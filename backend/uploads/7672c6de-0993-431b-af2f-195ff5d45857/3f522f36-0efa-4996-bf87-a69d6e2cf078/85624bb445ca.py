"""Atelier Visuel de Pensée — Point d'entrée FastAPI."""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import espaces, blocs, liaisons, config_ia, ia, upload
from db.database import init_db, close_db, seed_db

# Charger .env depuis la racine du projet
_env_path = Path(__file__).resolve().parent.parent / ".env"
if _env_path.exists():
    load_dotenv(_env_path)
else:
    logging.warning(
        "Fichier .env absent (%s). L'IA ne sera pas configurée. "
        "Copiez .env.example en .env et ajoutez votre clé OPENROUTER_API_KEY.",
        _env_path,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_db()
    yield
    await close_db()


app = FastAPI(
    title="Atelier Visuel de Pensée",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(espaces.router, prefix="/api/espaces", tags=["espaces"])
app.include_router(blocs.router, prefix="/api/blocs", tags=["blocs"])
app.include_router(liaisons.router, prefix="/api/liaisons", tags=["liaisons"])
app.include_router(config_ia.router, prefix="/api/config-ia", tags=["config-ia"])
app.include_router(ia.router, prefix="/api/ia", tags=["ia"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
