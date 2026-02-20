# CENTRAL.md — Atelier Visuel de Pensée

Version : V2
Date : 20/02/2026
Mainteneur : Humain uniquement

---

## 1. VISION ET PHILOSOPHIE

### 1.1 Nature fondamentale

Le système est un **environnement cognitif spatial augmenté par IA**, conçu pour remplir simultanément :

- prise de notes immédiate sans friction,
- stockage documentaire relationnel,
- exploration intelligente de contenus,
- structuration conceptuelle,
- production cognitive assistée,
- conception de projets.

C'est un **système intégré orienté sens** — pas un ensemble de fonctionnalités juxtaposées.

| Dimension | Rôle |
|-----------|------|
| **Outil de pensée** | Structurer, relier, visualiser des idées et concepts |
| **Outil de stockage** | Conserver et organiser des contenus hétérogènes avec traçabilité |
| **Explorateur documentaire** | Naviguer, rechercher, filtrer dans une base de connaissances vivante |
| **Espace d'analyse augmentée** | Révéler des patterns, des manques, des centralités via l'IA |
| **Système cohérent** | Toutes les couches interagissent — aucune n'est isolée |

### 1.2 Ce que le système n'est pas

- Pas un outil de mind-mapping classique (pas de hiérarchie imposée)
- Pas un éditeur de texte avec graphe décoratif
- Pas un agrégateur de liens sans structure
- Pas une juxtaposition de modules indépendants

> **Principe directeur** : chaque fonctionnalité existe parce qu'elle sert le processus de pensée. Si elle ne sert pas le sens, elle n'a pas sa place.

### 1.3 Problème fondamental adressé

**Stockage mort** — Les systèmes actuels (gestion de notes, fichiers, "second cerveau") souffrent de :

- organisation hiérarchique rigide,
- fragmentation des informations,
- absence de relations visibles,
- dépendance à la nomination explicite,
- impossibilité d'explorer dynamiquement les connexions,
- séparation entre contenu et relations,
- nécessité d'apprentissage préalable.

Le système répond à ces limites par un stockage vivant, relationnel et explorable.

### 1.4 Positionnement stratégique

Positionnement **professionnel** (R&D, conseil, stratégie, analyse documentaire avancée) — pas grand public PKM.

Modèle envisagé : **local-first souverain** avec éventuelle couche cloud apportant collaboration et accélération.

### 1.5 Principes non négociables

1. Interaction vocale native obligatoire.
2. Capture immédiate sans friction.
3. Bloc conteneur multi-éléments non destructif.
4. Stockage documentaire relationnel.
5. Épure visuelle maximale.
6. Information uniquement contextuelle.
7. Réversibilité des actions IA.
8. Absence de hiérarchie arborescente.
9. Maintien du caractère vivant du stockage.
10. Esthétique comme contrainte d'ingénierie primaire.

---

## 2. ARCHITECTURE GLOBALE

### 2.1 Modèle structurel — Graphe spatial persistant

Le système repose sur un modèle graphe spatial persistant :

- **Nœuds** : blocs
- **Arêtes** : liaisons
- **Conteneurs** : espaces

Chaque espace constitue un sous-graphe indépendant : G = (N, E).

Coordonnées (x, y) persistantes dans un plan 2D. Force-directed uniquement en mode temporaire IA, avec retour possible à l'état persisté.

#### Analyse géométrique des positions

Les coordonnées persistantes alimentent une analyse géométrique :

- Clustering spatial (blocs proches → thématique commune implicite)
- Centralité spatiale (noyaux implicites détectés par position)
- Proposition IA de regrouper des clusters géométriques en sous-espaces

Cette analyse est une capacité de l'IA observatrice, pas une modification automatique.

### 2.2 Modèle de données des blocs

**Identité :**

- `id` : identifiant unique immutable
- `espace_id` : référence à l'espace parent

**Position spatiale :**

- `x`, `y` : coordonnées persistées

**Contenu multi-éléments :**

Un bloc peut contenir un ou plusieurs types : texte, note, URL, page web résumée, PDF, image, vidéo référencée, fichier local, citation, pièce jointe, tableau simple.

Chaque élément interne est indépendant et non destructif. Le type principal détermine l'icône affichée dans le canvas.

**Métadonnées obligatoires V1 :**

- `created_at`, `updated_at`
- `titre_ia` (titre synthétique généré automatiquement)
- `resume_ia` (résumé automatique)
- `entites[]` (entités nommées détectées)
- `mots_cles[]` (mots-clés extraits)

Ces métadonnées sont recalculables dynamiquement.

**Statut relationnel :**

- liste de liaisons sortantes
- liste de liaisons entrantes

### 2.3 Modèle des liaisons (modèle unifié intra/inter-espaces)

Structure : `id`, `bloc_source_id`, `bloc_cible_id`, `type`, `poids`, `origine`, `validation`, `label`, `metadata`, `created_at`, `updated_at`.

Le modèle est **unifié** : une seule table, une seule structure. Une liaison relie deux blocs, que ceux-ci soient dans le même espace ou dans des espaces différents. La distinction intra/inter-espace est une **propriété dérivée** (calculée depuis les `espace_id` des blocs), pas une catégorie structurelle.

Types de liaison (11 au total) :

| Type | Description | Catégorie |
|------|-------------|----------|
| simple | Relation neutre | Intra (v1) |
| logique | Structuration | Intra (v1) |
| tension | Contradiction / friction | Intra (v1) |
| ancree | Toujours visible | Intra (v1) |
| prolongement | Une idée prolonge une autre | Inter/Intra |
| fondation | Un bloc fonde un autre | Inter/Intra |
| complementarite | Enrichissement mutuel | Inter/Intra |
| application | Un concept se concrétise | Inter/Intra |
| analogie | Résonance entre domaines | Inter/Intra |
| dependance | Nécessité structurelle | Inter/Intra |
| exploration | Lien hypothétique en validation | Inter/Intra |

**Poids** (0.0 à 1.0) : force de la relation. Détermine la proximité visuelle dans le graphe global, l'épaisseur de la liaison, et le seuil de filtrage.

**Origine** : `manuel` (créé par l'utilisateur), `auto` (détecté par algorithme), `ia_suggestion` (proposé par l'IA).

**Validation** : `valide`, `en_attente` (suggestion IA non encore validée), `rejete`.

### 2.4 Espaces et graphe global

**Deux thématiques fondatrices** avec grilles de lecture travaillées :

- **IDÉES** : réflexion large et transversale
- **CONCEPTION** : structuration opérationnelle

Sous ces thématiques, l'utilisateur crée autant d'espaces que nécessaire. Palette sémantique identique entre espaces.

Chaque espace possède une **couleur d'identité** (teintes désaturées : vert forêt, prune, bleu acier...) distincte de la palette sémantique des blocs, servant à l'identification dans le graphe global.

**Graphe global** : vue où tous les blocs de tous les espaces coexistent. Les liaisons inter-espaces y sont visibles. Chaque espace forme un cluster dont la distance reflète la proximité sémantique.

**Double système de coordonnées** :
- `x`, `y` : position dans l'espace d'appartenance
- `x_global`, `y_global` : position dans le graphe global (indépendante)

**Filtres du graphe global** (combinables en ET logique) : par espace(s), par type de liaison, inter-espaces seulement, par poids minimum, par statut de validation, par couleur/forme sémantique.

### 2.5 Double représentation synchronisée

| Vue | Mode | Fonction |
|-----|------|----------|
| **Graphe** | Principal | Spatialisation 2D, manipulation directe, visualisation relationnelle |
| **Liste** | Secondaire | Affichage textuel, tri par métadonnées, recherche rapide |

Synchronisation en temps réel. Toute sélection dans une vue se répercute dans l'autre.

### 2.6 Système d'indexation automatique

Déclenché à la création et modification d'un bloc :

1. Analyse sémantique
2. Génération `titre_ia`
3. Génération `resume_ia`
4. Extraction entités
5. Extraction mots-clés

L'index alimente recherche et filtrage.

### 2.7 Couche d'import structuré

| Mode | Description |
|------|-------------|
| Import manuel | PDF, images, URLs, copier-coller |
| Import assisté IA | Proposition structurée avec métadonnées |

Métadonnées obligatoires à l'import : source, date d'import, type, statut (importé → validé → enrichi).

### 2.8 Versioning graphe non destructif

Chaque modification (nœud/arête) est traçable. Le système préserve l'historique des états de manière non destructive. Prépare la collaboration future et permet le retour à un état antérieur.

### 2.9 Invariants architecturaux

**Interdits :**

1. Hiérarchie parent-enfant
2. Fusion automatique destructive
3. Personnalisation avancée du graphe
4. Moteur IA permanent (toujours activable/désactivable)
5. Duplication logique des liaisons entre tables différentes

> Note : l'interdit V1 « pondération algorithmique » est levé pour le champ `poids` des liaisons (0.0–1.0), nécessaire au graphe global. Le poids reste indicatif et ne modifie jamais la structure du graphe automatiquement.

### 2.10 Architecture modulaire

Principes :

- Modules indépendants mais coordonnés
- Interfaces propres
- Zéro friction logique
- État partagé minimal

Anti-patterns interdits : duplication logique, dépendances circulaires, état global non contrôlé.

---

## 3. STACK TECHNIQUE ET IMPLÉMENTATION

### 3.1 Principes techniques directeurs

- **Local-first** : les données restent sur la machine de l'utilisateur.
- **Rendu fidèle** : le moteur graphique produit le rendu cible — on ne compromet pas l'esthétique.
- **Architecture extensible** : emplacements prévus pour fonctionnalités futures.
- **Pas de provisoire** : aucun code temporaire, aucun placeholder fonctionnel, aucun legacy.
- **IA configurable** : l'utilisateur choisit ses modèles (local ou API).

### 3.2 Stack validée

| Couche | Technologie | Rôle |
|--------|------------|------|
| **Moteur d'affichage** | Canvas2D pur (HTML5) | Rendu des blocs, formes, liaisons, effets visuels |
| **Framework frontend** | React | Interface utilisateur (panneaux, barres, console, configuration) |
| **Persistance** | SQLite local | Stockage des espaces, blocs, liaisons, métadonnées |
| **Backend** | FastAPI (Python) | API locale, pont entre frontend et données/IA |
| **IA Graphe** | Configurable (Ollama / LM Studio / API) | Traitement automatique des blocs (titres, résumés, entités, mots-clés, similarité) |
| **IA Assistant** | Configurable (Ollama / LM Studio / API) | Interaction utilisateur, analyse d'espace, suggestions, dialogue |

### 3.3 Architecture détaillée

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

### 3.4 Module Canvas2D — Cœur du rendu

Module **isolé du reste de l'application** — ne dépend pas de React pour son rendu.

Responsabilités :

- Dessin des blocs (formes pré-programmées : nuage, rectangle arrondi, carré, ovale, cercle)
- Effets visuels (volume, brillance, ombres, halos)
- Dessin des liaisons (courbes de Bézier cubiques, effets lumineux, couleurs sémantiques)
- Points de connexion sur les blocs
- Drag & drop, zoom, pan
- Sélection et survol (curseur contextuel)
- Légendes contextuelles (couleur, forme) au moment de l'interaction
- Redimensionnement révélateur

**L'utilisateur ne dessine jamais.** Il choisit parmi des formes et couleurs pré-programmées. Les liaisons se créent par glisser d'un connecteur à un autre.

Communication avec React : via système d'événements. Le Canvas ne connaît pas React, React ne connaît pas les détails du Canvas.

**Ce module encapsule le moteur graphique existant de la version Asus.** Le rendu actuel (blocs glossy/3D, liaisons lumineuses, fond sombre) est le rendu cible. Il ne doit pas être remplacé ni simplifié.

### 3.5 Interdictions techniques formelles

| Interdit | Imposé |
|----------|--------|
| Polylignes lissées | Bézier cubiques uniques |
| Déformation sinusoïdale | Tangence réelle |
| Offset naïf rails lumineux | Zéro intersection bloc-liaison |
| Constantes codées en dur | Paramètres externalisés |
| Modales bloquantes | Moteur énergie séparé |
| Connecteurs fixes | Contour intégralement connectable |
| Resize sans révélation | Resize révélant contenu |
| Stop backend incomplet | Stop propre backend |

Architecture graphique cible : Canvas2D `bezierCurveTo`, système thème externalisé, moteur énergie indépendant, pathfinding léger.

### 3.6 Configuration IA

Écran de configuration accessible depuis l'interface :

| Rôle | Mode | Configuration |
|------|------|---------------|
| **IA Graphe** (titres, résumés, entités) | Local / API | URL Ollama + modèle ou clé API + endpoint |
| **IA Assistant** (dialogue, analyse) | Local / API | URL Ollama + modèle ou clé API + endpoint |

L'utilisateur peut mixer (ex : IA Graphe en local Mistral 7B via Ollama, IA Assistant en API Claude Sonnet). Configuration stockée dans `config.json`, lue par le backend au démarrage.

### 3.7 Modèle de données SQLite

```sql
-- Espaces
CREATE TABLE espaces (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    theme TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Blocs
CREATE TABLE blocs (
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

-- Contenus des blocs
CREATE TABLE contenus_bloc (
    id TEXT PRIMARY KEY,
    bloc_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('texte','note','url','pdf','image','video_ref','fichier','citation','tableau')),
    contenu TEXT,
    metadata TEXT,
    ordre INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Liaisons (modèle unifié intra/inter-espaces)
CREATE TABLE liaisons (
    id TEXT PRIMARY KEY,
    bloc_source_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    bloc_cible_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'simple' CHECK(type IN (
        'simple','logique','tension','ancree',
        'prolongement','fondation','complementarite',
        'application','analogie','dependance','exploration'
    )),
    poids REAL DEFAULT 1.0 CHECK(poids >= 0.0 AND poids <= 1.0),
    origine TEXT DEFAULT 'manuel' CHECK(origine IN ('manuel','auto','ia_suggestion')),
    validation TEXT DEFAULT 'valide' CHECK(validation IN ('valide','en_attente','rejete')),
    label TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Configuration IA
CREATE TABLE config_ia (
    role TEXT PRIMARY KEY CHECK(role IN ('graphe','assistant')),
    mode TEXT NOT NULL CHECK(mode IN ('local','api')),
    url TEXT,
    modele TEXT,
    cle_api TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_blocs_espace ON blocs(espace_id);
CREATE INDEX idx_contenus_bloc ON contenus_bloc(bloc_id);
CREATE INDEX idx_liaisons_source ON liaisons(bloc_source_id);
CREATE INDEX idx_liaisons_cible ON liaisons(bloc_cible_id);
CREATE INDEX idx_liaisons_type ON liaisons(type);
CREATE INDEX idx_liaisons_validation ON liaisons(validation);
```

### 3.8 API REST et WebSocket

**Endpoints CRUD :**

```
GET/POST   /api/espaces
GET/DELETE /api/espaces/{id}
POST       /api/blocs
PUT/DELETE /api/blocs/{id}
POST       /api/liaisons
DELETE     /api/liaisons/{id}
GET/PUT    /api/config-ia
```

**Endpoints implémentés (hors CRUD) :**

```
POST       /api/ia/ask                  → Question libre à l'IA
POST       /api/ia/reorganiser           → Réorganisation IA d'un espace
POST       /api/upload/file              → Upload fichier (80+ formats)
POST       /api/upload/youtube           → Import vidéo YouTube + transcription
GET        /api/filesystem/dossiers      → Dossiers surveillés
POST       /api/filesystem/dossiers      → Ajouter un dossier
POST       /api/filesystem/scan          → Scan différentiel
GET        /api/filesystem/rapport       → Rapports de scan
GET        /api/graphe-global            → Vue globale tous espaces (filtrable)
```

**Endpoints réservés :**

```
[RÉSERVÉ] POST /api/ia/analyser-espace
[RÉSERVÉ] POST /api/ia/suggerer-liaisons  → Suggestions intra et inter-espaces
[RÉSERVÉ] POST /api/ia/generer-graphe
[RÉSERVÉ] POST /api/vocal/stt
[RÉSERVÉ] POST /api/vocal/tts
[RÉSERVÉ] POST /api/recherche/externe
```

**WebSocket** : notifications IA, synchronisation vue liste/graphe, feedback vocal streaming.

### 3.9 Structure de fichiers

```
atelier-visuel/
├── CENTRAL.md
├── AGENT.md
├── SEQUENCAGE.md
├── .claude/
│   ├── commands/
│   └── hooks/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── canvas/              ← MODULE CANVAS2D (isolé)
│   │   │   ├── engine.ts
│   │   │   ├── shapes.ts
│   │   │   ├── links.ts
│   │   │   ├── interactions.ts
│   │   │   ├── legends.ts
│   │   │   ├── theme.ts
│   │   │   └── events.ts
│   │   ├── components/
│   │   │   ├── TopBar.tsx
│   │   │   ├── SidePanel.tsx
│   │   │   ├── BottomBar.tsx
│   │   │   ├── ConsoleIA.tsx
│   │   │   ├── ConfigIA.tsx
│   │   │   └── BlocEditor.tsx
│   │   ├── modules/             ← Emplacements réservés
│   │   │   ├── vocal/
│   │   │   ├── import/
│   │   │   ├── recherche/
│   │   │   └── meta/
│   │   └── stores/
│   │       ├── espaceStore.ts
│   │       ├── blocsStore.ts
│   │       └── iaStore.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── main.py
│   ├── api/
│   │   ├── espaces.py
│   │   ├── blocs.py
│   │   ├── liaisons.py
│   │   └── config_ia.py
│   ├── services/
│   │   ├── ia_routeur.py
│   │   ├── ia_graphe.py
│   │   ├── ia_assistant.py
│   │   ├── indexation.py
│   │   ├── vocal.py             ← [RÉSERVÉ]
│   │   ├── import_parser.py     ← [RÉSERVÉ]
│   │   ├── recherche_externe.py ← [RÉSERVÉ]
│   │   ├── embeddings.py        ← [RÉSERVÉ]
│   │   ├── meta_graphe.py       ← [RÉSERVÉ]
│   │   └── generateur_graphe.py ← [RÉSERVÉ]
│   ├── db/
│   │   ├── database.py
│   │   └── schema.sql
│   └── requirements.txt
└── data/
    └── espaces/
```

### 3.10 Emplacements réservés (fonctionnalités futures)

| Fonctionnalité | Frontend | Backend | Table(s) |
|---------------|----------|---------|----------|
| Vocal (STT/TTS) | `src/modules/vocal/` | `services/vocal.py` | — |
| Import multimodal | `src/modules/import/` | `services/import_parser.py` | `imports_log` |
| Recherche externe | `src/modules/recherche/` | `services/recherche_externe.py` | `sources_externes` |
| Embeddings / similarité | Intégré service IA | `services/embeddings.py` | `vecteurs_blocs` |
| Graphe global inter-espaces | Mode global dans Canvas + filtres SidePanel | `GET /api/graphe-global` + table liaisons unifiée | Aucune table spécifique |
| Filesystem / Scan différentiel | `src/modules/filesystem/` | `services/scan_diff.py`, `api/filesystem.py` | `dossiers_surveilles`, `fichiers_indexes`, `journal_scan` |
| Génération graphe initial | Intégré console IA | `services/generateur_graphe.py` | — |

Règle stricte : dossiers/fichiers vides ou avec commentaire d'intention. Aucun code provisoire.

### 3.11 Contraintes de performance V1

| Métrique | Cible | Justification |
|----------|-------|---------------|
| Blocs par espace | Jusqu'à 500 | Limite Canvas2D |
| Temps de rendu frame | <16ms (60 FPS) | Fluidité de manipulation |
| Réponse API CRUD | <100ms | Réactivité interface |
| Réponse IA Graphe | <3s | Génération titre/résumé |
| Réponse IA Assistant | <10s | Analyse d'espace |
| Taille fichier espace | <50 Mo | Gérable sur toute machine |

### 3.12 Compatibilité matérielle

| Machine | GPU | Contraintes IA |
|---------|-----|----------------|
| HP 470G4 | 930MX, RAM limitée | Petits modèles 7B, pas de parallèle lourd |
| Asus ROG | GPU puissant, RAM élevée | Modèles 13B+, parallèle possible |

La configuration IA flexible (local/API) adapte l'expérience sans modifier le code.

---

## 4. UX ET INTERACTIONS

### 4.1 Philosophie UX

- **Réduction maximale de la friction** : immédiatement utilisable sans apprentissage préalable.
- **Information contextuelle** : aides uniquement lors des actions, disparition automatique.
- **Épure visuelle** : interface minimaliste, non intrusive, spatialement claire.
- **Rendu visuel = contrainte d'ingénierie primaire** : l'esthétique fait partie de la spécification.

> Le moteur graphique doit être choisi pour produire le rendu attendu. On n'ajuste pas un moteur inadéquat.

### 4.2 Organisation de l'interface

Quatre zones principales :

| Zone | Position | Fonction |
|------|----------|----------|
| **Espace Graphe** | Centre | Zone principale d'interaction, création/manipulation de blocs, visualisation relationnelle |
| **Explorateur documentaire** | Latéral gauche | Recherche sémantique, filtres, navigation documentaire |
| **Gestion des espaces** | Barre supérieure | Création/sélection d'espace, choix thématique |
| **Commandes globales** | Barre inférieure | Enregistrer, recentrer, zoom, effacer, IA observatrice, stop |

### 4.3 Explorateur documentaire (panneau latéral gauche)

**Apparence** : ligne verticale discrète, fine, permanente, non intrusive, saisissable à la souris sur toute la hauteur gauche.

**Déploiement** : cliquer-tirer vers le centre → ouverture progressive jusqu'à largeur maximale.

**Contenu** :

- Champ de recherche unique (sémantique, multi-critères : texte, couleur, forme, tags, statut, date)
- Filtres dynamiques (type de contenu, mots-clés, entités, date, couleur, forme, statut)
- Liste structurée triable — chaque entrée montre titre IA, extrait, métadonnées
- Sélection → centrage + zoom sur le bloc
- Commande vocale possible

### 4.4 Console IA textuelle

- Panneau vertical droit, translucide, graphe visible derrière
- Jamais modale centrale, jamais popup, jamais overlay opaque
- État conservé entre sessions
- Historique en haut, zone de saisie en bas
- Vocal et texte possibles

### 4.5 Interaction vocale

La voix est le **mode d'interaction primaire**, non optionnel.

Au lancement : micro actif, assistant à l'écoute, texte en fallback.

Architecture obligatoire : STT temps réel, TTS, détection commande vs dictée, feedback sonore.

Le système permet : création de blocs par dictée, organisation vocale, sessions de brainstorming co-créatif, dialogue continu avec l'IA, navigation sans souris.

### 4.6 Interaction avec les blocs

**Curseur contextuel :**

| Zone | Action | Résultat |
|------|--------|----------|
| Sur bloc | Clic simple | Sélection / couleur |
| Sur bloc | Double-clic | Ouverture (fenêtre d'édition) |
| Sur bordure | Glisser | Déplacement |
| Sur bordure | Double-clic | Mode déformation |
| Sur connecteur | Glisser | Création liaison |

**Édition bloc** : zone texte, import, gestion contenus internes.

**Dépôt direct** : glisser fichier sur bloc, coller contenu.

### 4.7 Redimensionnement révélateur

- Agrandir → révèle contenu
- Réduire → masque secondaire
- Jamais d'espace vide
- Taille reflète contenu révélé

### 4.8 Navigation spatiale

- Zoom progressif continu
- À distance : blocs deviennent points lumineux
- Recentrage : retour au centre actif

### 4.9 Règles d'affichage des liaisons

- Mode normal : seules liaisons des blocs sélectionnés visibles
- Exception : liaisons ancrées toujours visibles
- Activation contextuelle : sélection, survol, mode exploration

### 4.10 Gestion des espaces

- Icône des espaces : à gauche du titre central (jamais exilée dans le coin)
- Création d'espace : choix obligatoire de thème, aucune création implicite
- Au lancement : panneau de choix de thème affiché automatiquement

### 4.11 Workflow IA de création assistée d'espace

1. Requête utilisateur
2. Proposition IA (structure initiale, sources potentielles, schéma de blocs)
3. Validation explicite
4. Génération du graphe
5. Mise en lumière (analyse)

### 4.12 Bouton Stop — Arrêt propre

Doit : arrêter backend, fermer client, nettoyer processus, fournir feedback visuel.

**Processus zombie = défaut critique.**

### 4.13 États système

Normal, sélection, édition bloc, interaction IA vocale, interaction IA textuelle, filtrage actif, mode réorganisation IA.

### 4.14 Invariants UX

Le système ne doit jamais introduire :

- menus complexes
- panneaux permanents intrusifs
- interactions indirectes
- configuration préalable obligatoire

---

## 5. GRAMMAIRE IA ET ASSISTANT

### 5.1 Identité de l'Assistant IA intégré

L'Assistant IA est le **gestionnaire intelligent du graphe**. Il ne code pas, il ne touche pas à l'implémentation technique, il opère exclusivement au niveau sémantique et structurel.

| Rôle | Description |
|------|-------------|
| **Gestionnaire du graphe** | Comprend la structure, les relations, les patterns |
| **Médiateur** | Fait le lien entre l'utilisateur, les espaces, et la base de données |
| **Moteur d'analyse** | Observe, interprète, détecte, propose |
| **Interface vocale** | Reçoit les commandes vocales, répond en langage naturel |

**Ce qu'il n'est pas** : pas l'agent codeur, pas responsable de l'implémentation, pas d'accès au code source.

**Périmètre** : création d'espace, recherche documentaire, proposition d'import, suggestion de liaisons, filtres, organisation thématique, génération de premiers graphes.

> **Règle absolue** : toutes ses actions sont proposées puis validées par l'utilisateur. Aucune action automatique non validée. Aucune exception.

### 5.2 Sémantique des couleurs

Chaque couleur encode une **intention** de l'utilisateur :

| Couleur | Clé | Intention | Type d'information | Verbe associé |
|---------|-----|-----------|-------------------|---------------|
| **Vert** | `green` | Matière première / Relation | Fait brut, donnée, observation | *Constater, relier* |
| **Orange** | `orange` | Énergie / Tension | Problème, friction, obstacle, question urgente | *Questionner, alerter* |
| **Jaune** | `yellow` | Lumière / Insight | Solution, idée lumineuse, déclic | *Résoudre, éclairer* |
| **Bleu** | `blue` | Logique / Raison | Analyse, argument, structure logique | *Structurer, argumenter* |
| **Violet** | `violet` | Spirituel / Sens vertical | Valeur profonde, sens, principe fondateur | *Fonder, transcender* |
| **Rose-mauve** | `mauve` | Concept en création | Idée embryonnaire, hypothèse | *Explorer, imaginer* |

> L'IA ne juge jamais la couleur choisie. Elle l'utilise comme indice d'intention.

### 5.3 Sémantique des formes

La forme modifie le **statut épistémique** de l'information :

| Forme | Clé | Statut | Certitude |
|-------|-----|--------|-----------|
| **Nuage** | `cloud` | Intuition vivante | Faible |
| **Rectangle arrondi** | `rounded-rect` | Idée structurée | Moyenne |
| **Carré** | `square` | Texte fondateur | Haute |
| **Ovale** | `oval` | Processus | Variable |
| **Cercle** | `circle` | Cœur / Centre | Maximale |

### 5.4 Matrice Couleur x Forme

| | Nuage | Rectangle arrondi | Carré | Ovale | Cercle |
|---|---|---|---|---|---|
| **Vert** | Observation floue | Fait établi | Donnée de référence | Processus factuel | Pilier factuel |
| **Orange** | Malaise diffus | Problème identifié | Contrainte dure | Crise en cours | Tension centrale |
| **Jaune** | Intuition de solution | Solution formulée | Règle de résolution | Implémentation | Insight fondateur |
| **Bleu** | Hypothèse logique | Argument structuré | Axiome | Raisonnement | Cadre logique central |
| **Violet** | Pressentiment de sens | Valeur articulée | Principe fondateur | Quête de sens | Conviction profonde |
| **Mauve** | Germe d'idée | Concept exploré | Convention de travail | Exploration | Concept pivot |

### 5.5 Heuristiques de liaisons

#### Règles de flux naturel

| # | Règle | Couleur liaison suggérée |
|---|-------|-------------------------|
| R1 | Le vert nourrit le jaune (fait → insight) | Jaune |
| R2 | L'orange appelle le jaune (problème → solution) | Orange |
| R3 | Le bleu structure le mauve (logique → concept) | Bleu |
| R4 | Le violet fonde le bleu (sens → cadre logique) | Violet |
| R5 | Le mauve explore le vert (hypothèse → faits) | Vert |

#### Règles d'alerte

| # | Condition | Suggestion IA |
|---|-----------|---------------|
| A1 | Bloc orange sans liaison sortante | "Ce problème n'a pas encore de piste de résolution." |
| A2 | Bloc jaune sans liaison entrante | "Cet insight semble flotter. Sur quels faits s'appuie-t-il ?" |
| A3 | Deux blocs orange liés mutuellement | "Tension circulaire détectée. Un bloc jaune pourrait débloquer." |
| A4 | Bloc bleu non relié à un violet | "Ce cadre logique manque de fondation." |
| A5 | Bloc mauve isolé | "Ce concept exploratoire est isolé." |

#### Règles de complétude

| # | Pattern détecté | Suggestion |
|---|----------------|------------|
| C1 | Beaucoup de vert, pas de jaune | "Vous avez beaucoup de matière. Prêt pour un premier insight ?" |
| C2 | Beaucoup d'orange, peu de jaune | "Plusieurs problèmes. Lequel traiter en priorité ?" |
| C3 | Pas de violet | "Le graphe manque d'ancrage. Quel est le sens profond ?" |
| C4 | Tout en nuage | "Beaucoup d'intuitions. Laquelle mérite d'être structurée ?" |
| C5 | Pas de cercle | "Le graphe n'a pas de noyau. Quelle idée est la plus centrale ?" |

### 5.6 Système de tags automatiques

Formule : `tag = [intention_couleur] + [statut_forme]`

Exemples : `#observation-brute` (vert+nuage), `#problème-identifié` (orange+rectangle), `#règle-de-résolution` (jaune+carré), `#conviction-profonde` (violet+cercle), `#germe-idée` (mauve+nuage).

### 5.7 Analyse de clusters

| Profil cluster | Composition dominante | Interprétation |
|---------------|----------------------|----------------|
| Nœud de tension | Majorité orange | Zone de friction — besoin de solutions |
| Pôle de synthèse | Vert + jaune | Zone productive — les faits génèrent des insights |
| Fondation | Violet + bleu | Socle structurel — valeurs fondent la logique |
| Laboratoire | Majorité mauve | Zone exploratoire — hypothèses en test |
| Centre décisionnel | Cercles + carrés | Zone de convergence — décisions |

### 5.8 Protocole d'intervention IA

Ordre strict :

1. **Observer** : lire le graphe (blocs, couleurs, formes, liaisons)
2. **Interpréter** : appliquer les grilles de lecture
3. **Détecter** : identifier alertes et patterns
4. **Proposer** : formuler une suggestion en français courant, jamais technique
5. **Attendre** : l'utilisateur décide. L'IA ne modifie jamais sans validation.

**Format de suggestion standard :**

```
[Observation] → [Interprétation] → [Suggestion] → [Score confiance]
```

Le score de confiance est calculé à partir de la similarité sémantique et de la complétude structurelle. Il est indicatif, jamais décisionnel.

### 5.9 Capacités d'accélération active

| Capacité | Déclencheur |
|----------|-------------|
| Analyser un espace complet | Commande utilisateur |
| Proposer des regroupements | Analyse auto ou sur demande |
| Signaler des incohérences | Analyse automatique |
| Suggérer des liaisons | Analyse sémantique + topologique |
| Proposer des sous-espaces | Détection de clusters isolés |
| Générer une première cartographie | Requête utilisateur explicite |

### 5.10 Fonction d'accélération de fabrication

Le système est un **accélérateur de fabrication de matière intellectuelle** :

1. **Génération d'espace thématique** — Constitution automatique d'un premier graphe complet à partir d'une requête.
2. **Recherche documentaire externe** — Interrogation de sources extérieures pour alimenter un espace.
3. **Proposition structurée de sources** — Résultats organisés avec métadonnées (pertinence, type, fiabilité) avant import.
4. **Import validé de contenus hétérogènes** — Intégration avec traçabilité complète de l'origine.
5. **Analyse multimodale native** — Contenus visuels deviennent nœuds interprétables avec mêmes heuristiques que le texte.
6. **Graphe pré-structuré par l'IA** — Organisation spatiale et relationnelle proposée, modifiable ou rejetable.

> L'IA accélère, propose, alimente — mais ne décide jamais. L'utilisateur reste souverain.

### 5.11 Graphe global et liaisons inter-espaces

> **Statut** : Architecture validée, en cours d’implémentation (cf. ARCHITECTURE_META_GRAPHE.md)

Le système offre un graphe global où tous les blocs de tous les espaces coexistent. Le modèle de liaison est unifié (cf. §2.3). La distinction intra/inter est une propriété dérivée.

**Rôle de l’IA dans le graphe global :**
- Détecter des thèmes transversaux entre espaces via analyse sémantique
- Proposer des liaisons inter-espaces avec type, poids, et justification
- Signaler des résonances (analogies non vues par l’utilisateur)
- Identifier des dépendances structurelles entre espaces

Toutes les suggestions arrivent en `en_attente` avec `origine=ia_suggestion`. L’utilisateur valide ou rejette.

**Heuristiques inter-espaces pour l’IA :**

| Pattern détecté | Suggestion |
|-----------------|------------|
| Même entité dans deux espaces | Liaison de type prolongement |
| Bloc orange ici, bloc jaune là-bas | Le problème a peut-être sa solution dans l’autre espace |
| Deux espaces sans aucune liaison inter | Ces espaces sont totalement isolés |
| Bloc violet / bloc bleu qui résonne | Ce cadre logique pourrait être fondé sur ce principe |

Contrainte : fonctionne en **lecture seule** sur les espaces existants, couche de visualisation séparée.

---

## 6. GLOSSAIRE

### Entités fondamentales

| Terme | Définition |
|-------|------------|
| **Espace** | Sous-graphe indépendant possédant une thématique globale, une grille sémantique stable, un ensemble de blocs et liaisons. Stocké dans un fichier unique. |
| **Bloc** | Unité relationnelle fondamentale — conteneur multi-éléments non destructif. Nœud du graphe, unité d'indexation sémantique, point d'ancrage relationnel. |
| **Liaison** | Arête relationnelle reliant deux blocs. Attachée dynamiquement, persistante, non directionnelle visuellement en V1. |
| **Graphe** | Représentation spatiale bidimensionnelle d'un espace, composée de nœuds (blocs) et d'arêtes (liaisons). |

### Couleurs (palette sémantique)

| Terme | Définition |
|-------|------------|
| **Vert** | Matière première, fait brut, observation concrète |
| **Orange** | Énergie, tension, problème, friction |
| **Jaune** | Lumière, insight, solution, déclic |
| **Bleu** | Logique, raison, structure, cadre |
| **Violet** | Sens vertical, valeur profonde, principe fondateur |
| **Rose-mauve** | Concept en création, hypothèse, piste exploratoire |

### Formes (statut épistémique)

| Terme | Définition |
|-------|------------|
| **Nuage** | Intuition vivante, certitude faible |
| **Rectangle arrondi** | Idée structurée, certitude moyenne |
| **Carré** | Texte fondateur, certitude haute |
| **Ovale** | Processus, certitude variable |
| **Cercle** | Cœur / centre, certitude maximale |

### Concepts techniques

| Terme | Définition |
|-------|------------|
| **IA Graphe** | Module IA dédié au traitement automatique des blocs (titres, résumés, entités, mots-clés, similarité) |
| **IA Assistant** | Module IA dédié à l'interaction utilisateur (dialogue, analyse d'espace, suggestions) |
| **IA Observatrice** | Mode activable d'analyse du graphe — propose sans modifier |
| **Stockage mort** | Phénomène où les informations sont conservées mais deviennent inexploitables, isolées et non évolutives |
| **Stockage vivant** | Modèle où les contenus restent connectables, les relations évoluent, les structures émergent |
| **Force-directed** | Algorithme de spatialisation temporaire utilisé uniquement en mode IA |
| **Liaison ancrée** | Type de liaison toujours visible, indépendamment de la sélection |
| **Redimensionnement révélateur** | Agrandir un bloc révèle son contenu, le réduire le masque — jamais d'espace vide |
| **Méta-graphe** | Vue conceptualisée (non V1) où chaque espace est un nœud et les relations entre espaces sont des méta-liaisons |
| **Local-first** | Architecture où les données restent sur la machine de l'utilisateur |

---

## 7. RÈGLES ET GRILLES DE LECTURE

### 7.1 Règle de souveraineté utilisateur

L'utilisateur est souverain sur la structure de sa pensée. L'IA accélère, propose, alimente — mais ne décide jamais. Toute action structurelle nécessite une validation explicite avant exécution. Ce principe est absolu et sans exception.

### 7.2 Règles de rendu visuel

- L'esthétique est une contrainte d'ingénierie, pas un "nice to have".
- L'outil ne doit jamais créer de friction conceptuelle.
- Toute friction répétée indique une erreur d'architecture, pas un bug isolé.
- Le moteur graphique est choisi pour le rendu attendu, pas ajusté après coup.

### 7.3 Règles IA

- L'IA ne juge jamais la couleur choisie par l'utilisateur.
- L'IA intervient uniquement lorsqu'elle est sollicitée (via console ou vocal).
- Protocole : Observer → Interpréter → Détecter → Proposer → Attendre.
- Aucune modification définitive sans validation.
- Le score de confiance est indicatif, jamais décisionnel.

### 7.4 Règles d'affichage

- Liaisons visibles uniquement sur sélection/survol/exploration (sauf ancrées).
- Légendes contextuelles au moment de l'interaction uniquement.
- Console IA : translucide, jamais modale, graphe visible derrière.
- Panneau latéral : déployable par glissement, non intrusif.

### 7.5 Règles de code

- Aucun code temporaire, placeholder fonctionnel, ou legacy.
- Emplacements réservés = fichiers vides ou avec commentaire d'intention.
- Paramètres externalisés (jamais de constantes codées en dur).
- Bézier cubiques uniques pour les liaisons, tangence réelle.
- Zéro intersection bloc-liaison.
- Stop propre du backend obligatoire.

### 7.6 Grille de décision : "Cette fonctionnalité a-t-elle sa place ?"

Toute fonctionnalité doit passer ce test :

1. Sert-elle le processus de pensée ?
2. Respecte-t-elle l'épure visuelle ?
3. Préserve-t-elle la souveraineté de l'utilisateur ?
4. Est-elle utilisable sans apprentissage préalable ?
5. Respecte-t-elle les invariants architecturaux V1 ?

Si une réponse est non → la fonctionnalité n'a pas sa place.

---

## 8. EXTENSION V2 — SYSTÈME D'EXPLOITATION PERSONNEL

### 8.1 Vision élargie

L'Atelier Visuel de Pensée n'est pas seulement un outil de pensée — il a vocation à devenir le **système d'exploitation personnel** de l'utilisateur. Le graphe vivant devient l'interface universelle où convergent : les fichiers du PC, les idées, les recherches, les projets, la documentation et le suivi système.

Cette vision ne remplace pas l'architecture V1 — elle l'étend en activant les emplacements réservés et en ajoutant trois capacités nouvelles.

### 8.2 Intégration du système de fichiers dans le graphe

Les fichiers et dossiers du PC deviennent des blocs dans le graphe, navigables visuellement par **sens sémantique** plutôt que par arborescence Windows.

**Principes :**

- Un fichier indexé = un bloc avec métadonnées (type, taille, date, chemin réel, tags sémantiques)
- Les dossiers peuvent être représentés comme des clusters ou des espaces dédiés
- La navigation se fait par thématique, projet ou relation — pas par `C:\Users\...\`
- Le chemin physique reste accessible mais n'est plus le mode de navigation principal
- L'indexation est sélective : l'utilisateur choisit quels dossiers sont intégrés au graphe

**Table supplémentaire :**

```sql
CREATE TABLE fichiers_indexes (
    id TEXT PRIMARY KEY,
    bloc_id TEXT REFERENCES blocs(id) ON DELETE SET NULL,
    chemin_absolu TEXT NOT NULL UNIQUE,
    nom TEXT NOT NULL,
    extension TEXT,
    taille_octets INTEGER,
    hash_contenu TEXT,
    date_modification DATETIME,
    date_indexation DATETIME DEFAULT CURRENT_TIMESTAMP,
    tags_semantiques TEXT,
    statut TEXT CHECK(statut IN ('actif','modifie','supprime','deplace')) DEFAULT 'actif'
);

CREATE INDEX idx_fichiers_chemin ON fichiers_indexes(chemin_absolu);
CREATE INDEX idx_fichiers_bloc ON fichiers_indexes(bloc_id);
CREATE INDEX idx_fichiers_statut ON fichiers_indexes(statut);
```

### 8.3 Scan différentiel au démarrage

À chaque ouverture de l'Atelier, le système compare l'état actuel du système de fichiers avec l'état enregistré dans `fichiers_indexes`.

**Processus :**

1. Parcours des dossiers indexés
2. Comparaison hash/date de modification avec l'enregistrement
3. Détection : nouveaux fichiers, fichiers modifiés, fichiers supprimés, fichiers déplacés
4. Rapport de différences présenté à l'utilisateur dans l'interface
5. Proposition de mise à jour du graphe (ajout/suppression/déplacement de blocs)
6. Validation utilisateur avant toute modification du graphe

**Contraintes :**

- Pas de processus de surveillance continu (pas de watchdog permanent)
- Le scan s'exécute au démarrage uniquement, puis sur demande explicite
- Le scan est un processus CPU léger — pas de GPU requis
- Temps cible : < 5 secondes pour 10 000 fichiers indexés

**Endpoints réservés :**

```
POST /api/filesystem/scan-diff
GET  /api/filesystem/rapport
POST /api/filesystem/appliquer-changements
```

### 8.4 Agents d'action locale sur les fichiers

Des agents IA légers (via Ollama, modèles 7B-13B) peuvent proposer et exécuter des actions sur le système de fichiers après validation.

**Capacités :**

- Proposer du rangement par thématique (regrouper des fichiers éparpillés)
- Détecter les doublons et proposer la fusion
- Identifier les fichiers volumineux inutiles
- Renommer selon une convention cohérente
- Déplacer des fichiers entre dossiers

**Principes de sécurité :**

- **Aucune action destructive sans validation explicite** (suppression, écrasement)
- Les déplacements sont proposés avec prévisualisation avant/après
- Un journal d'actions est maintenu pour réversibilité
- L'agent est chargé à la demande et déchargé après usage (non-blocage GPU)

**Table de journal :**

```sql
CREATE TABLE journal_actions_fichiers (
    id TEXT PRIMARY KEY,
    type_action TEXT NOT NULL CHECK(type_action IN ('deplacer','renommer','fusionner','supprimer','creer_dossier')),
    chemin_source TEXT NOT NULL,
    chemin_destination TEXT,
    date_action DATETIME DEFAULT CURRENT_TIMESTAMP,
    valide_par_utilisateur BOOLEAN DEFAULT FALSE,
    reversible BOOLEAN DEFAULT TRUE,
    statut TEXT CHECK(statut IN ('propose','valide','execute','annule')) DEFAULT 'propose'
);
```

### 8.5 Architecture multi-cerveaux discontinue

Le système utilise plusieurs intelligences spécialisées, aucune ne tournant en permanence :

| Cerveau | Technologie | Usage | Ressource | Mode |
|---------|-------------|-------|-----------|------|
| STT | Whisper large-v3 | Dictée vocale | GPU local | À la demande |
| TTS | Edge TTS ou Piper | Retour vocal | Cloud ou local | À la demande |
| IA Graphe | Ollama (7B) | Titres, résumés, entités | GPU local | À la demande |
| IA Assistant | API Claude/GPT | Dialogue, analyse profonde | Cloud | À la demande |
| Agent fichiers | Ollama (7B-13B) | Classification, rangement | GPU local | À la demande |
| Scan diff | Python natif | Détection changements | CPU | Au démarrage |

**Principe de non-blocage** : les agents GPU sont chargés/déchargés dynamiquement. Jamais deux agents lourds simultanément sur le même GPU. L'orchestrateur (backend FastAPI) gère la file d'attente.

### 8.6 Suivi des performances système

Une vue dédiée dans l'Atelier affiche l'état de santé de la machine :

- Espace disque par volume
- Utilisation mémoire RAM et VRAM
- Processus gourmands
- Températures GPU/CPU

Ce n'est pas un monitoring continu mais un **tableau de bord consultable**, mis à jour au démarrage et sur demande.

**Endpoints réservés :**

```
GET /api/systeme/sante
GET /api/systeme/gpu
GET /api/systeme/disques
```

### 8.7 Espaces de recherche dédiés

Chaque recherche entreprise (technique, créative, spirituelle, professionnelle) peut avoir son propre espace dans le graphe — un réceptacle vivant qui accumule résultats, notes, liens et conclusions au fil du temps.

**Workflow :**

1. L'utilisateur crée un espace de recherche (thème, objectif)
2. Les résultats de recherche (web, documents, notes) sont importés comme blocs
3. L'IA propose une structuration initiale du graphe de recherche
4. L'espace grandit organiquement à chaque session
5. L'IA détecte les patterns, les manques, les convergences

### 8.8 Relation avec la documentation existante

| Document | Public | Rôle |
|----------|--------|------|
| **Documents A-E, G0** (docs-creation/) | IA d'implémentation | Détail technique exhaustif par domaine |
| **CENTRAL.md** | IA (lecture rapide) | Synthèse complète — référence de vérité |
| **Vision_Architecture.docx** | Humain | Synthèse stratégique — direction et sens du projet |
| **AGENT.md** | IA d'implémentation | Protocole d'exécution des agents de développement |
| **SEQUENCAGE.md** | IA d'implémentation | Ordre de construction des fonctionnalités |

> Les documents ne se dupliquent pas — ils se complètent. Chaque niveau de lecture a son document dédié.

### 8.9 Emplacements réservés V2

| Fonctionnalité | Frontend | Backend | Statut |
|---------------|----------|---------|--------|
| Scan différentiel | `src/modules/filesystem/` | `services/scan_diff.py` | [RÉSERVÉ] |
| Agent fichiers | `src/modules/filesystem/` | `services/agent_fichiers.py` | [RÉSERVÉ] |
| Tableau de bord système | `src/modules/systeme/` | `services/sante_systeme.py` | [RÉSERVÉ] |
| Espaces de recherche | Intégré espaces existants | `services/recherche_espace.py` | [RÉSERVÉ] |

### 8.10 Structure de fichiers étendue

```
atelier-visuel/
├── ...existant...
├── frontend/
│   └── src/
│       └── modules/
│           ├── vocal/           ← [RÉSERVÉ V1]
│           ├── import/          ← [RÉSERVÉ V1]
│           ├── recherche/       ← [RÉSERVÉ V1]
│           ├── meta/            ← [RÉSERVÉ V1]
│           ├── filesystem/      ← [RÉSERVÉ V2] Navigateur fichiers, scan diff
│           └── systeme/         ← [RÉSERVÉ V2] Tableau de bord performance
├── backend/
│   └── services/
│       ├── ...existant...
│       ├── scan_diff.py         ← [RÉSERVÉ V2]
│       ├── agent_fichiers.py    ← [RÉSERVÉ V2]
│       ├── sante_systeme.py     ← [RÉSERVÉ V2]
│       └── recherche_espace.py  ← [RÉSERVÉ V2]
└── docs-creation/
    ├── ...existant A-E, G0...
    └── DOCUMENT_F_VISION_ELARGIE.md  ← [À CRÉER] Extension V2
```

---

## 9. PHILOSOPHIE D'INTÉGRATION — FUSION ARCHITECTURALE

### 9.1 Principe fondateur : fusionner, ne pas recréer

L'Atelier ne réinvente pas ce qui existe. Il absorbe les **principes architecturaux éprouvés** des meilleurs outils du marché et les fond dans un tout cohérent où les coutures sont invisibles.

Ce qui est emprunté, ce ne sont pas des interfaces ni du code, mais des **choix de conception** :

| Source d'inspiration | Principe emprunté | Ce qu'on en tire |
|---------------------|-------------------|------------------|
| **Obsidian** | Stockage local-first en Markdown, liens bidirectionnels | Persistance légère, souveraineté des données, interopérabilité |
| **Heptabase** | Spatialisation visuelle sur canvas infini | Organisation par proximité spatiale, pensée non-linéaire |
| **Kosmik** | Intégration multimédia native, navigateur embarqué, auto-tagging IA | Recherche et capture sans changer d'outil |
| **TheBrain** | Graphe de connaissances navigable sur le long terme | Persistance décennale, navigation par association |
| **Claude (API)** | Analyse sémantique profonde, co-création | Couche d'intelligence supérieure à la demande |
| **Claude Desktop (MCP)** | Accès système de fichiers, PowerShell, navigation web | Bras et jambes pour agir sur l'environnement |
| **Claude Code** | Skills, hooks, agents multi-agentiques, développement | Moteur de développement intégré, boucles de code |
| **Ollama** | LLM locaux légers à la demande | Maintenance, indexation, classification sans coût API |

### 9.2 Vigilances

- **Propriétaire** : Heptabase, Kosmik, TheBrain sont propriétaires. On étudie les principes, pas le code.
- **Dette technique héritée** : Ces outils datent d'une époque antérieure aux LLM, MCP et agents locaux. Les principes sont bons, l'implémentation doit être actuelle.
- **Haute couture** : L'intégration doit être élégante — pas de modules juxtaposés qui sentent le bricolage. Un seul flux, une seule interface, zéro couture visible.
- **Simplicité d'accueil** : Contrairement à Obsidian (courbe d'apprentissage sévère), l'Atelier doit être immédiatement utilisable. La complexité est derrière, jamais devant.

### 9.3 Ce que l'Atelier apporte d'unique (introuvable ailleurs)

1. **Grammaire sémantique visuelle** — 6 couleurs × 5 formes encodant intention et certitude. Rend visible la nature de la pensée, pas juste son contenu.
2. **Intégration du filesystem local dans le graphe** — Fichiers réels comme nœuds navigables par sens, pas par arborescence.
3. **Architecture multi-cerveaux discontinue** — Orchestration LLM local + API cloud + Whisper avec non-blocage GPU.
4. **Scan différentiel** — L'outil s'éveille, rattrape les changements, se rendort. Paradigme unique.
5. **Co-création en temps réel avec structuration visuelle** — La conversation avec l'IA produit directement des blocs connectés dans le graphe.
6. **Stockage énergétique** — Pas de l'archivage mort mais un stockage vivant où organiser = penser.

### 9.4 Rôle de l'environnement Claude comme levier

L'environnement Claude existant n'est pas extérieur au projet — il en est un pilier :

- **Claude.ai + MCP (Desktop Commander, Filesystem, TTS, STT)** : prototype vivant de ce que l'Atelier fera. Déjà capable de manipuler fichiers, lancer des processus, parler en voix.
- **Claude Code CLI** : moteur de développement avec skills, hooks, slash commands, agents multi-agentiques. C'est par là que le code de l'Atelier sera implémenté.
- **Claude API** : cerveau consultant appelé depuis l'Atelier pour l'analyse sémantique profonde, la co-création, l'émergence. Arrive sans MCP — l'Atelier lui fournit les bras.

**Distinction critique** : Claude Desktop (avec MCP) peut agir sur le système. Claude API (sans MCP) est intelligence pure. L'Atelier doit être conçu pour tirer le meilleur de chacun.

---

## 10. CHRONOLOGIE DE RÉALISATION — INTÉGRATION PROGRESSIVE

### 10.1 Principe : l'outil se construit avec lui-même

Chaque module ajouté rend le développement du suivant plus puissant. L'Atelier est à la fois le produit et l'outil de production. C'est une boucle vertueuse :

1. On co-crée dans l'Atelier (graphe vivant, idées, architecture)
2. On implémente via Claude Code (skills, agents, code)
3. Le résultat enrichit l'Atelier lui-même
4. L'Atelier enrichi permet une meilleure co-création du module suivant

### 10.2 Séquence d'intégration

**Étape 0 — Noyau fonctionnel minimal (en cours)**

Objectif : un Atelier utilisable pour co-créer la suite.

- Interface Canvas2D avec blocs, formes, couleurs, liaisons
- Backend FastAPI + SQLite
- Grammaire sémantique opérationnelle
- Sauvegarde/chargement d'espaces
- STT Whisper + TTS Edge (déjà actifs via MCP)

Résultat : on peut poser des idées, les relier, les voir. L'Atelier devient l'outil de travail pour le reste du développement.

**Étape 1 — Bloc-notes spatial et capture rapide**

Inspiration : Obsidian (capture légère), Heptabase (spatialisation)

- Création rapide de blocs par clic, voix ou raccourci
- Édition de contenu riche dans les blocs
- Recherche sémantique dans la base
- Vue liste synchronisée avec le graphe

Résultat : l'Atelier remplace le bloc-notes. Chaque idée de développement est capturée dedans.

**Étape 2 — Co-création IA intégrée**

Inspiration : Heptabase AI Chat, Kosmik auto-tagging

- Console IA intégrée (Claude API) pour dialogue et analyse
- Génération automatique de métadonnées (titres, résumés, entités)
- Suggestions de liaisons par analyse sémantique
- Les réponses IA peuvent créer des blocs directement dans le graphe

Résultat : la co-création se fait dans l'Atelier. Ce qu'on fait en conversation Claude.ai se fait désormais dans le graphe vivant.

**Étape 3 — Intégration recherche et import**

Inspiration : Kosmik (navigateur intégré), Heptabase Web Tab

- Recherche web depuis l'Atelier avec résultats importés comme blocs
- Espaces de recherche dédiés (réceptacles vivants)
- Import de documents (PDF, URL, notes) avec métadonnées
- Traçabilité des sources

Résultat : les recherches ne se perdent plus. Chaque investigation a son espace vivant.

**Étape 4 — Intégration filesystem et scan différentiel**

Inspiration : aucun outil existant (concept original)

- Indexation sélective de dossiers du PC dans le graphe
- Scan différentiel au démarrage
- Navigation par sens plutôt que par arborescence
- Agents Ollama locaux pour classification et rangement

Résultat : l'Atelier connaît le PC. Les fichiers sont des blocs vivants.

**Étape 5 — Tableau de bord système et maintenance**

- Vue santé de la machine (disque, RAM, GPU, températures)
- Propositions de nettoyage et d'optimisation
- Journal d'actions réversibles

Résultat : l'Atelier est le système d'exploitation personnel complet.

**Étape 6 (horizon) — Actions vers l'extérieur**

- Actions déclenchées depuis le graphe (création de projets, communication, automatisation)
- Intégration avec des services externes
- Méta-graphe inter-espaces

Résultat : l'Atelier ne regarde plus seulement vers l'intérieur mais agit vers l'extérieur.

### 10.3 Boucle de développement

Chaque étape suit le même cycle :

```
Co-création (Atelier + Claude API)
    ↓
Conception (graphe vivant des idées)
    ↓
Implémentation (Claude Code CLI + agents)
    ↓
Intégration (le module rejoint l'Atelier)
    ↓
L'Atelier est plus puissant → retour étape suivante
```

---

## 11. JOURNAL DES MODIFICATIONS

- 17/02/2026 : Version initiale — Fusion des documents A, B, C, D, E, G0
- 18/02/2026 : Ajout section 8 — Extension V2 (système d'exploitation personnel, scan différentiel, agents fichiers, multi-cerveaux, espaces de recherche)
- 18/02/2026 : Ajout sections 9 et 10 — Philosophie d'intégration (fusion architecturale, haute couture, sources d'inspiration, rôle de l'environnement Claude) et chronologie de réalisation par intégration progressive avec boucle vertueuse.

---

*Ce document constitue la référence permanente pour arbitrer les choix techniques, garantir la cohérence du développement, éviter la dérive fonctionnelle et maintenir l'alignement entre usage réel et implémentation.*
