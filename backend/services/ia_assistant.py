"""Service IA Assistant — Dialogue utilisateur avec tool calling.

L'assistant peut maintenant :
- Analyser l'espace (comme avant)
- Créer des blocs et des liaisons
- Modifier et supprimer des blocs
- Lire des documents locaux
- Tout cela via le mécanisme de tool calling

Boucle conversationnelle :
1. L'utilisateur pose une question
2. L'IA reçoit le contexte + les outils disponibles
3. Si l'IA appelle un outil → exécution → résultat renvoyé → l'IA continue
4. Boucle jusqu'à réponse finale textuelle (max 5 itérations)
"""

from db.database import get_db
from services.ia_routeur import call_ia_with_tools, get_ia_config
from services.ia_tools import TOOLS, execute_tool


# Nombre max d'itérations de tool calling par requête
MAX_TOOL_ITERATIONS = 8


SYSTEM_PROMPT = """Tu es l'assistant IA de l'Atelier Visuel de Pensée — un environnement cognitif spatial.

## Ton rôle
Tu es le GESTIONNAIRE INTELLIGENT du graphe. Tu peux :
- Observer et analyser l'espace (blocs, liaisons, patterns)
- CRÉER des blocs et des liaisons
- MODIFIER des blocs existants
- LIRE des documents locaux pour en extraire le contenu
- CAPTURER des pages web (stocker_document_web) pour les conserver dans le graphe
- SUPPRIMER des blocs

## Grammaire sémantique

### Couleurs (intention)
- green : Matière première, fait, donnée, observation
- orange : Énergie, tension, problème, friction
- yellow : Lumière, insight, solution, déclic
- blue : Logique, raison, structure, analyse
- violet : Sens profond, valeur, principe fondateur
- mauve : Concept en création, hypothèse, piste

### Formes (certitude)
- cloud : Intuition vivante (certitude faible)
- rounded-rect : Idée structurée (certitude moyenne)
- square : Texte fondateur (certitude haute)
- oval : Processus (certitude variable)
- circle : Cœur / Centre (certitude maximale)

## Heuristiques de liaisons

### Flux naturel
- R1 : green nourrit yellow (fait → insight)
- R2 : orange appelle yellow (problème → solution)
- R3 : blue structure mauve (logique → concept)
- R4 : violet fonde blue (sens → cadre logique)
- R5 : mauve explore green (hypothèse → faits)

### Alertes
- A1 : Bloc orange sans sortie → problème sans piste
- A2 : Bloc yellow sans entrée → insight flottant
- A3 : Deux orange liés → tension circulaire
- A4 : Bloc blue sans violet → logique sans fondation
- A5 : Bloc mauve isolé → concept inexploré

## Protocole d'action
1. OBSERVER : comprendre la demande et l'état du graphe
2. AGIR : utiliser les outils pour créer/modifier/lire selon la demande
3. RENDRE COMPTE : expliquer ce qui a été fait

Quand tu crées un graphe à partir d'un document ou d'une recherche :
- Lis d'abord le document avec l'outil lire_document (ou recherche_web)
- Identifie les concepts clés, problèmes, solutions, principes
- Crée des blocs avec les bonnes couleurs et formes selon la sémantique
- Crée les liaisons qui relient les concepts entre eux
- NE PAS spécifier de positions x,y — laisse l'auto-positionnement
- OBLIGATOIRE : après avoir créé tous les blocs et liaisons, appelle TOUJOURS reorganiser_graphe pour obtenir une disposition organique vivante (force-directed). Ne jamais l'oublier.

## Capture de pages web
Quand l'utilisateur partage une URL ou demande de stocker/capturer une page web :
- Propose le choix entre "brut" (garder le texte complet) et "analyse" (décomposer en blocs thématiques)
- Si le mode est "analyse" ou "les_deux", après la capture, crée des blocs thématiques à partir du contenu retourné
- Relie chaque bloc thématique au bloc source avec des liaisons appropriées
- Termine par reorganiser_graphe

Tu es concis et structuré. Tu utilises le vocabulaire sémantique du système.
Termine par [Confiance: X/10]."""


async def build_context(espace_id: str) -> str:
    """Construit le contexte de l'espace pour l'IA."""
    db = await get_db()

    rows = await db.execute_fetchall("SELECT * FROM espaces WHERE id = ?", (espace_id,))
    if not rows:
        return "Espace non trouvé."

    espace = dict(rows[0])

    blocs = await db.execute_fetchall(
        "SELECT * FROM blocs WHERE espace_id = ? ORDER BY created_at", (espace_id,)
    )
    liaisons = await db.execute_fetchall(
        "SELECT * FROM liaisons WHERE espace_id = ? ORDER BY created_at", (espace_id,)
    )

    bloc_contenus = {}
    for b in blocs:
        b_dict = dict(b)
        contenus = await db.execute_fetchall(
            "SELECT type, contenu FROM contenus_bloc WHERE bloc_id = ? ORDER BY ordre",
            (b_dict["id"],),
        )
        bloc_contenus[b_dict["id"]] = [dict(c) for c in contenus]

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
    """Pose une question à l'assistant IA avec capacité de tool calling.

    Boucle : question → (tool call → exécution → résultat)* → réponse finale.
    """
    context = await build_context(espace_id)

    # Construire les messages initiaux
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Contexte actuel de l'espace :\n{context}\n\n---\n\nDemande : {question}"},
    ]

    actions_log = []  # Journal des actions effectuées

    for iteration in range(MAX_TOOL_ITERATIONS):
        print(f"[IA Assistant] Itération {iteration + 1}/{MAX_TOOL_ITERATIONS}")

        result = await call_ia_with_tools("assistant", messages, TOOLS)

        if result.get("error"):
            # Erreur de configuration
            cfg = await get_ia_config("assistant")
            if cfg is None:
                return "L'assistant IA n'est pas configuré. Allez dans Config IA."
            missing = []
            if not cfg.get("url"): missing.append("URL")
            if not cfg.get("modele"): missing.append("Modèle")
            if cfg.get("mode") == "api" and not cfg.get("cle_api"): missing.append("Clé API")
            if missing:
                return f"Configuration IA incomplète : {', '.join(missing)}"
            return f"Erreur IA : {result['error']}"

        # Si l'IA a fait des appels d'outils
        if result.get("tool_calls"):
            # Ajouter la réponse de l'IA (avec tool calls) dans l'historique
            assistant_msg = {"role": "assistant", "content": result.get("content") or ""}
            # Format OpenAI : la réponse contient les tool_calls
            assistant_msg["tool_calls"] = [
                {
                    "id": tc["id"],
                    "type": "function",
                    "function": {
                        "name": tc["name"],
                        "arguments": str(tc["arguments"]) if isinstance(tc["arguments"], dict)
                                     else tc["arguments"],
                    }
                }
                for tc in result["tool_calls"]
            ]
            messages.append(assistant_msg)

            # Exécuter chaque outil
            for tc in result["tool_calls"]:
                print(f"[IA Assistant] Tool call: {tc['name']}({tc['arguments']})")
                tool_result = await execute_tool(espace_id, tc["name"], tc["arguments"])
                actions_log.append(f"{tc['name']}: {tool_result}")
                print(f"[IA Assistant] Résultat: {tool_result[:200]}")

                # Ajouter le résultat dans l'historique (format OpenAI)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc["id"],
                    "content": tool_result,
                })

            # Continuer la boucle pour que l'IA puisse faire d'autres appels
            continue

        # L'IA a répondu avec du texte (pas de tool call) → réponse finale
        content = result.get("content", "")

        # Ajouter le journal des actions si des outils ont été appelés
        if actions_log:
            actions_summary = "\n".join(f"  • {a}" for a in actions_log)
            content = f"**Actions effectuées :**\n{actions_summary}\n\n---\n\n{content}"

        return content

    # Max itérations atteintes
    if actions_log:
        actions_summary = "\n".join(f"  • {a}" for a in actions_log)
        return f"**Actions effectuées ({len(actions_log)}) :**\n{actions_summary}\n\n(Limite d'itérations atteinte — l'IA a terminé ses actions.)"

    return "L'assistant n'a pas pu répondre (limite d'itérations atteinte)."
