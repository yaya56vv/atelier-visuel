"""API — Assistant IA (dialogue, analyse d'espace, suggestions)."""

from fastapi import APIRouter
from pydantic import BaseModel

from services.ia_assistant import ask_assistant

router = APIRouter()


class IAQuestion(BaseModel):
    espace_id: str
    question: str


@router.post("/ask")
async def ia_ask(data: IAQuestion):
    response = await ask_assistant(data.espace_id, data.question)
    return {"response": response}
