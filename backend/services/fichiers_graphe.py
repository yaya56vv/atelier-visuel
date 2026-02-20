"""Service 4B — Intégration fichiers indexés → blocs du graphe.

Transforme les fichiers détectés par le scan différentiel en blocs
dans le graphe de l'espace associé au dossier surveillé.

Chaque fichier indexé peut devenir un bloc avec :
- Couleur déterminée par l'extension/type MIME
- Forme selon la catégorie (document, code, image, etc.)
- Titre = nom du fichier
- Contenu = référence au fichier (type 'fichier')
- Liaison automatique possible avec les blocs existants (via mots-clés)

La création de blocs est sur demande — pas automatique.
L'utilisateur déclenche l'intégration après un scan.
"""

import json
import uuid
from datetime import datetime, timezone

from db.database import get_db


# ═══════════════════════════════════════════════════════════
#  MAPPING EXTENSION → COULEUR / FORME
# ═══════════════════════════════════════════════════════════

# Couleur sémantique selon le type de fichier
COULEUR_PAR_EXT: dict[str, str] = {
    # Documents texte → vert (matière)
    ".md": "green", ".txt": "green", ".rtf": "green",
    ".docx": "green", ".doc": "green", ".odt": "green",
    # PDF → bleu (logique/structuré)
    ".pdf": "blue",
    # Code → jaune (insight/solution)
    ".py": "yellow", ".js": "yellow", ".ts": "yellow", ".tsx": "yellow",
    ".jsx": "yellow", ".html": "yellow", ".css": "yellow",
    ".json": "yellow", ".yaml": "yellow", ".yml": "yellow",
    ".toml": "yellow", ".sql": "yellow", ".sh": "yellow",
    ".rs": "yellow", ".go": "yellow", ".java": "yellow",
    # Images → mauve (concept en création)
    ".png": "mauve", ".jpg": "mauve", ".jpeg": "mauve",
    ".gif": "mauve", ".svg": "mauve", ".webp": "mauve",
    ".bmp": "mauve", ".ico": "mauve",
    # Audio/Vidéo → violet (sens profond)
    ".mp3": "violet", ".wav": "violet", ".flac": "violet",
    ".mp4": "violet", ".mkv": "violet", ".avi": "violet",
    # Données → orange (énergie/tension)
    ".csv": "orange", ".xlsx": "orange", ".xls": "orange",
    ".db": "orange", ".sqlite": "orange",
}

# Forme selon la catégorie
FORME_PAR_EXT: dict[str, str] = {
    # Documents → rectangle arrondi (structuré)
    ".md": "rounded-rect", ".txt": "rounded-rect", ".rtf": "rounded-rect",
    ".docx": "rounded-rect", ".doc": "rounded-rect", ".odt": "rounded-rect",
    ".pdf": "rounded-rect",
    # Code → carré (fondateur)
    ".py": "square", ".js": "square", ".ts": "square", ".tsx": "square",
    ".jsx": "square", ".html": "square", ".css": "square",
    ".json": "square", ".yaml": "square", ".yml": "square",
    ".sql": "square", ".sh": "square", ".rs": "square",
    # Images → cercle (centre visuel)
    ".png": "circle", ".jpg": "circle", ".jpeg": "circle",
    ".gif": "circle", ".svg": "circle", ".webp": "circle",
    # Audio/Vidéo → ovale (processus)
    ".mp3": "oval", ".wav": "oval", ".mp4": "oval", ".mkv": "oval",
    # Données → nuage (intuition/exploration)
    ".csv": "cloud", ".xlsx": "cloud", ".xls": "cloud",
}

COULEUR_DEFAUT = "green"
FORME_DEFAUT = "rounded-rect"


# ═══════════════════════════════════════════════════════════
#  INTÉGRATION FICHIERS → BLOCS
# ═══════════════════════════════════════════════════════════

async def integrer_fichiers_dans_graphe(dossier_id: str) -> dict:
    """Crée des blocs pour les fichiers indexés qui n'ont pas encore de bloc.

    Ne touche pas aux fichiers déjà intégrés (qui ont un bloc_id).
    Retourne un résumé { blocs_crees, fichiers_ignores }.
    """
    db = await get_db()

    # Récupérer le dossier et son espace
    dossier = await db.execute_fetchall(
        "SELECT * FROM dossiers_surveilles WHERE id = ?", (dossier_id,)
    )
    if not dossier:
        return {"error": "Dossier non trouvé", "blocs_crees": 0}

    dossier = dict(dossier[0])
    espace_id = dossier["espace_id"]

    if not espace_id:
        return {"error": "Aucun espace associé au dossier", "blocs_crees": 0}

    # Fichiers sans bloc_id (pas encore intégrés), statut actif ou nouveau
    fichiers = await db.execute_fetchall(
        """SELECT * FROM fichiers_indexes
           WHERE dossier_id = ? AND bloc_id IS NULL
           AND statut IN ('actif', 'nouveau')
           ORDER BY chemin_relatif""",
        (dossier_id,),
    )

    if not fichiers:
        return {"blocs_crees": 0, "message": "Tous les fichiers sont déjà intégrés."}

    now = datetime.now(timezone.utc).isoformat()
    blocs_crees = 0

    # Position initiale : grille simple (le force-directed repositionnera)
    cols = 4
    espacement_x = 280
    espacement_y = 180
    offset_x = 100
    offset_y = 100

    for i, f in enumerate(fichiers):
        f = dict(f)
        ext = (f.get("extension") or "").lower()

        couleur = COULEUR_PAR_EXT.get(ext, COULEUR_DEFAUT)
        forme = FORME_PAR_EXT.get(ext, FORME_DEFAUT)

        # Position en grille
        col = i % cols
        row = i // cols
        x = offset_x + col * espacement_x
        y = offset_y + row * espacement_y

        # Créer le bloc
        bloc_id = str(uuid.uuid4())
        titre = f.get("nom", "Fichier")

        await db.execute(
            """INSERT INTO blocs (id, espace_id, x, y, forme, couleur, largeur, hauteur,
               titre_ia, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, 220, 130, ?, ?, ?)""",
            (bloc_id, espace_id, x, y, forme, couleur, titre, now, now),
        )

        # Créer le contenu de type 'fichier'
        contenu_id = str(uuid.uuid4())
        metadata = json.dumps({
            "chemin_absolu": f.get("chemin_absolu"),
            "chemin_relatif": f.get("chemin_relatif"),
            "extension": ext,
            "taille_octets": f.get("taille_octets"),
            "hash_contenu": f.get("hash_contenu"),
        }, ensure_ascii=False)

        await db.execute(
            """INSERT INTO contenus_bloc (id, bloc_id, type, contenu, metadata, ordre,
               chemin_fichier, mime_type, taille, hash_contenu, origine, created_at)
               VALUES (?, ?, 'fichier', ?, ?, 0, ?, ?, ?, ?, 'auto', ?)""",
            (contenu_id, bloc_id, f.get("nom"), metadata,
             f.get("chemin_relatif"), None, f.get("taille_octets"),
             f.get("hash_contenu"), now),
        )

        # Lier le fichier indexé au bloc
        await db.execute(
            "UPDATE fichiers_indexes SET bloc_id = ? WHERE id = ?",
            (bloc_id, f["id"]),
        )

        blocs_crees += 1

    await db.commit()

    return {
        "blocs_crees": blocs_crees,
        "espace_id": espace_id,
        "dossier": dossier.get("nom"),
        "message": f"✓ {blocs_crees} fichiers intégrés comme blocs dans l'espace.",
    }


async def desintegrer_fichiers(dossier_id: str) -> dict:
    """Supprime les blocs créés à partir des fichiers d'un dossier.

    Remet bloc_id à NULL dans fichiers_indexes.
    Utile pour recommencer proprement.
    """
    db = await get_db()

    fichiers = await db.execute_fetchall(
        "SELECT id, bloc_id FROM fichiers_indexes WHERE dossier_id = ? AND bloc_id IS NOT NULL",
        (dossier_id,),
    )

    count = 0
    for f in fichiers:
        f = dict(f)
        bloc_id = f["bloc_id"]
        if bloc_id:
            # Supprimer contenus, liaisons, puis bloc
            await db.execute("DELETE FROM contenus_bloc WHERE bloc_id = ?", (bloc_id,))
            await db.execute(
                "DELETE FROM liaisons WHERE bloc_source_id = ? OR bloc_cible_id = ?",
                (bloc_id, bloc_id),
            )
            await db.execute("DELETE FROM blocs WHERE id = ?", (bloc_id,))
            await db.execute(
                "UPDATE fichiers_indexes SET bloc_id = NULL WHERE id = ?", (f["id"],)
            )
            count += 1

    await db.commit()
    return {"blocs_supprimes": count}
