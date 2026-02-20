"""API — Gestion du système de fichiers intégré au graphe.

Endpoints :
  GET    /api/filesystem/dossiers          → liste les dossiers surveillés
  POST   /api/filesystem/dossiers          → ajoute un dossier à surveiller
  DELETE /api/filesystem/dossiers/{id}     → retire un dossier (et ses fichiers indexés)
  POST   /api/filesystem/scan              → lance un scan différentiel (tous les dossiers actifs)
  POST   /api/filesystem/scan/{dossier_id} → lance un scan sur un seul dossier
  GET    /api/filesystem/rapport           → dernier rapport de scan par dossier
  GET    /api/filesystem/fichiers/{dossier_id} → fichiers indexés d'un dossier
"""

import uuid
import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.database import get_db

router = APIRouter()


# ═══════════════════════════════════════════════════════════
# MODÈLES
# ═══════════════════════════════════════════════════════════

class DossierCreate(BaseModel):
    chemin_absolu: str
    espace_id: str
    profondeur_max: int = -1           # -1 = illimité
    extensions_filtre: list[str] | None = None  # ex: [".pdf", ".md", ".py"]


class DossierUpdate(BaseModel):
    actif: bool | None = None
    profondeur_max: int | None = None
    extensions_filtre: list[str] | None = None


# ═══════════════════════════════════════════════════════════
# CRUD DOSSIERS SURVEILLÉS
# ═══════════════════════════════════════════════════════════

@router.get("/dossiers")
async def list_dossiers():
    """Liste tous les dossiers surveillés avec leur nombre de fichiers indexés."""
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT * FROM dossiers_surveilles ORDER BY created_at DESC"
    )
    dossiers = []
    for r in rows:
        d = dict(r)
        # Compter les fichiers indexés
        count = await db.execute_fetchall(
            "SELECT COUNT(*) as cnt FROM fichiers_indexes WHERE dossier_id = ?",
            (d["id"],)
        )
        d["fichiers_count"] = dict(count[0])["cnt"]
        dossiers.append(d)
    return dossiers


@router.post("/dossiers", status_code=201)
async def add_dossier(data: DossierCreate):
    """Ajoute un dossier à surveiller.
    
    Vérifie que le chemin existe et que l'espace cible existe.
    Effectue un premier scan immédiat pour indexer les fichiers.
    """
    db = await get_db()
    
    # Vérifier que le chemin existe
    path = Path(data.chemin_absolu)
    if not path.exists():
        raise HTTPException(status_code=400, detail=f"Le chemin n'existe pas : {data.chemin_absolu}")
    if not path.is_dir():
        raise HTTPException(status_code=400, detail=f"Le chemin n'est pas un dossier : {data.chemin_absolu}")
    
    # Vérifier que l'espace existe
    espace = await db.execute_fetchall(
        "SELECT id FROM espaces WHERE id = ?", (data.espace_id,)
    )
    if not espace:
        raise HTTPException(status_code=404, detail="Espace non trouvé")
    
    # Vérifier doublon
    existing = await db.execute_fetchall(
        "SELECT id FROM dossiers_surveilles WHERE chemin_absolu = ?",
        (str(path.resolve()),)
    )
    if existing:
        raise HTTPException(status_code=409, detail="Ce dossier est déjà surveillé")
    
    now = datetime.now(timezone.utc).isoformat()
    dossier_id = str(uuid.uuid4())
    
    ext_json = json.dumps(data.extensions_filtre) if data.extensions_filtre else None
    
    await db.execute(
        """INSERT INTO dossiers_surveilles 
           (id, chemin_absolu, nom, actif, profondeur_max, extensions_filtre, espace_id, created_at, updated_at)
           VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)""",
        (dossier_id, str(path.resolve()), path.name, data.profondeur_max,
         ext_json, data.espace_id, now, now)
    )
    await db.commit()
    
    # Premier scan immédiat
    from services.scan_diff import scanner_dossier
    rapport = await scanner_dossier(dossier_id)
    
    # Retourner le dossier créé
    rows = await db.execute_fetchall(
        "SELECT * FROM dossiers_surveilles WHERE id = ?", (dossier_id,)
    )
    result = dict(rows[0])
    result["scan_initial"] = rapport
    return result


@router.delete("/dossiers/{dossier_id}")
async def remove_dossier(dossier_id: str):
    """Retire un dossier de la surveillance.
    
    Supprime les fichiers indexés associés mais NE supprime PAS
    les blocs déjà créés dans le graphe (ils deviennent orphelins
    mais restent consultables).
    """
    db = await get_db()
    
    rows = await db.execute_fetchall(
        "SELECT * FROM dossiers_surveilles WHERE id = ?", (dossier_id,)
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    
    # Détacher les fichiers de leurs blocs (SET NULL) se fait par le ON DELETE CASCADE
    await db.execute(
        "DELETE FROM fichiers_indexes WHERE dossier_id = ?", (dossier_id,)
    )
    await db.execute(
        "DELETE FROM journal_scan WHERE dossier_id = ?", (dossier_id,)
    )
    await db.execute(
        "DELETE FROM dossiers_surveilles WHERE id = ?", (dossier_id,)
    )
    await db.commit()
    
    return {"deleted": dossier_id}


@router.put("/dossiers/{dossier_id}")
async def update_dossier(dossier_id: str, data: DossierUpdate):
    """Met à jour les paramètres d'un dossier surveillé."""
    db = await get_db()
    
    rows = await db.execute_fetchall(
        "SELECT * FROM dossiers_surveilles WHERE id = ?", (dossier_id,)
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    
    now = datetime.now(timezone.utc).isoformat()
    updates = []
    params = []
    
    if data.actif is not None:
        updates.append("actif = ?")
        params.append(1 if data.actif else 0)
    if data.profondeur_max is not None:
        updates.append("profondeur_max = ?")
        params.append(data.profondeur_max)
    if data.extensions_filtre is not None:
        updates.append("extensions_filtre = ?")
        params.append(json.dumps(data.extensions_filtre))
    
    if updates:
        updates.append("updated_at = ?")
        params.append(now)
        params.append(dossier_id)
        await db.execute(
            f"UPDATE dossiers_surveilles SET {', '.join(updates)} WHERE id = ?",
            params
        )
        await db.commit()
    
    rows = await db.execute_fetchall(
        "SELECT * FROM dossiers_surveilles WHERE id = ?", (dossier_id,)
    )
    return dict(rows[0])


# ═══════════════════════════════════════════════════════════
# SCAN DIFFÉRENTIEL
# ═══════════════════════════════════════════════════════════

@router.post("/scan")
async def scan_all():
    """Lance un scan différentiel sur TOUS les dossiers actifs.
    
    Retourne un rapport global avec le détail par dossier.
    """
    db = await get_db()
    from services.scan_diff import scanner_dossier
    
    dossiers = await db.execute_fetchall(
        "SELECT id, chemin_absolu, nom FROM dossiers_surveilles WHERE actif = 1"
    )
    
    if not dossiers:
        return {"message": "Aucun dossier surveillé actif", "rapports": []}
    
    rapports = []
    for d in dossiers:
        rapport = await scanner_dossier(d["id"])
        rapports.append({
            "dossier_id": d["id"],
            "nom": d["nom"],
            "chemin": d["chemin_absolu"],
            **rapport,
        })
    
    return {
        "dossiers_scannes": len(rapports),
        "rapports": rapports,
    }


@router.post("/scan/{dossier_id}")
async def scan_dossier(dossier_id: str):
    """Lance un scan différentiel sur un dossier spécifique."""
    db = await get_db()
    from services.scan_diff import scanner_dossier
    
    rows = await db.execute_fetchall(
        "SELECT * FROM dossiers_surveilles WHERE id = ?", (dossier_id,)
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    
    rapport = await scanner_dossier(dossier_id)
    return rapport


@router.get("/rapport")
async def get_rapports():
    """Retourne le dernier rapport de scan pour chaque dossier surveillé."""
    db = await get_db()
    
    dossiers = await db.execute_fetchall(
        "SELECT id, nom, chemin_absolu FROM dossiers_surveilles WHERE actif = 1"
    )
    
    rapports = []
    for d in dossiers:
        journal = await db.execute_fetchall(
            "SELECT * FROM journal_scan WHERE dossier_id = ? ORDER BY date_scan DESC LIMIT 1",
            (d["id"],)
        )
        rapports.append({
            "dossier_id": d["id"],
            "nom": d["nom"],
            "chemin": d["chemin_absolu"],
            "dernier_scan": dict(journal[0]) if journal else None,
        })
    
    return rapports


# ═══════════════════════════════════════════════════════════
# FICHIERS INDEXÉS
# ═══════════════════════════════════════════════════════════

@router.get("/fichiers/{dossier_id}")
async def list_fichiers(dossier_id: str, statut: str | None = None):
    """Liste les fichiers indexés d'un dossier, optionnellement filtré par statut."""
    db = await get_db()
    
    if statut:
        rows = await db.execute_fetchall(
            "SELECT * FROM fichiers_indexes WHERE dossier_id = ? AND statut = ? ORDER BY chemin_relatif",
            (dossier_id, statut)
        )
    else:
        rows = await db.execute_fetchall(
            "SELECT * FROM fichiers_indexes WHERE dossier_id = ? ORDER BY chemin_relatif",
            (dossier_id,)
        )
    
    return [dict(r) for r in rows]


# ═══════════════════════════════════════════════════════════
# 4B — Intégration fichiers → blocs du graphe
# ═══════════════════════════════════════════════════════════


@router.post("/integrer/{dossier_id}")
async def integrer_fichiers(dossier_id: str):
    """Intègre les fichiers indexés d'un dossier comme blocs dans le graphe.

    Crée un bloc par fichier non encore intégré (bloc_id IS NULL).
    Couleur et forme déterminées par l'extension.
    """
    from services.fichiers_graphe import integrer_fichiers_dans_graphe
    result = await integrer_fichiers_dans_graphe(dossier_id)
    return result


@router.delete("/integrer/{dossier_id}")
async def desintegrer_fichiers_endpoint(dossier_id: str):
    """Supprime les blocs créés à partir des fichiers d'un dossier.

    Remet les fichiers en état non-intégré (bloc_id NULL).
    """
    from services.fichiers_graphe import desintegrer_fichiers
    result = await desintegrer_fichiers(dossier_id)
    return result
