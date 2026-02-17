"""API — Configuration IA (lecture/modification)."""

from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.database import get_db

router = APIRouter()


class ConfigIAUpdate(BaseModel):
    mode: Literal["local", "api"]
    url: str | None = None
    modele: str | None = None
    cle_api: str | None = None


@router.get("/")
async def get_config():
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM config_ia ORDER BY role")
    return [dict(r) for r in rows]


@router.get("/{role}")
async def get_config_role(role: Literal["graphe", "assistant"]):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM config_ia WHERE role = ?", (role,))
    if not rows:
        return {"role": role, "mode": None, "url": None, "modele": None, "cle_api": None}
    return dict(rows[0])


@router.put("/{role}")
async def update_config_role(role: Literal["graphe", "assistant"], data: ConfigIAUpdate):
    db = await get_db()
    now = datetime.now(timezone.utc).isoformat()

    rows = await db.execute_fetchall("SELECT role FROM config_ia WHERE role = ?", (role,))
    if rows:
        await db.execute(
            "UPDATE config_ia SET mode = ?, url = ?, modele = ?, cle_api = ?, updated_at = ? WHERE role = ?",
            (data.mode, data.url, data.modele, data.cle_api, now, role),
        )
    else:
        await db.execute(
            "INSERT INTO config_ia (role, mode, url, modele, cle_api, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (role, data.mode, data.url, data.modele, data.cle_api, now),
        )
    await db.commit()

    row = await db.execute_fetchall("SELECT * FROM config_ia WHERE role = ?", (role,))
    return dict(row[0])
