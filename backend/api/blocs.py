"""API — Gestion des blocs et contenus (CRUD)."""

import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.database import get_db

router = APIRouter()

Forme = Literal["cloud", "rounded-rect", "square", "oval", "circle"]
Couleur = Literal["green", "orange", "yellow", "blue", "violet", "mauve"]
TypeContenu = Literal[
    "texte", "note", "url", "pdf", "image", "video_ref", "fichier", "citation", "tableau"
]


class BlocCreate(BaseModel):
    espace_id: str
    x: float
    y: float
    forme: Forme = "rounded-rect"
    couleur: Couleur = "green"
    largeur: float = 200
    hauteur: float = 120


class BlocUpdate(BaseModel):
    x: float | None = None
    y: float | None = None
    forme: Forme | None = None
    couleur: Couleur | None = None
    largeur: float | None = None
    hauteur: float | None = None


class ContenuCreate(BaseModel):
    type: TypeContenu
    contenu: str | None = None
    metadata: str | None = None
    ordre: int = 0


@router.post("/", status_code=201)
async def create_bloc(data: BlocCreate):
    db = await get_db()

    # Vérifier que l'espace existe
    rows = await db.execute_fetchall("SELECT id FROM espaces WHERE id = ?", (data.espace_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Espace non trouvé")

    bloc_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        """INSERT INTO blocs (id, espace_id, x, y, forme, couleur, largeur, hauteur, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (bloc_id, data.espace_id, data.x, data.y, data.forme, data.couleur, data.largeur, data.hauteur, now, now),
    )
    await db.commit()
    row = await db.execute_fetchall("SELECT * FROM blocs WHERE id = ?", (bloc_id,))
    return dict(row[0])


@router.get("/{bloc_id}")
async def get_bloc(bloc_id: str):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM blocs WHERE id = ?", (bloc_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Bloc non trouvé")

    contenus = await db.execute_fetchall(
        "SELECT * FROM contenus_bloc WHERE bloc_id = ? ORDER BY ordre", (bloc_id,)
    )

    bloc = dict(rows[0])
    bloc["contenus"] = [dict(c) for c in contenus]
    return bloc


@router.put("/{bloc_id}")
async def update_bloc(bloc_id: str, data: BlocUpdate):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM blocs WHERE id = ?", (bloc_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Bloc non trouvé")

    current = dict(rows[0])
    now = datetime.now(timezone.utc).isoformat()

    await db.execute(
        """UPDATE blocs SET x = ?, y = ?, forme = ?, couleur = ?, largeur = ?, hauteur = ?, updated_at = ?
           WHERE id = ?""",
        (
            data.x if data.x is not None else current["x"],
            data.y if data.y is not None else current["y"],
            data.forme if data.forme is not None else current["forme"],
            data.couleur if data.couleur is not None else current["couleur"],
            data.largeur if data.largeur is not None else current["largeur"],
            data.hauteur if data.hauteur is not None else current["hauteur"],
            now,
            bloc_id,
        ),
    )
    await db.commit()
    row = await db.execute_fetchall("SELECT * FROM blocs WHERE id = ?", (bloc_id,))
    return dict(row[0])


@router.delete("/{bloc_id}", status_code=204)
async def delete_bloc(bloc_id: str):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM blocs WHERE id = ?", (bloc_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Bloc non trouvé")

    await db.execute("DELETE FROM contenus_bloc WHERE bloc_id = ?", (bloc_id,))
    await db.execute("DELETE FROM liaisons WHERE bloc_source_id = ? OR bloc_cible_id = ?", (bloc_id, bloc_id))
    await db.execute("DELETE FROM blocs WHERE id = ?", (bloc_id,))
    await db.commit()


# --- Contenus de bloc ---

@router.post("/{bloc_id}/contenus", status_code=201)
async def add_contenu(bloc_id: str, data: ContenuCreate):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT id FROM blocs WHERE id = ?", (bloc_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Bloc non trouvé")

    contenu_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        """INSERT INTO contenus_bloc (id, bloc_id, type, contenu, metadata, ordre, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (contenu_id, bloc_id, data.type, data.contenu, data.metadata, data.ordre, now),
    )
    await db.commit()
    row = await db.execute_fetchall("SELECT * FROM contenus_bloc WHERE id = ?", (contenu_id,))
    return dict(row[0])


@router.delete("/{bloc_id}/contenus/{contenu_id}", status_code=204)
async def delete_contenu(bloc_id: str, contenu_id: str):
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT id FROM contenus_bloc WHERE id = ? AND bloc_id = ?", (contenu_id, bloc_id)
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Contenu non trouvé")

    await db.execute("DELETE FROM contenus_bloc WHERE id = ?", (contenu_id,))
    await db.commit()
