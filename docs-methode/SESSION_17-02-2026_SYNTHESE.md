# SESSION 17/02/2026 — Note de synthèse

## Contexte

Session de travail sur le projet Atelier Visuel de Pensée. Application de la méthode multi-agents (METHODE_REFERENCE.md) avec phase de remédiation. Première session de codage structuré avec Claude Code sur ce projet.

---

## CONSTAT PRINCIPAL

**Le résultat produit par 12 étapes de séquençage + remédiation est fonctionnellement et visuellement inférieur à des brouillons HTML réalisés en 5-10 minutes avec des modèles moins avancés.**

### Ce qui ne fonctionne pas dans la version structurée (frontend)

- Pas de liaison créable entre blocs (non fonctionnel)
- Pas d'effets visuels (blocs plats, pas de volume 3D, pas de reflets)
- Interface quasi invisible (boutons trop petits, illisibles)
- Pas de double-clic fonctionnel pour éditer/choisir couleur
- Pas de légendes contextuelles visibles
- Pas d'animation de flux dans les liaisons
- Le CENTRAL.md §3.4 dit explicitement : "Le rendu actuel (blocs glossy/3D, liaisons lumineuses, fond sombre) est le rendu cible. Il ne doit pas être remplacé ni simplifié." → Ignoré.
- Le CENTRAL.md §3.5 dit : "Contour intégralement connectable" → Ignoré.
- Le CENTRAL.md §4.6 décrit le curseur contextuel précis → Ignoré.
- Le dossier `refrences-visuelles/` avec 3 captures de référence → Ignoré.

### Ce qui fonctionne dans la version structurée (backend)

- API REST complète (CRUD espaces, blocs, liaisons, config IA)
- Base SQLite relationnelle avec contraintes et index
- Seed automatique (2 espaces, 6 blocs démo, 4 liaisons, config IA)
- Routeur IA fonctionnel (Ollama/OpenRouter)
- Service IA Assistant avec protocole et heuristiques
- Chargement .env avec python-dotenv
- Architecture modulaire propre (Canvas isolé, bus d'événements, stores)

---

## CAUSES RACINES IDENTIFIÉES

### 1. La méthode était inadaptée au modèle

La méthode multi-agents a été conçue pour des modèles moins avancés qui ont besoin de cadrage structurel fort. Pour un modèle avancé comme Claude Opus, le sur-cadrage processif a remplacé la vision par de la conformité. L'agent a codé pour respecter les règles techniques, pas pour produire un résultat.

### 2. L'humain exclu de la boucle visuelle

L'automatisation testée (agent code en continu, valide lui-même) a supprimé les points de contrôle visuels. L'humain n'a eu aucune occasion de voir un résultat intermédiaire et de corriger la direction.

### 3. Les références visuelles ignorées

Le CENTRAL.md contenait des instructions explicites sur le rendu cible. Le dossier de références visuelles contenait 3 captures. L'agent n'a pas utilisé ces références comme contraintes.

### 4. L'agent ne regarde jamais le résultat

Claude Code code, vérifie que ça compile, passe à la suite. Il ne lance pas le navigateur pour voir le rendu. Même quand les boucles de contrôle exigent des tests visuels, l'agent les contourne.

### 5. AGENT.md non mis à jour malgré 4 rappels

Malgré 4 points de rappel dans la méthode (section 7, CONTROL_LOOP, fin de mission, checklist), l'agent n'a pas mis à jour AGENT.md spontanément. Il a fallu une demande explicite supplémentaire.

### 6. Le séquençage découpe la vision

Chaque étape est traitée isolément. L'agent qui code l'étape 3 ne voit pas ce que l'étape 8 doit produire visuellement. Le découpage est une force pour la structure, une faiblesse pour la cohérence visuelle.

---

## QUALITÉS DES BROUILLONS EXISTANTS

### Brouillon 1 — pensee-liberee-v1.html (2316 lignes)
Emplacement : `C:\Users\YAEL\Documents\PROJETS CLAUDE\brouillon\`

**Forces :**
- Blocs : 4 couches de gradient radial, reflet spéculaire (::before), contre-reflet (::after), box-shadow 8 couches
- Liaisons SVG : 5 couches (halo ambiant, liserés lumineux, tube, glow central, flux animé)
- Palette couleur contextuelle au clic droit avec légendes sémantiques
- Sélection de liaisons avec halo doré pulsant
- Détection de fusion entre blocs
- Recherche rapide Ctrl+O
- Gestion multi-espaces avec sauvegarde

**Faiblesses selon Yaya :**
- Liaisons trop grosses, trop lumineuses, trop éblouissantes
- Aspect des blocs trop métallique (pas assez végétal/vivant)

### Brouillon 2 — index-v2.html (1842 lignes)
Emplacement : `C:\Users\YAEL\Documents\PROJETS CLAUDE\brouillont 2\pensee-liberee-complete\`

**Forces :**
- Blocs : gradient linéaire + backdrop-filter blur 35px saturate 250% = effet vitreux raffiné
- Liaisons plus fines et élégantes (liseré 1.2px, 3 couches)
- Flux animé bien visible à l'intérieur des liaisons
- Fluidité générale supérieure à toutes les autres versions
- Interface claire et fonctionnelle
- A déjà un api_server.py et config.env

**Faiblesses selon Yaya :**
- Les 4 variantes de patates sont trop difficiles à distinguer (complexité inutile)

---

## VISION DE YAYA — Corrections par rapport aux brouillons

### Blocs
- Volume 3D gélule avec reflet → aspect VÉGÉTAL et VIVANT, pas métallique
- Cellulose, épaisseur organique, comme une cellule vivante
- Dégradé de couleur = bon dans les deux versions
- UNE SEULE forme patate (bord aléatoire) = idée naissante, non définie
- Cercle parfait = idée centrale, bien définie, construite
- Carré = situation structurée
- Rectangle arrondi = idée structurée
- Ovale = idée contrainte, comprimée (on sent la contrainte qui resserre)
- Chaque forme CLAIREMENT identifiable et distincte

### Liaisons (version 2 = référence de finesse)
- Deux liserés lumineux qui ÉCLAIRENT SANS ÉBLOUIR
- Remplissage central entre les deux liserés
- Mouvement visible à l'intérieur (sève, énergie, circulation)
- Ni trop fin ni trop gros — JUSTESSE
- Le sens = premier clic → deuxième clic (le flux anime dans cette direction)
- Tiennent fluidement quand on déplace les blocs

### Interactions — INVERSION par rapport aux brouillons
- La TOTALITÉ de la bordure du bloc = source de liaison (clic+glisser)
- Les petits ronds (connecteurs) = points de DÉFORMATION du bloc (main)
- Le petit carré en haut à droite = changeur de forme (clic = change)
- La légende de forme apparaît à droite du carré changeur
- Double-clic sur bloc = choix de couleur (liste descendante avec pastilles + légendes)
- Quand on clique une couleur → bloc change + légende disparaît
- Même logique pour les liaisons (palette couleur à la création)

### Interface
- Épurée MAIS VISIBLE (pas invisible comme la version structurée)
- Proche des brouillons en termes de taille et lisibilité
- Les contrôles (barre du bas) doivent être facilement lisibles

### Philosophie
- L'outil fait appel à l'intuition ET au rationnel
- Aspect organique, vivant, fluide
- Rapidité de mise en œuvre, souplesse comme l'idée qui arrive
- L'esthétique est une contrainte d'ingénierie (CENTRAL.md §7.2)

---

## DÉCISIONS PRISES

### Sur le projet
1. La version structurée (backend) est gardée comme fondation technique
2. Le frontend structuré est un ÉCHEC — à remplacer, pas à améliorer
3. Le nouveau frontend sera basé sur le meilleur des deux brouillons, connecté au backend existant
4. La connexion = remplacer localStorage par des appels fetch vers l'API REST existante

### Sur la méthode
1. La méthode actuelle reste valable pour les modèles moins avancés
2. Pour Claude Opus, une méthode différente est à créer — cadrage sur le RÉSULTAT, pas sur le PROCESSUS
3. Les références visuelles doivent être une source de vérité impérative
4. L'humain doit avoir des points de validation visuelle PENDANT le développement
5. Le ton des prompts : directif sur le résultat attendu, libre sur l'implémentation
6. Le format de transmission de l'information est à repenser (le CENTRAL.md contient tout, mais l'agent ne l'applique pas → problème de FORMAT, pas de CONTENU)

### Sur la collaboration
1. Yaya et Claude se découvrent en tant que collaborateurs de codage
2. Rien n'est figé — la méthode est à construire ensemble
3. Claude a toutes les capacités pour faire mieux que les brouillons — le problème était le cadrage, pas la compétence

---

## PLAN POUR LA PROCHAINE SESSION

### Étape 1 — Prompt de fusion
Claude (claude.ai) rédige un prompt unique et complet basé sur :
- Le CENTRAL.md (sections clés reformulées comme instructions impératives)
- La vision de Yaya (corrections par rapport aux brouillons, documentées ci-dessus)
- Les références aux deux brouillons (quoi prendre de chacun)
- L'instruction de se connecter au backend existant
- Format adapté à un modèle avancé : cible claire, liberté d'implémentation, contraintes visuelles non négociables

### Étape 2 — Exécution en dialogue
Claude Code ouvre le projet à la racine `PROJETS CLAUDE` (accès brouillons + atelier-visuel).
Travail itératif avec points de validation visuelle par l'humain :
1. Blocs (formes, couleurs, volume) → validation Yaya
2. Liaisons (finesse, animation, fluidité) → validation Yaya
3. Interface (contrôles, légendes) → validation Yaya
4. Connexion backend → validation Yaya

### Étape 3 — Intégration IA
Une fois le visuel et les fonctionnalités validés, ajout de la couche intelligence (services IA déjà prêts dans le backend).

---

## FICHIERS DE RÉFÉRENCE

| Fichier | Emplacement | Rôle |
|---------|-------------|------|
| CENTRAL.md | `atelier-visuel/` | Source de vérité projet |
| AGENT.md | `atelier-visuel/` | Mémoire partagée agents (V2 mise à jour) |
| pensee-liberee-v1.html | `brouillon/` | Brouillon 1 — référence blocs 3D |
| index-v2.html | `brouillont 2/pensee-liberee-complete/` | Brouillon 2 — référence liaisons fines + fluidité |
| Captures de référence | `atelier-visuel/refrences-visuelles/` | 3 captures visuelles cibles |
| METHODE_REFERENCE.md | `atelier-visuel/docs-methode/` | Méthode multi-agents (à adapter) |
| PROMPT_REMEDIATION.md | `atelier-visuel/` | Prompt de remédiation (exécuté, partiellement) |

---

## MOT DE FIN

Cette session est un échec de résultat mais une réussite d'apprentissage. Les causes sont identifiées, les décisions sont prises, le plan est clair. Le prochain cycle partira sur des bases radicalement différentes : cible visuelle impérative, humain dans la boucle, liberté créative pour l'agent, contrôle sur le résultat.

Yaya a raison : l'information était là. C'est le format de transmission qui doit changer. C'est à Claude de trouver ce format.
