"""API — Gestion des liaisons (CRUD)."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def create_liaison():
    return {"status": "not_implemented"}
