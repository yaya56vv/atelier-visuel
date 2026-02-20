"""Service scan différentiel — Détection des changements dans les dossiers surveillés.

Le scan compare l'état actuel du système de fichiers avec l'état enregistré
dans `fichiers_indexes`. Il détecte :
  - Fichiers nouveaux (présents sur disque, absents de l'index)
  - Fichiers modifiés (hash ou date de modification différents)
  - Fichiers supprimés (dans l'index mais absents du disque)
  - Fichiers déplacés (même hash trouvé à un chemin différent)

Contraintes (CENTRAL.md §8.3) :
  - Pas de watchdog permanent — scan au démarrage ou sur demande
  - CPU léger — pas de GPU requis
  - Cible : < 5 secondes pour 10 000 fichiers indexés
"""

import hashlib
import json
import os
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

from db.database import get_db


# ═══════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════

# Taille max pour calcul de hash complet (au-delà, hash partiel)
HASH_MAX_SIZE = 50 * 1024 * 1024  # 50 Mo

# Extensions ignorées par défaut (binaires lourds, caches, etc.)
IGNORE_PATTERNS = {
    # Dossiers
    "__pycache__", "node_modules", ".git", ".svn", ".hg",
    ".venv", "venv", "env", ".env", ".tox",
    ".idea", ".vscode", ".vs", "__MACOSX",
    "dist", "build", ".next", ".nuxt",
    "Thumbs.db", ".DS_Store",
}

# Extensions binaires lourdes à ignorer par défaut
IGNORE_EXTENSIONS = {
    ".exe", ".dll", ".so", ".dylib", ".o", ".obj",
    ".pyc", ".pyo", ".class",
    ".lock", ".cache",
}


# ═══════════════════════════════════════════════════════════
# SCAN PRINCIPAL
# ═══════════════════════════════════════════════════════════

async def scanner_dossier(dossier_id: str) -> dict:
    """Scanne un dossier surveillé et produit un rapport différentiel.
    
    Retourne un rapport avec le nombre de fichiers par catégorie
    et les détails des changements.
    """
    db = await get_db()
    start = time.monotonic()
    now = datetime.now(timezone.utc).isoformat()
    
    # Charger la config du dossier
    rows = await db.execute_fetchall(
        "SELECT * FROM dossiers_surveilles WHERE id = ?", (dossier_id,)
    )
    if not rows:
        return {"error": "Dossier non trouvé"}
    
    dossier = dict(rows[0])
    racine = Path(dossier["chemin_absolu"])
    
    if not racine.exists():
        return {"error": f"Le dossier n'existe plus : {dossier['chemin_absolu']}"}
    
    profondeur_max = dossier["profondeur_max"]
    extensions_filtre = None
    if dossier["extensions_filtre"]:
        try:
            extensions_filtre = set(json.loads(dossier["extensions_filtre"]))
        except (json.JSONDecodeError, TypeError):
            pass
    
    # ─── Charger l'index actuel ───────────────────────────
    index_rows = await db.execute_fetchall(
        "SELECT * FROM fichiers_indexes WHERE dossier_id = ?", (dossier_id,)
    )
    # Dictionnaire chemin → enregistrement
    index_par_chemin: dict[str, dict] = {}
    # Dictionnaire hash → liste de chemins (pour détection déplacements)
    index_par_hash: dict[str, list[str]] = {}
    
    for r in index_rows:
        d = dict(r)
        index_par_chemin[d["chemin_absolu"]] = d
        if d["hash_contenu"]:
            index_par_hash.setdefault(d["hash_contenu"], []).append(d["chemin_absolu"])
    
    # ─── Scanner le système de fichiers ───────────────────
    fichiers_disque: dict[str, dict] = {}
    
    for entry in _parcourir_dossier(racine, profondeur_max, extensions_filtre):
        chemin_str = str(entry["path"])
        fichiers_disque[chemin_str] = entry
    
    # ─── Analyse différentielle ───────────────────────────
    nouveaux = []
    modifies = []
    supprimes = []
    deplaces = []
    inchanges = 0
    
    # 1. Fichiers sur le disque mais pas dans l'index → NOUVEAUX
    for chemin, info in fichiers_disque.items():
        if chemin not in index_par_chemin:
            # Vérifier si c'est un déplacement (même hash, autre chemin)
            file_hash = _calculer_hash(info["path"])
            if file_hash and file_hash in index_par_hash:
                # Trouver l'ancien chemin qui n'existe plus
                for ancien_chemin in index_par_hash[file_hash]:
                    if ancien_chemin not in fichiers_disque:
                        deplaces.append({
                            "ancien_chemin": ancien_chemin,
                            "nouveau_chemin": chemin,
                            "nom": info["nom"],
                            "hash": file_hash,
                        })
                        break
                else:
                    # Hash trouvé mais tous les anciens chemins existent encore → copie = nouveau
                    nouveaux.append({
                        "chemin": chemin,
                        "nom": info["nom"],
                        "taille": info["taille"],
                        "extension": info["extension"],
                        "hash": file_hash,
                    })
            else:
                nouveaux.append({
                    "chemin": chemin,
                    "nom": info["nom"],
                    "taille": info["taille"],
                    "extension": info["extension"],
                    "hash": file_hash,
                })
    
    # 2. Fichiers dans l'index mais plus sur le disque → SUPPRIMÉS
    for chemin, record in index_par_chemin.items():
        if chemin not in fichiers_disque:
            # Vérifier que ce n'est pas un déplacement déjà détecté
            is_deplaced = any(d["ancien_chemin"] == chemin for d in deplaces)
            if not is_deplaced:
                supprimes.append({
                    "chemin": chemin,
                    "nom": record["nom"],
                    "id": record["id"],
                })
    
    # 3. Fichiers présents des deux côtés → vérifier modification
    for chemin in fichiers_disque:
        if chemin in index_par_chemin:
            info_disque = fichiers_disque[chemin]
            record = index_par_chemin[chemin]
            
            # Comparer date de modification et taille
            mtime_disque = info_disque["date_modification"]
            mtime_index = record["date_modification"]
            taille_disque = info_disque["taille"]
            taille_index = record["taille_octets"]
            
            if mtime_disque != mtime_index or taille_disque != taille_index:
                # Confirmer par hash si la taille ou la date a changé
                new_hash = _calculer_hash(info_disque["path"])
                if new_hash != record["hash_contenu"]:
                    modifies.append({
                        "chemin": chemin,
                        "nom": info_disque["nom"],
                        "id": record["id"],
                        "ancien_hash": record["hash_contenu"],
                        "nouveau_hash": new_hash,
                        "ancienne_taille": taille_index,
                        "nouvelle_taille": taille_disque,
                    })
                else:
                    inchanges += 1
            else:
                inchanges += 1
    
    # ─── Mettre à jour l'index ────────────────────────────
    
    # Nouveaux fichiers → INSERT
    for f in nouveaux:
        fid = str(uuid.uuid4())
        chemin_rel = str(Path(f["chemin"]).relative_to(racine))
        await db.execute(
            """INSERT INTO fichiers_indexes 
               (id, dossier_id, chemin_absolu, chemin_relatif, nom, extension, 
                taille_octets, hash_contenu, date_modification, statut, date_indexation)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'nouveau', ?)""",
            (fid, dossier_id, f["chemin"], chemin_rel, f["nom"], f["extension"],
             f["taille"], f["hash"],
             fichiers_disque[f["chemin"]]["date_modification"], now)
        )
    
    # Modifiés → UPDATE
    for f in modifies:
        info = fichiers_disque[f["chemin"]]
        await db.execute(
            """UPDATE fichiers_indexes 
               SET hash_contenu = ?, taille_octets = ?, date_modification = ?,
                   statut = 'modifie', date_indexation = ?
               WHERE id = ?""",
            (f["nouveau_hash"], f["nouvelle_taille"],
             info["date_modification"], now, f["id"])
        )
    
    # Supprimés → UPDATE statut (ne pas supprimer l'enregistrement pour traçabilité)
    for f in supprimes:
        await db.execute(
            "UPDATE fichiers_indexes SET statut = 'supprime', date_indexation = ? WHERE id = ?",
            (now, f["id"])
        )
    
    # Déplacés → UPDATE chemin
    for f in deplaces:
        chemin_rel = str(Path(f["nouveau_chemin"]).relative_to(racine))
        await db.execute(
            """UPDATE fichiers_indexes 
               SET chemin_absolu = ?, chemin_relatif = ?, statut = 'deplace', date_indexation = ?
               WHERE chemin_absolu = ?""",
            (f["nouveau_chemin"], chemin_rel, now, f["ancien_chemin"])
        )
    
    duree_ms = int((time.monotonic() - start) * 1000)
    
    # ─── Journal du scan ──────────────────────────────────
    rapport = {
        "fichiers_total": len(fichiers_disque),
        "fichiers_nouveaux": len(nouveaux),
        "fichiers_modifies": len(modifies),
        "fichiers_supprimes": len(supprimes),
        "fichiers_deplaces": len(deplaces),
        "fichiers_inchanges": inchanges,
        "duree_ms": duree_ms,
    }
    
    journal_id = str(uuid.uuid4())
    details = json.dumps({
        "nouveaux": nouveaux[:50],    # Limiter les détails pour le journal
        "modifies": modifies[:50],
        "supprimes": supprimes[:50],
        "deplaces": deplaces[:50],
    }, ensure_ascii=False)
    
    await db.execute(
        """INSERT INTO journal_scan 
           (id, dossier_id, date_scan, fichiers_total, fichiers_nouveaux, 
            fichiers_modifies, fichiers_supprimes, fichiers_deplaces, 
            duree_ms, statut, details)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'termine', ?)""",
        (journal_id, dossier_id, now, rapport["fichiers_total"],
         rapport["fichiers_nouveaux"], rapport["fichiers_modifies"],
         rapport["fichiers_supprimes"], rapport["fichiers_deplaces"],
         duree_ms, details)
    )
    
    await db.commit()
    
    rapport["journal_id"] = journal_id
    return rapport


# ═══════════════════════════════════════════════════════════
# UTILITAIRES
# ═══════════════════════════════════════════════════════════

def _parcourir_dossier(
    racine: Path,
    profondeur_max: int = -1,
    extensions_filtre: set[str] | None = None,
    _profondeur: int = 0,
) -> list[dict]:
    """Parcourt un dossier récursivement et retourne les infos de chaque fichier.
    
    Respecte les filtres de profondeur et d'extensions.
    Ignore les dossiers/fichiers dans IGNORE_PATTERNS et IGNORE_EXTENSIONS.
    """
    resultats = []
    
    if profondeur_max != -1 and _profondeur > profondeur_max:
        return resultats
    
    try:
        entries = sorted(racine.iterdir())
    except PermissionError:
        return resultats
    except OSError:
        return resultats
    
    for entry in entries:
        # Ignorer les patterns
        if entry.name in IGNORE_PATTERNS:
            continue
        if entry.name.startswith('.'):
            continue
        
        if entry.is_dir():
            resultats.extend(
                _parcourir_dossier(entry, profondeur_max, extensions_filtre, _profondeur + 1)
            )
        elif entry.is_file():
            ext = entry.suffix.lower()
            
            # Ignorer extensions binaires
            if ext in IGNORE_EXTENSIONS:
                continue
            
            # Filtre d'extensions si défini
            if extensions_filtre and ext not in extensions_filtre:
                continue
            
            try:
                stat = entry.stat()
                mtime = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat()
                
                resultats.append({
                    "path": entry,
                    "nom": entry.name,
                    "extension": ext,
                    "taille": stat.st_size,
                    "date_modification": mtime,
                })
            except (PermissionError, OSError):
                continue
    
    return resultats


def _calculer_hash(filepath: Path) -> str | None:
    """Calcule le SHA-256 d'un fichier.
    
    Pour les fichiers > HASH_MAX_SIZE, calcule un hash partiel
    (début + milieu + fin) pour rester rapide.
    """
    try:
        size = filepath.stat().st_size
        
        if size == 0:
            return hashlib.sha256(b"").hexdigest()
        
        h = hashlib.sha256()
        
        if size <= HASH_MAX_SIZE:
            # Hash complet
            with open(filepath, "rb") as f:
                while chunk := f.read(65536):
                    h.update(chunk)
        else:
            # Hash partiel : 64KB début + 64KB milieu + 64KB fin + taille
            chunk_size = 65536
            with open(filepath, "rb") as f:
                # Début
                h.update(f.read(chunk_size))
                # Milieu
                f.seek(size // 2)
                h.update(f.read(chunk_size))
                # Fin
                f.seek(max(0, size - chunk_size))
                h.update(f.read(chunk_size))
            # Inclure la taille pour différencier des fichiers avec même début/milieu/fin
            h.update(str(size).encode())
        
        return h.hexdigest()
    except (PermissionError, OSError):
        return None
