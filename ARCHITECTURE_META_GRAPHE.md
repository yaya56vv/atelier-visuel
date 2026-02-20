# ARCHITECTURE_META_GRAPHE.md — Graphe Global Inter-Espaces

## Version : Proposition V1
## Date : 20/02/2026

---

## 1. DIAGNOSTIC DE L'EXISTANT

### 1.1 Points de friction identifiés

**Table `liaisons` actuelle — trop restrictive :**
```sql
-- ACTUEL : les deux blocs DOIVENT appartenir au même espace
espace_id TEXT NOT NULL REFERENCES espaces(id)
type TEXT CHECK(type IN ('simple','logique','tension','ancree'))
```
- Le champ `espace_id` est redondant (on peut le déduire des blocs) ET bloquant (empêche les liens inter-espaces)
- Seulement 4 types de liaison → insuffisant pour ta vision (8 types)
- Pas de poids, pas d'origine, pas de validation

**Frontend `blocsStore` — monoespace :**
- `useBlocsStore(espaceActifId)` charge un seul espace à la fois
- Pas de mode "tous les espaces"

**Canvas `LiaisonVisuelle` — modèle trop simple :**
```ts
// ACTUEL
{ id, sourceId, cibleId, type: 'simple'|'logique'|'tension'|'ancree', couleur }
```
- Pas de poids, pas d'origine, pas de notion inter-espace

**API `liaisons.py` — vérifie que les deux blocs sont dans le MÊME espace :**
```python
# ACTUEL — bloquant
for bid in (data.bloc_source_id, data.bloc_cible_id):
    rows = await db.execute("SELECT id FROM blocs WHERE id = ? AND espace_id = ?", ...)
```

### 1.2 Ce qui est sain et reste

- Les blocs ont un `espace_id` → chaque bloc a un espace d'appartenance. Ça reste.
- L'identifiant unique des blocs est global (UUID) → pas de conflit entre espaces. Parfait.
- Le Canvas sait déjà dessiner des blocs et liaisons sans se soucier des espaces. Bon.
- Le système de couleurs/formes des blocs (grammaire sémantique) est indépendant du concept d'espace.

---

## 2. PROPOSITION D'ARCHITECTURE

### 2.1 Principe fondateur : UN modèle de liaison unifié

On ne crée PAS une table séparée pour les "liaisons inter-espaces". On **enrichit le modèle unique** de liaison pour qu'il fonctionne à la fois en intra et en inter-espace. La distinction intra/inter est une PROPRIÉTÉ DÉRIVÉE, pas une catégorie structurelle.

> Une liaison relie deux blocs. Point. Que ces blocs soient dans le même espace ou dans des espaces différents est une information contextuelle, pas un type.

### 2.2 Nouveau modèle de liaison (table SQL)

```sql
CREATE TABLE IF NOT EXISTS liaisons (
    id TEXT PRIMARY KEY,
    
    -- Blocs reliés (la seule chose qui compte structurellement)
    bloc_source_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    bloc_cible_id TEXT NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    
    -- Sémantique enrichie
    type TEXT NOT NULL DEFAULT 'simple' CHECK(type IN (
        -- V1 originaux
        'simple', 'logique', 'tension', 'ancree',
        -- Nouveaux types inter/intra
        'prolongement', 'fondation', 'complementarite',
        'application', 'analogie', 'dependance', 'exploration'
    )),
    poids REAL DEFAULT 1.0 CHECK(poids >= 0.0 AND poids <= 1.0),
    
    -- Traçabilité
    origine TEXT DEFAULT 'manuel' CHECK(origine IN ('manuel', 'auto', 'ia_suggestion')),
    validation TEXT DEFAULT 'valide' CHECK(validation IN ('valide', 'en_attente', 'rejete')),
    
    -- Métadonnées
    label TEXT,                  -- étiquette optionnelle affichable
    metadata TEXT,               -- JSON libre
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Changements clés :**
1. **Suppression de `espace_id`** sur les liaisons — une liaison appartient à ses blocs, pas à un espace
2. **11 types de liaison** (4 originaux + 7 nouveaux de ta spec — `complementarite` sans accent pour la contrainte SQL)
3. **Poids** (0.0 à 1.0) — permet le positionnement par proximité sémantique dans le graphe global
4. **Origine** — distingue les liaisons manuelles des suggestions IA et des détections automatiques
5. **Validation** — les suggestions IA arrivent en `en_attente`, l'utilisateur valide ou rejette
6. **Label** — texte optionnel sur la liaison (ex: "ce code implémente cette idée")

**Propriété dérivée `inter_espace`** — calculée par SQL ou en mémoire :
```sql
-- Exemple de requête : liaisons inter-espaces
SELECT l.*, 
       bs.espace_id AS espace_source, 
       bc.espace_id AS espace_cible,
       (bs.espace_id != bc.espace_id) AS inter_espace
FROM liaisons l
JOIN blocs bs ON l.bloc_source_id = bs.id
JOIN blocs bc ON l.bloc_cible_id = bc.id
```

### 2.3 Migration de l'ancien schéma

La migration doit :
1. Ajouter les nouvelles colonnes (`poids`, `origine`, `validation`, `label`, `metadata`, `updated_at`)
2. Élargir la contrainte CHECK sur `type` (SQLite ne permet pas ALTER CHECK → on recrée la table)
3. Supprimer la dépendance à `espace_id` sur les liaisons (les données existantes gardent la valeur mais elle n'est plus contraignante)
4. Recalculer les index

```python
# Stratégie de migration :
# 1. Créer liaisons_new avec le nouveau schéma
# 2. INSERT INTO liaisons_new SELECT ... FROM liaisons (avec valeurs par défaut)
# 3. DROP liaisons
# 4. ALTER TABLE liaisons_new RENAME TO liaisons
# 5. Recréer les index
```

### 2.4 Endpoint graphe global (nouvelle API)

```
GET /api/graphe-global
    ?espaces=id1,id2,id3          -- filtre par espace(s), vide = tous
    &types_liaison=tension,analogie -- filtre par type de liaison
    &inter_seulement=true          -- uniquement les liaisons inter-espaces
    &poids_min=0.3                 -- poids minimum
    &validation=valide             -- filtre par statut de validation
```

Retourne :
```json
{
  "espaces": [
    { "id": "...", "nom": "IDÉES", "theme": "réflexion", "couleur_espace": "#4A6741" }
  ],
  "blocs": [
    { "id": "...", "espace_id": "...", "x": 200, "y": 300, ...tout le bloc standard... }
  ],
  "liaisons": [
    { 
      "id": "...", 
      "bloc_source_id": "...", "bloc_cible_id": "...",
      "type": "analogie", "poids": 0.8,
      "origine": "ia_suggestion", "validation": "valide",
      "inter_espace": true,
      "espace_source": "...", "espace_cible": "..."
    }
  ]
}
```

### 2.5 Positions dans le graphe global

**Problème** : un bloc a une seule position (x, y) qui est relative à son espace. Dans le graphe global, tous les blocs doivent coexister spatialement.

**Solution : double système de coordonnées.**

```sql
-- Ajout à la table blocs :
ALTER TABLE blocs ADD COLUMN x_global REAL;
ALTER TABLE blocs ADD COLUMN y_global REAL;
```

- `x`, `y` : position dans l'espace d'appartenance (inchangé)
- `x_global`, `y_global` : position dans le graphe global

**Calcul initial des positions globales :**
- À la première activation du graphe global, un algorithme positionne les espaces en clusters
- Les blocs d'un même espace sont regroupés spatialement
- La distance entre clusters reflète la proximité sémantique inter-espaces
- L'utilisateur peut ensuite déplacer librement les blocs dans le graphe global (positions persistées)

**Algorithme de positionnement initial :**
```
1. Pour chaque espace, calculer un centroïde global
   - Distance entre centroïdes = f(nombre de liaisons inter-espaces, poids moyen)
   - Plus il y a de liaisons fortes entre deux espaces, plus ils sont proches
2. Placer les blocs de chaque espace autour de leur centroïde
   - En conservant les positions relatives (x, y) de l'espace
   - Avec un facteur d'échelle pour éviter les chevauchements
```

---

## 3. GESTION VISUELLE DES COULEURS

### 3.1 La décision : la couleur du bloc reste sémantique

La couleur principale du bloc continue de représenter **l'intention sémantique** (vert=matière, orange=tension, etc.) telle que définie dans CENTRAL.md §5.2. C'est le cœur de la grammaire visuelle, on ne la sacrifie pas.

### 3.2 L'espace d'appartenance : un marqueur secondaire

L'espace d'appartenance est identifié par :

1. **Un liseré de contour coloré** — chaque espace a une couleur d'identité (attribuée automatiquement ou choisie)
2. **Un badge ou pastille** — petit indicateur dans le coin du bloc
3. **Le système de filtres** — permet d'isoler visuellement un ou plusieurs espaces

```sql
-- Ajout à la table espaces :
ALTER TABLE espaces ADD COLUMN couleur_identite TEXT DEFAULT '#667788';
```

Palette de couleurs d'identité des espaces (distincte de la palette sémantique des blocs) :
```
#4A6741  -- vert forêt
#6B4A7A  -- prune
#4A6B8A  -- bleu acier
#8A6B4A  -- terre
#6B8A4A  -- mousse
#8A4A5A  -- bordeaux
#4A8A7A  -- turquoise
#7A7A4A  -- olive
```

### 3.3 Couleurs des liaisons dans le graphe global

**Liaisons intra-espace** : comportement actuel (héritent la couleur du bloc source)

**Liaisons inter-espaces** : couleur déterminée par le **type de liaison** :

| Type | Couleur RGB | Signification visuelle |
|------|-------------|----------------------|
| prolongement | `180,200,255` | bleu clair — continuité |
| fondation | `200,160,255` | violet clair — profondeur |
| tension | `255,160,120` | orange — friction |
| complémentarité | `160,255,200` | vert clair — enrichissement |
| application | `255,220,140` | jaune — concrétisation |
| analogie | `200,200,255` | lavande — résonance |
| dépendance | `255,180,180` | rose — nécessité |
| exploration | `200,180,255` | mauve — hypothèse |

Ces couleurs sont volontairement **désaturées et claires** pour se distinguer des couleurs sémantiques des blocs (qui sont vives et saturées).

### 3.4 Mode de rendu des liaisons inter-espaces

Les liaisons inter-espaces ont un rendu visuel distinct :
- **Trait en pointillés longs** (dash: [15, 8]) au lieu du trait continu des liaisons intra
- **Poids visible** : épaisseur proportionnelle au poids (1px à 4px)
- **Label optionnel** affiché au milieu de la courbe
- **Badge de type** : petit symbole au point médian (→ pour prolongement, ⚡ pour tension, etc.)

---

## 4. SYSTÈME DE FILTRES DANS LE GRAPHE GLOBAL

### 4.1 Filtres disponibles

L'explorateur documentaire (panneau gauche) propose ces filtres en mode graphe global :

| Filtre | Type | Effet |
|--------|------|-------|
| **Par espace** | Multi-sélection | Affiche uniquement les blocs des espaces cochés + leurs liaisons (intra et inter) |
| **Par type de liaison** | Multi-sélection | Affiche uniquement les liaisons du/des type(s) sélectionné(s) |
| **Inter seulement** | Toggle | Cache les liaisons intra-espace, ne montre que les ponts |
| **Par poids** | Slider | Masque les liaisons sous le seuil de poids |
| **Par validation** | Toggle | Affiche/masque les liaisons `en_attente` |
| **Par couleur bloc** | Sélection | Filtre sémantique habituel (vert, orange...) |
| **Par forme** | Sélection | Filtre épistémique habituel |

### 4.2 Combinaison de filtres

Les filtres se combinent en **ET logique** :
- Espace "IDÉES" + type "tension" + poids > 0.5 → uniquement les tensions fortes dans IDÉES et vers/depuis IDÉES

### 4.3 Pas de duplication logique

**Garantie d'unicité :**
- Chaque bloc a UN SEUL identifiant et UN SEUL espace d'appartenance
- Une liaison inter-espace apparaît UNE SEULE fois (pas dupliquée par espace)
- Le filtre par espace montre les blocs de cet espace ET les liaisons qui touchent au moins un de ses blocs

---

## 5. MODIFICATIONS FRONTEND

### 5.1 Nouveau type `LiaisonVisuelle` enrichi

```typescript
export type TypeLiaison = 
  | 'simple' | 'logique' | 'tension' | 'ancree'
  | 'prolongement' | 'fondation' | 'complementarite'
  | 'application' | 'analogie' | 'dependance' | 'exploration'

export interface LiaisonVisuelle {
  id: string
  sourceId: string
  cibleId: string
  type: TypeLiaison
  couleur: Couleur    // héritée du bloc source (intra) ou du type (inter)
  poids: number       // 0.0 à 1.0
  origine: 'manuel' | 'auto' | 'ia_suggestion'
  validation: 'valide' | 'en_attente' | 'rejete'
  interEspace: boolean
  label?: string
}
```

### 5.2 `BlocVisuel` enrichi

```typescript
export interface BlocVisuel {
  // ...existant...
  espaceId: string           // pour le graphe global
  espaceNom?: string         // pour l'affichage
  espaceCouleur?: string     // couleur d'identité de l'espace
  xGlobal?: number           // position dans le graphe global
  yGlobal?: number
}
```

### 5.3 Mode de vue du Canvas

```typescript
type VueMode = 'espace' | 'global'
```

Le `CanvasEngine` reçoit un `mode` :
- `'espace'` : comportement actuel (un seul espace, positions x/y)
- `'global'` : tous les blocs, positions x_global/y_global, liseré d'espace, liaisons inter visibles

### 5.4 `blocsStore` → supporte les deux modes

Le store actuel `useBlocsStore(espaceActifId)` devient :

```typescript
function useBlocsStore(mode: 'espace' | 'global', espaceActifId?: string | null)
```

- Mode `espace` + espaceActifId : comportement actuel
- Mode `global` : charge via `GET /api/graphe-global` avec les filtres actifs

---

## 6. PLAN D'IMPLÉMENTATION

### Phase 1 : Migration du modèle de données (fondation)
1. Nouveau schéma `liaisons` avec tous les champs
2. Migration automatique dans `database.py`
3. Ajout `x_global`, `y_global` aux blocs
4. Ajout `couleur_identite` aux espaces
5. Mise à jour des index

### Phase 2 : API enrichie (plomberie)
1. Modifier `api/liaisons.py` pour supporter le nouveau modèle
   - Supprimer la vérification "même espace"
   - Supporter les nouveaux types, poids, origine, validation
2. Créer `GET /api/graphe-global` avec filtres
3. Endpoint de suggestion IA de liaisons inter-espaces

### Phase 3 : Frontend — Canvas global (rendu)
1. Types TypeScript enrichis
2. `blocsStore` bi-mode
3. `CanvasEngine` mode global (liseré d'espace, positions globales)
4. Rendu des liaisons inter-espaces (pointillés, couleur par type, poids = épaisseur)
5. TopBar : toggle espace/global

### Phase 4 : Filtres dans l'explorateur (interaction)
1. Panneau de filtres étendu en mode global
2. Multi-sélection espaces
3. Filtre par type de liaison, poids, validation
4. Combinaison des filtres

### Phase 5 : IA et positionnement (intelligence)
1. Algorithme de positionnement initial des clusters
2. Suggestions IA de liaisons inter-espaces (via service existant)
3. Badge de validation dans l'interface

---

## 7. REMARQUES ET PROPOSITIONS COMPLÉMENTAIRES

### 7.1 Rétrocompatibilité totale

L'ancien `espace_id` sur les liaisons est supprimé du schéma mais l'information reste disponible via les blocs. Aucune liaison existante n'est perdue. Les 4 types originaux restent valides.

### 7.2 Performance avec croissance

- Le graphe global avec 2000+ blocs et 5000+ liaisons nécessitera un LOD (Level of Detail) spatial — déjà implémenté dans le canvas (mode constellation pour les blocs éloignés)
- Les filtres sont appliqués côté API (SQL) → le frontend ne reçoit que les données filtrées
- L'index sur `bloc_source_id` et `bloc_cible_id` garantit des jointures rapides

### 7.3 Le poids comme clé de la topologie globale

Le poids est l'information la plus stratégique du nouveau modèle. C'est lui qui détermine :
- La proximité visuelle entre espaces dans le graphe global
- L'épaisseur visuelle des liaisons
- Le seuil de filtrage (masquer les liaisons faibles)
- La pertinence des suggestions IA

Le poids peut être :
- Manuel (l'utilisateur le fixe)
- Automatique (l'IA le calcule selon la similarité sémantique)
- Mixte (suggestion IA validée/ajustée par l'utilisateur)

### 7.4 Les liaisons `en_attente` — le feed de l'intelligence

Quand l'IA détecte une relation potentielle entre deux blocs d'espaces différents, elle crée une liaison `en_attente` avec `origine='ia_suggestion'`. L'utilisateur voit un badge notification et peut accepter ou rejeter. C'est le flux de découverte : l'IA révèle des connexions que l'humain n'a pas vues.

### 7.5 Vers les espaces de recherche

Ce modèle rend les "espaces de recherche" du CENTRAL.md §8.7 naturels : chaque recherche est un espace, et ses liens avec les autres espaces émergent organiquement via les liaisons inter-espaces. Le filesystem (étape 4) en bénéficie directement : un fichier peut être relié à des blocs dans plusieurs espaces.
