# DOCUMENT B — ARCHITECTURE CONCEPTUELLE (VERSION CONSOLIDÉE)

**Projet :** Projet 1 — Atelier Visuel de Pensée
**Date :** 14/02/2026 (consolidé 16/02/2026)
**Statut :** Version fusionnée unique — Source de vérité

---

## 1. Modèle structurel global

### 1.1 Nature du système

Le système repose sur un modèle graphe spatial persistant composé de :
- nœuds : blocs
- arêtes : liaisons
- conteneurs : espaces

Chaque espace constitue un sous-graphe indépendant.

### 1.2 Représentation mathématique

Un espace est défini comme :
G = (N, E)
où :
N = ensemble des blocs
E = ensemble des liaisons

Chaque bloc possède des coordonnées persistantes dans un plan 2D.

---

## 2. Modèle de données des blocs (nœuds)

### 2.1 Structure logique du bloc

Identité :
- id : identifiant unique immutable
- espace_id : référence à l'espace parent

Position spatiale :
- x : coordonnée horizontale persistée
- y : coordonnée verticale persistée

Contenu multi-éléments :
type_element ∈ {texte, image, lien, extrait, document, note}

Chaque élément interne est indépendant et non destructif.

### 2.2 Métadonnées obligatoires V1

- created_at
- updated_at
- titre_ia
- resume_ia
- entites[]
- mots_cles[]

Ces métadonnées sont recalculables dynamiquement.

### 2.3 Statut relationnel

Chaque bloc possède :
- liste de liaisons sortantes
- liste de liaisons entrantes

Les liaisons sont symétriques en V1.

---

## 3. Modèle des liaisons (arêtes)

Structure :
- id
- bloc_source_id
- bloc_cible_id
- type
- poids (0.0 à 1.0)
- origine (manuel / auto / ia_suggestion)
- validation (valide / en_attente / rejete)
- label (optionnel)
- metadata (JSON libre)
- created_at, updated_at

### 3.1 Types de liaison

Le modèle unifie les liaisons intra-espace et inter-espaces. La distinction intra/inter est une propriété dérivée (calculée depuis les espace_id des blocs reliés), pas une catégorie structurelle.

Types intra-espace :
- simple — relation neutre
- logique — structuration
- tension — contradiction
- ancree — toujours visible

Types inter-espaces (fonctionnent aussi en intra) :
- prolongement — une idée prolonge une autre
- fondation — un bloc fonde un autre
- complementarite — deux blocs s’enrichissent mutuellement
- application — un concept se concrétise
- analogie — résonance entre domaines différents
- dependance — un bloc nécessite un autre
- exploration — lien hypothétique en cours de validation

### 3.2 Poids et validation

Le poids (0.0 à 1.0) encode la force de la relation. Il détermine :
- la proximité visuelle entre espaces dans le graphe global
- l’épaisseur de la liaison à l’écran
- le seuil de filtrage (masquer les liaisons faibles)

La validation permet le flux de découverte IA : l’IA crée des liaisons `en_attente` que l’utilisateur accepte ou rejette.

### 3.3 Propriété dérivée inter_espace

Une liaison est inter-espace si et seulement si espace_id(bloc_source) ≠ espace_id(bloc_cible). Cette propriété n’est pas stockée, elle est calculée à la requête.

---

## 4. Persistance spatiale

Coordonnées persistantes (x, y).
Force-directed uniquement en mode temporaire IA.
Retour possible à l'état persisté.

### Analyse géométrique des positions

Les coordonnées (x, y) persistantes ne servent pas uniquement à l'affichage. Elles alimentent une analyse géométrique :
- Clustering spatial (blocs proches → thématique commune implicite)
- Centralité spatiale (noyaux implicites détectés par position)
- L'IA peut proposer de regrouper des clusters géométriques en sous-espaces

Cette analyse est une capacité de l'IA observatrice, pas une modification automatique du graphe.

---

## 5. Double représentation synchronisée

Vue Graphe :
- Spatialisation 2D
- Manipulation directe
- Visualisation relationnelle

Vue Liste :
- Affichage textuel
- Tri par métadonnées
- Recherche rapide

Synchronisation en temps réel.

---

## 6. Système d'indexation automatique

Déclenchement :
- Création
- Modification

Processus :
- Analyse sémantique
- Génération titre_ia
- Génération resume_ia
- Extraction entités
- Extraction mots-clés

L'index alimente recherche et filtrage.

---

## 7. Règles d'affichage des liaisons

Mode normal :
- Liaisons des blocs sélectionnés visibles

Exception :
- Liaisons ancrées toujours visibles

Activation contextuelle :
- Sélection
- Survol
- Mode exploration

---

## 8. Rôle de l'IA

IA verbale :
- Dialogue vocal
- Dictée
- Brainstorming

IA visuelle :
- Filtrage
- Regroupement temporaire
- Suggestion de liens

Aucune modification définitive sans validation.

---

## 9. Sémantique par espace

Deux thématiques fondatrices :
- **IDÉES** — réflexion large et transversale
- **CONCEPTION** — structuration opérationnelle

Chaque thématique offre une grille de lecture travaillée. Sous ces thématiques, l’utilisateur crée autant d’espaces que nécessaire (ex : espace « Révolution française » sous IDÉES, espace « Architecture Atelier » sous CONCEPTION).

Palette sémantique (couleurs/formes des blocs) identique entre espaces. Influence uniquement interprétative.

Chaque espace possède une **couleur d’identité** distincte de la palette sémantique des blocs (teintes désaturées : vert forêt, prune, bleu acier, terre...). Cette couleur identifie l’espace d’appartenance dans le graphe global.

---

## 10. Invariants architecturaux

Interdits :
1. Hiérarchie parent-enfant
2. Fusion automatique destructive
3. Personnalisation avancée du graphe
4. Moteur IA permanent
5. Duplication logique des liaisons entre tables différentes

> Note : l’ancien interdit « pondération algorithmique » est levé pour le champ `poids` des liaisons (0.0–1.0), nécessaire au graphe global. Le poids reste indicatif et ne modifie jamais la structure du graphe automatiquement.

### Versioning graphe non destructif

Chaque modification (nœud/arête) est traçable. Le système préserve l'historique des états du graphe de manière non destructive. Ce mécanisme prépare la collaboration future et permet le retour à un état antérieur si nécessaire.

---

## 11. Couche d'analyse activable

Capacités :
- Similarité sémantique
- Détection de clusters
- Analyse de centralité
- Détection de manques structurels
- Suggestions de liaisons

Principe :
Observation augmentée.
Aucune modification sans validation.

---

## 12. Couche d'import structuré

Modes :
1. Import manuel (PDF, images, URLs, copier-coller)
2. Import assisté IA

Métadonnées obligatoires :
- Source
- Date d'import
- Type
- Statut (importé → validé → enrichi)

---

## 13. Architecture modulaire

Principes :
- Modules indépendants mais coordonnés
- Interfaces propres
- Zéro friction logique
- État partagé minimal

Exigences :
- Fluidité
- Extension future
- Interface IA unifiée
- Cohérence globale

Anti-patterns interdits :
- Duplication logique
- Dépendances circulaires
- État global non contrôlé

---

## 14. Interdictions techniques formelles

Interdit :
- Polylignes lissées
- Déformation sinusoïdale
- Offset naïf rails lumineux
- Constantes codées en dur
- Modales bloquantes
- Connecteurs fixes
- Resize sans révélation
- Stop backend incomplet

Imposé :
- Bézier cubiques uniques
- Tangence réelle
- Zéro intersection bloc-liaison
- Paramètres externalisés
- Moteur énergie séparé
- Contour intégralement connectable
- Resize révélant contenu
- Stop propre backend

---

## 15. Architecture graphique cible

- Canvas2D bezierCurveTo
- Système thème externalisé
- Moteur énergie indépendant
- Pathfinding léger

---

## 16. Extension du contenu des blocs

Les blocs sont des conteneurs riches :
- Texte structuré
- Images
- Documents (PDF, DOCX, code source, JSON, CSV...)
- Extraits
- Métadonnées
- Références croisées
- Vidéos référencées (YouTube avec transcription)
- Audio/podcasts (transcription Whisper)
- Résultats IA validés

Conséquence :
Conception native multi-contenus.

---

## 17. Graphe global inter-espaces

### 17.1 Principe

Le graphe global est une vue où TOUS les blocs de TOUS les espaces coexistent spatialement. Les liaisons inter-espaces y sont visibles. Chaque espace forme un cluster, et la distance entre clusters reflète la proximité sémantique.

### 17.2 Double système de coordonnées

Chaque bloc possède :
- `x`, `y` : position dans son espace d’appartenance
- `x_global`, `y_global` : position dans le graphe global

Les deux systèmes sont indépendants. Déplacer un bloc dans le graphe global ne modifie pas sa position dans son espace.

### 17.3 Système de filtres

Le graphe global offre des filtres combinables (ET logique) :
- Par espace(s) — multi-sélection
- Par type de liaison
- Inter-espaces seulement (toggle)
- Par poids minimum (slider)
- Par statut de validation
- Par couleur/forme sémantique des blocs

### 17.4 Rendu visuel

- Couleur du bloc = intention sémantique (inchangée)
- Liseré de contour = couleur d’identité de l’espace
- Liaisons inter-espaces : pointillés longs, couleur déterminée par le type de liaison, épaisseur proportionnelle au poids
- Liaisons intra-espace : rendu habituel (tube fin + flux animé)

### 17.5 Garanties

- Chaque bloc a UN identifiant et UN espace d’appartenance
- Une liaison existe UNE SEULE fois (pas de duplication)
- Les filtres ne génèrent aucun doublon logique
- Performance stable avec croissance progressive du nombre de blocs (LOD spatial actif)
