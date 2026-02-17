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

    espace = dict(rows[0])
    espace["blocs"] = [dict(b) for b in blocs]
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
