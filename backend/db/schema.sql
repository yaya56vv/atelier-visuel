-- Atelier Visuel de Pensée — Schéma SQLite V1

CREATE TABLE IF NOT EXISTS espaces (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    theme TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocs (
    id TEXT PRIMARY KEY,
    espace_id TEXT NOT NULL REFERENCES espaces(id),
    x REAL NOT NULL,
    y REAL NOT NULL,
    forme TEXT NOT NULL CHECK(forme IN ('cloud','rounded-rect','square','oval','circle')),
    couleur TEXT NOT NULL CHECK(couleur IN ('green','orange','yellow','blue','violet','mauve')),
    largeur REAL DEFAULT 200,
    hauteur REAL DEFAULT 120,
    titre_ia TEXT,
    resume_ia TEXT,
    entites TEXT,
    mots_cles TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contenus_bloc (
    id TEXT PRIMARY KEY,
    bloc_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('texte','note','url','pdf','image','video_ref','fichier','citation','tableau')),
    contenu TEXT,
    metadata TEXT,
    ordre INTEGER DEFAULT 0,
    -- Métadonnées enrichies (3A)
    hash_contenu TEXT,               -- SHA-256 du fichier (dédoublonnage)
    taille INTEGER,                  -- Taille en octets
    mime_type TEXT,                   -- Type MIME réel (application/pdf, image/png...)
    chemin_fichier TEXT,              -- Chemin relatif dans uploads/
    origine TEXT DEFAULT 'user' CHECK(origine IN ('user','ia','extraction')),
    extraction_auto INTEGER DEFAULT 0, -- 1 si généré par extraction automatique
    id_parent TEXT REFERENCES contenus_bloc(id) ON DELETE SET NULL,  -- Lien vers le contenu source
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS liaisons (
    id TEXT PRIMARY KEY,
    espace_id TEXT NOT NULL REFERENCES espaces(id),
    bloc_source_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    bloc_cible_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('simple','logique','tension','ancree')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS config_ia (
    role TEXT PRIMARY KEY CHECK(role IN ('graphe','assistant')),
    mode TEXT NOT NULL CHECK(mode IN ('local','api')),
    url TEXT,
    modele TEXT,
    cle_api TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blocs_espace ON blocs(espace_id);
CREATE INDEX IF NOT EXISTS idx_contenus_bloc ON contenus_bloc(bloc_id);
CREATE INDEX IF NOT EXISTS idx_liaisons_espace ON liaisons(espace_id);
CREATE INDEX IF NOT EXISTS idx_liaisons_source ON liaisons(bloc_source_id);
CREATE INDEX IF NOT EXISTS idx_liaisons_cible ON liaisons(bloc_cible_id);
