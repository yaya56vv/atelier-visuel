"""Service Méta-Graphe — Suggestions IA de liaisons inter-espaces (Phase 5).

Analyse les blocs de tous les espaces pour détecter des connexions sémantiques
et proposer des liaisons inter-espaces. Les suggestions arrivent en état
`en_attente` avec `origine=ia_suggestion` — l'utilisateur valide ou rejette.

Le poids suggéré est strictement indicatif : l'utilisateur garde la maîtrise.
Aucun poids algorithmique implicite n'est injecté.

Heuristiques (cf. CENTRAL.md §5.11) :
- Même entité/concept entre espaces → prolongement
- Bloc orange (problème) ↔ bloc jaune (solution) → application
- Blocs violet/bleu résonnants → analogie
- Espaces isolés (aucune liaison inter) → signalement
- Dépendances structurelles → dependance
"""

import json
import uuid
from datetime import datetime, timezone

from db.database import get_db


# ═══════════════════════════════════════════════════════════
#  HEURISTIQUES LOCALES (sans appel LLM)
# ═══════════════════════════════════════════════════════════

async def detecter_suggestions_inter_espaces() -> list[dict]:
    """Détecte des connexions potentielles entre espaces par heuristiques.

    Retourne une liste de suggestions (non encore persistées).
    Chaque suggestion = {
        bloc_source_id, bloc_cible_id, type, poids, justification
    }
    """
    db = await get_db()

    # Charger tous les blocs avec leur espace et métadonnées IA
    blocs = await db.execute_fetchall(
        """SELECT id, espace_id, couleur, forme, titre_ia, resume_ia,
                  entites, mots_cles
           FROM blocs ORDER BY espace_id"""
    )
    blocs_list = [dict(b) for b in blocs]

    if len(blocs_list) < 2:
        return []

    # Charger les liaisons existantes pour éviter les doublons
    liaisons_existantes = await db.execute_fetchall(
        "SELECT bloc_source_id, bloc_cible_id FROM liaisons"
    )
    paires_existantes = set()
    for l in liaisons_existantes:
        l = dict(l)
        pair = tuple(sorted([l["bloc_source_id"], l["bloc_cible_id"]]))
        paires_existantes.add(pair)

    # Indexer par espace
    par_espace: dict[str, list[dict]] = {}
    for b in blocs_list:
        eid = b["espace_id"]
        if eid not in par_espace:
            par_espace[eid] = []
        par_espace[eid].append(b)

    espaces = list(par_espace.keys())
    if len(espaces) < 2:
        return []

    suggestions: list[dict] = []

    # Comparer les blocs entre espaces différents
    for i, espace_a in enumerate(espaces):
        for espace_b in espaces[i + 1:]:
            for bloc_a in par_espace[espace_a]:
                for bloc_b in par_espace[espace_b]:
                    pair = tuple(sorted([bloc_a["id"], bloc_b["id"]]))
                    if pair in paires_existantes:
                        continue

                    suggestion = _evaluer_paire(bloc_a, bloc_b)
                    if suggestion:
                        suggestions.append(suggestion)
                        paires_existantes.add(pair)  # Éviter doublons dans la session

    return suggestions


def _evaluer_paire(a: dict, b: dict) -> dict | None:
    """Évalue si deux blocs d'espaces différents méritent une liaison.

    Retourne une suggestion ou None.
    """
    # Extraire les mots-clés et entités
    mots_a = _extraire_termes(a)
    mots_b = _extraire_termes(b)

    if not mots_a or not mots_b:
        return None

    # Intersection des termes
    communs = mots_a & mots_b

    if not communs:
        return None

    # Score basé sur le ratio de termes communs
    ratio = len(communs) / min(len(mots_a), len(mots_b))

    if ratio < 0.15:
        return None  # Trop peu de recouvrement

    # Déterminer le type de liaison selon les couleurs sémantiques
    liaison_type, justification = _determiner_type(a, b, communs, ratio)

    # Poids suggeré = indicatif, jamais algorithmique implicite
    poids_suggere = min(1.0, round(0.4 + ratio * 0.5, 2))

    return {
        "bloc_source_id": a["id"],
        "bloc_cible_id": b["id"],
        "type": liaison_type,
        "poids": poids_suggere,
        "justification": justification,
    }


def _extraire_termes(bloc: dict) -> set[str]:
    """Extrait un ensemble de termes normalisés d'un bloc."""
    termes = set()

    # Mots-clés IA
    if bloc.get("mots_cles"):
        try:
            mots = json.loads(bloc["mots_cles"])
            if isinstance(mots, list):
                for m in mots:
                    termes.add(str(m).lower().strip())
        except (json.JSONDecodeError, TypeError):
            for mot in str(bloc["mots_cles"]).split(","):
                t = mot.strip().lower()
                if t:
                    termes.add(t)

    # Entités IA
    if bloc.get("entites"):
        try:
            ents = json.loads(bloc["entites"])
            if isinstance(ents, list):
                for e in ents:
                    termes.add(str(e).lower().strip())
        except (json.JSONDecodeError, TypeError):
            for ent in str(bloc["entites"]).split(","):
                t = ent.strip().lower()
                if t:
                    termes.add(t)

    # Titre IA (mots significatifs > 3 lettres)
    if bloc.get("titre_ia"):
        for mot in bloc["titre_ia"].split():
            t = mot.strip().lower()
            if len(t) > 3:
                termes.add(t)

    return termes


def _determiner_type(a: dict, b: dict, communs: set, ratio: float) -> tuple[str, str]:
    """Détermine le type de liaison et la justification."""
    c_a = a.get("couleur", "")
    c_b = b.get("couleur", "")
    termes_str = ", ".join(sorted(communs)[:5])

    # Orange (problème) ↔ Jaune (solution)
    if {c_a, c_b} == {"orange", "yellow"}:
        return "application", f"Problème ↔ Solution — termes communs : {termes_str}"

    # Violet/Bleu résonnants
    if c_a in ("violet", "blue") and c_b in ("violet", "blue"):
        return "analogie", f"Résonance conceptuelle — termes communs : {termes_str}"

    # Fort recouvrement → prolongement
    if ratio > 0.4:
        return "prolongement", f"Forte continuité thématique ({ratio:.0%}) — {termes_str}"

    # Vert (matière) ↔ Violet (sens) → fondation
    if {c_a, c_b} == {"green", "violet"}:
        return "fondation", f"Matière ↔ Sens — termes communs : {termes_str}"

    # Défaut → complémentarité
    return "complementarite", f"Thèmes liés entre espaces — {termes_str}"


# ═══════════════════════════════════════════════════════════
#  PERSISTANCE DES SUGGESTIONS
# ═══════════════════════════════════════════════════════════

async def persister_suggestions(suggestions: list[dict]) -> int:
    """Insère les suggestions comme liaisons en_attente.

    Retourne le nombre de suggestions créées.
    """
    if not suggestions:
        return 0

    db = await get_db()
    now = datetime.now(timezone.utc).isoformat()
    count = 0

    for s in suggestions:
        lid = str(uuid.uuid4())
        metadata = json.dumps({"justification": s["justification"]}, ensure_ascii=False)

        await db.execute(
            """INSERT INTO liaisons
               (id, bloc_source_id, bloc_cible_id, type, poids, origine, validation, metadata, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, 'ia_suggestion', 'en_attente', ?, ?, ?)""",
            (lid, s["bloc_source_id"], s["bloc_cible_id"], s["type"],
             s["poids"], metadata, now, now),
        )
        count += 1

    await db.commit()
    return count


async def suggerer_et_persister() -> str:
    """Pipeline complet : détection + persistance. Retourne un résumé."""
    suggestions = await detecter_suggestions_inter_espaces()

    if not suggestions:
        return "Aucune suggestion inter-espaces détectée."

    count = await persister_suggestions(suggestions)

    # Résumé par type
    par_type: dict[str, int] = {}
    for s in suggestions:
        par_type[s["type"]] = par_type.get(s["type"], 0) + 1

    detail = ", ".join(f"{t}: {n}" for t, n in sorted(par_type.items()))
    return f"✓ {count} suggestions inter-espaces créées (en attente de validation).\n  Types : {detail}"
