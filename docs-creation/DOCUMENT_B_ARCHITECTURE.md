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
- type_liaison
- created_at

Types V1 :
- Relation simple
- Liaison logique
- Liaison tension
- Liaison ancrée (toujours visible)

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

Espaces V1 :
- IDÉES
- CONCEPTION

Palette identique.
Influence uniquement interprétative.

---

## 10. Invariants architecturaux V1

Interdits :
1. Pondération algorithmique
2. Hiérarchie parent-enfant
3. Fusion automatique destructive
4. Personnalisation avancée du graphe
5. Moteur IA permanent

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
- Documents
- Extraits
- Métadonnées
- Références croisées
- Liens inter-espaces
- Résultats IA validés

Conséquence :
Conception native multi-contenus.
