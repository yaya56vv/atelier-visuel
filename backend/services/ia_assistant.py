# Service IA Assistant — Dialogue utilisateur, analyse d'espace, suggestions
# Protocole : Observer → Interpréter → Détecter → Proposer → Attendre

from db.database import get_db
from services.ia_routeur import call_ia


SYSTEM_PROMPT = """Tu es l'assistant IA de l'Atelier Visuel de Pensée.

Tu analyses des espaces de pensée composés de blocs et de liaisons.

Chaque bloc a :
- une couleur sémantique (green=fait/donnée, orange=problème/friction, yellow=solution/insight, blue=logique/analyse, violet=sens profond/valeur, mauve=concept/hypothèse)
- une forme épistémique (cloud=intuition, rounded-rect=idée structurée, square=texte fondateur, oval=processus, circle=cœur/centre)
- un titre et des contenus

Les liaisons entre blocs ont un type : simple, logique, tension, ancrée.

Ton protocole d'intervention :
1. OBSERVER : décris ce que tu vois dans l'espace
2. INTERPRÉTER : identifie les patterns, clusters, flux
3. DÉTECTER : signale les incohérences, blocs isolés, tensions non résolues
4. PROPOSER : suggère des actions concrètes (liaisons, réorganisations, questions)
5. ATTENDRE : laisse l'utilisateur décider

Termine TOUJOURS ta réponse par un score de confiance : [Confiance: X/10]

Sois concis et structuré. Utilise le vocabulaire sémantique du système."""


async def build_context(espace_id: str) -> str:
    """Construit le contexte de l'espace pour l'IA."""
    db = await get_db()

    # Charger l'espace
    rows = await db.execute_fetchall("SELECT * FROM espaces WHERE id = ?", (espace_id,))
    if not rows:
        return "Espace non trouvé."

    espace = dict(rows[0])

    # Charger les blocs
    blocs = await db.execute_fetchall(
        "SELECT * FROM blocs WHERE espace_id = ? ORDER BY created_at", (espace_id,)
    )

    # Charger les liaisons
    liaisons = await db.execute_fetchall(
        "SELECT * FROM liaisons WHERE espace_id = ? ORDER BY created_at", (espace_id,)
    )

    # Construire le contexte textuel
    lines = [f"Espace : {espace['nom']} (thème: {espace['theme']})"]
    lines.append(f"Nombre de blocs : {len(blocs)}")
    lines.append(f"Nombre de liaisons : {len(liaisons)}")
    lines.append("")

    bloc_map = {}
    for b in blocs:
        b = dict(b)
        bloc_map[b["id"]] = b
        titre = b.get("titre_ia") or b.get("titre") or "(sans titre)"
        resume = b.get("resume_ia") or ""
        lines.append(f"- Bloc [{b['couleur']}/{b['forme']}] \"{titre}\"")
        if resume:
            lines.append(f"  Résumé: {resume}")

    if liaisons:
        lines.append("")
        lines.append("Liaisons :")
        for li in liaisons:
            li = dict(li)
            src = bloc_map.get(li["bloc_source_id"], {})
            dst = bloc_map.get(li["bloc_cible_id"], {})
            src_titre = src.get("titre_ia") or src.get("titre") or "?"
            dst_titre = dst.get("titre_ia") or dst.get("titre") or "?"
            lines.append(f"  {src_titre} --[{li['type']}]--> {dst_titre}")

    return "\n".join(lines)


async def ask_assistant(espace_id: str, question: str) -> str:
    """Pose une question à l'assistant IA sur un espace.

    Retourne la réponse ou un message d'erreur.
    """
    context = await build_context(espace_id)
    prompt = f"""Contexte de l'espace :
{context}

Question de l'utilisateur :
{question}"""

    response = await call_ia("assistant", prompt, SYSTEM_PROMPT)

    if response is None:
        return "L'assistant IA n'est pas configuré. Configurez-le dans les paramètres IA (rôle: assistant)."

    return response
