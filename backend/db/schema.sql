-- Atelier Visuel de Pensée — Schéma SQLite V2
-- V2 : modèle de liaisons unifié intra/inter-espaces, graphe global

CREATE TABLE IF NOT EXISTS espaces (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    theme TEXT NOT NULL,
    couleur_identite TEXT DEFAULT '#667788',  -- V2 : couleur d'identité dans le graphe global
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocs (
    id TEXT PRIMARY KEY,
    espace_id TEXT NOT NULL REFERENCES espaces(id),
    x REAL NOT NULL,
    y REAL NOT NULL,
    x_global REAL,                -- V2 : position dans le graphe global
    y_global REAL,                -- V2 : position dans le graphe global
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

-- V2 : Modèle de liaisons unifié intra/inter-espaces
-- La distinction intra/inter est une propriété DÉRIVÉE, pas une catégorie
CREATE TABLE IF NOT EXISTS liaisons (
    id TEXT PRIMARY KEY,
    bloc_source_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    bloc_cible_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'simple' CHECK(type IN (
        -- V1 originaux
        'simple', 'logique', 'tension', 'ancree',
        -- V2 : types inter/intra enrichis
        'prolongement', 'fondation', 'complementarite',
        'application', 'analogie', 'dependance', 'exploration'
    )),
    poids REAL DEFAULT 1.0 CHECK(poids >= 0.0 AND poids <= 1.0),
    origine TEXT DEFAULT 'manuel' CHECK(origine IN ('manuel', 'auto', 'ia_suggestion')),
    validation TEXT DEFAULT 'valide' CHECK(validation IN ('valide', 'en_attente', 'rejete')),
    label TEXT,                      -- étiquette optionnelle affichable
    metadata TEXT,                   -- JSON libre
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS config_ia (
    role TEXT PRIMARY KEY CHECK(role IN ('graphe','assistant')),
    mode TEXT NOT NULL CHECK(mode IN ('local','api')),
    url TEXT,
    modele TEXT,
    cle_api TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dossiers surveillés pour le scan différentiel (V2 §8.2-8.3)
CREATE TABLE IF NOT EXISTS dossiers_surveilles (
    id TEXT PRIMARY KEY,
    chemin_absolu TEXT NOT NULL UNIQUE,
    nom TEXT NOT NULL,
    actif INTEGER DEFAULT 1,
    profondeur_max INTEGER DEFAULT -1,  -- -1 = illimité
    extensions_filtre TEXT,              -- JSON array d'extensions, null = toutes
    espace_id TEXT REFERENCES espaces(id),  -- espace où les fichiers deviennent des blocs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Fichiers indexés — chaque fichier du PC connu du graphe (V2 §8.2)
CREATE TABLE IF NOT EXISTS fichiers_indexes (
    id TEXT PRIMARY KEY,
    dossier_id TEXT NOT NULL REFERENCES dossiers_surveilles(id) ON DELETE CASCADE,
    bloc_id TEXT REFERENCES blocs(id) ON DELETE SET NULL,
    chemin_absolu TEXT NOT NULL UNIQUE,
    chemin_relatif TEXT NOT NULL,        -- relatif au dossier surveillé
    nom TEXT NOT NULL,
    extension TEXT,
    taille_octets INTEGER,
    hash_contenu TEXT,                   -- SHA-256 (pour détection modifications)
    date_modification DATETIME,
    date_indexation DATETIME DEFAULT CURRENT_TIMESTAMP,
    tags_semantiques TEXT,               -- JSON array
    statut TEXT DEFAULT 'actif' CHECK(statut IN ('actif','modifie','supprime','deplace','nouveau')),
    metadata TEXT                        -- JSON libre (mime_type, etc.)
);

-- Journal du scan différentiel
CREATE TABLE IF NOT EXISTS journal_scan (
    id TEXT PRIMARY KEY,
    dossier_id TEXT NOT NULL REFERENCES dossiers_surveilles(id),
    date_scan DATETIME DEFAULT CURRENT_TIMESTAMP,
    fichiers_total INTEGER DEFAULT 0,
    fichiers_nouveaux INTEGER DEFAULT 0,
    fichiers_modifies INTEGER DEFAULT 0,
    fichiers_supprimes INTEGER DEFAULT 0,
    fichiers_deplaces INTEGER DEFAULT 0,
    duree_ms INTEGER DEFAULT 0,
    statut TEXT DEFAULT 'termine' CHECK(statut IN ('en_cours','termine','erreur')),
    details TEXT                          -- JSON rapport détaillé
);

-- ═══════════════════════════════════════════════════════
-- INDEX
-- ═══════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_blocs_espace ON blocs(espace_id);
CREATE INDEX IF NOT EXISTS idx_contenus_bloc ON contenus_bloc(bloc_id);
CREATE INDEX IF NOT EXISTS idx_liaisons_source ON liaisons(bloc_source_id);
CREATE INDEX IF NOT EXISTS idx_liaisons_cible ON liaisons(bloc_cible_id);
CREATE INDEX IF NOT EXISTS idx_liaisons_type ON liaisons(type);
CREATE INDEX IF NOT EXISTS idx_liaisons_validation ON liaisons(validation);
CREATE INDEX IF NOT EXISTS idx_fichiers_chemin ON fichiers_indexes(chemin_absolu);
CREATE INDEX IF NOT EXISTS idx_fichiers_bloc ON fichiers_indexes(bloc_id);
CREATE INDEX IF NOT EXISTS idx_fichiers_dossier ON fichiers_indexes(dossier_id);
CREATE INDEX IF NOT EXISTS idx_fichiers_statut ON fichiers_indexes(statut);
CREATE INDEX IF NOT EXISTS idx_dossiers_chemin ON dossiers_surveilles(chemin_absolu);
CREATE INDEX IF NOT EXISTS idx_journal_dossier ON journal_scan(dossier_id);
