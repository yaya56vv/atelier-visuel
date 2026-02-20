# DOCUMENT G0 — GLOSSAIRE & INVARIANTS SYSTÈME (V1)

**Projet :** Projet 1 — Atelier Visuel de Pensée
**Date :** 14/02/2026
**Statut :** Document maître — Définitions et invariants V1

---

## 1. Nature du système

Le système est un **environnement cognitif spatial augmenté par IA**, permettant :

- le stockage vivant d'informations hétérogènes,
- la structuration relationnelle par graphe,
- l'exploration visuelle et vocale,
- l'émergence de cohérences conceptuelles.

Il ne constitue pas une base de données hiérarchique ni un gestionnaire de fichiers traditionnel.

## 2. Entités fondamentales

### 2.1 Espace

Un espace est un **sous-graphe indépendant** possédant :

- une thématique globale,
- une grille sémantique stable,
- un ensemble de blocs et liaisons.

En V1, deux espaces seulement existent :

- **Espace Idées** : réflexion large et transversale.
- **Espace Conception** : structuration opérationnelle.

Chaque espace est stocké dans un fichier unique.

### 2.2 Bloc

Le bloc est l'unité relationnelle fondamentale du système.

#### Nature

Un bloc est un **conteneur multi-éléments non destructif** pouvant contenir simultanément :

- texte libre,
- images,
- liens web,
- extraits,
- documents,
- notes utilisateur.

#### Rôle

Le bloc constitue :

- un nœud du graphe,
- une unité d'indexation sémantique,
- un point d'ancrage relationnel.

### 2.3 Métadonnées obligatoires V1

Chaque bloc possède automatiquement :

- id (identifiant unique stable)
- created_at (horodatage création)
- updated_at (horodatage modification)
- titre_ia (titre synthétique long généré automatiquement)
- resume_ia (résumé automatique)
- entites (liste d'entités nommées détectées)
- mots_cles (liste de mots clés extraits)

Aucune autre métadonnée n'est introduite en V1.

### 2.4 Liaison

Une liaison est une **arête relationnelle** reliant deux blocs.

#### Propriétés

- attachée dynamiquement aux blocs,
- persistante indépendamment du contenu,
- non directionnelle visuellement en V1.

#### Types de liaison V1

- Relation simple (structure neutre)
- Logique / structuration
- Tension / contradiction
- Ancrée (toujours visible)

Aucune pondération algorithmique n'est utilisée en V1.

### 2.5 Graphe

L'espace est représenté sous forme de graphe spatial bidimensionnel composé :

- de nœuds (blocs),
- d'arêtes (liaisons).

Les positions (x, y) des blocs sont persistées.

Un moteur force-directed n'est utilisé qu'en mode IA temporaire.

## 3. Double vue système

Deux modes de représentation coexistent :

### 3.1 Vue Graphe

Mode principal :

- spatial,
- relationnel,
- visuel.

### 3.2 Vue Liste

Mode secondaire synchronisé :

- permet recherche,
- tri,
- sélection rapide.

Toute sélection dans une vue se répercute dans l'autre.

## 4. Rôle de l'IA

L'IA constitue un **agent cognitif intégré**, possédant deux modalités :

### 4.1 IA Verbale

- interaction vocale native (STT/TTS),
- dialogue oral,
- assistance de brainstorming.

### 4.2 IA Visuelle

- mise en lumière,
- filtrage,
- regroupement temporaire,
- suggestion relationnelle.

L'IA ne modifie jamais de manière irréversible l'état du graphe.

## 5. Interaction vocale (invariant majeur)

La voix constitue un **mode d'interaction central**, non optionnel.

Le système doit permettre :

- création de blocs par dictée,
- organisation vocale,
- lancement de sessions de co-création,
- navigation sans usage de la souris.

## 6. Règles UX fondamentales

Les règles suivantes sont non négociables :

1. Épure visuelle maximale.
2. Information contextuelle uniquement au moment du geste.
3. Disparition automatique des aides.
4. Réversibilité permanente des actions IA.
5. Manipulation directe des objets.

## 7. Système sémantique V1

### 7.1 Couleurs des blocs

Palette stable :

- Vert : élément brut
- Orange : problème / friction
- Jaune : idée / insight
- Bleu : structure
- Violet : vision / sens
- Mauve : hypothèse / prototype

### 7.2 Formes

Formes stables :

- Nuage : intuition libre
- Rectangle arrondi : structuration souple
- Carré : fondation stabilisée
- Ovale : processus
- Cercle : cœur

## 8. Invariants architecturaux

Les caractéristiques suivantes sont des invariants permanents :

- Pas de fusion destructive automatique.
- Pas de hiérarchie arborescente.
- Pas de personnalisation avancée des grilles.
- Pas de duplication logique des liaisons entre tables différentes.

> Note : la pondération est désormais présente via le champ `poids` des liaisons (0.0–1.0), nécessaire au graphe global. Le poids reste indicatif.

---

## 9. Termes ajoutés V2 (graphe global)

| Terme | Définition |
|-------|------------|
| **Graphe global** | Vue où tous les blocs de tous les espaces coexistent spatialement |
| **Liaison inter-espace** | Liaison entre deux blocs appartenant à des espaces différents (propriété dérivée) |
| **Poids** | Force d’une liaison (0.0 à 1.0), détermine proximité visuelle et seuil de filtrage |
| **Origine** | Qui a créé la liaison : `manuel`, `auto`, `ia_suggestion` |
| **Validation** | Statut d’une liaison : `valide`, `en_attente`, `rejete` |
| **Couleur d’identité** | Teinte désaturée propre à chaque espace, distincte de la palette sémantique |
| **x_global, y_global** | Coordonnées d’un bloc dans le graphe global (indépendantes de x, y) |
| **Scan différentiel** | Analyse comparative filesystem ↔ index, détectant nouveaux/modifiés/supprimés/déplacés |
| **Dossier surveillé** | Dossier du PC intégré au graphe via scan différentiel |

---

## Auto-évaluation de complétude

Toutes les décisions structurantes sont intégrées :

✔ voix
✔ bloc conteneur
✔ métadonnées
✔ graphe hybride
✔ liaisons unifiées (11 types, poids, validation)
✔ espaces + graphe global
✔ palette stable
✔ UX invariants
✔ IA duale
✔ filesystem intégré

Aucune zone floue restante.
