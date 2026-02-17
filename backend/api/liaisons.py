"""API — Gestion des liaisons (CRUD)."""

import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.database import get_db

router = APIRouter()

TypeLiaison = Literal["simple", "logique", "tension", "ancree"]


class LiaisonCreate(BaseModel):
    espace_id: str
    bloc_source_id: str
    bloc_cible_id: str
    type: TypeLiaison = "simple"


@router.post("/", status_code=201)
async def create_liaison(data: LiaisonCreate):
    db = await get_db()

    # Vérifier que l'espace existe
    rows = await db.execute_fetchall("SELECT id FROM espaces WHERE id = ?", (data.espace_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Espace non trouvé")

    # Vérifier que les deux blocs existent et appartiennent à l'espace
    for bid in (data.bloc_source_id, data.bloc_cible_id):
        rows = await db.execute_fetchall(
            "SELECT id FROM blocs WHERE id = ? AND espace_id = ?", (bid, data.espace_id)
        )
        if not rows:
            raise HTTPException(status_code=404, detail=f"Bloc {bid} non trouvé dans cet espace")

    # Empêcher l'auto-liaison
    if data.bloc_source_id == data.bloc_cible_id:
        raise HTTPException(status_code=400, detail="Un bloc ne peut pas être lié à lui-même")

    liaison_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        """INSERT INTO liaisons (id, espace_id, bloc_source_id, bloc_cible_id, type, created_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (liaison_id, data.espace_id, data.bloc_source_id, data.bloc_cible_id, data.type, now),
    )
    await db.commit()
    row = await db.execute_fetchall("SELECT * FROM liaisons WHERE id = ?", (liaison_id,))
    return dict(row[0])


@router.get("/{liaison_id}")
async def get_liaison(liaison_id: str):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM liaisons WHERE id = ?", (liaison_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Liaison non trouvée")
    return dict(rows[0])


@router.delete("/{liaison_id}", status_code=204)
async def delete_liaison(liaison_id: str):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM liaisons WHERE id = ?", (liaison_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Liaison non trouvée")

    await db.execute("DELETE FROM liaisons WHERE id = ?", (liaison_id,))
    await db.commit()
