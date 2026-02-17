# PROMPT DE REMÉDIATION — Atelier Visuel de Pensée
# Date : 17/02/2026
# À copier-coller intégralement dans une nouvelle session Claude Code

---

## 1. CONTEXTE

Tu interviens sur le projet "Atelier Visuel de Pensée" après une Phase de Remédiation.

Le développement initial (12 étapes) a été complété avec tous les contrôles validés OK. Cependant, l'application ne fonctionne pas en réel : l'utilisateur ouvre l'appli et voit un fond noir avec une barre vide, sans possibilité de créer quoi que ce soit de visible.

**Cause racine identifiée :** Les tests étaient exclusivement programmatiques (requêtes HTTP, status codes). Aucun test visuel n'a jamais été fait. Le séquençage était incomplet par rapport à CENTRAL.md. La méthode a été corrigée — c'est maintenant ton rôle d'appliquer ces corrections au code.

## 2. DIAGNOSTIC — Ce qui ne va pas

1. **Aucune donnée initiale (seed).** CENTRAL.md §2.4 prévoit deux espaces au lancement : IDÉES et CONCEPTION. Ils n'existent pas. La base est vide.
2. **Le fichier .env n'existe pas.** Les clés API pour OpenRouter (IA Graphe et IA Assistant) ne sont configurées nulle part. Sans .env, l'indexation IA et l'assistant ne peuvent pas fonctionner.
3. **La grille sémantique couleur×forme (CENTRAL.md §5) n'est pas implémentée dans le code.** Les légendes contextuelles existent mais n'utilisent pas la matrice complète de CENTRAL.md §5.4.
4. **Les heuristiques de liaisons (CENTRAL.md §5.5) ne sont pas implémentées.** Les règles de flux naturel, d'alerte, et de complétude ne sont pas dans le code de l'IA Assistant.
5. **Le séquençage (SEQUENCAGE.md) est incomplet.** Il manque les étapes de seed, d'implémentation de la grille sémantique, et des heuristiques IA.

## 3. RÈGLES MISES À JOUR (à respecter impérativement)

### Règle : CENTRAL.md est la commande, le code est l'exécution
Tout ce qui est décrit dans CENTRAL.md (hors mentions [RÉSERVÉ] ou [FUTUR]) doit se retrouver implémenté. Tu n'as PAS le droit de décider qu'une fonctionnalité est "hors scope" ou "pour plus tard". Si tu estimes que quelque chose est trop complexe, tu le signales à l'humain et tu attends sa décision.

### Règle : Le fichier .env est un prérequis bloquant
- Crée `.env.example` à la racine avec les noms de variables (sans valeurs)
- Vérifie que `.env` est dans `.gitignore`
- **Demande à l'humain de créer .env** et d'y mettre ses clés AVANT de tester l'IA
- Si .env est absent, le backend doit démarrer MAIS signaler clairement que l'IA n'est pas configurée (pas de crash silencieux)

### Règle : Les données initiales (seed) font partie du code
Si CENTRAL.md prévoit des données au lancement, elles doivent être implémentées dans l'initialisation du backend. C'est obligatoire, pas optionnel.

### Règle : JAMAIS de clés API dans le code
Aucune clé, aucun token, aucun secret nulle part : ni dans le code, ni dans les tests, ni dans les logs, ni dans les commits. Tout passe par .env.

## 4. CORRECTIONS DEMANDÉES (par ordre de priorité)

### Correction 1 — Seed des espaces IDÉES et CONCEPTION
**Fichier :** `backend/db/database.py` (fonction init_db ou nouvelle fonction seed_db)

Au premier lancement (base vide), créer automatiquement :
- Espace "IDÉES" (thème: réflexion)
- Espace "CONCEPTION" (thème: structuration)
- Dans l'espace IDÉES : 4-6 blocs de démonstration utilisant des combinaisons variées de couleurs et formes, avec des positions spatiales lisibles (pas empilés), pour que l'utilisateur voie immédiatement le système en action.

Les blocs de démo doivent illustrer la grille sémantique :
- Un bloc vert nuage (observation floue)
- Un bloc orange rounded-rect (problème identifié)
- Un bloc jaune square (règle de résolution)
- Un bloc bleu oval (raisonnement)
- Un bloc violet circle (conviction profonde)
- Un bloc mauve cloud (germe d'idée)

### Correction 2 — Fichier .env.example
**Fichier :** `.env.example` à la racine du projet

Contenu :
```
# Configuration IA — Remplir avec vos clés
OPENROUTER_API_KEY=
IA_GRAPHE_MODEL=anthropic/claude-opus-4.6
IA_ASSISTANT_MODEL=anthropic/claude-opus-4.6
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

IMPORTANT : Le modèle utilisé est `anthropic/claude-opus-4.6` (format OpenRouter) pour les DEUX rôles (IA Graphe et IA Assistant). C'est ce format exact qui doit apparaître dans la config IA en base de données ET dans le .env. Le code actuel référence probablement un modèle OpenAI qui n'existe pas sur OpenRouter — il faut le remplacer partout.

Vérifier que `.env` est dans `.gitignore`. Si `.gitignore` n'existe pas, le créer.

### Correction 3 — Chargement .env dans le backend
**Fichier :** `backend/main.py`

Ajouter le chargement de `.env` au démarrage (via python-dotenv). Les variables d'environnement doivent être accessibles aux services IA. Si .env n'existe pas, le backend démarre quand même mais log un avertissement clair.

### Correction 4 — Légendes contextuelles conformes à la matrice CENTRAL.md §5
**Fichier :** `frontend/src/canvas/legends.ts`

Vérifier que les légendes contextuelles (affichées au geste) correspondent exactement à la matrice couleur×forme de CENTRAL.md §5.4. Chaque combinaison doit afficher sa signification exacte.

Exemples à vérifier :
- Vert + nuage → "Observation floue"
- Orange + rounded-rect → "Problème identifié"
- Jaune + square → "Règle de résolution"
- Bleu + oval → "Raisonnement"
- Violet + circle → "Conviction profonde"
- Mauve + cloud → "Germe d'idée"

### Correction 5 — Heuristiques de liaisons dans l'IA Assistant
**Fichier :** `backend/services/ia_assistant.py`

Intégrer les heuristiques de CENTRAL.md §5.5 dans le contexte que l'IA Assistant utilise pour analyser un espace :
- Règles de flux naturel (R1-R5)
- Règles d'alerte (A1-A5)
- Règles de complétude (C1-C5)

L'IA Assistant doit pouvoir, quand on lui demande d'analyser un espace, appliquer ces règles et formuler des suggestions conformes au protocole Observer → Interpréter → Détecter → Proposer → Attendre.

### Correction 6 — Remplacement du modèle IA dans tout le code
**Fichiers concernés :** `backend/services/ia_routeur.py`, `backend/services/ia_graphe.py`, `backend/services/ia_assistant.py`, `backend/api/config_ia.py`, et tout fichier contenant un nom de modèle IA en dur.

Le code actuel référence probablement un modèle par défaut (type "gpt-4" ou "openai/gpt-4o") qui n'existe pas sur OpenRouter. Remplacer TOUS les modèles par défaut dans le code par `anthropic/claude-opus-4.6`. 

De plus, le seed de la config IA (table config_ia) doit insérer au démarrage :
- Rôle `graphe` : mode `api`, url `https://openrouter.ai/api/v1`, modèle `anthropic/claude-opus-4.6`
- Rôle `assistant` : mode `api`, url `https://openrouter.ai/api/v1`, modèle `anthropic/claude-opus-4.6`
- La clé API est lue depuis la variable d'environnement OPENROUTER_API_KEY (fichier .env), JAMAIS codée en dur.

Vérifier que le routeur IA utilise le format OpenAI-compatible (endpoint `/chat/completions`) avec le header `Authorization: Bearer {clé}` et le header optionnel `HTTP-Referer` pour OpenRouter.

### Correction 7 — Seed de données de démonstration riches
**Fichier :** `backend/db/database.py` (dans la fonction seed_db créée en Correction 1)

Les blocs de démo ne doivent PAS être vides. Chaque bloc doit contenir du contenu textuel réaliste pour que :
- L'IA Assistant puisse analyser le graphe et appliquer les heuristiques
- L'utilisateur voie immédiatement le système en action avec des données exploitables
- Cognee puisse être alimenté avec de la matière existante

Exemple de contenu pour l'espace IDÉES :

| Bloc | Couleur | Forme | Contenu | Position |
|------|---------|-------|---------|----------|
| 1 | green | cloud | "L'intelligence artificielle locale permet de garder les données sensibles sur la machine de l'utilisateur, sans dépendance cloud." | (200, 200) |
| 2 | orange | rounded-rect | "Problème : les outils de prise de notes actuels fragmentent l'information dans des hiérarchies rigides. Impossible de voir les connexions." | (500, 150) |
| 3 | yellow | square | "Règle : toute information stockée doit rester connectable et explorable. Le stockage mort est l'ennemi." | (350, 400) |
| 4 | blue | oval | "Analyse : un système de graphe spatial permet de représenter les relations naturelles entre idées, sans imposer de hiérarchie." | (700, 250) |
| 5 | violet | circle | "Conviction : la pensée humaine est relationnelle, pas arborescente. L'outil doit refléter cette réalité." | (450, 550) |
| 6 | mauve | cloud | "Et si on pouvait dicter une idée et la voir apparaître directement comme un bloc coloré dans l'espace ?" | (150, 450) |

Créer également 3-4 liaisons entre ces blocs pour illustrer les relations :
- Bloc 1 (vert) → Bloc 3 (jaune) : type "simple" (le fait nourrit la règle)
- Bloc 2 (orange) → Bloc 3 (jaune) : type "logique" (le problème appelle la solution)
- Bloc 5 (violet) → Bloc 4 (bleu) : type "simple" (la conviction fonde l'analyse)
- Bloc 6 (mauve) → Bloc 1 (vert) : type "simple" (l'hypothèse explore le fait)

Créer aussi des contenus dans la table `contenus_bloc` pour chaque bloc (type "texte").

### Correction 8 — Mise à jour de SEQUENCAGE.md
Ajouter les étapes manquantes ou marquer les corrections comme effectuées. Produire une matrice de couverture montrant que chaque fonctionnalité de CENTRAL.md est couverte.

### Correction 9 — Mise à jour de AGENT.md
Mettre à jour les sections 4 (état du projet) et 5 (carte du code) pour refléter les changements. Ajouter le fichier .env.example dans les fichiers clés.

## 5. CRITÈRES DE SUCCÈS (vérifiables visuellement)

L'humain ouvrira l'application dans un navigateur et vérifiera :

1. ✅ L'application s'ouvre et affiche la TopBar avec les espaces IDÉES et CONCEPTION
2. ✅ En sélectionnant IDÉES, 6 blocs colorés apparaissent sur le canvas avec des formes et couleurs variées, et du contenu textuel visible
3. ✅ Des liaisons sont visibles entre certains blocs (au moins quand on sélectionne un bloc)
4. ✅ En survolant un bloc, la légende contextuelle affiche la bonne signification (ex: "Observation floue" pour vert+nuage)
5. ✅ L'utilisateur peut double-cliquer sur un bloc et voir son contenu textuel dans l'éditeur
6. ✅ L'utilisateur peut double-cliquer sur le canvas vide pour créer un nouveau bloc
7. ✅ L'utilisateur peut déplacer les blocs, créer des liaisons
8. ✅ Le fichier .env.example existe à la racine avec les bonnes variables (OPENROUTER_API_KEY, IA_GRAPHE_MODEL, IA_ASSISTANT_MODEL, OPENROUTER_BASE_URL)
9. ✅ Si .env n'existe pas, le backend démarre quand même avec un avertissement clair (pas de crash)
10. ✅ La configuration IA (accessible depuis BottomBar) affiche `anthropic/claude-opus-4.6` pour les deux rôles, PAS un modèle OpenAI
11. ✅ Après rechargement de la page, toutes les données persistent (blocs, positions, contenus, liaisons)

## 6. FICHIERS À MODIFIER

| Fichier | Action |
|---------|--------|
| `backend/db/database.py` | Ajouter fonctions seed_db + seed_demo_data avec contenus et liaisons |
| `backend/main.py` | Charger .env (python-dotenv), appeler seed_db |
| `backend/services/ia_routeur.py` | Remplacer modèle par défaut par `anthropic/claude-opus-4.6`, lire clé depuis .env |
| `backend/services/ia_graphe.py` | Vérifier/corriger modèle par défaut |
| `backend/services/ia_assistant.py` | Intégrer heuristiques §5.5 + corriger modèle par défaut |
| `backend/api/config_ia.py` | Vérifier/corriger modèle par défaut |
| `.env.example` | Créer avec les 4 variables |
| `.gitignore` | Vérifier que .env est présent |
| `frontend/src/canvas/legends.ts` | Vérifier conformité matrice §5.4 |
| `SEQUENCAGE.md` | Mettre à jour avec étapes manquantes |
| `AGENT.md` | Mettre à jour §4, §5, §8 |

## 7. INTERDICTIONS

- ❌ Ne PAS repartir de zéro. Tu corriges et complètes le code existant.
- ❌ Ne PAS mettre de clé API dans le code, les tests, ou les commits.
- ❌ Ne PAS valider tes propres corrections avec des tests HTTP uniquement. Lance l'application et vérifie visuellement.
- ❌ Ne PAS simplifier ou réduire le périmètre de CENTRAL.md.
- ❌ Ne PAS créer de fichiers de documentation supplémentaires (README, DOCS/, etc.).
- ❌ Ne PAS modifier CENTRAL.md.

## 8. PROCÉDURE

1. Lis AGENT.md en entier
2. Lis CENTRAL.md sections 2.4, 5.2, 5.3, 5.4, 5.5 (grille sémantique et heuristiques)
3. Lis CONTROL_LOOP.md pour connaître les nouvelles règles de test
4. Vérifie que `.env` existe à la racine du projet. Si non, crée `.env.example` et DEMANDE à l'humain de créer `.env` avec sa clé OpenRouter. ATTENDS sa confirmation avant de tester l'IA.
5. Exécute les corrections 1 à 9 dans l'ordre
6. Lance le backend ET le frontend
7. Ouvre l'application dans le navigateur (utilise l'accès Chrome si disponible)
8. Vérifie visuellement CHAQUE critère de succès (§5) — un par un
9. Met à jour AGENT.md et SEQUENCAGE.md
10. Commit et push

Après ton travail, la boucle de contrôle standard (Phase 4) sera déclenchée avec les nouvelles règles (tests visuels obligatoires). Prépare-toi à ce que le contrôleur te demande des preuves visuelles.
