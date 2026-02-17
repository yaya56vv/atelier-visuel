"""Service d'indexation — Génération titre_ia, resume_ia, entités, mots-clés."""

import json
from datetime import datetime, timezone

from db.database import get_db
from services.ia_routeur import call_ia

SYSTEM_PROMPT = """Tu es un indexeur sémantique. Pour le texte fourni, génère un JSON avec exactement ces 4 clés :
- "titre_ia": un titre synthétique (max 10 mots)
- "resume_ia": un résumé en 1-2 phrases
- "entites": une liste de noms propres ou concepts clés (max 5)
- "mots_cles": une liste de mots-clés (max 8)

Réponds UNIQUEMENT avec le JSON, sans markdown, sans explication."""


async def indexer_bloc(bloc_id: str) -> bool:
    """Indexe un bloc : génère titre_ia, resume_ia, entités, mots-clés.

    Retourne True si l'indexation a réussi, False sinon (IA non configurée ou erreur).
    """
    db = await get_db()

    # Récupérer les contenus du bloc
    contenus = await db.execute_fetchall(
        "SELECT type, contenu FROM contenus_bloc WHERE bloc_id = ? ORDER BY ordre", (bloc_id,)
    )

    if not contenus:
        return False

    # Construire le texte à indexer
    texte_parts = []
    for c in contenus:
        c = dict(c)
        if c["contenu"]:
            texte_parts.append(f"[{c['type']}] {c['contenu']}")

    if not texte_parts:
        return False

    texte = "\n".join(texte_parts)

    # Appeler l'IA Graphe
    reponse = await call_ia("graphe", texte, SYSTEM_PROMPT)
    if reponse is None:
        return False

    # Parser la réponse JSON
    try:
        data = json.loads(reponse.strip())
    except json.JSONDecodeError:
        return False

    titre_ia = data.get("titre_ia", "")
    resume_ia = data.get("resume_ia", "")
    entites = json.dumps(data.get("entites", []), ensure_ascii=False)
    mots_cles = json.dumps(data.get("mots_cles", []), ensure_ascii=False)
    now = datetime.now(timezone.utc).isoformat()

    await db.execute(
        "UPDATE blocs SET titre_ia = ?, resume_ia = ?, entites = ?, mots_cles = ?, updated_at = ? WHERE id = ?",
        (titre_ia, resume_ia, entites, mots_cles, now, bloc_id),
    )
    await db.commit()
    return True
