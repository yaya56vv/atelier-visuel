# DOCUMENT E — STACK TECHNIQUE & ARCHITECTURE D'IMPLÉMENTATION

**Projet :** Projet 1 — Atelier Visuel de Pensée
**Date :** 16/02/2026
**Statut :** Document maître — Choix techniques validés

---

## 1. Principes techniques directeurs

Tout choix technique est subordonné à la philosophie du projet (Document A).

Principes :

- **Local-first** : les données restent sur la machine de l'utilisateur.
- **Rendu fidèle** : le moteur graphique produit le rendu cible — on ne compromet pas l'esthétique pour la facilité technique.
- **Architecture extensible** : chaque module prévoit les emplacements pour les fonctionnalités futures, même si elles ne sont pas implémentées immédiatement.
- **Pas de provisoire** : aucun code temporaire, aucun placeholder fonctionnel, aucun legacy. Ce qui est codé est définitif ou n'est pas codé.
- **IA configurable** : l'utilisateur choisit ses modèles (local ou API) selon sa machine et ses préférences.

---

## 2. Stack validée

| Couche | Technologie | Rôle |
|--------|------------|------|
| **Moteur d'affichage** | Canvas2D pur (HTML5) | Rendu des blocs, formes, liaisons, effets visuels |
| **Framework frontend** | React | Interface utilisateur (panneaux, barres, console, configuration) |
| **Persistance** | SQLite local | Stockage des espaces, blocs, liaisons, métadonnées |
| **Backend** | FastAPI (Python) | API locale, pont entre frontend et données/IA |
| **IA Graphe** | Configurable (Ollama / LM Studio / API) | Traitement automatique des blocs (titres, résumés, entités, mots-clés, similarité) |
| **IA Assistant** | Configurable (Ollama / LM Studio / API) | Interaction utilisateur, analyse d'espace, suggestions, dialogue |

---

## 3. Architecture modulaire détaillée

### 3.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                  │
│                                                       │
│  ┌──────────────────────────────────────────────┐    │
│  │           CANVAS2D (module isolé)             │    │
│  │  Blocs • Formes • Liaisons • Effets visuels  │    │
│  │  Drag & Drop • Zoom • Sélection • Légendes   │    │
│  └──────────────────────────────────────────────┘    │
│                                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────────┐   │
│  │ Barre sup. │ │ Panneau    │ │ Console IA     │   │
│  │ (espaces)  │ │ latéral    │ │ (droite,       │   │
│  │            │ │ (recherche)│ │  translucide)   │   │
│  └────────────┘ └────────────┘ └────────────────┘   │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │            Barre inférieure                     │  │
│  │  Enregistrer • Recentrer • Zoom • IA • Stop    │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │         Écran de configuration IA               │  │
│  │  (accessible via bouton dans l'interface)       │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  [EMPLACEMENT] Module vocal (STT/TTS)                │
│  [EMPLACEMENT] Module import multimodal              │
│  [EMPLACEMENT] Module recherche documentaire externe │
│  [EMPLACEMENT] Vue méta-graphe inter-espaces         │
│                                                       │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP / WebSocket
┌───────────────────────┴─────────────────────────────┐
│                  BACKEND (FastAPI)                    │
│                                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────────┐   │
│  │ API Blocs  │ │ API Espaces│ │ API Liaisons   │   │
│  └────────────┘ └────────────┘ └────────────────┘   │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │           Service IA (routeur)                  │  │
│  │  → Lit la config utilisateur                    │  │
│  │  → Dispatche vers Ollama / LM Studio / API     │  │
│  │  → Deux rôles : Graphe + Assistant              │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────┐ ┌────────────────────────────────┐   │
│  │ SQLite     │ │ Service d'indexation            │   │
│  │ (données)  │ │ (titre_ia, resume_ia, entités)  │   │
│  └────────────┘ └────────────────────────────────┘   │
│                                                       │
│  [EMPLACEMENT] Service vocal (STT/TTS)               │
│  [EMPLACEMENT] Service import/parsing documents      │
│  [EMPLACEMENT] Service recherche externe             │
│  [EMPLACEMENT] Service embeddings / similarité       │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### 3.2 Le module Canvas2D — Cœur du rendu

Ce module est **isolé du reste de l'application**. Il ne dépend pas de React pour son rendu.

Il est responsable de :
- Dessin des blocs (formes pré-programmées : nuage, rectangle arrondi, carré, ovale, cercle)
- Effets visuels (volume, brillance, ombres, halos)
- Dessin des liaisons (courbes de Bézier cubiques, effets lumineux, couleurs sémantiques)
- Points de connexion sur les blocs
- Gestion du drag & drop des blocs
- Gestion du zoom et du pan
- Sélection et survol (curseur contextuel)
- Affichage des légendes contextuelles (couleur, forme) au moment de l'interaction
- Redimensionnement révélateur

**L'utilisateur ne dessine jamais.** Il choisit parmi des formes et couleurs pré-programmées. Les liaisons se créent automatiquement par glisser d'un connecteur à un autre.

Communication avec React : via un système d'événements (le Canvas émet des événements que React écoute, et vice versa). Le Canvas ne connaît pas React, React ne connaît pas les détails du Canvas.

**Ce module encapsule le moteur graphique existant de la version Asus.** Le rendu actuel (blocs glossy/3D, liaisons lumineuses, fond sombre) est le rendu cible. Il ne doit pas être remplacé ni simplifié.

### 3.3 Écran de configuration IA

Accessible via un bouton dans l'interface (ou via la barre inférieure).

Affiche un tableau avec deux lignes :

| Rôle | Mode | Configuration |
|------|------|---------------|
| **IA Graphe** (titres, résumés, entités) | Local / API | Si local : URL Ollama + nom du modèle. Si API : clé + endpoint |
| **IA Assistant** (dialogue, analyse) | Local / API | Si local : URL Ollama + nom du modèle. Si API : clé + endpoint |

L'utilisateur peut mixer : par exemple IA Graphe en local (Mistral 7B via Ollama) et IA Assistant en API (Claude Sonnet).

La configuration est stockée dans un fichier local (config.json) et lue par le backend au démarrage.

---

## 4. Modèle de données SQLite

### 4.1 Table `espaces`

```sql
CREATE TABLE espaces (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    theme TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 Table `blocs`

```sql
CREATE TABLE blocs (
    id TEXT PRIMARY KEY,
    espace_id TEXT NOT NULL REFERENCES espaces(id),
    x REAL NOT NULL,
    y REAL NOT NULL,
    forme TEXT NOT NULL CHECK(forme IN ('cloud', 'rounded-rect', 'square', 'oval', 'circle')),
    couleur TEXT NOT NULL CHECK(couleur IN ('green', 'orange', 'yellow', 'blue', 'violet', 'mauve')),
    largeur REAL DEFAULT 200,
    hauteur REAL DEFAULT 120,
    titre_ia TEXT,
    resume_ia TEXT,
    entites TEXT,          -- JSON array
    mots_cles TEXT,        -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3 Table `contenus_bloc`

```sql
CREATE TABLE contenus_bloc (
    id TEXT PRIMARY KEY,
    bloc_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('texte', 'note', 'url', 'pdf', 'image', 'video_ref', 'fichier', 'citation', 'tableau')),
    contenu TEXT,          -- Texte brut ou chemin fichier
    metadata TEXT,         -- JSON (source, date_import, etc.)
    ordre INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.4 Table `liaisons`

```sql
CREATE TABLE liaisons (
    id TEXT PRIMARY KEY,
    espace_id TEXT NOT NULL REFERENCES espaces(id),
    bloc_source_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    bloc_cible_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('simple', 'logique', 'tension', 'ancree')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.5 Table `config_ia`

```sql
CREATE TABLE config_ia (
    role TEXT PRIMARY KEY CHECK(role IN ('graphe', 'assistant')),
    mode TEXT NOT NULL CHECK(mode IN ('local', 'api')),
    url TEXT,              -- URL Ollama/LM Studio ou endpoint API
    modele TEXT,           -- Nom du modèle
    cle_api TEXT,          -- Clé API (si mode api)
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.6 Index

```sql
CREATE INDEX idx_blocs_espace ON blocs(espace_id);
CREATE INDEX idx_contenus_bloc ON contenus_bloc(bloc_id);
CREATE INDEX idx_liaisons_espace ON liaisons(espace_id);
CREATE INDEX idx_liaisons_source ON liaisons(bloc_source_id);
CREATE INDEX idx_liaisons_cible ON liaisons(bloc_cible_id);
```

---

## 5. Emplacements réservés pour fonctionnalités futures

Ces emplacements sont prévus dans l'architecture dès le départ. Les modules, routes API, et tables sont nommés et positionnés, mais leur contenu n'est implémenté que lorsque le séquençage les atteint.

| Fonctionnalité | Emplacement frontend | Emplacement backend | Table(s) supplémentaire(s) |
|---------------|---------------------|--------------------|-----------------------|
| **Vocal (STT/TTS)** | Module vocal dans le dossier `src/modules/vocal/` | Service vocal `backend/services/vocal.py` | Aucune |
| **Import multimodal** | Module import `src/modules/import/` | Service parsing `backend/services/import_parser.py` | `imports_log` |
| **Recherche externe** | Module recherche `src/modules/recherche/` | Service recherche `backend/services/recherche_externe.py` | `sources_externes` |
| **Embeddings / similarité** | Intégré au service IA | `backend/services/embeddings.py` | `vecteurs_blocs` |
| **Analyse inter-espaces** | Module méta-graphe `src/modules/meta/` | `backend/services/meta_graphe.py` | `meta_liaisons` |
| **Génération graphe initial** | Intégré à la console IA | `backend/services/generateur_graphe.py` | Aucune |

**Règle stricte :** Ces emplacements sont des dossiers et fichiers vides (ou avec un commentaire d'intention). Aucun code provisoire, aucun placeholder fonctionnel, aucun "TODO" dans le code. L'emplacement existe, le contenu viendra quand le séquençage l'atteindra.

---

## 6. Communication Frontend ↔ Backend

### 6.1 API REST (opérations CRUD)

```
GET    /api/espaces                     → Liste des espaces
POST   /api/espaces                     → Créer un espace
GET    /api/espaces/{id}                → Détail d'un espace avec blocs et liaisons
DELETE /api/espaces/{id}                → Supprimer un espace

POST   /api/blocs                       → Créer un bloc
PUT    /api/blocs/{id}                  → Modifier un bloc (position, forme, couleur, contenu)
DELETE /api/blocs/{id}                  → Supprimer un bloc

POST   /api/liaisons                    → Créer une liaison
DELETE /api/liaisons/{id}               → Supprimer une liaison

GET    /api/config-ia                   → Lire la configuration IA
PUT    /api/config-ia                   → Modifier la configuration IA

[RÉSERVÉ] POST /api/ia/analyser-espace  → Analyse complète d'un espace
[RÉSERVÉ] POST /api/ia/suggerer-liaisons → Suggestions de liaisons
[RÉSERVÉ] POST /api/ia/generer-graphe    → Génération d'un graphe initial
[RÉSERVÉ] POST /api/vocal/stt            → Speech-to-text
[RÉSERVÉ] POST /api/vocal/tts            → Text-to-speech
[RÉSERVÉ] POST /api/import/parser        → Import et parsing de documents
[RÉSERVÉ] POST /api/recherche/externe    → Recherche documentaire externe
```

### 6.2 WebSocket (temps réel)

Canal WebSocket pour :
- Notifications IA (analyse terminée, suggestion prête)
- Mise à jour en temps réel de la vue liste quand un bloc est modifié dans le graphe
- Feedback vocal (STT en streaming, quand implémenté)

---

## 7. Structure de fichiers du projet

```
atelier-visuel/
├── CENTRAL.md
├── AGENT.md
├── SEQUENCAGE.md
├── .claude/
│   ├── commands/          ← Slash commands (méthode multi-agents)
│   └── hooks/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── canvas/              ← MODULE CANVAS2D (isolé)
│   │   │   ├── engine.ts        ← Moteur de rendu principal
│   │   │   ├── shapes.ts        ← Formes pré-programmées (nuage, ovale, cercle...)
│   │   │   ├── links.ts         ← Liaisons (Bézier cubiques, effets lumineux)
│   │   │   ├── interactions.ts  ← Drag, zoom, sélection, hit-testing
│   │   │   ├── legends.ts       ← Légendes contextuelles (couleur, forme)
│   │   │   ├── theme.ts         ← Paramètres visuels externalisés
│   │   │   └── events.ts        ← Bus d'événements Canvas ↔ React
│   │   │
│   │   ├── components/          ← Composants React UI
│   │   │   ├── TopBar.tsx       ← Barre supérieure (espaces, thèmes)
│   │   │   ├── SidePanel.tsx    ← Panneau latéral gauche (recherche, filtres)
│   │   │   ├── BottomBar.tsx    ← Barre inférieure (commandes)
│   │   │   ├── ConsoleIA.tsx    ← Console IA droite (translucide)
│   │   │   ├── ConfigIA.tsx     ← Écran configuration IA
│   │   │   └── BlocEditor.tsx   ← Fenêtre édition bloc (double-clic)
│   │   │
│   │   ├── modules/             ← Emplacements réservés
│   │   │   ├── vocal/           ← [RÉSERVÉ] STT/TTS
│   │   │   ├── import/          ← [RÉSERVÉ] Import multimodal
│   │   │   ├── recherche/       ← [RÉSERVÉ] Recherche externe
│   │   │   └── meta/            ← [RÉSERVÉ] Vue méta-graphe
│   │   │
│   │   └── stores/              ← Gestion d'état React
│   │       ├── espaceStore.ts
│   │       ├── blocsStore.ts
│   │       └── iaStore.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── main.py                  ← Point d'entrée FastAPI
│   ├── api/
│   │   ├── espaces.py
│   │   ├── blocs.py
│   │   ├── liaisons.py
│   │   └── config_ia.py
│   │
│   ├── services/
│   │   ├── ia_routeur.py        ← Routeur IA (dispatch local/API)
│   │   ├── ia_graphe.py         ← Traitement IA des blocs
│   │   ├── ia_assistant.py      ← Dialogue et analyse IA
│   │   ├── indexation.py        ← Génération titre_ia, resume_ia, etc.
│   │   ├── vocal.py             ← [RÉSERVÉ]
│   │   ├── import_parser.py     ← [RÉSERVÉ]
│   │   ├── recherche_externe.py ← [RÉSERVÉ]
│   │   ├── embeddings.py        ← [RÉSERVÉ]
│   │   ├── meta_graphe.py       ← [RÉSERVÉ]
│   │   └── generateur_graphe.py ← [RÉSERVÉ]
│   │
│   ├── db/
│   │   ├── database.py          ← Connexion SQLite
│   │   └── schema.sql           ← Schéma de création des tables
│   │
│   └── requirements.txt
│
└── data/
    └── espaces/                 ← Fichiers SQLite (un par espace, ou un global)
```

---

## 8. Contraintes de performance V1

| Métrique | Cible V1 | Justification |
|----------|---------|---------------|
| Nombre de blocs par espace | Jusqu'à 500 | Au-delà, Canvas2D commence à ralentir |
| Temps de rendu d'un frame | <16ms (60 FPS) | Fluidité de manipulation |
| Temps de réponse API CRUD | <100ms | Réactivité de l'interface |
| Temps de réponse IA Graphe | <3s | Génération titre/résumé à la création |
| Temps de réponse IA Assistant | <10s | Acceptable pour une analyse d'espace |
| Taille d'un fichier espace | <50 Mo | Gérable sur toute machine |

---

## 9. Compatibilité matérielle

Le système doit fonctionner sur :

| Machine | Spécifications | Contraintes |
|---------|---------------|-------------|
| **HP 470G4** | GPU 930MX, RAM limitée | IA locale limitée (petits modèles 7B), pas de parallèle lourd |
| **Asus ROG** | GPU puissant, RAM élevée | IA locale performante (modèles 13B+), parallèle possible |

La configuration IA flexible (local/API) permet d'adapter l'expérience à la machine sans modifier le code.
