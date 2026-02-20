"""Connexion SQLite — Initialisation, fermeture, et seed de la base de données."""

import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

import aiosqlite

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "atelier.db"
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"

_db: aiosqlite.Connection | None = None


async def get_db() -> aiosqlite.Connection:
    if _db is None:
        raise RuntimeError("Base de données non initialisée.")
    return _db


async def init_db() -> None:
    global _db
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    _db = await aiosqlite.connect(str(DB_PATH))
    _db.row_factory = aiosqlite.Row
    await _db.execute("PRAGMA foreign_keys = ON")

    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    await _db.executescript(schema)
    await _db.commit()

    # Migration : ajouter les colonnes enrichies si absentes (3A)
    await _migrate_contenus_bloc()


async def _migrate_contenus_bloc() -> None:
    """Ajoute les colonnes de métadonnées enrichies à contenus_bloc si absentes."""
    db = await get_db()
    # Récupérer les colonnes existantes
    cursor = await db.execute("PRAGMA table_info(contenus_bloc)")
    existing = {row[1] for row in await cursor.fetchall()}

    migrations = [
        ("hash_contenu", "ALTER TABLE contenus_bloc ADD COLUMN hash_contenu TEXT"),
        ("taille", "ALTER TABLE contenus_bloc ADD COLUMN taille INTEGER"),
        ("mime_type", "ALTER TABLE contenus_bloc ADD COLUMN mime_type TEXT"),
        ("chemin_fichier", "ALTER TABLE contenus_bloc ADD COLUMN chemin_fichier TEXT"),
        ("origine", "ALTER TABLE contenus_bloc ADD COLUMN origine TEXT DEFAULT 'user'"),
        ("extraction_auto", "ALTER TABLE contenus_bloc ADD COLUMN extraction_auto INTEGER DEFAULT 0"),
        ("id_parent", "ALTER TABLE contenus_bloc ADD COLUMN id_parent TEXT REFERENCES contenus_bloc(id) ON DELETE SET NULL"),
    ]

    for col_name, sql in migrations:
        if col_name not in existing:
            await db.execute(sql)
            print(f"[Migration] Ajout colonne contenus_bloc.{col_name}")

    await db.commit()


async def close_db() -> None:
    global _db
    if _db is not None:
        await _db.close()
        _db = None


async def seed_db() -> None:
    """Seed des données initiales si la base est vide.

    Crée les espaces IDÉES et CONCEPTION, les blocs de démo avec contenus,
    les liaisons, et la configuration IA depuis les variables d'environnement.
    """
    db = await get_db()

    # Vérifier si des espaces existent déjà
    rows = await db.execute_fetchall("SELECT COUNT(*) as c FROM espaces")
    if rows[0]["c"] > 0:
        return  # Base déjà peuplée, ne pas ré-insérer

    now = datetime.now(timezone.utc).isoformat()

    # ─── Espaces (CENTRAL.md §2.4) ───────────────────────
    espace_idees = str(uuid.uuid4())
    espace_conception = str(uuid.uuid4())

    await db.execute(
        "INSERT INTO espaces (id, nom, theme, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        (espace_idees, "IDÉES", "réflexion", now, now),
    )
    await db.execute(
        "INSERT INTO espaces (id, nom, theme, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        (espace_conception, "CONCEPTION", "structuration", now, now),
    )

    # ─── Blocs de démo dans IDÉES ────────────────────────
    # Chaque bloc illustre une combinaison couleur×forme de la grammaire sémantique
    blocs_demo = [
        {
            "couleur": "green", "forme": "cloud",
            "x": 200, "y": 200, "largeur": 220, "hauteur": 130,
            "titre_ia": "IA locale et souveraineté des données",
            "contenu": "L'intelligence artificielle locale permet de garder les données sensibles sur la machine de l'utilisateur, sans dépendance cloud.",
        },
        {
            "couleur": "orange", "forme": "rounded-rect",
            "x": 500, "y": 150, "largeur": 230, "hauteur": 130,
            "titre_ia": "Fragmentation de l'information",
            "contenu": "Problème : les outils de prise de notes actuels fragmentent l'information dans des hiérarchies rigides. Impossible de voir les connexions.",
        },
        {
            "couleur": "yellow", "forme": "square",
            "x": 350, "y": 400, "largeur": 220, "hauteur": 120,
            "titre_ia": "Connectabilité permanente",
            "contenu": "Règle : toute information stockée doit rester connectable et explorable. Le stockage mort est l'ennemi.",
        },
        {
            "couleur": "blue", "forme": "oval",
            "x": 700, "y": 250, "largeur": 230, "hauteur": 130,
            "titre_ia": "Le graphe spatial comme modèle naturel",
            "contenu": "Analyse : un système de graphe spatial permet de représenter les relations naturelles entre idées, sans imposer de hiérarchie.",
        },
        {
            "couleur": "violet", "forme": "circle",
            "x": 450, "y": 550, "largeur": 180, "hauteur": 180,
            "titre_ia": "La pensée est relationnelle",
            "contenu": "Conviction : la pensée humaine est relationnelle, pas arborescente. L'outil doit refléter cette réalité.",
        },
        {
            "couleur": "mauve", "forme": "cloud",
            "x": 150, "y": 450, "largeur": 210, "hauteur": 120,
            "titre_ia": "Dictée vocale vers bloc coloré",
            "contenu": "Et si on pouvait dicter une idée et la voir apparaître directement comme un bloc coloré dans l'espace ?",
        },
    ]

    bloc_ids = []
    for b in blocs_demo:
        bid = str(uuid.uuid4())
        bloc_ids.append(bid)
        await db.execute(
            """INSERT INTO blocs (id, espace_id, x, y, forme, couleur, largeur, hauteur, titre_ia, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (bid, espace_idees, b["x"], b["y"], b["forme"], b["couleur"],
             b["largeur"], b["hauteur"], b["titre_ia"], now, now),
        )

        # Contenu texte pour chaque bloc
        cid = str(uuid.uuid4())
        await db.execute(
            """INSERT INTO contenus_bloc (id, bloc_id, type, contenu, ordre, created_at)
               VALUES (?, ?, 'texte', ?, 0, ?)""",
            (cid, bid, b["contenu"], now),
        )

    # ─── Liaisons entre blocs ────────────────────────────
    # Bloc 0 (vert) → Bloc 2 (jaune) : simple (le fait nourrit la règle)
    # Bloc 1 (orange) → Bloc 2 (jaune) : logique (le problème appelle la solution)
    # Bloc 4 (violet) → Bloc 3 (bleu) : simple (la conviction fonde l'analyse)
    # Bloc 5 (mauve) → Bloc 0 (vert) : simple (l'hypothèse explore le fait)
    liaisons_demo = [
        (bloc_ids[0], bloc_ids[2], "simple"),
        (bloc_ids[1], bloc_ids[2], "logique"),
        (bloc_ids[4], bloc_ids[3], "simple"),
        (bloc_ids[5], bloc_ids[0], "simple"),
    ]

    for src, dst, ltype in liaisons_demo:
        lid = str(uuid.uuid4())
        await db.execute(
            """INSERT INTO liaisons (id, espace_id, bloc_source_id, bloc_cible_id, type, created_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (lid, espace_idees, src, dst, ltype, now),
        )

    # ─── Config IA depuis .env ───────────────────────────
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    base_url = os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    graphe_model = os.environ.get("IA_GRAPHE_MODEL", "anthropic/claude-opus-4.6")
    assistant_model = os.environ.get("IA_ASSISTANT_MODEL", "anthropic/claude-opus-4.6")

    # Seed config IA seulement si pas déjà configurée
    existing = await db.execute_fetchall("SELECT role FROM config_ia")
    existing_roles = {r["role"] for r in existing}

    if "graphe" not in existing_roles:
        await db.execute(
            "INSERT INTO config_ia (role, mode, url, modele, cle_api, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            ("graphe", "api", base_url, graphe_model, api_key, now),
        )

    if "assistant" not in existing_roles:
        await db.execute(
            "INSERT INTO config_ia (role, mode, url, modele, cle_api, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            ("assistant", "api", base_url, assistant_model, api_key, now),
        )

    await db.commit()
