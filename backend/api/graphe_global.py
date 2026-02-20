"""API — Graphe global inter-espaces (V2).

Endpoint unique qui charge tous les blocs de tous les espaces avec liaisons,
filtrable par espace(s), type de liaison, poids, validation, inter-espace.

Convention scope : toutes les réponses portent scope='global'.
"""

from fastapi import APIRouter, Query
from db.database import get_db

router = APIRouter()


@router.get("/")
async def get_graphe_global(
    espaces: str | None = Query(None, description="IDs d'espaces séparés par virgule"),
    types_liaison: str | None = Query(None, description="Types de liaison séparés par virgule"),
    inter_seulement: bool = Query(False, description="Uniquement les liaisons inter-espaces"),
    poids_min: float = Query(0.0, ge=0.0, le=1.0, description="Poids minimum des liaisons"),
    validation: str | None = Query(None, description="Filtre par statut de validation"),
    couleur: str | None = Query(None, description="Filtre par couleur sémantique de bloc"),
    forme: str | None = Query(None, description="Filtre par forme de bloc"),
):
    """Retourne le graphe global : tous les espaces, blocs et liaisons filtrés."""
    db = await get_db()

    # ── 1. Charger les espaces ────────────────────────────
    espace_ids = None
    if espaces:
        espace_ids = [e.strip() for e in espaces.split(",") if e.strip()]

    espaces_rows = await db.execute_fetchall(
        "SELECT id, nom, theme, couleur_identite, created_at, updated_at FROM espaces ORDER BY created_at"
    )
    espaces_list = [dict(r) for r in espaces_rows]

    # ── 2. Charger les blocs (filtrés si nécessaire) ──────
    blocs_sql = "SELECT * FROM blocs"
    blocs_conditions = []
    blocs_params: list = []

    if espace_ids:
        placeholders = ",".join("?" * len(espace_ids))
        blocs_conditions.append(f"espace_id IN ({placeholders})")
        blocs_params.extend(espace_ids)

    if couleur:
        blocs_conditions.append("couleur = ?")
        blocs_params.append(couleur)

    if forme:
        blocs_conditions.append("forme = ?")
        blocs_params.append(forme)

    if blocs_conditions:
        blocs_sql += " WHERE " + " AND ".join(blocs_conditions)

    blocs_sql += " ORDER BY created_at"
    blocs_rows = await db.execute_fetchall(blocs_sql, blocs_params)
    blocs_list = [dict(r) for r in blocs_rows]

    # Index des blocs pour filtrage liaisons
    bloc_ids_set = {b["id"] for b in blocs_list}

    # ── 3. Charger les contenus types par bloc ────────────
    if bloc_ids_set:
        import json as _json
        placeholders = ",".join("?" * len(bloc_ids_set))
        contenus_rows = await db.execute_fetchall(
            f"SELECT bloc_id, type, metadata FROM contenus_bloc WHERE bloc_id IN ({placeholders})",
            list(bloc_ids_set),
        )
        types_par_bloc: dict[str, list[str]] = {}
        for row in contenus_rows:
            bid = row["bloc_id"]
            t = row["type"]
            if row["metadata"]:
                try:
                    meta = _json.loads(row["metadata"])
                    if meta.get("detail_type"):
                        t = meta["detail_type"]
                    elif meta.get("source") == "youtube_transcript":
                        continue
                except (ValueError, TypeError):
                    pass
            if bid not in types_par_bloc:
                types_par_bloc[bid] = []
            if t not in types_par_bloc[bid]:
                types_par_bloc[bid].append(t)

        for b in blocs_list:
            b["content_types"] = types_par_bloc.get(b["id"], [])
    else:
        for b in blocs_list:
            b["content_types"] = []

    # ── 4. Charger les liaisons avec propriété dérivée ────
    liaisons_sql = """
        SELECT l.*,
               bs.espace_id AS espace_source,
               bc.espace_id AS espace_cible
        FROM liaisons l
        JOIN blocs bs ON l.bloc_source_id = bs.id
        JOIN blocs bc ON l.bloc_cible_id = bc.id
    """
    liaisons_conditions = []
    liaisons_params: list = []

    # Filtre poids
    if poids_min > 0.0:
        liaisons_conditions.append("l.poids >= ?")
        liaisons_params.append(poids_min)

    # Filtre validation
    if validation:
        liaisons_conditions.append("l.validation = ?")
        liaisons_params.append(validation)

    # Filtre types de liaison
    if types_liaison:
        types_list = [t.strip() for t in types_liaison.split(",") if t.strip()]
        if types_list:
            placeholders = ",".join("?" * len(types_list))
            liaisons_conditions.append(f"l.type IN ({placeholders})")
            liaisons_params.extend(types_list)

    if liaisons_conditions:
        liaisons_sql += " WHERE " + " AND ".join(liaisons_conditions)

    liaisons_sql += " ORDER BY l.created_at"
    liaisons_rows = await db.execute_fetchall(liaisons_sql, liaisons_params)

    # Filtrer les liaisons selon les blocs présents et le mode inter
    liaisons_list = []
    for r in liaisons_rows:
        lr = dict(r)
        lr["inter_espace"] = lr["espace_source"] != lr["espace_cible"]
        lr["scope"] = "global" if lr["inter_espace"] else "espace"

        # Filtre inter seulement
        if inter_seulement and not lr["inter_espace"]:
            continue

        # Filtre par espaces : au moins un des deux blocs doit être dans les espaces filtrés
        if espace_ids:
            src_in = lr["espace_source"] in espace_ids
            dst_in = lr["espace_cible"] in espace_ids
            if not (src_in or dst_in):
                continue

        # Les deux blocs de la liaison doivent exister dans le résultat filtré
        # (sauf si la liaison est inter et un seul côté est filtré → on la garde)
        if lr["bloc_source_id"] in bloc_ids_set or lr["bloc_cible_id"] in bloc_ids_set:
            liaisons_list.append(lr)

    return {
        "scope": "global",
        "espaces": espaces_list,
        "blocs": blocs_list,
        "liaisons": liaisons_list,
    }
