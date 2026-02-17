# MÉTHODE DE DÉVELOPPEMENT MULTI-AGENTS

## Document de référence — Architecture complète

**Version :** V1
**Date :** 2026-02-16

---

## 1. VUE D'ENSEMBLE

Cette méthode organise le développement logiciel en 4 phases distinctes,
orchestrées par des agents IA spécialisés qui partagent une mémoire commune (AGENT.md).

```
PHASE 1          PHASE 2            PHASE 3              PHASE 4
CONCEPTION  →  INITIALISATION  →  DÉVELOPPEMENT  ⇄  CONTRÔLE
(1 fois)        (1 fois)          (itératif)        (après chaque étape)
```

### Principes fondamentaux

- On n'avance pas tant que ce n'est pas propre et validé
- AGENT.md est la seule mémoire partagée entre agents
- CENTRAL.md est la seule source de vérité sur la vision du projet (maintenable uniquement par l'humain)
- Les logs restent dans le chat, jamais en fichiers
- Tout le travail se fait en local, GitHub = sauvegarde d'étapes validées
- Qualité > vitesse, toujours

---

## 2. LES 4 PHASES EN DÉTAIL

### PHASE 1 — CONCEPTION

**Quand :** Une seule fois, au lancement du projet.

**Entrée :** Les documents de création existants, éventuellement éclatés et désordonnés :
- Vision / philosophie du projet
- Architecture globale
- UX / interactions / design
- Glossaire
- Règles de fonctionnement / grilles de lecture

**Agent :** Agent Concepteur

**Mission :**
1. Lire et analyser l'ensemble des documents fournis
2. Les fusionner en UN document unique : **CENTRAL.md**
   - Structure cohérente
   - Pas de redondance
   - Tout le sens du projet en un seul endroit
3. Pas de séquençage à cette étape (il sera produit en Phase 2)

**Fruit :** CENTRAL.md

**CENTRAL.md est maintenu uniquement par l'humain.** Les agents ne le modifient jamais.
Si la vision évolue en cours de développement, l'humain met à jour CENTRAL.md
et note la date et le changement en bas du document.

---

### PHASE 2 — INITIALISATION

**Quand :** Une seule fois, après la Phase 1.

**Entrée :**
- CENTRAL.md (produit en Phase 1)
- AGENT_template.md (template vierge fourni par la méthode)

**Agent :** Agent Initial

**Mission :**
1. Lire intégralement CENTRAL.md et AGENT_template.md
2. Coder le **squelette complet** du projet :
   - Structure de dossiers
   - Fichiers de configuration (package.json, vite.config, tsconfig, etc.)
   - Points d'entrée (main, App, routes de base)
   - Architecture modulaire conforme à CENTRAL.md
   - Aucune logique métier, juste la structure d'accueil
3. **Créer les fichiers d'environnement :**
   - `.env.example` à la racine (noms des variables, SANS valeurs)
   - Vérifier que `.env` est bien dans `.gitignore`
   - **Demander explicitement à l'humain** de créer `.env` avec ses clés avant tout test
4. Personnaliser **AGENT.md** à partir du template :
   - Section 2 (sens du projet) d'après CENTRAL.md
   - Section 4 (état des lieux) d'après le squelette créé
   - Section 5 (carte du projet) d'après le squelette créé
5. Créer **SEQUENCAGE.md** :
   - Découpage du développement en étapes numérotées
   - Pour chaque étape : objectif, critère de fin **vérifiable visuellement**, agents concernés
   - **Inclure une étape de seed de données initiales** si CENTRAL.md prévoit des données au lancement (espaces, configurations par défaut, blocs de démo)
   - Marquage des étapes qui déclenchent un contrôle (toutes par défaut,
     sauf micro-étapes regroupables)
   - Identification des jalons pour l'Agent Analyste (tous les 3-5 étapes)
6. Initialiser le repo Git local + premier commit + push GitHub

**Fruits :** Code squelette + AGENT.md + SEQUENCAGE.md + MATRICE_COUVERTURE (dans le chat) + .env.example + repo Git/GitHub

**Pourquoi le séquençage est ici et pas en Phase 1 :**
On séquence sur du concret. C'est en voyant la structure réelle du code
qu'on peut découper intelligemment les étapes de développement.

---

### RÈGLES IMPÉRATIVES DE LA PHASE 2 (aucune liberté autorisée)

Ces règles sont absolues. L'agent Initial ne peut ni les contourner, ni les interpréter, ni les adapter. Toute dérogation doit être explicitement demandée à l'humain et validée par lui AVANT d'agir.

#### Règle I.1 — Couverture intégrale de CENTRAL.md

**Le séquençage doit couvrir 100% des fonctionnalités, comportements et données décrits dans CENTRAL.md.**

Chaque fonctionnalité, chaque comportement utilisateur, chaque donnée initiale, chaque règle d'affichage, chaque grille de lecture décrite dans CENTRAL.md doit apparaître dans au moins une étape du séquençage.

L'agent n'a PAS le droit de :
- Décider qu'une fonctionnalité est "hors scope V1"
- Repousser une fonctionnalité à une version future
- Simplifier ou réduire le périmètre décrit dans CENTRAL.md
- Regrouper ou fusionner des fonctionnalités de manière à en perdre une
- Ignorer les données initiales (espaces par défaut, configurations, données de démonstration)

Si l'agent estime qu'une fonctionnalité est trop complexe ou irréalisable dans le cadre actuel, il **doit le signaler explicitement à l'humain** dans la discussion et **attendre sa décision**. Il ne supprime jamais silencieusement.

CENTRAL.md est la commande. Le séquençage est le plan d'exécution de cette commande. Pas une version réduite.

#### Règle I.2 — Squelette structurant la vision complète

**Le squelette de code doit prévoir des points d'accueil pour TOUT ce que CENTRAL.md décrit, pas seulement les bases techniques.**

Pour chaque fonctionnalité décrite dans CENTRAL.md, le squelette doit contenir :
- Le fichier ou module concerné (même vide avec commentaire d'intention)
- La fonction ou le point d'entrée qui accueillera l'implémentation
- Les imports et connexions nécessaires pour que le module s'intègre naturellement

Le but : quand un codeur arrive à l'étape N, il trouve une structure prête qui l'attend. Il n'a pas à créer la structure ET implémenter en même temps. Les pièces du puzzle sont déjà découpées, il ne reste qu'à les assembler.

Anti-pattern interdit : un squelette purement technique (framework + config + routes vides) qui ignore les spécificités métier décrites dans CENTRAL.md.

#### Règle I.3 — Matrice de couverture obligatoire

**Après avoir créé le séquençage, l'agent DOIT produire une matrice de couverture dans la discussion.**

Format :

| # | Fonctionnalité / Comportement / Donnée (décrit dans CENTRAL.md) | Étape du séquençage | Couvert |
|---|---|---|---|
| 1 | [Description extraite de CENTRAL.md] | Étape N | ✅ |
| 2 | [Description extraite de CENTRAL.md] | Étape M | ✅ |
| 3 | [Description extraite de CENTRAL.md] | — | ❌ |

Règles de la matrice :
- Chaque section de CENTRAL.md doit être parcourue systématiquement
- Les fonctionnalités marquées [RÉSERVÉ] ou [FUTUR] dans CENTRAL.md sont exclues de la matrice (elles ne sont pas attendues dans cette version)
- Toute ligne avec ❌ est un **problème bloquant**. L'agent doit soit ajouter une étape au séquençage, soit expliquer à l'humain pourquoi c'est impossible et attendre sa décision.
- L'humain valide la matrice AVANT que le développement commence (Phase 3)
- La matrice est postée dans le chat, pas stockée en fichier

#### Règle I.4 — Critères de fin vérifiables par un humain

**Les critères de fin de chaque étape doivent être vérifiables visuellement ou fonctionnellement par un humain non-technique.**

Formulation interdite : "Les données sont persistées en base", "Le status code est 200", "Le test unitaire passe".

Formulation obligatoire : "Quand l'utilisateur fait [action], il voit [résultat visible]". Exemples :
- "L'utilisateur ouvre l'application et voit deux espaces : IDÉES et CONCEPTION"
- "L'utilisateur double-clique sur le canvas et un bloc apparaît avec la forme et la couleur par défaut"
- "L'utilisateur sélectionne un bloc et la légende contextuelle affiche la signification de sa couleur et de sa forme"

Le critère doit pouvoir être vérifié par quelqu'un qui ouvre l'application et regarde l'écran, sans lancer de commande technique.

---

### PHASE 3 — DÉVELOPPEMENT

**Quand :** Itératif, étape par étape selon SEQUENCAGE.md.

**Entrée :**
- AGENT.md (lu obligatoirement avant toute action)
- SEQUENCAGE.md (étape N en cours)
- CENTRAL.md (disponible en référence si besoin)

**Agents :** Mode multi-agents avec agent lead

```
┌─────────────────────────────────────────────┐
│  AGENT LEAD (coordonne, ne code pas)        │
│                                              │
│  Lit SEQUENCAGE.md, distribue le travail,   │
│  surveille la cohérence, détecte les        │
│  conflits entre agents                       │
│                                              │
│  ┌───────────────┐  ┌───────────────┐       │
│  │ Agent Backend  │  │ Agent Frontend│       │
│  │ (API, BDD,     │  │ (React, UI,  │       │
│  │  logique)      │  │  interactions)│       │
│  └───────────────┘  └───────────────┘       │
│                                              │
│  Communication entre agents via tmux         │
└─────────────────────────────────────────────┘
```

**Protocole de chaque agent codeur :**
1. Lire AGENT.md (obligatoire, sections 0, 3, 4, 5, 6)
2. Lire la mission de l'étape N dans SEQUENCAGE.md
3. Faire un mini-plan (5 lignes, posté dans la discussion)
4. Coder petit, valider souvent
5. En fin de mission : mettre à jour AGENT.md (§4, §5, §7, §8)
6. Compte-rendu dans le chat

**Agent Analyste (intervient aux jalons uniquement) :**
- Ne code pas, ne touche pas à AGENT.md
- Lit le code, AGENT.md, CENTRAL.md
- Produit une note d'analyse dans le chat :
  - Tensions architecturales détectées
  - Améliorations possibles non prévues
  - Risques émergents
- L'humain valide ou rejette avant que ça entre dans le backlog

**Quand l'objectif de l'étape N est atteint → Phase 4**

---

### PHASE 4 — CONTRÔLE

**Quand :** Après chaque étape de développement.

**Entrée :**
- Code actuel
- AGENT.md
- CENTRAL.md (pour le Contrôleur Conformité)

**Agents :** Mode multi-agents possible (les 2 premiers contrôleurs en parallèle)

```
┌──────────────────────────────────────────────────┐
│                                                    │
│  Contrôleur Tests ──┐                              │
│  (LOG TESTS, chat)  ├──→ Contrôleur Conformité    │
│  Contrôleur Hygiène ┘    (analyse propre           │
│  (LOG HYGIÈNE, chat)      + intègre les 2 logs     │
│                           + vérifie vs CENTRAL.md)  │
│                                                    │
│  Verdict : OK ou KO                                │
│                                                    │
│  Si KO → Codeur-Correcteur                         │
│          (agent de cette boucle)                    │
│          → corrige selon directive                  │
│          → met à jour AGENT.md                      │
│          → relance Phase 4                          │
│                                                    │
│  Si OK → commit Git + push GitHub                   │
│        → AGENT.md §8 avancement mis à jour         │
│        → retour Phase 3 (étape N+1)                │
└──────────────────────────────────────────────────┘
```

**Règles de la boucle de contrôle :**
- Les contrôleurs ne codent jamais
- Les logs restent dans le chat, jamais en fichiers
- Le Codeur-Correcteur ne fait QUE ce qui est dans la directive
- Après correction → nouveau cycle complet de contrôle
- Après 3 KO consécutifs → arrêt + intervention humaine
- Timeout : si >4h de travail actif → pause + évaluation humaine
- **Test visuel obligatoire** : toute étape produisant un résultat visible DOIT être testée dans le navigateur. Un test exclusivement HTTP/programmatique ne valide JAMAIS une étape frontend ou intégration.
- **Prérequis .env** : aucun test ne peut être validé sans fichier .env fonctionnel. KO immédiat sinon.
- **Rigueur constante** : la qualité des contrôles ne diminue pas au fil des étapes. Le Contrôleur Conformité rejette les logs bâclés.
- **JAMAIS de tests sur données jetables auto-générées** : tester sur des données persistées représentatives (seed ou données créées via l'interface)

---

## 3. LES DOCUMENTS DU SYSTÈME

| Document | Créé par | Modifiable par | Rôle |
|----------|----------|---------------|------|
| **CENTRAL.md** | Agent Concepteur (Phase 1) | Humain uniquement | Vision, architecture, UX, glossaire, règles — source de vérité |
| **AGENT.md** | Agent Initial (Phase 2) | Tous les agents codeurs | Mémoire partagée — état du code, carte, transmission |
| **SEQUENCAGE.md** | Agent Initial (Phase 2) | Humain (pour ajuster) | Plan d'étapes, critères de fin, jalons |
| **CONTROL_LOOP.md** | Fourni par la méthode | Humain | Règles de la boucle de contrôle |

---

## 4. INTÉGRATION DANS CLAUDE CODE

### 4.1 Structure des fichiers dans un projet

```
mon-projet/
├── CENTRAL.md                    ← Vision du projet (Phase 1)
├── AGENT.md                      ← Mémoire partagée (Phase 2+)
├── SEQUENCAGE.md                 ← Plan d'étapes (Phase 2+)
├── CONTROL_LOOP.md               ← Règles de contrôle
├── .claude/
│   ├── settings.json             ← Configuration Claude Code
│   └── commands/                 ← Slash commands (les agents)
│       ├── concepteur.md         ← /concepteur   (Phase 1)
│       ├── init-projet.md        ← /init-projet  (Phase 2)
│       ├── mission.md            ← /mission       (Phase 3 — codeur standard)
│       ├── mission-backend.md    ← /mission-backend
│       ├── mission-frontend.md   ← /mission-frontend
│       ├── analyste.md           ← /analyste     (Phase 3 — jalons)
│       ├── controle-tests.md     ← /controle-tests    (Phase 4)
│       ├── controle-hygiene.md   ← /controle-hygiene  (Phase 4)
│       ├── controle-conformite.md← /controle-conformite
│       └── correction.md         ← /correction        (Phase 4)
├── .claude/hooks/
│   ├── pre-message.sh            ← Vérifie qu'AGENT.md est présent
│   └── post-message.sh           ← Rappelle la mise à jour d'AGENT.md
├── src/                          ← Code du projet
└── ...
```

### 4.2 Mode multi-agents (Team avec tmux)

Le mode multi-agents est utilisé dans deux situations :

**Phase 3 — Développement :**
```bash
# Le mode multi-agents tmux doit être activé dans la config Claude Code
# L'agent Lead doit EXPLICITEMENT demander la création d'une équipe
# dans son slash command — sinon Claude reste mono-agent
```
L'agent Lead crée les agents Backend et Frontend dans des panneaux tmux séparés.
Il distribue les tâches et gère les accès exclusifs aux fichiers partagés.
Les agents communiquent entre eux via tmux (contrairement aux sous-agents).

**Gestion des conflits de fichiers en parallèle :**
Pas de branches Git. Le Lead définit un ordre d'accès pour chaque fichier partagé.
Un seul agent modifie un fichier à la fois. C'est plus simple que des branches
et ça fonctionne parce que le Lead coordonne activement.

**Phase 4 — Contrôle (optionnel) :**
Les Contrôleurs Tests et Hygiène peuvent tourner en parallèle.
Le Contrôleur Conformité attend leurs résultats avant d'agir.

**Important :** Le mode multi-agents fonctionne par orchestration en langage naturel,
pas par un moteur de workflow natif. La discipline vient des slash commands
et d'AGENT.md, pas d'un système automatique. C'est l'état de l'art actuel
et c'est suffisant pour un workflow efficace.

### 4.3 Hooks

**pre-message.sh** — Se déclenche avant chaque message de Claude Code :
- Vérifie que AGENT.md existe à la racine
- Si absent, affiche un avertissement

**post-message.sh** — Se déclenche après chaque réponse :
- Rappelle de mettre à jour AGENT.md si des fichiers ont été modifiés

### 4.4 Git — Protocole simplifié

Tout le travail se fait directement sur les fichiers locaux, sur la branche `main`.
Git sert de protection, pas de workflow.

- **Phase 2 :** `git init` + `git add .` + `git commit -m "Init: squelette"` + `git push`
- **Phase 4 OK :** `git add .` + `git commit -m "Étape N: [description]"` + `git push`
- **Rollback si besoin :** `git log` pour trouver le bon commit, `git checkout [hash]`

Pas de branches. Pas de merge. Simple et fiable.

---

## 5. PORTABILITÉ ENTRE MACHINES

La méthode doit fonctionner sur n'importe quelle machine où Claude Code est installé.

### Ce qui est spécifique au projet (dans le repo Git)
- CENTRAL.md, AGENT.md, SEQUENCAGE.md, CONTROL_LOOP.md
- Le dossier `.claude/commands/` avec tous les slash commands
- Le dossier `.claude/hooks/` avec les hooks

→ Se synchronise automatiquement avec `git pull`

### Ce qui est global à la machine (dans ~/.claude/)
- Les paramètres globaux de Claude Code
- Le mode multi-agents / tmux (configuration système)

→ À reconfigurer une fois sur chaque nouvelle machine

### Procédure pour une nouvelle machine
1. Installer Claude Code CLI (dernière version)
2. Configurer le mode tmux pour les multi-agents
3. `git clone` du projet
4. Les slash commands et hooks sont déjà dans le repo
5. C'est prêt

---

## 6. SECTION 8 D'AGENT.MD — AVANCEMENT

Ajout proposé à AGENT.md pour le suivi d'avancement :

```markdown
## 8. AVANCEMENT — Où on en est

**Étape actuelle :** [N] / [TOTAL]
**Dernière étape validée :** [N-1] — "[description]" (commit [hash court])
**Prochaine étape :** [N] — "[description]"
**Critère de fin :** [critère mesurable]
**Dernier verdict contrôle :** OK / KO (date)
**Cycles KO consécutifs :** [0-3]
```

---

## 7. RÉSUMÉ DES AGENTS

| Agent | Phase | Rôle | Code ? | Touche AGENT.md ? | Livrable |
|-------|-------|------|--------|-------------------|----------|
| Concepteur | 1 | Fusionne les docs de création | Non | Non | CENTRAL.md |
| Initial | 2 | Squelette + AGENT.md + séquençage + Git | Oui | Oui (§2,4,5) | Squelette + AGENT.md + SEQUENCAGE.md |
| Lead | 3 | Coordonne backend/frontend | Non | Non | Coordination |
| Backend | 3 | Code serveur, API, BDD | Oui | Oui (§4,5,7,8) | Code + AGENT.md à jour |
| Frontend | 3 | Code UI, interactions, composants | Oui | Oui (§4,5,7,8) | Code + AGENT.md à jour |
| Analyste | 3 (jalons) | Analyse, suggestions, alertes | Non | Non | Note d'analyse (chat) |
| Contrôleur Tests | 4 | Vérifie fonctionnement | Non | Non | LOG TESTS (chat) |
| Contrôleur Hygiène | 4 | Vérifie propreté | Non | Non | LOG HYGIÈNE (chat) |
| Contrôleur Conformité | 4 | Vue holistique + verdict | Non | Non | Verdict + directive (chat) |
| Codeur-Correcteur | 4 | Corrige selon directive | Oui | Oui (§4,5,7) | Code corrigé + AGENT.md |
| **Codeur-Remédiation** | **R** | **Applique les corrections post-diagnostic structurel** | **Oui** | **Oui (§4,5,7,8)** | **Code corrigé + AGENT.md + SEQUENCAGE.md si modifié** |
| **Orchestrateur** | **Toutes** | **Automatise le workflow complet** | **Non** | **Oui (§8)** | **Projet terminé** |

---

## 8. PHASE DE REMÉDIATION — /remediation

### Le concept

La remédiation est une phase exceptionnelle qui se déclenche quand un **retour d'expérience révèle des failles structurelles** dans le code, la méthode, ou les deux. Ce n'est pas une correction d'étape classique (Phase 4). C'est une reprise en main globale après découverte d'un problème systémique.

### Quand déclencher une remédiation

- L'application est techniquement "complète" mais ne fonctionne pas en réel
- Un retour d'expérience révèle que la méthode elle-même avait des lacunes
- La méthode a été mise à jour et les corrections doivent être appliquées au code existant
- Le séquençage s'avère incomplet par rapport à CENTRAL.md
- Des règles fondamentales n'ont pas été respectées (seed manquant, tests insuffisants, .env absent)

### Déclencheur

L'humain décide. La remédiation ne se déclenche jamais automatiquement.

### Le flux de remédiation

```
 DÉCOUVERTE DU PROBLÈME
        │
        ▼
┌─────────────────────────────────────┐
│  ÉTAPE R.1 — Diagnostic                │
│  Identifier les causes racines          │
│  Distinguer : problème de méthode       │
│  vs problème de code vs les deux         │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  ÉTAPE R.2 — Correction de la méthode   │
│  Modifier les documents de la méthode   │
│  (METHODE_REFERENCE, CONTROL_LOOP,      │
│  AGENT_template, slash commands)         │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  ÉTAPE R.3 — Prompt de remédiation      │
│  Rédiger un prompt complet pour le       │
│  codeur-correcteur, intégrant :          │
│  - Le diagnostic (ce qui ne va pas)      │
│  - Les règles mises à jour               │
│  - Les corrections concrètes attendues   │
│  - Les critères de succès visuels        │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  ÉTAPE R.4 — Exécution                  │
│  L'agent codeur exécute le prompt.       │
│  Il applique les corrections au code     │
│  existant ET met à jour AGENT.md,        │
│  SEQUENCAGE.md si nécessaire.            │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  ÉTAPE R.5 — Contrôle complet           │
│  Boucle de contrôle standard (Phase 4)  │
│  avec les règles mises à jour            │
│  (tests visuels obligatoires, etc.)      │
└─────────────────────────────────────┘
```

### Structure du prompt de remédiation (R.3)

Le prompt destiné au codeur-correcteur doit suivre cette structure :

```
1. CONTEXTE : Ce qui s'est passé, pourquoi on en est là
2. DIAGNOSTIC : Les problèmes identifiés (liste précise)
3. RÈGLES MISÀ JOUR : Les nouvelles règles à respecter désormais
4. CORRECTIONS DEMANDÉES : Actions concrètes, numérotées, priorisées
5. CRITÈRES DE SUCCÈS : Vérifiables visuellement par l'humain
6. FICHIERS À MODIFIER : Liste explicite
7. INTERDICTIONS : Ce que le codeur ne doit PAS faire
```

Le prompt doit être autonome : l'agent qui le reçoit doit pouvoir travailler sans poser de question. Tout le contexte nécessaire est dans le prompt.

### Règles de la remédiation

1. La remédiation ne remplace jamais le code existant en entier. Elle corrige, complète, et met en conformité.
2. Le codeur-correcteur lit AGENT.md AVANT de commencer (comme toujours).
3. Le codeur-correcteur met à jour AGENT.md APRES avoir fini (comme toujours).
4. La boucle de contrôle (Phase 4) s'applique après la remédiation, avec les règles mises à jour.
5. Si la remédiation implique une modification du SEQUENCAGE.md (ajout d'étapes manquantes), le codeur produit une nouvelle matrice de couverture.
6. L'humain valide le résultat final visuellement.

---

## 9. L'ORCHESTRATEUR — /build

### Le concept

L'orchestrateur est une commande unique `/build` qui automatise tout le workflow.
Une fois lancée, elle déroule : développement → contrôle → correction si KO →
étape suivante → ... jusqu'à la fin du séquençage.

L'humain n'intervient que dans 3 cas :
- Escalade après 3 KO consécutifs
- Validation d'un jalon Analyste
- Interruption volontaire

### Comment ça marche techniquement

L'orchestrateur est un **agent unique qui assume plusieurs rôles** successivement :
il joue le Lead pendant le développement, puis le Contrôleur Tests, puis Hygiène,
puis Conformité. Les seuls agents séparés sont les codeurs Backend/Frontend,
créés via tmux.

C'est de l'**orchestration par langage naturel dans un prompt long**.
L'agent suit un pseudo-code écrit en français dans son slash command.

### Limites honnêtes

1. **Contexte** : Sur un projet long (20+ étapes), le contexte de conversation
   va devenir très long. L'agent peut perdre en précision. Solution : si ça arrive,
   relancer `/build` — il reprend grâce à AGENT.md §8.

2. **Fiabilité** : L'orchestration n'est pas un moteur de workflow déterministe.
   C'est un agent qui suit des instructions. Il peut dévier, oublier une étape,
   ou mal interpréter un verdict. L'humain doit rester vigilant sur les premiers
   projets pour calibrer la fiabilité.

3. **Coût** : Un `/build` complet consomme beaucoup de tokens. Chaque étape
   implique lectures d'AGENT.md + code + contrôles. Sur un projet de 15 étapes,
   c'est significatif.

4. **Parallélisme** : Le vrai parallélisme backend/frontend via tmux fonctionne,
   mais l'orchestrateur doit attendre que les deux agents aient fini avant
   de lancer le contrôle. Il ne peut pas "surveiller" en temps réel.

### Stratégie recommandée

**V1 — Semi-automatique (maintenant) :**
Utilise les slash commands individuels pour les premiers projets.
Apprends comment chaque agent se comporte. Calibre les prompts.

**V2 — Automatique par étape :**
Lance `/build` mais surveille les transitions. Interviens si ça dérive.

**V3 — Full automatique (quand la confiance est établie) :**
Lance `/build` et laisse tourner. Vérifie le résultat final.
