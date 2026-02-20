"""API — Gestion des espaces (CRUD)."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.database import get_db

router = APIRouter()


class EspaceCreate(BaseModel):
    nom: str
    theme: str


class EspaceUpdate(BaseModel):
    nom: str | None = None
    theme: str | None = None


@router.get("/")
async def list_espaces():
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM espaces ORDER BY created_at DESC")
    return [dict(r) for r in rows]


@router.post("/", status_code=201)
async def create_espace(data: EspaceCreate):
    db = await get_db()
    espace_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        "INSERT INTO espaces (id, nom, theme, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        (espace_id, data.nom, data.theme, now, now),
    )
    await db.commit()
    row = await db.execute_fetchall("SELECT * FROM espaces WHERE id = ?", (espace_id,))
    return dict(row[0])


@router.get("/{espace_id}")
async def get_espace(espace_id: str):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM espaces WHERE id = ?", (espace_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Espace non trouvé")

    blocs = await db.execute_fetchall(
        "SELECT * FROM blocs WHERE espace_id = ? ORDER BY created_at", (espace_id,)
    )
    liaisons = await db.execute_fetchall(
        "SELECT * FROM liaisons WHERE espace_id = ? ORDER BY created_at", (espace_id,)
    )

    # Récupérer les types de contenus par bloc (pour icônes indicatrices canvas)
    import json as _json
    contenus_types = await db.execute_fetchall(
        "SELECT bloc_id, type, metadata FROM contenus_bloc WHERE bloc_id IN "
        "(SELECT id FROM blocs WHERE espace_id = ?)",
        (espace_id,),
    )
    # Grouper par bloc_id → liste de types distincts (avec detail_type si disponible)
    types_par_bloc: dict[str, list[str]] = {}
    for row in contenus_types:
        bid = row["bloc_id"]
        t = row["type"]
        # Vérifier si un detail_type plus précis existe dans les metadata
        if row["metadata"]:
            try:
                meta = _json.loads(row["metadata"])
                if meta.get("detail_type"):
                    t = meta["detail_type"]
                elif meta.get("source") == "youtube_transcript":
                    continue  # Ne pas afficher le texte extrait comme type séparé
            except (ValueError, TypeError):
                pass
        if bid not in types_par_bloc:
            types_par_bloc[bid] = []
        if t not in types_par_bloc[bid]:
            types_par_bloc[bid].append(t)

    espace = dict(rows[0])
    blocs_list = []
    for b in blocs:
        bd = dict(b)
        bd["content_types"] = types_par_bloc.get(bd["id"], [])
        blocs_list.append(bd)
    espace["blocs"] = blocs_list
    espace["liaisons"] = [dict(li) for li in liaisons]
    return espace


@router.put("/{espace_id}")
async def update_espace(espace_id: str, data: EspaceUpdate):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM espaces WHERE id = ?", (espace_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Espace non trouvé")

    current = dict(rows[0])
    nom = data.nom if data.nom is not None else current["nom"]
    theme = data.theme if data.theme is not None else current["theme"]
    now = datetime.now(timezone.utc).isoformat()

    await db.execute(
        "UPDATE espaces SET nom = ?, theme = ?, updated_at = ? WHERE id = ?",
        (nom, theme, now, espace_id),
    )
    await db.commit()
    row = await db.execute_fetchall("SELECT * FROM espaces WHERE id = ?", (espace_id,))
    return dict(row[0])


@router.delete("/{espace_id}", status_code=204)
async def delete_espace(espace_id: str):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM espaces WHERE id = ?", (espace_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Espace non trouvé")

    await db.execute("DELETE FROM liaisons WHERE espace_id = ?", (espace_id,))
    await db.execute(
        "DELETE FROM contenus_bloc WHERE bloc_id IN (SELECT id FROM blocs WHERE espace_id = ?)",
        (espace_id,),
    )
    await db.execute("DELETE FROM blocs WHERE espace_id = ?", (espace_id,))
    await db.execute("DELETE FROM espaces WHERE id = ?", (espace_id,))
    await db.commit()
