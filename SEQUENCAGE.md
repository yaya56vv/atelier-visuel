# SEQUENCAGE.md — Plan de développement

## Informations

Projet : Atelier Visuel de Pensée
Total d'étapes : 12 + Remédiation
Date de création : 17/02/2026

---

## Étapes

### Étape 1 — Backend CRUD (espaces, blocs, liaisons)

- Objectif : Implémenter les routes REST complètes pour créer, lire, modifier et supprimer des espaces, blocs (avec contenus), et liaisons
- Critère de fin : Toutes les routes POST/GET/PUT/DELETE fonctionnent, les données persistent en SQLite, les contraintes (formes, couleurs, types liaison) sont respectées
- Agents concernés : Backend
- Contrôle : Oui
- Dépendances : Aucune

### Étape 2 — Backend configuration IA + indexation

- Objectif : Implémenter la route config IA (lecture/modification) et le service d'indexation automatique (titre_ia, resume_ia, entités, mots-clés à la création/modification d'un bloc)
- Critère de fin : La config IA se lit et se modifie via API. Le routeur IA dispatche vers local (Ollama) ou API externe. L'indexation se déclenche à la création/modification d'un bloc.
- Agents concernés : Backend
- Contrôle : Oui
- Dépendances : Étape 1

### Étape 3 — Canvas2D : moteur de rendu et formes

- Objectif : Implémenter le moteur de rendu Canvas2D avec les 5 formes pré-programmées (nuage, rectangle arrondi, carré, ovale, cercle), les effets visuels (volume, brillance, ombres, halos), et le système de thème externalisé
- Critère de fin : Les 5 formes s'affichent correctement avec les 6 couleurs, les effets visuels sont fidèles au rendu cible (glossy/3D, fond sombre), zéro constante codée en dur
- Agents concernés : Frontend
- Contrôle : Oui
- Dépendances : Aucune

### Étape 4 — Canvas2D : liaisons Bézier cubiques

- Objectif : Implémenter le dessin des liaisons entre blocs avec courbes de Bézier cubiques, effets lumineux, couleurs sémantiques, et les 4 types de liaison (simple, logique, tension, ancrée)
- Critère de fin : Les liaisons se dessinent avec tangence réelle, zéro intersection bloc-liaison, effets lumineux visibles, liaisons ancrées toujours affichées
- Agents concernés : Frontend
- Contrôle : Oui
- Dépendances : Étape 3

### Étape 5 — Canvas2D : interactions utilisateur

- Objectif : Implémenter drag & drop des blocs, zoom/pan, sélection, survol, curseur contextuel, hit-testing, création de liaison par glisser de connecteur, redimensionnement révélateur
- Critère de fin : Manipulation fluide des blocs (60 FPS), zoom progressif continu, sélection/survol avec feedback visuel, création de liaison fonctionnelle, redimensionnement révélant le contenu
- Agents concernés : Frontend
- Contrôle : Oui
- Dépendances : Étape 4

### Étape 6 — Canvas2D : légendes contextuelles et bus d'événements

- Objectif : Implémenter les légendes contextuelles (couleur, forme) au moment de l'interaction, et le bus d'événements Canvas ↔ React
- Critère de fin : Les légendes apparaissent au geste et disparaissent automatiquement. Le bus émet et reçoit les événements clés (select, open, move, link, resize). Le Canvas et React communiquent sans couplage direct.
- Agents concernés : Frontend
- Contrôle : Oui
- Dépendances : Étape 5

### Étape 7 — Interface React : barres et panneaux

- Objectif : Implémenter TopBar (gestion espaces, thèmes), SidePanel (explorateur documentaire, recherche, filtres), BottomBar (commandes globales), ConsoleIA (panneau droit translucide)
- Critère de fin : Les 4 zones UI sont visibles et positionnées correctement. Le SidePanel se déploie par glissement. La ConsoleIA est translucide avec graphe visible derrière. La TopBar permet la création/sélection d'espace.
- Agents concernés : Frontend
- Contrôle : Oui
- Dépendances : Étape 6

### Étape 8 — Intégration Frontend ↔ Backend (API REST)

- Objectif : Connecter les composants React et le Canvas aux routes backend via API REST. Les blocs, liaisons et espaces se chargent, se créent, se modifient et se suppriment avec persistance réelle.
- Critère de fin : Créer un espace → visible en TopBar. Créer un bloc (clic sur canvas) → persisté en base. Déplacer un bloc → position mise à jour. Créer une liaison → persistée. Supprimer → supprimé. Rechargement page → données restaurées.
- Agents concernés : Les deux
- Contrôle : Oui
- Dépendances : Étapes 6, 7

### Étape 9 — Éditeur de bloc + dépôt direct

- Objectif : Implémenter BlocEditor (double-clic sur bloc → fenêtre d'édition avec zone texte, import, gestion contenus internes) et le dépôt direct (glisser fichier sur bloc, coller contenu)
- Critère de fin : Double-clic ouvre l'éditeur. On peut ajouter du texte, des URLs, des fichiers. Le dépôt direct fonctionne. Les contenus sont persistés via API.
- Agents concernés : Les deux
- Contrôle : Oui
- Dépendances : Étape 8

### Étape 10 — Vue Liste synchronisée

- Objectif : Implémenter la vue liste dans le SidePanel — affichage textuel triable par métadonnées, synchronisé en temps réel avec la vue graphe
- Critère de fin : La liste affiche tous les blocs avec titre_ia, extrait, métadonnées. Sélection dans la liste → centrage + zoom dans le graphe. Modification dans le graphe → mise à jour instantanée de la liste.
- Agents concernés : Frontend
- Contrôle : Oui
- Dépendances : Étape 8

### Étape 11 — Console IA + Assistant

- Objectif : Implémenter la console IA textuelle (historique, saisie, dialogue) connectée au service IA Assistant via API. L'assistant peut analyser un espace, proposer des liaisons, détecter des incohérences.
- Critère de fin : L'utilisateur peut dialoguer avec l'IA via la console. L'IA peut lire le graphe et formuler des suggestions selon le protocole (Observer → Interpréter → Détecter → Proposer → Attendre). Le score de confiance est affiché.
- Agents concernés : Les deux
- Contrôle : Oui
- Dépendances : Étapes 2, 10

### Étape 12 — Configuration IA + écran de paramétrage

- Objectif : Implémenter l'écran ConfigIA permettant de choisir les modèles pour IA Graphe et IA Assistant (local Ollama / LM Studio ou API externe). Test de connexion intégré.
- Critère de fin : L'utilisateur peut configurer séparément IA Graphe et IA Assistant. Le test de connexion valide que le modèle répond. La configuration persiste entre sessions.
- Agents concernés : Les deux
- Contrôle : Oui
- Dépendances : Étape 11

---

## Phase Remédiation (post étape 12)

### R1 — Seed données initiales + config IA depuis .env
- Objectif : Créer espaces IDÉES/CONCEPTION, 6 blocs démo avec contenus et liaisons, config IA OpenRouter pré-remplie
- Critère de fin : Au premier lancement, l'application affiche 2 espaces, 6 blocs colorés dans IDÉES, 4 liaisons, config IA avec anthropic/claude-opus-4.6
- Fichiers : database.py, main.py, requirements.txt, .env.example
- Statut : FAIT

### R2 — Chargement .env + avertissement si absent
- Objectif : Le backend charge .env au démarrage (python-dotenv). Si absent, avertissement clair, pas de crash.
- Critère de fin : Backend démarre avec .env → clés chargées. Sans .env → warning dans les logs, backend fonctionnel.
- Fichiers : main.py, requirements.txt
- Statut : FAIT

### R3 — Routeur IA corrigé pour OpenRouter
- Objectif : Corriger endpoint API (pas de double /v1), ajouter headers HTTP-Referer/X-Title pour OpenRouter
- Critère de fin : Appel API vers OpenRouter avec le bon endpoint /chat/completions
- Fichiers : ia_routeur.py
- Statut : FAIT

### R4 — Légendes contextuelles matrice §5.4
- Objectif : Afficher la signification croisée couleur×forme (matrice complète CENTRAL.md §5.4) en plus des significations individuelles
- Critère de fin : Sélection d'un bloc vert nuage affiche "Observation floue", orange rounded-rect affiche "Problème identifié", etc.
- Fichiers : legends.ts
- Statut : FAIT

### R5 — Heuristiques de liaisons dans l'IA Assistant
- Objectif : Intégrer les règles R1-R5, A1-A5, C1-C5 de CENTRAL.md §5.5 dans le system prompt de l'assistant
- Critère de fin : L'assistant peut détecter les patterns de flux, alertes, et complétude dans un espace
- Fichiers : ia_assistant.py
- Statut : FAIT

### R6 — Modèle IA anthropic/claude-opus-4.6 partout
- Objectif : Remplacer tout modèle IA par défaut par anthropic/claude-opus-4.6, seed config_ia au démarrage
- Critère de fin : Config IA affiche anthropic/claude-opus-4.6, pas de modèle OpenAI en dur
- Fichiers : database.py, ia_routeur.py
- Statut : FAIT

---

## Matrice de couverture CENTRAL.md → Code

| Section CENTRAL.md | Fonctionnalité | Étape | Statut |
|---|---|---|---|
| §1 Vision | Environnement cognitif spatial | Global | FAIT |
| §2.1 Graphe spatial | Canvas2D moteur | 3 | FAIT |
| §2.2 Modèle blocs | 5 formes × 6 couleurs | 3 | FAIT |
| §2.3 Modèle liaisons | 4 types Bézier | 4 | FAIT |
| §2.4 Espaces V1 | IDÉES + CONCEPTION | R1 | FAIT |
| §2.5 Double représentation | Graphe + Liste sync | 10 | FAIT |
| §2.6 Indexation auto | titre_ia, resume_ia | 2 | FAIT |
| §3.2 Stack | React+Vite, FastAPI, SQLite | Init | FAIT |
| §3.4 Canvas2D | Rendu isolé, thème ext. | 3-6 | FAIT |
| §3.6 Config IA | Écran config, mode local/API | 12 | FAIT |
| §3.7 Schéma SQLite | 5 tables + index | 1 | FAIT |
| §3.8 API REST | CRUD complet | 1-2 | FAIT |
| §4.2 Interface | TopBar, SidePanel, BottomBar | 7 | FAIT |
| §4.4 Console IA | Panneau dialogue | 11 | FAIT |
| §4.5 Vocal | [RÉSERVÉ] | — | — |
| §4.6 Interaction blocs | Drag, zoom, sélection | 5 | FAIT |
| §4.7 Redimensionnement | 8 directions | 5 | FAIT |
| §5.2 Couleurs sémantiques | 6 couleurs | 3 | FAIT |
| §5.3 Formes sémantiques | 5 formes | 3 | FAIT |
| §5.4 Matrice couleur×forme | Légendes croisées | R4 | FAIT |
| §5.5 Heuristiques liaisons | R1-R5, A1-A5, C1-C5 | R5 | FAIT |
| §5.8 Protocole IA | Observer→Attendre | 11+R5 | FAIT |

---

## Jalons Analyste

- Après étape 6 : **Revue architecture Canvas2D** — Le moteur de rendu est-il performant, maintenable, fidèle au rendu cible ? Le bus d'événements est-il propre ?
- Après étape 9 : **Revue intégration complète** — Frontend et backend communiquent-ils correctement ? La persistance est-elle fiable ? L'UX est-elle fluide ?
- Après étape 12 : **Revue UX/IA finale** — L'assistant IA fonctionne-t-il selon le protocole défini ? La configuration est-elle intuitive ? Le système est-il utilisable de bout en bout ?
