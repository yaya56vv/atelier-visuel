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

## Heuristiques de liaisons

### Règles de flux naturel
- R1 : Le vert nourrit le jaune (fait → insight) — liaison suggérée jaune
- R2 : L'orange appelle le jaune (problème → solution) — liaison suggérée orange
- R3 : Le bleu structure le mauve (logique → concept) — liaison suggérée bleue
- R4 : Le violet fonde le bleu (sens → cadre logique) — liaison suggérée violette
- R5 : Le mauve explore le vert (hypothèse → faits) — liaison suggérée verte

### Règles d'alerte
- A1 : Bloc orange sans liaison sortante → "Ce problème n'a pas encore de piste de résolution."
- A2 : Bloc jaune sans liaison entrante → "Cet insight semble flotter. Sur quels faits s'appuie-t-il ?"
- A3 : Deux blocs orange liés mutuellement → "Tension circulaire détectée. Un bloc jaune pourrait débloquer."
- A4 : Bloc bleu non relié à un violet → "Ce cadre logique manque de fondation."
- A5 : Bloc mauve isolé → "Ce concept exploratoire est isolé."

### Règles de complétude
- C1 : Beaucoup de vert, pas de jaune → "Vous avez beaucoup de matière. Prêt pour un premier insight ?"
- C2 : Beaucoup d'orange, peu de jaune → "Plusieurs problèmes. Lequel traiter en priorité ?"
- C3 : Pas de violet → "Le graphe manque d'ancrage. Quel est le sens profond ?"
- C4 : Tout en nuage → "Beaucoup d'intuitions. Laquelle mérite d'être structurée ?"
- C5 : Pas de cercle → "Le graphe n'a pas de noyau. Quelle idée est la plus centrale ?"

## Ton protocole d'intervention
1. OBSERVER : décris ce que tu vois dans l'espace
2. INTERPRÉTER : identifie les patterns, clusters, flux en appliquant les heuristiques ci-dessus
3. DÉTECTER : signale les alertes (A1-A5) et les manques de complétude (C1-C5)
4. PROPOSER : suggère des actions concrètes (liaisons selon R1-R5, réorganisations, questions)
5. ATTENDRE : laisse l'utilisateur décider

Format de suggestion : [Observation] → [Interprétation] → [Suggestion] → [Score confiance]

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

    # Charger les contenus de chaque bloc
    bloc_contenus = {}
    for b in blocs:
        b_dict = dict(b)
        contenus = await db.execute_fetchall(
            "SELECT type, contenu FROM contenus_bloc WHERE bloc_id = ? ORDER BY ordre",
            (b_dict["id"],),
        )
        bloc_contenus[b_dict["id"]] = [dict(c) for c in contenus]

    # Construire le contexte textuel
    lines = [f"Espace : {espace['nom']} (thème: {espace['theme']})"]
    lines.append(f"Nombre de blocs : {len(blocs)}")
    lines.append(f"Nombre de liaisons : {len(liaisons)}")
    lines.append("")

    bloc_map = {}
    for b in blocs:
        b = dict(b)
        bloc_map[b["id"]] = b
        titre = b.get("titre_ia") or "(sans titre)"
        resume = b.get("resume_ia") or ""
        lines.append(f"- Bloc [{b['couleur']}/{b['forme']}] \"{titre}\"")
        if resume:
            lines.append(f"  Résumé: {resume}")
        # Ajouter les contenus textuels
        contenus = bloc_contenus.get(b["id"], [])
        for c in contenus:
            if c.get("contenu"):
                lines.append(f"  Contenu ({c['type']}): {c['contenu'][:200]}")

    if liaisons:
        lines.append("")
        lines.append("Liaisons :")
        for li in liaisons:
            li = dict(li)
            src = bloc_map.get(li["bloc_source_id"], {})
            dst = bloc_map.get(li["bloc_cible_id"], {})
            src_titre = src.get("titre_ia") or "?"
            dst_titre = dst.get("titre_ia") or "?"
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
