"""API — Configuration IA (lecture/modification/test connexion)."""

from datetime import datetime, timezone
from typing import Literal

import httpx
from fastapi import APIRouter
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


@router.post("/{role}/test")
async def test_connection(role: Literal["graphe", "assistant"]):
    """Teste la connexion IA pour un rôle donné."""
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM config_ia WHERE role = ?", (role,))
    if not rows:
        return {"ok": False, "detail": "Aucune configuration trouvée"}

    cfg = dict(rows[0])
    mode = cfg.get("mode", "local")
    url = cfg.get("url", "")
    modele = cfg.get("modele", "")

    if not url:
        return {"ok": False, "detail": "URL non configurée"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            if mode == "local":
                resp = await client.get(f"{url.rstrip('/')}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    if modele and modele not in models:
                        return {"ok": True, "detail": f"Serveur OK, modèle '{modele}' non trouvé. Disponibles: {', '.join(models[:5])}"}
                    return {"ok": True, "detail": "Connexion OK"}
                return {"ok": False, "detail": f"Serveur a répondu {resp.status_code}"}
            else:
                headers = {}
                cle = cfg.get("cle_api", "")
                if cle:
                    headers["Authorization"] = f"Bearer {cle}"
                resp = await client.get(f"{url.rstrip('/')}/models", headers=headers)
                if resp.status_code == 200:
                    return {"ok": True, "detail": "Connexion OK"}
                return {"ok": False, "detail": f"API a répondu {resp.status_code}"}
    except httpx.TimeoutException:
        return {"ok": False, "detail": "Timeout — le serveur ne répond pas"}
    except Exception as e:
        return {"ok": False, "detail": f"Erreur: {str(e)}"}
