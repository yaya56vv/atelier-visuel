"""API — Assistant IA (dialogue, analyse d'espace, suggestions, réorganisation)."""

from fastapi import APIRouter
from pydantic import BaseModel

from services.ia_assistant import ask_assistant
from services.force_layout import reorganiser_espace

router = APIRouter()


class IAQuestion(BaseModel):
    espace_id: str
    question: str


class ReorgRequest(BaseModel):
    espace_id: str


@router.post("/ask")
async def ia_ask(data: IAQuestion):
    response = await ask_assistant(data.espace_id, data.question)
    return {"response": response}


@router.post("/reorganiser")
async def ia_reorganiser(data: ReorgRequest):
    """Réorganise le graphe avec l'algorithme force-directed."""
    result = await reorganiser_espace(data.espace_id)
    return {"result": result}
