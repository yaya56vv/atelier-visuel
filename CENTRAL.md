# CENTRAL.md — Atelier Visuel de Pensée

Version : V1
Date : 17/02/2026
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

### 2.3 Modèle des liaisons

Structure : `id`, `bloc_source_id`, `bloc_cible_id`, `type_liaison`, `created_at`.

Types V1 :

| Type | Description |
|------|-------------|
| Relation simple | Structure neutre |
| Logique | Structuration |
| Tension | Contradiction |
| Ancrée | Toujours visible |

Liaisons symétriques en V1. Aucune pondération algorithmique.

### 2.4 Espaces V1

Deux espaces seulement :

- **IDÉES** : réflexion large et transversale
- **CONCEPTION** : structuration opérationnelle

Palette identique entre espaces. Influence uniquement interprétative.

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

### 2.9 Invariants architecturaux V1

**Interdits :**

1. Pondération algorithmique
2. Hiérarchie parent-enfant
3. Fusion automatique destructive
4. Personnalisation avancée du graphe
5. Moteur IA permanent (toujours activable/désactivable)
6. Surcharge sémantique sur les liaisons

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

-- Liaisons
CREATE TABLE liaisons (
    id TEXT PRIMARY KEY,
    espace_id TEXT NOT NULL REFERENCES espaces(id),
    bloc_source_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    bloc_cible_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('simple','logique','tension','ancree')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
CREATE INDEX idx_liaisons_espace ON liaisons(espace_id);
CREATE INDEX idx_liaisons_source ON liaisons(bloc_source_id);
CREATE INDEX idx_liaisons_cible ON liaisons(bloc_cible_id);
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

**Endpoints réservés :**

```
[RÉSERVÉ] POST /api/ia/analyser-espace
[RÉSERVÉ] POST /api/ia/suggerer-liaisons
[RÉSERVÉ] POST /api/ia/generer-graphe
[RÉSERVÉ] POST /api/vocal/stt
[RÉSERVÉ] POST /api/vocal/tts
[RÉSERVÉ] POST /api/import/parser
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
| Analyse inter-espaces | `src/modules/meta/` | `services/meta_graphe.py` | `meta_liaisons` |
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

### 5.11 Lecture inter-espaces (conceptualisée, non implémentée V1)

Principe : analyse de relations entre espaces distincts formant un **méta-graphe** (un espace = un nœud, relations entre espaces = méta-liaisons).

Capacités futures : détection de thèmes transversaux, suggestions de fusion, analyse de dépendances, vue méta-graphe.

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

## 8. JOURNAL DES MODIFICATIONS

- 17/02/2026 : Version initiale — Fusion des documents A, B, C, D, E, G0

---

*Ce document constitue la référence permanente pour arbitrer les choix techniques, garantir la cohérence du développement, éviter la dérive fonctionnelle et maintenir l'alignement entre usage réel et implémentation.*
