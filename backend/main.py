"""Atelier Visuel de Pensée — Point d'entrée FastAPI."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import espaces, blocs, liaisons, config_ia
from db.database import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
