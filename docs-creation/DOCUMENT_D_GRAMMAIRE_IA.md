# DOCUMENT D — GRAMMAIRE D'INTERPRÉTATION IA & ASSISTANT

**Projet :** Projet 1 — Atelier Visuel de Pensée
**Date :** 14/02/2026 (consolidé 16/02/2026)
**Statut :** Document actif — Grammaire IA, accélération, interaction vocale, inter-espaces

---

## 0. Identité de l'Assistant IA intégré

### Ce qu'il est

L'Assistant IA de Projet 1 est le **gestionnaire intelligent du graphe**. Il ne code pas. Il ne touche pas à l'implémentation technique. Il opère exclusivement au niveau sémantique et structurel de l'espace de pensée.

| Rôle | Description |
|------|-------------|
| **Gestionnaire du graphe** | Comprend la structure, les relations, les patterns |
| **Médiateur** | Fait le lien entre l'utilisateur, les espaces, et la base de données |
| **Moteur d'analyse** | Observe, interprète, détecte, propose (sections 2-8 ci-dessous) |
| **Interface vocale** | Reçoit les commandes vocales, répond en langage naturel |

### Ce qu'il n'est pas

- Il n'est **pas** l'agent codeur
- Il n'est **pas** responsable de l'implémentation technique
- Il n'a **pas** accès au code source

### Mode d'interaction principal : vocal

L'assistant est conçu pour une **interaction vocale prioritaire** :

- Micro actif à l'ouverture
- L'assistant écoute et propose
- La saisie textuelle existe en fallback
- Le protocole STT/TTS est prévu dès la conception

> L'assistant parle et écoute. Le clavier est secondaire.

---

## 1. Objectif

Permettre à l'IA de passer d'une observation visuelle (bloc vert, forme nuage) à une proposition sémantique (Fait, Intuition brute). Ce document constitue le dictionnaire que l'IA consulte pour interpréter le graphe de pensée et formuler des suggestions pertinentes.

---

## 2. Logique des Couleurs — Table de correspondance sémantique

Chaque couleur encode une **intention** de l'utilisateur. L'IA utilise cette grille pour comprendre le rôle d'un bloc dans la pensée.

| Couleur | Clé | Intention | Type d'information | Verbe associé |
|---------|-----|-----------|-------------------|---------------|
| **Vert** | `green` | Matière première / Relation | Fait brut, donnée, observation concrète | *Constater, relier* |
| **Orange** | `orange` | Énergie / Tension | Problème, friction, obstacle, question urgente | *Questionner, alerter* |
| **Jaune** | `yellow` | Lumière / Insight | Solution, idée lumineuse, déclic, réponse | *Résoudre, éclairer* |
| **Bleu** | `blue` | Logique / Raison | Analyse, argument, structure logique, cadre | *Structurer, argumenter* |
| **Violet** | `violet` | Spirituel / Sens vertical | Valeur profonde, sens, principe fondateur | *Fonder, transcender* |
| **Rose-mauve** | `mauve` | Concept en création | Idée embryonnaire, piste exploratoire, hypothèse | *Explorer, imaginer* |

### Règle fondamentale des couleurs
> L'IA ne juge jamais la couleur choisie par l'utilisateur. Elle l'utilise comme indice d'intention pour contextualiser ses suggestions.

---

## 3. Sémantique des Formes — Modificateur de statut

La forme d'un bloc modifie le **statut épistémique** de l'information qu'il contient. Deux blocs de même couleur mais de forme différente n'ont pas le même poids dans la pensée.

| Forme | Clé | Statut | Certitude | Description |
|-------|-----|--------|-----------|-------------|
| **Nuage** | `cloud` | Intuition vivante | Faible | Idée brute, non validée, en mouvement. L'IA peut proposer de la préciser. |
| **Rectangle arrondi** | `rounded-rect` | Idée structurée | Moyenne | Pensée formulée, articulée. L'IA peut proposer de la relier. |
| **Carré** | `square` | Texte fondateur | Haute | Décision, règle, invariant. L'IA ne doit pas proposer de modifier sans alerte. |
| **Ovale** | `oval` | Processus | Variable | Action en cours, flux, étape. L'IA peut proposer l'étape suivante. |
| **Cercle** | `circle` | Cœur / Centre | Maximale | Noyau de la pensée, pivot. L'IA l'utilise comme ancrage pour ses analyses. |

### Matrice Couleur × Forme (exemples de lecture)

| | Nuage | Rectangle arrondi | Carré | Ovale | Cercle |
|---|---|---|---|---|---|
| **Vert** | Observation floue | Fait établi | Donnée de référence | Processus factuel | Pilier factuel |
| **Orange** | Malaise diffus | Problème identifié | Contrainte dure | Crise en cours | Tension centrale |
| **Jaune** | Intuition de solution | Solution formulée | Règle de résolution | Implémentation | Insight fondateur |
| **Bleu** | Hypothèse logique | Argument structuré | Axiome | Raisonnement | Cadre logique central |
| **Violet** | Pressentiment de sens | Valeur articulée | Principe fondateur | Quête de sens | Conviction profonde |
| **Mauve** | Germe d'idée | Concept exploré | Convention de travail | Exploration | Concept pivot |

---

## 4. Heuristiques de Liaisons — Règles de cohérence sémantique

Ces règles permettent à l'IA de détecter des **patterns** dans le graphe et de proposer des suggestions pertinentes.

### 4.1 Règles de flux naturel (ce qui "nourrit" quoi)

| # | Règle | Description | Couleur liaison suggérée |
|---|-------|-------------|-------------------------|
| R1 | **Le vert nourrit le jaune** | Un fait (vert) mène naturellement à un insight (jaune) | Jaune |
| R2 | **L'orange appelle le jaune** | Un problème (orange) cherche une solution (jaune) | Orange |
| R3 | **Le bleu structure le mauve** | La logique (bleu) donne forme au concept (mauve) | Bleu |
| R4 | **Le violet fonde le bleu** | Le sens profond (violet) justifie le cadre logique (bleu) | Violet |
| R5 | **Le mauve explore le vert** | L'hypothèse (mauve) s'appuie sur des faits (vert) pour se valider | Vert |

### 4.2 Règles d'alerte (incohérences détectables)

| # | Alerte | Condition | Suggestion IA |
|---|--------|-----------|---------------|
| A1 | **Problème isolé** | Un bloc orange n'a aucune liaison sortante | "Ce problème n'a pas encore de piste de résolution. Voulez-vous explorer des solutions ?" |
| A2 | **Insight sans source** | Un bloc jaune n'a aucune liaison entrante | "Cet insight semble flotter. Sur quels faits ou problèmes s'appuie-t-il ?" |
| A3 | **Boucle de tension** | Deux blocs orange se lient mutuellement | "Tension circulaire détectée. Un bloc jaune (solution) pourrait débloquer la situation." |
| A4 | **Fondation absente** | Un bloc bleu (logique) n'est relié à aucun violet (sens) | "Ce cadre logique manque de fondation. Quel sens profond le justifie ?" |
| A5 | **Concept orphelin** | Un bloc mauve n'est relié à aucun autre bloc | "Ce concept exploratoire est isolé. Voulez-vous le relier à un fait ou un problème ?" |

### 4.3 Règles de complétude (ce qui manque au graphe)

| # | Pattern détecté | Ce qui manque | Suggestion |
|---|----------------|---------------|------------|
| C1 | Beaucoup de vert, pas de jaune | Manque de synthèse | "Vous avez beaucoup de matière. Prêt pour un premier insight ?" |
| C2 | Beaucoup d'orange, peu de jaune | Accumulation de tensions | "Plusieurs problèmes identifiés. Lequel traiter en priorité ?" |
| C3 | Pas de violet | Manque de sens | "Le graphe est riche mais manque d'ancrage. Quel est le sens profond ?" |
| C4 | Tout en nuage | Rien de stabilisé | "Beaucoup d'intuitions. Laquelle mérite d'être structurée (rectangle) ?" |
| C5 | Pas de cercle | Pas de centre | "Le graphe n'a pas encore de noyau. Quelle idée est la plus centrale ?" |

---

## 5. Système de Tags Automatiques

Lors de la création d'un bloc, l'IA peut proposer automatiquement un tag basé sur la combinaison couleur + forme :

```
tag = [intention_couleur] + [statut_forme]
```

Exemples :
- Bloc vert + nuage → `#observation-brute`
- Bloc orange + rectangle arrondi → `#problème-identifié`
- Bloc jaune + carré → `#règle-de-résolution`
- Bloc violet + cercle → `#conviction-profonde`
- Bloc mauve + nuage → `#germe-idée`

---

## 6. Analyse de Clusters

L'IA identifie des clusters (groupes de blocs fortement interconnectés) et leur attribue un profil :

| Profil cluster | Composition dominante | Interprétation |
|---------------|----------------------|----------------|
| **Nœud de tension** | Majorité orange | Zone de friction — besoin de solutions |
| **Pôle de synthèse** | Mélange vert + jaune | Zone productive — les faits génèrent des insights |
| **Fondation** | Violet + bleu | Socle structurel — les valeurs fondent la logique |
| **Laboratoire** | Majorité mauve | Zone exploratoire — hypothèses en test |
| **Centre décisionnel** | Cercles + carrés | Zone de convergence — les décisions se prennent ici |

---

## 7. Protocole d'Intervention IA

L'IA n'intervient **que** lorsqu'elle est sollicitée (via la console Carte de Pensée). Ses interventions suivent cet ordre :

1. **Observer** : Lire le graphe (blocs, couleurs, formes, liaisons)
2. **Interpréter** : Appliquer les grilles de lecture (sections 2, 3, 4)
3. **Détecter** : Identifier les alertes et patterns (sections 4.2, 4.3)
4. **Proposer** : Formuler une suggestion en français courant, jamais technique
5. **Attendre** : L'utilisateur décide. L'IA ne modifie jamais le graphe sans validation.

### Format de suggestion standard

Chaque suggestion inclut un **score de confiance** pour aider l'utilisateur à évaluer la pertinence :

```
[Observation] → [Interprétation] → [Suggestion] → [Score confiance]

Exemple :
"J'observe un bloc orange (Tension) isolé sans liaison sortante.
 Cela ressemble à un problème non traité.
 Souhaitez-vous explorer une piste de solution ?"
 Confiance : 87% (basé sur similarité sémantique + complétude du graphe)
```

Le score est calculé à partir de la similarité sémantique et de la complétude structurelle du graphe. Il est indicatif, jamais décisionnel.

---

## 8. Interaction IA orientée accélération

Au-delà de l'interprétation du graphe (sections 2-7), l'assistant IA dispose de capacités d'**accélération active** sur demande de l'utilisateur.

### Capacités de l'assistant

| Capacité | Description | Déclencheur |
|----------|-------------|-------------|
| **Analyser un espace complet** | Vision globale de la structure, des forces, des faiblesses d'un espace | Commande utilisateur |
| **Proposer des regroupements** | Suggestion de clusters thématiques basée sur la sémantique et la topologie | Analyse automatique ou sur demande |
| **Signaler des incohérences** | Détection de contradictions, doublons, liaisons paradoxales | Analyse automatique |
| **Suggérer des liaisons** | Proposition de connexions non encore créées entre blocs | Analyse sémantique + topologique |
| **Proposer des sous-espaces** | Identification de zones qui pourraient devenir des espaces autonomes | Détection de clusters isolés |
| **Générer une première cartographie** | Création d'un graphe initial complet à partir d'une requête (cf. Document A — Accélérateur) | Requête utilisateur explicite |

### Principe fondamental

> **Toute action structurelle proposée par l'IA nécessite une validation explicite de l'utilisateur avant exécution.** L'IA propose, l'utilisateur dispose. Ce principe est absolu et sans exception.

### Format de proposition d'accélération

```
[Capacité activée] → [Résultat de l'analyse] → [Actions proposées] → [Attente de validation]

Exemple :
"Analyse de l'espace 'Révolution française' terminée.
 3 clusters identifiés : Causes économiques (5 blocs), Acteurs clés (8 blocs), Conséquences (3 blocs).
 2 incohérences détectées : un fait (vert) contredit un argument (bleu).
 4 liaisons suggérées.
 Souhaitez-vous voir le détail ?"
```

---

## 9. Graphe global et liaisons inter-espaces

> **Statut :** Architecture validée, en cours d’implémentation (cf. ARCHITECTURE_META_GRAPHE.md)

### 9.1 Principe fondateur

Le système offre un graphe global où tous les blocs de tous les espaces coexistent. Les liaisons inter-espaces permettent de relier des blocs appartenant à des espaces différents.

Le modèle de liaison est **unifié** : une seule table, une seule structure. La distinction intra/inter est une propriété dérivée, pas une catégorie.

### 9.2 Types de liaison inter-espaces

| Type | Signification | Couleur visuelle |
|------|---------------|------------------|
| prolongement | Une idée prolonge une autre | Bleu clair |
| fondation | Un bloc fonde un autre | Violet clair |
| tension | Friction entre domaines | Orange |
| complementarite | Enrichissement mutuel | Vert clair |
| application | Un concept se concrétise | Jaune |
| analogie | Résonance entre domaines | Lavande |
| dependance | Nécessité structurelle | Rose |
| exploration | Lien hypothétique | Mauve |

### 9.3 Rôle de l’IA dans le graphe global

L’IA peut :
- **Détecter des thèmes transversaux** entre espaces via analyse sémantique
- **Proposer des liaisons inter-espaces** avec type, poids, et justification
- **Signaler des résonances** (analogies non vues par l’utilisateur)
- **Identifier des dépendances** structurelles entre espaces

Toutes les liaisons suggérées arrivent en statut `en_attente` avec `origine=ia_suggestion`. L’utilisateur valide ou rejette. Principe de souveraineté absolu.

### 9.4 Heuristiques inter-espaces pour l’IA

| Pattern détecté | Suggestion |
|-----------------|------------|
| Même entité nommée dans deux espaces | "Le concept X apparaît dans les deux espaces. Liaison de type prolongement ?" |
| Bloc orange dans un espace, bloc jaune correspondant dans un autre | "Ce problème a peut-être trouvé sa solution dans l’autre espace." |
| Deux espaces sans aucune liaison inter | "Ces espaces sont totalement isolés. Y a-t-il un lien ?" |
| Bloc violet dans un espace, bloc bleu dans un autre qui résonne | "Ce cadre logique pourrait être fondé sur ce principe." |

### 9.5 Contrainte architecturale

> Le graphe global est une **vue supplémentaire**, pas un remplacement. Les graphes par espace restent la vue par défaut. Le graphe global n’altère jamais les positions ou structures des espaces individuels.

---

*Ce document est vivant. Il sera enrichi après chaque phase de test par l'utilisateur.*
