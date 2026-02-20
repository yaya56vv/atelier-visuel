# REPRISE_ETAPE4.md — Intégration Filesystem & Scan Différentiel

## Contexte
Étape 4 de CENTRAL.md §10.2 — Concept original unique.
Le système de fichiers du PC devient navigable par sens sémantique dans le graphe.

## 4A — Fondation : tables, API, service de scan ✅ COMPLET

### Base de données (schema.sql)
3 nouvelles tables :
- **dossiers_surveilles** : dossiers du PC que l'utilisateur choisit de surveiller
  - Champs : chemin_absolu, nom, actif, profondeur_max, extensions_filtre, espace_id
  - Le filtre d'extensions permet de limiter (ex: [".pdf", ".md", ".py"] seulement)
- **fichiers_indexes** : chaque fichier connu du graphe
  - Champs : chemin_absolu/relatif, nom, extension, taille, hash SHA-256, date_modification, statut
  - Statuts : actif, modifie, supprime, deplace, nouveau
  - Lien optionnel vers un bloc (bloc_id) pour l'intégration graphe
- **journal_scan** : historique des scans différentiels
  - Compteurs par catégorie, durée, détails JSON

### API REST (api/filesystem.py)
- `GET    /api/filesystem/dossiers` → liste dossiers surveillés + compteur fichiers
- `POST   /api/filesystem/dossiers` → ajoute un dossier (vérifie existence + scan immédiat)
- `DELETE /api/filesystem/dossiers/{id}` → retire (blocs graphe préservés)
- `PUT    /api/filesystem/dossiers/{id}` → modifie paramètres
- `POST   /api/filesystem/scan` → scan tous les dossiers actifs
- `POST   /api/filesystem/scan/{id}` → scan un seul dossier
- `GET    /api/filesystem/rapport` → derniers rapports par dossier
- `GET    /api/filesystem/fichiers/{id}` → fichiers indexés, filtrable par statut

### Service scan différentiel (services/scan_diff.py)
Algorithme :
1. Charge l'index existant (par chemin + par hash)
2. Parcourt le système de fichiers réel
3. Comparaison différentielle :
   - Nouveau : sur disque mais pas dans l'index
   - Modifié : dans les deux mais hash/taille/date différents
   - Supprimé : dans l'index mais plus sur disque
   - Déplacé : même hash trouvé à un chemin différent
4. Met à jour l'index + écrit le journal

Optimisations :
- Hash partiel pour fichiers > 50Mo (début+milieu+fin+taille)
- Ignore automatique : __pycache__, node_modules, .git, .exe, .dll, .pyc, etc.
- Filtre d'extensions configurable par dossier
- Profondeur max configurable

### Frontend (api.ts)
Interfaces TypeScript + fonctions d'appel pour tous les endpoints.

### Enregistrement
Router monté dans main.py : `/api/filesystem`

## Ce qui reste (4B, 4C, 4D)

### 4B — Intégration des fichiers dans le graphe
- Créer des blocs pour les fichiers indexés (avec couleur/forme selon type)
- Extraction de texte pour l'indexation IA (réutilise import_parser)
- Liaisons automatiques entre fichiers d'un même dossier

### 4C — Navigation par sens
- Vue spéciale dans le SidePanel pour naviguer les fichiers par tags sémantiques
- Regroupement spatial automatique par type/thématique
- Double-clic sur bloc fichier → ouvre le fichier natif

### 4D — Interface utilisateur du scan
- Panneau de configuration des dossiers surveillés
- Rapport de scan au démarrage avec actions proposées
- Badge/notification quand des changements sont détectés
