"""API — Configuration IA (lecture/modification)."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_config():
    return {"status": "not_implemented"}
