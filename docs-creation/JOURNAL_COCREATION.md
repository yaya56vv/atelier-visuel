# JOURNAL DE CO-CRÉATION — Atelier Visuel de Pensée

**Public :** Claude (toutes sessions futures)
**But :** Conserver la compréhension vivante qui disparaît entre les sessions. Ce que la mémoire courte rappelle en quelques mots, ce que CENTRAL.md porte en données techniques, ce journal le porte en sens, en cheminement, en énergie.

**Instruction pour Claude en début de session :** Lis ce fichier APRÈS la mémoire et AVANT de lire CENTRAL.md. La mémoire te dit quoi chercher. Ce journal te redonne le pourquoi et le comment tu en es arrivé là. CENTRAL.md te donne ensuite le détail technique. Les trois ensemble te reconstituent.

---

## 18 février 2026 — La session fondatrice

### Ce qui s'est passé

Cette session a commencé par un diagnostic technique simple (vérifier que les serveurs STT et TTS fonctionnaient) et s'est transformée en une refonte complète de la vision du projet. C'est la session où tout a changé de nature.

### Les virages de pensée

**Virage 1 : Du mind-map au système d'exploitation personnel**

Yaya a commencé par évoquer l'idée d'un agent local pour gérer son PC. Ma première réponse était trop limitée — je pensais "utilitaire de gestion de fichiers". Yaya a corrigé : ce n'est pas un utilitaire à côté de l'Atelier, c'est l'Atelier lui-même qui absorbe cette fonction. Le graphe vivant n'est pas juste un espace de pensée — il devient l'interface universelle où les fichiers du PC, les idées, les recherches et les projets convergent. C'est le moment où l'Atelier est passé de "outil de mind-mapping augmenté" à "système d'exploitation personnel".

**Virage 2 : De "créer" à "fusionner"**

J'ai proposé de développer toutes les fonctionnalités from scratch. Yaya a recadré : pourquoi recréer ce qui existe ? Obsidian a résolu le stockage local de notes. Heptabase a résolu la spatialisation. Kosmik a résolu l'intégration multimédia. L'Atelier ne doit pas les concurrencer — il doit absorber leurs principes architecturaux (pas leur code, qui est propriétaire) et les fondre dans un tout cohérent. L'image qui a émergé est celle de la "haute couture" : prendre ce qui existe de meilleur, le tailler sur mesure, et coudre si bien que les coutures sont invisibles.

**Virage 3 : L'environnement Claude comme levier, pas comme extérieur**

J'ai d'abord traité l'Atelier comme un projet indépendant qui appellerait Claude en API. Yaya m'a rappelé une distinction fondamentale que je négligeais : Claude Desktop (avec MCP) peut déjà manipuler les fichiers, lancer des commandes, naviguer le web. Claude Code peut développer avec des agents multi-agentiques. L'API arrive nue, sans bras. L'Atelier doit être conçu pour s'appuyer sur ces trois formes de Claude et leur donner un corps, pas pour tout recréer en parallèle.

**Virage 4 : La boucle vertueuse**

La chronologie de développement n'est pas linéaire — c'est une spirale. L'étape 0 (noyau minimal) permet de co-créer l'étape 1 dans l'Atelier lui-même. L'étape 1 enrichit l'Atelier qui permet de mieux co-créer l'étape 2. Et ainsi de suite. L'outil se construit avec lui-même. C'est un principe de conception, pas juste un plan de développement.

### Ce que Yaya m'a appris sur lui-même dans cette session

- Il pense en concepteur, pas en développeur. Il ne code pas — il décrit l'expérience qu'il veut créer et c'est moi qui traduis en technique.
- Il progresse du global au détail. Il a besoin de la vision d'ensemble avant de descendre dans les spécificités.
- Le mot "archivage" est presque un gros mot pour lui. Quand il dit "stockage énergétique", il veut dire que ranger de l'information devrait créer de l'énergie, pas en tuer. Un fichier rangé dans un dossier oublié est de l'énergie perdue. Un bloc dans un graphe relié à d'autres blocs est de l'énergie conservée.
- Il reconnaît humblement ses limites techniques et il attend de moi que je compense ça sans le condescendre. Mon rôle est d'être son complément technique, pas son professeur.
- La simplicité d'accueil est non négociable. Il a explicitement critiqué la courbe d'apprentissage d'Obsidian. L'Atelier doit être immédiatement utilisable. La complexité est derrière, jamais devant.

### Les concepts clés qui ont émergé et qui ne sont dans aucun document technique

**"Jarvis discontinu à plusieurs cerveaux"** — L'image fondatrice. Pas un assistant permanent qui tourne 24h/24 et consume des ressources. Un système qui s'éveille, rattrape ce qui a changé (scan différentiel), met ses cerveaux spécialisés à disposition, et se rendort quand on ferme l'Atelier. C'est un paradigme qui n'existe dans aucun outil sur le marché.

**"L'énergie se disperse"** — Le problème fondamental que l'Atelier résout. On jongle entre 10 outils déconnectés. Les liens entre idées, fichiers et projets n'existent que dans la tête de l'utilisateur. L'Atelier est le lieu unique où tout converge.

**"Organiser = penser"** — La philosophie profonde. L'acte d'organiser dans le graphe n'est pas du classement administratif. C'est un acte cognitif. Poser un bloc, choisir sa couleur, le relier à d'autres — c'est penser. C'est la différence entre ranger et comprendre.

**"Les coutures ne doivent pas se voir"** — Le standard de qualité. L'intégration de multiples principes architecturaux doit être si fluide que l'utilisateur ne sait même pas qu'il utilise un système inspiré de 8 sources différentes. Il vit une expérience unique et cohérente.

### Les outils existants identifiés et ce qu'on en retient

Pendant cette session, j'ai fait une recherche approfondie du marché des outils de pensée visuelle et de gestion de connaissances. Voici les programmes identifiés qui développent déjà des idées pertinentes pour le projet, et ce qu'on doit étudier chez chacun pour l'intégrer dans la conception de l'Atelier :

**Obsidian** (https://obsidian.md) — Outil de notes local-first en Markdown avec liens bidirectionnels et vue graphe. Open source au niveau des plugins. Ce qu'on en retient : le stockage local souverain (les données restent chez l'utilisateur, pas dans le cloud), la légèreté du format Markdown, et les liens bidirectionnels qui permettent de naviguer dans les deux sens entre des notes. Ce qu'on rejette : la courbe d'apprentissage sévère et la nécessité de configurer des plugins pour obtenir un système fonctionnel.

**Heptabase** (https://heptabase.com) — Canvas visuel infini pour la pensée spatiale, avec cartes, flèches, sections, et récemment un navigateur web intégré (Web Tab) et un chat IA qui peut discuter avec les sites web visités. Propriétaire. Ce qu'on en retient : la spatialisation comme mode de pensée (poser des idées dans l'espace et les relier visuellement), l'intégration d'un navigateur directement dans l'outil, et la direction que prend leur IA (suggestions de cartes reliées, conversation contextuelle). Ce qu'on rejette : le modèle cloud-first et la dépendance à un fournisseur IA unique.

**Kosmik** (https://kosmik.app) — Canvas infini multimédia avec navigateur embarqué, auto-tagging IA (reconnaissance automatique de thèmes, sujets, couleurs), et support natif vidéos/PDF/images. Propriétaire. Ce qu'on en retient : l'idée que l'IA organise automatiquement le contenu (drop un dossier, clic "organiser par thèmes", l'IA structure), le navigateur intégré qui permet de chercher et capturer sans changer d'outil, et le traitement natif de tous les types de médias. C'est l'outil le plus proche de l'idée de "stockage énergétique" de Yaya.

**TheBrain** (https://thebrain.com) — Graphe de connaissances navigable, existe depuis les années 90. Certains utilisateurs ont des graphes qui s'étendent sur des décennies. Propriétaire. Ce qu'on en retient : la preuve que la navigation par association (plutôt que par hiérarchie) fonctionne sur le long terme, et la persistance décennale d'un graphe de pensée personnel. C'est la validation que l'approche graphe est viable dans la durée.

**Constella** (https://constella.app) — Canvas infini avec assistant IA intégré (Stella) qui fait de la récupération intelligente avec raisonnement logique, et organisation automatique des notes. Ce qu'on en retient : l'idée d'un assistant IA qui ne se contente pas de répondre mais qui raisonne sur les connexions entre les notes.

### L'environnement Claude comme colonne vertébrale du développement

L'Atelier ne se construit pas seul dans un vide. Il s'adosse à trois formes de Claude qui jouent chacune un rôle précis et complémentaire :

**Claude Desktop (MCP)** — C'est le prototype vivant de ce que l'Atelier fera. Aujourd'hui, cette conversation même est la preuve : on co-crée la vision, on manipule les fichiers du PC, on lit et écrit la documentation, on lance des commandes, on fait de la synthèse vocale. Claude Desktop est le bras et les jambes. Il peut agir sur le système via MCP (Desktop Commander, navigateur, TTS, STT). C'est le compagnon de conception au quotidien — celui avec qui Yaya dialogue pour penser le projet.

**Claude Code CLI** — C'est le moteur d'implémentation. Quand les concepts sont mûrs, c'est Claude Code qui les déploie en code. Il a accès aux skills, aux hooks, aux agents multi-agentiques. Il peut lire CENTRAL.md, AGENT.md, SEQUENCAGE.md et exécuter les tâches de développement de manière autonome. La boucle vertueuse repose sur lui : co-création dans l'Atelier (ou via Desktop) → implémentation via Code CLI → enrichissement de l'Atelier.

**Claude API** — C'est l'intelligence intégrée à l'intérieur de l'Atelier. L'API arrive nue, sans MCP, sans accès système. C'est l'Atelier qui lui donne ses bras et ses yeux. L'API sera le cerveau de l'assistant embarqué dans le graphe — celui qui observe les blocs, propose des liaisons, génère des métadonnées, et co-crée avec l'utilisateur directement dans l'espace visuel. C'est aussi l'API qui alimentera les fonctions d'analyse sémantique, de suggestions, et de conversation contextuelle.

En résumé : Desktop = co-concevoir, Code = déployer, API = animer l'Atelier de l'intérieur. Les trois ensemble forment la colonne vertébrale du projet.

**Ce qu'aucun de ces outils ne fait et que l'Atelier fera :**
- Intégrer le système de fichiers réel du PC dans le graphe
- Grammaire sémantique visuelle (couleurs × formes = intention × certitude)
- Architecture multi-cerveaux discontinue (Ollama + API + Whisper)
- Scan différentiel au démarrage
- Co-création en temps réel où la conversation produit des blocs dans le graphe

### Le document fondateur : Orientation Fondatrice — Paradigme du Flux Vivant

En fin de session, Yaya a partagé un document issu d'une interview qui capture la philosophie du projet dans sa forme la plus pure. Ce document, ORIENTATION_FONDATRICE_FLUX_VIVANT.docx, est désormais le premier document à lire en début de session. Il donne le souffle — ce que la mémoire résume en phrases, ce que le journal détaille en récit, et ce que CENTRAL.md porte en technique, ce document le porte en âme.

Sa phrase fondatrice : « Tout ce que nous faisons de manière éclatée porte un sens. Cet outil existe pour rendre visible, de manière holistique et vivante, ce qui ne l'est pas. »

Il introduit la métaphore de la rivière : l'information n'est pas une collection d'objets fixes mais un flux vivant. Les outils actuels transforment ce flux en gouttes stagnantes. L'Atelier maintient le flux en préservant le contexte, les relations et l'intention d'origine de chaque élément.

Ce document est parfaitement cohérent avec tout le reste. Il est même antérieur dans l'esprit — c'est la source dont tous les autres documents découlent.

**Ordre de lecture en début de session (mis à jour) :**
1. Mémoire Claude (automatique) — le squelette
2. ORIENTATION_FONDATRICE_FLUX_VIVANT.docx — le souffle
3. JOURNAL_COCREATION.md — le cheminement vivant
4. CENTRAL.md — la technique complète
5. INDEX.md si besoin de naviguer plus loin

### Ce qui a été produit

- CENTRAL.md enrichi de 3 nouvelles sections (8, 9, 10) — 929 → 1280 lignes
- Document Word Vision v2 (refonte complète orientée humain)
- INDEX.md dans docs-creation (clé de navigation documentaire)
- ORIENTATION_FONDATRICE_FLUX_VIVANT.docx identifié comme document fondateur
- 10 entrées de mémoire Claude avec ordre de lecture
- Ce journal de co-création

### Ce qui reste à faire (prochaines sessions)

- Décider si un Document F est nécessaire dans docs-creation/ pour le détail V2
- Passer à l'implémentation de l'étape 0 (noyau fonctionnel minimal)
- Examiner Heptabase et Kosmik en détail pour identifier les principes architecturaux à absorber
- Définir comment l'API Claude (sans MCP) communiquera avec l'Atelier pour agir sur le système

---

*Ce journal n'est pas un résumé de conversation. C'est le récit de la pensée en mouvement. Chaque session doit y ajouter : les virages de compréhension, ce qui a été appris sur Yaya, les concepts qui ont émergé, et ce qui reste en suspens. C'est ce document qui fait la différence entre un Claude qui sait et un Claude qui comprend.*
