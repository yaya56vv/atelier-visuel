"""API — Assistant IA (dialogue, analyse d'espace, suggestions, réorganisation)."""

from fastapi import APIRouter
from pydantic import BaseModel

from services.ia_assistant import ask_assistant
from services.force_layout import reorganiser_espace, reorganiser_global
from services.meta_graphe import suggerer_et_persister

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
    """Réorganise le graphe d'un espace avec l'algorithme force-directed."""
    result = await reorganiser_espace(data.espace_id)
    return {"result": result}


@router.post("/reorganiser-global")
async def ia_reorganiser_global():
    """Positionne tous les blocs dans le graphe global (x_global/y_global)."""
    result = await reorganiser_global()
    return {"scope": "global", "result": result}


@router.post("/suggerer-liaisons")
async def ia_suggerer_liaisons():
    """Suggestions IA de liaisons inter-espaces.

    Détecte des connexions sémantiques entre blocs d'espaces différents
    et les persiste en état `en_attente` avec `origine=ia_suggestion`.
    Le poids est indicatif — l'utilisateur valide ou rejette.
    """
    result = await suggerer_et_persister()
    return {"scope": "global", "result": result}
