"""API — Gestion des blocs (CRUD)."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def create_bloc():
    return {"status": "not_implemented"}
