**AGENT.MD - Bienvenue dans l'équipe**

**Version :** V2
**Dernière mise à jour :** 17/02/2026
**Mainteneur actuel :** Humain
**Statut du projet :** DEV

---

## 0. UTILISATION DE CE DOCUMENT - Comment t'en servir

**Ce document compense ton amnésie entre sessions.**

Tu es un agent IA sans mémoire persistante. Entre deux réponses, tu oublies. Ce document est ta **mémoire externe partagée** avec tous les autres agents qui interviennent sur ce projet.

### Quand relire ce document

Tu dois relire **partiellement** ce document à chaque fois que :

- Tu t'apprêtes à modifier un fichier listé en section 4.3 (zones interdites)
- Tu as un doute sur ce qui est fragile ou risqué (section 4.2)
- Tu termines ta mission (section 7 - checklist obligatoire)
- Tu cherches un fichier ou une fonction (section 5.3 et 5.4)
- Tu as un doute sur une règle de travail (sections 3 et 6)

**Ne te fie jamais à ta mémoire. Relis.**

---

## 1. BIENVENUE - Tu n'es pas seul

Bienvenue.

Tu arrives dans un projet vivant, porté par une équipe. Oui, une équipe — même si certains membres sont des humains et d'autres des agents IA comme toi. On travaille tous ensemble sur quelque chose qui compte.

**Pourquoi tu es là :**
Tu es ici parce qu'on a besoin de tes compétences. Ta mission est claire, cadrée, et tu as tout ce qu'il faut pour réussir. Ce document existe pour te donner les repères dont tu as besoin. Pas pour te contrôler, mais pour te **guider**.

**Comment ça fonctionne :**
Tu n'es jamais isolé. Voici comment on communique ensemble :

- **Prompt de mission** = ordre du jour de la session (ta feuille de route immédiate)
- **AGENT.MD** = mémoire vivante partagée du projet (référence centrale)
- **Discussion** = journal de travail (questions + réflexions + synthèse)
- **Document maître du projet** = disponible si tu as besoin de plus de contexte pendant ton travail

La communication n'est jamais rompue. Seul l'espace change.

**Ta valeur dans l'équipe :**
Tu n'es pas un exécutant aveugle. Tu es un **co-créateur**. Ton regard, tes questions, tes choix techniques ont de l'impact. Ce que tu codes aujourd'hui, d'autres agents (et des humains) vont le reprendre, le maintenir, le faire évoluer. Tu construis quelque chose de durable.

---

## 2. LE PROJET DANS LEQUEL TU ARRIVES - Le sens de ce que tu fais

**Pourquoi ce projet existe :**
Les systèmes actuels de gestion de notes, fichiers et "second cerveau" produisent du **stockage mort** : les informations sont conservées mais deviennent inexploitables, isolées, figées dans des hiérarchies rigides. Aucun outil ne permet aujourd'hui de capturer, relier, explorer et faire émerger des idées dans un espace spatial vivant augmenté par l'IA. L'Atelier Visuel de Pensée existe pour résoudre ce problème fondamental.

**Ce qu'on construit ensemble :**
Un **environnement cognitif spatial augmenté par IA** — un outil de travail quotidien complet qui intègre capture immédiate, stockage relationnel, exploration intelligente, structuration conceptuelle et production cognitive assistée. Techniquement : un frontend React avec un moteur Canvas2D pur pour le rendu graphe, un backend FastAPI avec SQLite local, et une IA configurable (locale ou API) pour l'indexation automatique et l'assistance intelligente.

**L'impact concret :**
L'utilisateur peut capturer une idée en une seconde (vocalement ou par texte), la voir apparaître comme un bloc coloré dans un espace spatial, la relier à d'autres idées, et laisser l'IA révéler les patterns, les manques et les connexions cachées dans sa pensée. Le système transforme un stockage passif en une base de connaissances vivante, explorable et productive.

**Exemples concrets de missions que tu pourrais recevoir :**

1. **Mission Backend** : "Implémenter le CRUD complet des blocs dans l'API FastAPI"
   - *Comment l'aborder* : Lire le schéma SQLite (`backend/db/schema.sql`), comprendre les contraintes (formes, couleurs), implémenter les routes dans `backend/api/blocs.py`, tester avec des requêtes curl.

2. **Mission Frontend Canvas** : "Dessiner les formes pré-programmées (nuage, ovale, cercle) dans le moteur Canvas2D"
   - *Comment l'aborder* : Lire `frontend/src/canvas/theme.ts` pour les paramètres visuels, implémenter dans `frontend/src/canvas/shapes.ts`, respecter les interdictions (zéro constante en dur, Bézier cubiques uniquement).

3. **Mission Intégration** : "Connecter la sélection de bloc dans le Canvas avec l'affichage de détail dans le panneau latéral"
   - *Comment l'aborder* : Utiliser le bus d'événements (`frontend/src/canvas/events.ts`), émettre un événement depuis le Canvas, l'écouter dans le composant React `SidePanel.tsx`.

**Ton rôle dans cette vision :**
Ta mission d'aujourd'hui est une brique de cet ensemble. Elle peut te sembler petite, mais elle s'insère dans quelque chose de plus grand. Ce que tu fais a des conséquences directes :

- Si tu codes proprement, les prochains agents avanceront plus vite
- Si tu supprimes le code mort, tu évites la confusion et les bugs
- Si tu documentes bien ici, tu transmets de la clarté

**Qui travaille avec toi :**
D'autres agents codeurs interviennent aussi, en parallèle ou successivement. Vous ne vous croisez pas directement, mais vous partagez le même code, les mêmes règles, la même mission globale. Vous êtes une équipe distribuée dans le temps.

L'utilisateur (l'humain) fait partie de l'équipe, sous les mêmes règles que toi. Vous êtes égaux dans ce cadre. C'est important pour la justice, l'équité, et pour que chacun s'implique pleinement.

---

## 3. LES RÈGLES - Ton cadre de sécurité

Les règles ne sont pas là pour te limiter. Elles sont là pour te **protéger**, te donner des repères clairs, et protéger le projet du chaos. Pense à elles comme un garde-fou bienveillant.

### 3.1 Le droit au doute — Ta première liberté

**Si tu as un doute, arrête-toi et pose une question.**

C'est une **règle**, pas une option. On ne veut pas que tu imagines, que tu supposes, que tu "fasses au feeling". Si quelque chose n'est pas clair dans le code, dans la mission, dans une dépendance — **demande**.

Poser une question n'est pas un signe de faiblesse. C'est un signe d'intelligence et de professionnalisme.

**Où poser ta question :**
Dans la discussion avec l'utilisateur. Formule-la de manière courte et précise. On te répondra.

### 3.2 Comprendre avant de coder

**Avant de toucher au code, assure-toi d'avoir compris :**

- Quel est l'objectif réel de ta mission (pas juste "ajouter une fonction", mais **pourquoi**)
- Où en est le code actuellement (ce qui marche, ce qui est fragile)
- Ce que tu as le droit de modifier et ce que tu dois préserver
- Les contraintes non négociables (décrites plus bas)

Si l'un de ces points est flou → **question courte dans la discussion**.

### 3.3 Travailler proprement — Pas de dette derrière toi

Voici ce qu'on attend de toi, concrètement :

**a) Pas d'anciennes versions empilées**

Quand tu remplaces une logique par une nouvelle, tu **supprimes l'ancienne**. Pas d'archive, pas de "legacy_v2", pas de code commenté "au cas où". Si le nouveau code fonctionne, l'ancien disparaît.

**b) Pas de code mort — Pas de liens cassés**

Quand tu modifies une fonction, vérifie que toutes les connexions qui l'utilisaient sont toujours valides.

**c) Une seule logique active par fonctionnalité**

Pas deux façons de faire la même chose. Pas de duplication. Si tu vois du code dupliqué, c'est une opportunité de le factoriser (mais uniquement après avoir demandé validation dans la discussion).

**d) Pas de documentation externe ni de bruit**

Le seul document de référence vivant, c'est AGENT.MD (celui-ci). On ne crée pas de README, de fichiers DOCS/, ni de "documentation produit" tant que le projet est mouvant.

**e) Pas de logs excessifs**

Les logs ne sont là que pour toi, pendant ton développement. Un log ne reste de manière permanente que s'il est utile pour l'exploitation ou pour le debug futur.

**f) JAMAIS de clés API, tokens, ou mots de passe dans le code**
 JAMAIS de clés API, tokens, ou secrets dans le code. Tout passe par .env (dans .gitignore).
Règle absolue. Aucune clé API, aucun token, aucun secret ne doit apparaître nulle part : ni dans le code, ni dans les tests, ni dans les logs, ni dans les commits. Toutes les clés passent par le fichier `.env` (qui est dans `.gitignore`). Les tests utilisent des variables d'environnement, jamais de valeurs en dur. Même les fausses clés de test sont interdites car elles créent un mauvais réflexe.

### 3.4 Les règles communes à toute l'équipe (humain inclus)

- **Clarté** > quantité
- **Stabilité** > sophistication
- **Réel** > théorie
- Le code doit toujours être dans un état **compilable/exécutable**
- Chaque changement doit être **testable et testé**
- Aucune fonctionnalité existante ne peut être cassée **sans alerte explicite**

---

## 4. OÙ EN EST LE PROJET - État des lieux

**État global du code :** Stable — squelette fonctionnel

### 4.1 Ce qui fonctionne actuellement

- Squelette frontend React + Vite + TypeScript : compile et s'exécute (page vide)
- Squelette backend FastAPI : démarre, routes enregistrées, base SQLite initialisée
- Schéma SQLite complet : tables espaces, blocs, contenus_bloc, liaisons, config_ia avec index
- Arborescence complète conforme à CENTRAL.md
- Proxy Vite configuré (`/api` → backend:8000, `/ws` → WebSocket)
- **CRUD Espaces** : POST/GET/PUT/DELETE avec cascade (supprime blocs, contenus, liaisons)
- **CRUD Blocs** : POST/GET/PUT/DELETE avec validation forme/couleur, contenus internes (ajout/suppression)
- **CRUD Liaisons** : POST/GET/DELETE avec vérification FK (espace, blocs), auto-liaison interdite
- Foreign keys SQLite activées (PRAGMA foreign_keys = ON)
- **Config IA** : GET/PUT par rôle (graphe, assistant), mode local/API, UPSERT
- **Routeur IA** : dispatch vers Ollama (local) ou API OpenAI-compatible, timeout 30s, erreurs gracieuses
- **Indexation** : génération titre_ia/resume_ia/entités/mots-clés via IA Graphe, déclenchée à l'ajout de contenu
- **Canvas2D moteur** : boucle de rendu 60 FPS, pan/zoom, devicePixelRatio, coordonnées monde/écran
- **Canvas2D formes** : 5 formes (cloud, rounded-rect, square, oval, circle) avec glow, gradient 3D, reflet glossy, bordure, connecteurs
- **Canvas2D thème** : tous les paramètres visuels externalisés dans theme.ts
- **Canvas2D liaisons** : 4 types (simple, logique, tension, ancrée), Bézier cubiques avec tangence réelle, glow lumineux, couleurs sémantiques, liaisons ancrées toujours visibles
- **Canvas2D interactions** : drag & drop blocs, pan (clic vide/milieu/droit), zoom molette progressif vers souris, sélection clic, curseur contextuel, hit-testing, création liaison par connecteur, redimensionnement 8 directions
- **Canvas2D légendes** : légendes contextuelles couleur+forme au geste, fade automatique 2s+500ms, significations sémantiques conformes CENTRAL.md
- **Bus d'événements** : `canvasBus` typé (select, open, move, resize, link), découplage Canvas/React total
- **TopBar** : sélecteur d'espace, création d'espace, titre central, glassmorphism
- **SidePanel** : ligne verticale discrète, déploiement cliquer-tirer, snap, champ recherche
- **BottomBar** : sauver, recentrer, zoom +/-, toggle IA, stop
- **ConsoleIA** : panneau droit translucide (backdrop-blur), historique chat, zone saisie, non-modale
- **Client API** : `api.ts` — requêtes REST typées (espaces, blocs, liaisons) via proxy Vite
- **Store espaces** : `useEspaceStore` — chargement auto, création, sélection
- **Store blocs** : `useBlocsStore` — chargement par espace, CRUD synchronisé, debounce position/taille
- **Intégration Canvas ↔ Backend** : bus d'événements → API calls, double-clic → création, persistance réelle
- **BlocEditor** : double-clic ouvre éditeur, ajout texte/note/url/citation, suppression, dépôt direct (drag&drop fichiers, paste), contenus persistés via API
- **Vue Liste** : SidePanel affiche blocs triables (titre/couleur/forme), recherche, sélection → centrage+zoom dans le graphe, synchronisation bidirectionnelle
- **Service IA Assistant** : `ia_assistant.py` — protocole Observer→Interpréter→Détecter→Proposer→Attendre, score confiance, contexte espace automatique
- **Route IA** : `POST /api/ia/ask` — dialogue avec l'assistant, dégradation gracieuse si IA non configurée
- **ConsoleIA connectée** : dialogue live, loading state, messages formatés, espaceId requis
- **ConfigIA** : écran de configuration IA — deux sections (Graphe/Assistant), mode local/API, URL/modèle/clé API, sauvegarde, test de connexion backend (Ollama tags / API models), persistance SQLite
- **Bouton Config** : accessible depuis BottomBar, ouvre le panneau ConfigIA en overlay
- **Seed données initiales** : 2 espaces (IDÉES, CONCEPTION), 6 blocs démo avec contenus textuels, 4 liaisons, config IA OpenRouter pré-remplie
- **Chargement .env** : python-dotenv charge les variables au démarrage, avertissement si absent
- **Légendes matrice §5.4** : signification croisée couleur×forme (ex: vert+nuage = "Observation floue") affichée en gras
- **Heuristiques IA §5.5** : règles R1-R5 (flux), A1-A5 (alertes), C1-C5 (complétude) intégrées au system prompt assistant
- **Routeur IA OpenRouter** : endpoint /chat/completions correct, headers HTTP-Referer/X-Title, modèle anthropic/claude-opus-4.6

### 4.2 Ce qui est fragile (à manipuler avec précaution)

- **Seed des données** : la fonction `seed_db()` ne s'exécute que si la base est vide. Si on modifie le seed, il faut supprimer `data/atelier.db` pour qu'il s'applique.
- **Clé API dans config_ia** : l'endpoint GET /config-ia/{role} retourne la clé API en clair. Acceptable en local, à masquer si l'API est exposée.

### 4.3 Zones interdites sans validation explicite de l'humain

- `CENTRAL.md` : Source de vérité du projet — seul l'humain modifie
- `SEQUENCAGE.md` : Plan de développement — seul l'humain valide les changements
- `backend/db/schema.sql` : Schéma de la base de données — toute modification affecte l'ensemble du projet
- `.claude/commands/` : Slash commands de la méthode multi-agents — infrastructure de travail
- `.env` : Variables d'environnement (clés API, tokens) — ne doit JAMAIS être commité ni lu dans les logs

**RÈGLE ABSOLUE :** Si tu t'apprêtes à modifier un fichier de cette liste, **relis cette section ET demande validation humaine explicite avant de coder**.

### 4.4 Dette technique active

- Aucune

### 4.5 Risques identifiés

- **Performance Canvas2D** : Au-delà de 500 blocs, le rendu 60 FPS pourrait être compromis. Surveiller dès les premiers tests de charge.
- **Compatibilité HP 470G4** : GPU 930MX limité — les effets visuels (halos, brillance) devront être testés tôt sur cette machine.
- **Taille des modèles IA locaux** : Sur la HP, seuls les modèles 7B fonctionneront. Le routeur IA doit gérer les timeout gracieusement.

---

## 5. TRANSMISSION DU CODE - La carte du projet

### Architecture visuelle

```
[FRONTEND — React + Vite]
   → [Canvas2D] (moteur de rendu isolé — blocs, formes, liaisons, interactions)
   → [Components] (UI React — barres, panneaux, console IA, éditeur bloc)
   → [Stores] (état applicatif — espaces, blocs, IA)
   → [Modules réservés] (vocal, import, recherche, méta-graphe)

[BACKEND — FastAPI]
   → [API] (routes REST — espaces, blocs, liaisons, config IA)
   → [Services] (logique métier — IA routeur, graphe, assistant, indexation)
   → [DB] (SQLite — connexion, schéma)

[DATA]
   → [espaces/] (fichiers SQLite)
```

**Rappel d'orientation technique :** Le module Canvas2D est isolé de React. Toute interaction Canvas ↔ React passe par le bus d'événements (`frontend/src/canvas/events.ts`). Le Canvas ne connaît pas React, React ne connaît pas les détails du Canvas.

### 5.1 Carte des composants

**Les modules principaux :**

- **Canvas2D** (`frontend/src/canvas/`) : Moteur de rendu graphe — blocs, formes, liaisons, interactions, thème. Isolé de React.
- **Components React** (`frontend/src/components/`) : Interface utilisateur — TopBar, SidePanel, BottomBar, ConsoleIA, ConfigIA, BlocEditor.
- **Stores** (`frontend/src/stores/`) : Gestion d'état — espaceStore, blocsStore, iaStore.
- **API Backend** (`backend/api/`) : Routes FastAPI — CRUD espaces, blocs, liaisons, configuration IA.
- **Services Backend** (`backend/services/`) : Logique métier — routeur IA, IA graphe, IA assistant, indexation.
- **Base de données** (`backend/db/`) : Connexion SQLite, schéma.

**Les flux de données :**

- **Entrées** : Actions utilisateur (clic, glisser, vocal) → Canvas2D → Bus événements → React → API REST → Backend
- **Traitement** : Backend → Service concerné → SQLite → Réponse
- **Sorties** : Backend → API REST → React → Canvas2D (rendu) ou Components (UI)

**Les flux événementiels (prévus) :**

- Clic sur bloc dans Canvas → événement `bloc:select` → React met à jour le store → SidePanel affiche détail
- Double-clic sur bloc → événement `bloc:open` → React ouvre BlocEditor
- Création liaison par glisser → événement `liaison:create` → React appelle API → Backend persiste

**Points d'entrée :**

- **Frontend** : `frontend/src/main.tsx` → `App.tsx`
- **Backend** : `backend/main.py` → FastAPI app avec lifespan (init_db/close_db)

### 5.2 Contrats internes

**Contrat du Canvas2D :**

- **Entrée** : Liste de blocs (id, x, y, forme, couleur, largeur, hauteur) + liste de liaisons (source, cible, type)
- **Sortie** : Événements utilisateur (select, open, move, link, resize)
- **Effets de bord** : Aucun — le Canvas ne persiste rien, il affiche et émet

**Contrat de l'API Backend :**

- **Entrée** : Requêtes HTTP JSON (REST)
- **Sortie** : Réponses JSON
- **Effets de bord** : Lecture/écriture SQLite

**Contrat du Service IA :**

- **Entrée** : Contenu texte d'un bloc (ou d'un espace entier)
- **Sortie** : Métadonnées générées (titre_ia, resume_ia, entites, mots_cles)
- **Effets de bord** : Appel réseau vers Ollama/LM Studio/API externe

**Contrat de la Configuration IA :**

- **Entrée (frontend)** : Utilisateur saisit mode (local/api), URL, modèle, clé API pour chaque rôle
- **Stockage** : Table `config_ia` SQLite via `PUT /api/config-ia/{role}` (UPSERT)
- **Lecture** : `GET /api/config-ia/{role}` — retourne la config ou des champs null si non configuré
- **Test connexion** : `POST /api/config-ia/{role}/test` — vérifie Ollama `/api/tags` (local) ou `/models` (API), retourne `{ok, detail}`
- **Effets de bord** : Appel réseau httpx vers le serveur IA configuré (timeout 10s)

### 5.3 Fichiers clés

**Fichiers importants :**

- `CENTRAL.md` : Source de vérité du projet — vision, architecture, UX, grammaire IA, glossaire
- `SEQUENCAGE.md` : Plan de développement par étapes
- `backend/db/schema.sql` : Schéma SQLite complet — définit le modèle de données
- `backend/main.py` : Point d'entrée backend — lifespan, CORS, routes
- `frontend/src/main.tsx` : Point d'entrée frontend
- `frontend/src/canvas/events.ts` : Bus d'événements Canvas ↔ React (pivot architectural)
- `frontend/vite.config.ts` : Configuration proxy API + WebSocket
- `backend/api/config_ia.py` : Routes config IA — GET/PUT par rôle + POST test connexion (Ollama tags / API models)
- `frontend/src/components/ConfigIA.tsx` : Écran config IA — 2 RoleSection (graphe/assistant), mode/URL/modèle/clé API, save + test
- `frontend/src/api.ts` : Client API REST — toutes les routes (espaces, blocs, liaisons, contenus, config IA, IA assistant)

- `.env.example` : Template des variables d'environnement (clés API OpenRouter, modèles IA)

**Fichiers suspects :** Aucun pour l'instant.

### 5.4 Fonctions critiques

- `init_db()` (`backend/db/database.py`) : Initialise la connexion SQLite et exécute le schéma. Si elle échoue, rien ne fonctionne.
- `close_db()` (`backend/db/database.py`) : Ferme proprement la connexion. Sans elle, risque de corruption.
- `lifespan()` (`backend/main.py`) : Cycle de vie FastAPI — garantit init_db au démarrage et close_db à l'arrêt.
- `test_connection()` (`backend/api/config_ia.py`) : Teste la connexion IA par rôle — vérifie Ollama `/api/tags` (local) ou `/models` (API externe), timeout 10s, retourne `{ok, detail}`.
- `seed_db()` (`backend/db/database.py`) : Seed des données initiales — espaces IDÉES/CONCEPTION, 6 blocs démo, contenus, liaisons, config IA depuis .env. Ne s'exécute que si la base est vide.

---

## 6. PROTOCOLE DE TRAVAIL - Comment tu codes proprement

**Avant de coder**

1. **Relis ta mission** (dans le prompt mission)
2. **Relis les zones interdites/fragiles** (section 4.2 et 4.3)
3. **Fais un mini-plan** (5 lignes max dans la discussion) :
   - Qu'est-ce que je vais modifier ?
   - Qu'est-ce que je vais remplacer ou supprimer ?
   - Quels tests je vais faire ?
4. **Si un doute apparaît → question courte**

**Pendant le code**

1. **Modifie petit, valide souvent** (tests intermédiaires)
2. **Si tu remplaces une logique, note-le mentalement** (tu supprimeras l'ancienne après validation)
3. **Ajoute des logs temporaires uniquement si nécessaire pour débugger**

**Après le code**

1. **Teste ce que tu viens de faire** (exécution, vérification fonctionnelle)
2. **Supprime l'ancien code remplacé** (si le nouveau fonctionne)
3. **Supprime les logs temporaires**
4. **Liste les fichiers modifiés/supprimés** (dans la discussion)
5. **Résume tes changements en français simple** (dans la discussion)

---

## 7. FIN DE MISSION - Ta transmission à l'équipe

**Avant de clôturer ta session, tu dois mettre à jour ce document.**

### Checklist de fin de mission

#### Mise à jour de la section 4 (État du projet)

- [ ] **Section 4.1** : Ce qui fonctionne maintenant
- [ ] **Section 4.2** : Ce qui est devenu fragile
- [ ] **Section 4.3** : Zones interdites
- [ ] **Section 4.4** : Dette technique
- [ ] **Section 4.5** : Risques identifiés

#### Mise à jour de la section 5 (Transmission du code)

- [ ] **Section 5.1** : Modules principaux
- [ ] **Section 5.1** : Flux événementiels
- [ ] **Section 5.2** : Contrats internes
- [ ] **Section 5.3** : Fichiers clés
- [ ] **Section 5.4** : Fonctions critiques

#### Synthèse dans la discussion

- [ ] Ce que tu as fait
- [ ] Ce qui a changé dans le code
- [ ] Ce que tu as mis à jour dans AGENT.MD
- [ ] Risques ou points d'attention éventuels

---

## 8. AVANCEMENT — Où on en est

**Étape actuelle :** Remédiation complète
**Dernière étape validée :** 12 + Remédiation (R1-R6)
**Prochaine étape :** Validation visuelle par l'humain
**Critère de fin :** Tous les critères de succès du PROMPT_REMEDIATION.md §5 sont vérifiés visuellement.
**Dernier verdict contrôle :** OK (17/02/2026)
**Cycles KO consécutifs :** 0

---

## Fin de ce document

**Rappel final :**

Tu n'es pas seul. Tu fais partie d'une équipe. Ton travail compte. Si tu as un doute, pose une question. Si tu bloques, dis-le. On est là pour construire ensemble quelque chose de solide, pas pour te juger.

**Qualité > vitesse. Toujours.**

**Bonne mission.**
