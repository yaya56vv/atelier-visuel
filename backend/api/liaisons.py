"""API — Gestion des liaisons V2 (modèle unifié intra/inter-espaces)."""

import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from db.database import get_db

router = APIRouter()

TypeLiaison = Literal[
    "simple", "logique", "tension", "ancree",
    "prolongement", "fondation", "complementarite",
    "application", "analogie", "dependance", "exploration",
]


class LiaisonCreate(BaseModel):
    bloc_source_id: str
    bloc_cible_id: str
    type: TypeLiaison = "simple"
    poids: float = Field(default=1.0, ge=0.0, le=1.0)
    origine: Literal["manuel", "auto", "ia_suggestion"] = "manuel"
    validation: Literal["valide", "en_attente", "rejete"] = "valide"
    label: str | None = None
    metadata: str | None = None


class LiaisonUpdate(BaseModel):
    type: TypeLiaison | None = None
    poids: float | None = Field(default=None, ge=0.0, le=1.0)
    validation: Literal["valide", "en_attente", "rejete"] | None = None
    label: str | None = None
    metadata: str | None = None


def _enrich_liaison(row: dict) -> dict:
    """Ajoute les propriétés dérivées inter_espace et scope à une liaison."""
    row["inter_espace"] = row.get("espace_source") != row.get("espace_cible")
    row["scope"] = "global" if row["inter_espace"] else "espace"
    return row


@router.post("/", status_code=201)
async def create_liaison(data: LiaisonCreate):
    db = await get_db()

    # Vérifier que les deux blocs existent (pas de contrainte d'espace)
    for bid in (data.bloc_source_id, data.bloc_cible_id):
        rows = await db.execute_fetchall(
            "SELECT id FROM blocs WHERE id = ?", (bid,)
        )
        if not rows:
            raise HTTPException(status_code=404, detail=f"Bloc {bid} non trouvé")

    # Empêcher l'auto-liaison
    if data.bloc_source_id == data.bloc_cible_id:
        raise HTTPException(status_code=400, detail="Un bloc ne peut pas être lié à lui-même")

    liaison_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        """INSERT INTO liaisons
           (id, bloc_source_id, bloc_cible_id, type, poids, origine, validation, label, metadata, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (liaison_id, data.bloc_source_id, data.bloc_cible_id, data.type,
         data.poids, data.origine, data.validation, data.label, data.metadata,
         now, now),
    )
    await db.commit()

    # Retourner avec propriété dérivée
    row = await db.execute_fetchall(
        """SELECT l.*,
                  bs.espace_id AS espace_source,
                  bc.espace_id AS espace_cible
           FROM liaisons l
           JOIN blocs bs ON l.bloc_source_id = bs.id
           JOIN blocs bc ON l.bloc_cible_id = bc.id
           WHERE l.id = ?""",
        (liaison_id,),
    )
    return _enrich_liaison(dict(row[0]))


@router.get("/{liaison_id}")
async def get_liaison(liaison_id: str):
    db = await get_db()
    rows = await db.execute_fetchall(
        """SELECT l.*,
                  bs.espace_id AS espace_source,
                  bc.espace_id AS espace_cible
           FROM liaisons l
           JOIN blocs bs ON l.bloc_source_id = bs.id
           JOIN blocs bc ON l.bloc_cible_id = bc.id
           WHERE l.id = ?""",
        (liaison_id,),
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Liaison non trouvée")
    return _enrich_liaison(dict(rows[0]))


@router.put("/{liaison_id}")
async def update_liaison(liaison_id: str, data: LiaisonUpdate):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM liaisons WHERE id = ?", (liaison_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Liaison non trouvée")

    current = dict(rows[0])
    now = datetime.now(timezone.utc).isoformat()

    new_type = data.type if data.type is not None else current["type"]
    new_poids = data.poids if data.poids is not None else current["poids"]
    new_validation = data.validation if data.validation is not None else current["validation"]
    new_label = data.label if data.label is not None else current["label"]
    new_metadata = data.metadata if data.metadata is not None else current["metadata"]

    await db.execute(
        """UPDATE liaisons
           SET type = ?, poids = ?, validation = ?, label = ?, metadata = ?, updated_at = ?
           WHERE id = ?""",
        (new_type, new_poids, new_validation, new_label, new_metadata, now, liaison_id),
    )
    await db.commit()

    row = await db.execute_fetchall(
        """SELECT l.*,
                  bs.espace_id AS espace_source,
                  bc.espace_id AS espace_cible
           FROM liaisons l
           JOIN blocs bs ON l.bloc_source_id = bs.id
           JOIN blocs bc ON l.bloc_cible_id = bc.id
           WHERE l.id = ?""",
        (liaison_id,),
    )
    return _enrich_liaison(dict(row[0]))


@router.delete("/{liaison_id}", status_code=204)
async def delete_liaison(liaison_id: str):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM liaisons WHERE id = ?", (liaison_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Liaison non trouvée")

    await db.execute("DELETE FROM liaisons WHERE id = ?", (liaison_id,))
    await db.commit()
