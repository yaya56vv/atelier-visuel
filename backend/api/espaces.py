"""API — Gestion des espaces (CRUD)."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_espaces():
    return []


@router.post("/")
async def create_espace():
    return {"status": "not_implemented"}
