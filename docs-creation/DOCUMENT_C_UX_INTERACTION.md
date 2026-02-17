# DOCUMENT C — UX & INTERACTION DESIGN

**Version consolidée unique — Source de vérité**

**Projet :** Projet 1 — Atelier Visuel de Pensée
**Date :** 14/02/2026
**Statut :** Document maître consolidé

---

## 1. Organisation générale de l'interface

L'interface est structurée en quatre zones principales :

- Zone centrale : espace graphe
- Bande latérale gauche : explorateur documentaire
- Barre supérieure : gestion des espaces
- Barre inférieure : commandes globales et IA

## 2. Zone centrale — Espace Graphe

### 2.1 Fonction

La zone centrale constitue l'espace principal d'interaction.

Elle permet :

- création de blocs
- manipulation spatiale
- visualisation relationnelle
- interaction directe avec l'IA

### 2.2 Comportement par défaut

En mode normal :

- espace vierge
- blocs manipulables
- seules liaisons ancrées visibles

## 3. Bande latérale gauche — Explorateur documentaire

### 3.1 Apparence

Une ligne verticale discrète, continue, est visible sur toute la hauteur gauche de l'écran.

Caractéristiques :

- fine
- permanente
- non intrusive
- saisissable à la souris

### 3.2 Déploiement

Action : cliquer et tirer la ligne vers le centre.

Résultat : ouverture progressive d'un panneau latéral, jusqu'à largeur maximale prédéfinie.

### 3.3 Contenu du panneau

#### 3.3.1 Zone de recherche

- champ de recherche unique
- recherche sémantique
- filtres dynamiques
- recherche multi-critères (texte, couleur, forme, tags, statut, date)

Commande vocale possible.

#### 3.3.2 Filtres

Filtres disponibles :

- type de contenu
- mots-clés
- entités
- date
- couleur
- forme
- statut

#### 3.3.3 Explorateur documentaire

Affichage :

- liste structurée ou arborescente
- triable par critère

Chaque entrée présente :

- titre IA
- extrait
- métadonnées principales

Navigation :

- sélection → centrage + zoom
- commande vocale possible

### 3.4 Types de contenus internes des blocs

Un bloc peut contenir un ou plusieurs types :

- Texte
- Note
- URL
- Page web résumée
- PDF
- Image
- Vidéo référencée
- Fichier local
- Citation
- Pièce jointe
- Tableau simple

Le type principal détermine l'icône affichée dans le canvas.

## 4. Barre supérieure — Gestion des espaces

### 4.1 Icône des espaces

Position : à gauche du titre central, sur la même ligne horizontale.
Jamais exilée dans le coin gauche de l'écran.

### 4.2 Fonction

Permet :

- création d'un espace
- changement d'espace
- sélection thématique

### 4.3 Création d'espace — Règles strictes

- choix obligatoire de thème
- aucune création implicite
- création et gestion sont deux actions distinctes

### 4.4 Comportement au lancement

Au lancement :

- panneau de choix de thème affiché automatiquement
- l'utilisateur choisit un thème ou un espace existant
- aucun espace n'est créé sans validation explicite

## 5. Workflow IA de création assistée d'espace

Étapes :

1. Requête utilisateur
2. Proposition IA
3. Validation
4. Génération du graphe
5. Mise en lumière (analyse)

L'IA propose :

- structure initiale
- sources potentielles
- schéma de blocs

La génération n'intervient qu'après validation.

## 6. Barre inférieure — Commandes globales

Toujours centrée en bas de l'écran.

Inclut :

- Enregistrer
- Recentrer
- Zoom
- Effacer espace
- Activation / désactivation IA observatrice
- Bouton Stop

## 7. Console IA textuelle

Position :

- panneau vertical droit
- translucide
- jamais modale centrale
- graphe visible derrière
- état conservé entre sessions

Structure :

- historique en haut
- zone de saisie en bas
- vocal et texte possibles

Ce que la console n'est pas :

- pas une popup
- pas un overlay opaque
- pas une modale bloquante

## 8. Interaction vocale prioritaire

Le vocal est mode primaire.

Au lancement :

- micro actif
- assistant à l'écoute
- texte en fallback

Architecture obligatoire :

- STT temps réel
- TTS
- détection commande vs dictée
- feedback sonore

Le vocal n'est pas optionnel ni ultérieur.

## 9. Interaction avec les blocs

### 9.1 Curseur contextuel

Sur bloc :

- clic simple → sélection / couleur
- double-clic → ouverture

Sur bordure :

- glisser → déplacement
- double-clic → mode déformation

Sur connecteur :

- glisser → création liaison

### 9.2 Déformation

Mode spécifique permettant modification de forme sans altération du contenu.

## 10. Contenu des blocs

### 10.1 Ouverture

Double-clic → fenêtre d'édition contextuelle.

### 10.2 Édition

Contient :

- zone texte
- import
- gestion contenus internes

### 10.3 Dépôt direct

- glisser fichier sur bloc
- coller contenu

## 11. Redimensionnement révélateur

Principe :

- agrandir → révèle contenu
- réduire → masque secondaire
- jamais d'espace vide
- taille reflète contenu révélé

## 12. Navigation spatiale

Zoom progressif continu.

À distance : blocs deviennent points lumineux.

Recentrage : retour au centre actif.

## 13. Mode IA observatrice

Peut :

- analyser graphe
- proposer liens
- suggérer blocs

Validation obligatoire avant action.

## 14. Bouton Stop — Arrêt propre

Doit :

- arrêter backend
- fermer client
- nettoyer processus
- fournir feedback visuel

Processus zombie = défaut critique.

## 15. États système

- normal
- sélection
- édition bloc
- interaction IA vocale
- interaction IA textuelle
- filtrage actif
- mode réorganisation IA

## 16. Invariants UX

Le système ne doit jamais introduire :

- menus complexes
- panneaux permanents intrusifs
- interactions indirectes
- configuration préalable obligatoire
