"""Connexion SQLite — Initialisation, fermeture, migrations et seed."""

import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

import aiosqlite

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "atelier.db"
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"

_db: aiosqlite.Connection | None = None

# Palette de couleurs d'identité pour les espaces (graphe global)
COULEURS_IDENTITE = [
    "#4A6741",  # vert forêt
    "#6B4A7A",  # prune
    "#4A6B8A",  # bleu acier
    "#8A6B4A",  # terre
    "#6B8A4A",  # mousse
    "#8A4A5A",  # bordeaux
    "#4A8A7A",  # turquoise
    "#7A7A4A",  # olive
]


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

    # Migrations incrémentales
    await _migrate_contenus_bloc()
    await _migrate_v2_graphe_global()


# ═══════════════════════════════════════════════════════════════
# MIGRATIONS
# ═══════════════════════════════════════════════════════════════


async def _get_columns(table: str) -> set[str]:
    """Récupère les noms des colonnes d'une table."""
    db = await get_db()
    cursor = await db.execute(f"PRAGMA table_info({table})")
    return {row[1] for row in await cursor.fetchall()}


async def _migrate_contenus_bloc() -> None:
    """V1 → 3A : colonnes enrichies sur contenus_bloc."""
    db = await get_db()
    existing = await _get_columns("contenus_bloc")

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
            print(f"[Migration 3A] Ajout colonne contenus_bloc.{col_name}")

    await db.commit()


async def _migrate_v2_graphe_global() -> None:
    """V1 → V2 : modèle unifié liaisons + coordonnées globales + couleur identité.

    Cette migration :
    1. Ajoute x_global, y_global aux blocs
    2. Ajoute couleur_identite aux espaces
    3. Recrée la table liaisons avec le schéma V2 unifié
       (SQLite ne supporte pas ALTER CHECK, on doit recréer)
    """
    db = await get_db()

    # ── 1. Blocs : coordonnées globales ──────────────────
    blocs_cols = await _get_columns("blocs")
    if "x_global" not in blocs_cols:
        await db.execute("ALTER TABLE blocs ADD COLUMN x_global REAL")
        await db.execute("ALTER TABLE blocs ADD COLUMN y_global REAL")
        print("[Migration V2] Ajout colonnes blocs.x_global, blocs.y_global")

    # ── 2. Espaces : couleur d'identité ──────────────────
    espaces_cols = await _get_columns("espaces")
    if "couleur_identite" not in espaces_cols:
        await db.execute("ALTER TABLE espaces ADD COLUMN couleur_identite TEXT DEFAULT '#667788'")
        print("[Migration V2] Ajout colonne espaces.couleur_identite")

        # Attribuer des couleurs aux espaces existants
        rows = await db.execute_fetchall("SELECT id FROM espaces ORDER BY created_at")
        for i, row in enumerate(rows):
            couleur = COULEURS_IDENTITE[i % len(COULEURS_IDENTITE)]
            await db.execute(
                "UPDATE espaces SET couleur_identite = ? WHERE id = ?",
                (couleur, row["id"]),
            )
        if rows:
            print(f"[Migration V2] Couleurs d'identité attribuées à {len(rows)} espaces")

    # ── 3. Liaisons : recréation avec schéma V2 ─────────
    liaisons_cols = await _get_columns("liaisons")

    if "poids" not in liaisons_cols:
        # La table liaisons V1 existe avec espace_id et CHECK restreint
        # On doit la recréer pour élargir les CHECK et supprimer espace_id
        print("[Migration V2] Recréation table liaisons (V1 → V2 unifié)...")

        # Sauvegarder les données existantes
        existing_liaisons = await db.execute_fetchall("SELECT * FROM liaisons")
        existing_data = [dict(r) for r in existing_liaisons]
        print(f"[Migration V2] {len(existing_data)} liaisons existantes sauvegardées")

        # Supprimer anciens index qui référencent l'ancienne table
        await db.execute("DROP INDEX IF EXISTS idx_liaisons_espace")
        await db.execute("DROP INDEX IF EXISTS idx_liaisons_source")
        await db.execute("DROP INDEX IF EXISTS idx_liaisons_cible")
        await db.execute("DROP INDEX IF EXISTS idx_liaisons_type")
        await db.execute("DROP INDEX IF EXISTS idx_liaisons_validation")

        # Supprimer l'ancienne table
        await db.execute("DROP TABLE IF EXISTS liaisons")

        # Créer la nouvelle table V2
        await db.execute("""
            CREATE TABLE liaisons (
                id TEXT PRIMARY KEY,
                bloc_source_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
                bloc_cible_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
                type TEXT NOT NULL DEFAULT 'simple' CHECK(type IN (
                    'simple', 'logique', 'tension', 'ancree',
                    'prolongement', 'fondation', 'complementarite',
                    'application', 'analogie', 'dependance', 'exploration'
                )),
                poids REAL DEFAULT 1.0 CHECK(poids >= 0.0 AND poids <= 1.0),
                origine TEXT DEFAULT 'manuel' CHECK(origine IN ('manuel', 'auto', 'ia_suggestion')),
                validation TEXT DEFAULT 'valide' CHECK(validation IN ('valide', 'en_attente', 'rejete')),
                label TEXT,
                metadata TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Recréer les index
        await db.execute("CREATE INDEX idx_liaisons_source ON liaisons(bloc_source_id)")
        await db.execute("CREATE INDEX idx_liaisons_cible ON liaisons(bloc_cible_id)")
        await db.execute("CREATE INDEX idx_liaisons_type ON liaisons(type)")
        await db.execute("CREATE INDEX idx_liaisons_validation ON liaisons(validation)")

        # Réinsérer les données avec les valeurs par défaut V2
        now = datetime.now(timezone.utc).isoformat()
        for l in existing_data:
            await db.execute(
                """INSERT INTO liaisons
                   (id, bloc_source_id, bloc_cible_id, type, poids, origine, validation, created_at, updated_at)
                   VALUES (?, ?, ?, ?, 1.0, 'manuel', 'valide', ?, ?)""",
                (l["id"], l["bloc_source_id"], l["bloc_cible_id"], l["type"],
                 l["created_at"], now),
            )

        print(f"[Migration V2] {len(existing_data)} liaisons restaurées avec schéma V2")

    await db.commit()
    print("[Migration V2] Migration graphe global terminée ✓")


# ═══════════════════════════════════════════════════════════════
# FERMETURE
# ═══════════════════════════════════════════════════════════════


async def close_db() -> None:
    global _db
    if _db is not None:
        await _db.close()
        _db = None


# ═══════════════════════════════════════════════════════════════
# SEED — Données initiales
# ═══════════════════════════════════════════════════════════════


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
        "INSERT INTO espaces (id, nom, theme, couleur_identite, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        (espace_idees, "IDÉES", "réflexion", COULEURS_IDENTITE[0], now, now),
    )
    await db.execute(
        "INSERT INTO espaces (id, nom, theme, couleur_identite, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        (espace_conception, "CONCEPTION", "structuration", COULEURS_IDENTITE[1], now, now),
    )

    # ─── Blocs de démo dans IDÉES ────────────────────────
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

    # ─── Liaisons V2 (sans espace_id) ────────────────────
    liaisons_demo = [
        (bloc_ids[0], bloc_ids[2], "simple"),     # vert → jaune
        (bloc_ids[1], bloc_ids[2], "logique"),     # orange → jaune
        (bloc_ids[4], bloc_ids[3], "fondation"),   # violet → bleu (V2 : fondation)
        (bloc_ids[5], bloc_ids[0], "exploration"), # mauve → vert (V2 : exploration)
    ]

    for src, dst, ltype in liaisons_demo:
        lid = str(uuid.uuid4())
        await db.execute(
            """INSERT INTO liaisons (id, bloc_source_id, bloc_cible_id, type, poids, origine, validation, created_at, updated_at)
               VALUES (?, ?, ?, ?, 1.0, 'manuel', 'valide', ?, ?)""",
            (lid, src, dst, ltype, now, now),
        )

    # ─── Config IA depuis .env ───────────────────────────
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    base_url = os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    graphe_model = os.environ.get("IA_GRAPHE_MODEL", "anthropic/claude-opus-4.6")
    assistant_model = os.environ.get("IA_ASSISTANT_MODEL", "anthropic/claude-opus-4.6")

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
