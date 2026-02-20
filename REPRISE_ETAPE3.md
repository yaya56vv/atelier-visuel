# REPRISE SESSION — Étape 3 : Import multimodal + Conteneurs enrichis
# Date : 20 février 2026
# Projet : Atelier Visuel de Pensée

---

## 📋 CONTEXTE RAPIDE

L'Atelier Visuel de Pensée est un graphe visuel interactif (React + Canvas2D + FastAPI + SQLite).
Les étapes 1 (fondation) et 2 (liaisons, recherche, IA) sont complètes et stables.
L'étape 3 (import multimodal) est EN COURS — environ 60% réalisée.

---

## ✅ CE QUI EST FAIT (Étape 3)

### 3A — Backend Upload ✅ COMPLET
- **Fichier** : `backend/api/upload.py` (nouveau, ~210 lignes)
- **Prefix router** : `/api/upload` (dans `main.py`)
- Trois endpoints :
  - `POST /api/upload/new-bloc` → crée un bloc + stocke fichier (Form: espace_id, x, y)
  - `POST /api/upload/{bloc_id}` → ajoute fichier dans bloc existant
  - `GET /api/upload/file/{espace_id}/{bloc_id}/{filename}` → sert fichier uploadé
- ⚠️ IMPORTANT : `/new-bloc` déclaré AVANT `/{bloc_id}` (sinon FastAPI confond)
- Fonction commune `_store_file()` factorise la logique de stockage
- Stockage physique : `backend/uploads/{espace_id}/{bloc_id}/{uuid_court}.ext`
- Max 50 Mo par fichier
- Couleur automatique du bloc selon type : orange=PDF, yellow=image, green=texte, blue=autre

### 3B — Parser intelligent ✅ COMPLET
- **Fichier** : `backend/services/import_parser.py` (réécrit, ~88 lignes)
- Extraction texte PDF via `pdfplumber` (fallback PyPDF2)
- Extraction texte brut / markdown (UTF-8, fallback latin-1)
- Limite 30 000 caractères pour l'indexation
- Le texte extrait est stocké comme contenu_bloc supplémentaire type `texte` avec metadata `{"extracted": true}`
- L'indexation IA se déclenche automatiquement après upload (titre_ia, resume_ia, entites, mots_cles)

### 3C — Drag & Drop Frontend ✅ COMPLET
- **Fichier** : `frontend/src/App.tsx` (déjà implémenté avant cette session)
- Drop sur canvas vide → `uploadFileNewBloc()` → crée nouveau bloc
- Drop sur bloc existant → `uploadFileToBloc()` → ajoute contenu
- Overlay doré semi-transparent pendant le drag ("Déposer le fichier ici")
- Indicateur "Import en cours..." pendant l'upload
- Curseur `copy` pendant le survol

### 3C — BlocEditor amélioré ✅ COMPLET
- **Fichier** : `frontend/src/components/BlocEditor.tsx`
- Drop de fichier dans l'éditeur passe par le vrai upload API (plus juste le nom)
- Fichiers PDF/image affichent le **nom original** (pas le chemin technique)
- Fichiers sont **cliquables** (lien bleu, ouvre dans nouvel onglet)
- Icônes par type : 📄 PDF, 🖼️ image, 📎 fichier, 🎬 vidéo, 📝 note, 🔗 URL, 💬 citation
- **Miniatures d'images** : preview cliquable (max 120px)
- **Texte extrait** : affiché en italique gris avec préfixe "ℹ️ Extrait :"
- **Highlight drag** : halo vert pulsant sur le bloc survolé pendant un drag de fichier (engine.ts + App.tsx)

### Frontend API ✅ MIS À JOUR
- **Fichier** : `frontend/src/api.ts`
- `uploadFileToBloc(blocId, file)` → `POST /api/upload/{blocId}`
- `uploadFileNewBloc(file, espaceId, x, y)` → `POST /api/upload/new-bloc`
- `getUploadUrl(storedPath)` → `/api/upload/file/{storedPath}`

### Dépendances installées
- `pdfplumber` (Python) — extraction texte PDF
- `python-multipart` (Python) — parsing multipart/form-data FastAPI

---

## ✅ TERMINÉ DANS CETTE SESSION (20 février)

### 3C — Highlight drag ✅ COMPLET
- Halo vert pulsant sur le bloc survolé pendant le drag de fichier
- `engine.ts` : nouveau state `dragHoverBlocId` + rendu halo radial vert
- `App.tsx` : détection du bloc survolé dans `handleDragOver`, nettoyage dans `handleDragLeave`/`handleDrop`

### 3D — Visualisation multi-contenu ✅ COMPLET
- **Backend** : `GET /espaces/{id}` enrichi, chaque bloc retourne `content_types[]`
- **Frontend** : `BlocVisuel.contentTypes` propagé depuis l'API
- **Canvas** : icônes vectorielles indicatrices en bas des blocs (pill semi-transparente)
  - PDF (orange), image (bleu), vidéo (rouge), URL (lavande), fichier (gris), citation (violet)
  - Types `texte`/`note`/`tableau` filtrés
- **BlocEditor** : miniatures images cliquables, texte extrait en italique gris

### 3E — IA : stocker_document_web + importer_youtube ✅ COMPLET
- Nouvel outil `stocker_document_web(url, mode, bloc_id?, titre?)` dans `ia_tools.py`
  - 3 modes : "brut", "analyse", "les_deux"
  - Téléchargement httpx + extraction BeautifulSoup (fallback regex)
- Nouvel outil `importer_youtube(url, bloc_id?)` dans `ia_tools.py`
  - Extraction transcription via youtube-transcript-api (fr > en > auto)
  - Titre via oEmbed YouTube, thumbnail automatique
  - Bloc mauve (concept en création) avec vidéo_ref + texte transcrit
- Endpoint REST `POST /upload/youtube` + fonction frontend `importYouTube()`
- Prompt système enrichi

### 3F — Import universel multi-format ✅ COMPLET
- **Parser enrichi** (`import_parser.py`) : PDF, DOCX, JSON, CSV/TSV, Code source, Audio/Whisper, YouTube
- **Upload élargi** (`upload.py`) : 80+ extensions reconnues
  - Code : .py .js .ts .jsx .tsx .html .css .java .c .cpp .go .rs .rb .php .swift .sql .sh .ps1
  - Documents : .docx .doc .json .csv .tsv .yaml .yml .toml .xml .rst .tex
  - Audio/Podcast : .mp3 .wav .m4a .ogg .flac .aac .opus (transcription Whisper si disponible)
- **Couleurs automatiques** : code=blue, audio=violet, docx=orange, json=blue, texte=green
- **Icônes canvas** : 3 nouvelles icônes vectorielles
  - audio (ondes sonores violet), code (chevrons </> turquoise), docx (W bleu)
- **detail_type dans metadata** : détection fine propagée aux icônes via GET /espaces/{id}
- **Dépendances** : python-docx, youtube-transcript-api, beautifulsoup4

## ❌ CE QUI RESTE À FAIRE (extensions optionnelles)

### 3D+ — Modal double-clic amélioré (NON COMMENCÉ)
- Viewer PDF intégré (iframe ou pdf.js)
- Galerie images avec navigation
- Player YouTube embed

---

## 📁 FICHIERS CLÉS À CONNAÎTRE

### Backend (Python / FastAPI)
```
backend/
├── main.py                          # Point d'entrée, inclut upload.router prefix="/api/upload"
├── api/
│   ├── upload.py                    # ★ NOUVEAU — endpoints upload (3 routes)
│   ├── blocs.py                     # CRUD blocs + contenus
│   ├── espaces.py                   # CRUD espaces
│   ├── liaisons.py                  # CRUD liaisons
│   ├── config_ia.py                 # Configuration IA
│   └── ia.py                        # Endpoints IA (ask, reorganiser)
├── services/
│   ├── import_parser.py             # ★ RÉÉCRIT — extraction texte PDF/txt/md
│   ├── indexation.py                # Génère titre_ia, resume_ia, entites, mots_cles
│   ├── ia_assistant.py              # Prompt système + appels LLM
│   ├── ia_tools.py                  # Outils IA (créer_bloc, etc.)
│   └── ...
├── db/
│   ├── database.py                  # Connexion SQLite (aiosqlite)
│   └── schema.sql                   # Schéma tables
├── uploads/                         # ★ NOUVEAU — fichiers uploadés
└── .env                             # Clé OPENROUTER_API_KEY
```

### Frontend (React + TypeScript + Canvas2D)
```
frontend/src/
├── App.tsx                          # ★ MODIFIÉ — drag & drop fichiers intégré
├── api.ts                           # ★ MODIFIÉ — fonctions upload ajoutées
├── canvas/
│   ├── engine.ts                    # Moteur Canvas2D principal
│   ├── interactions.ts              # Souris, drag, zoom, pan, connecteurs
│   ├── shapes.ts                    # Rendu blocs (formes, couleurs, glow)
│   ├── links.ts                     # Rendu liaisons (courbes, glow doré)
│   ├── theme.ts                     # Palette sombre + doré
│   ├── legends.ts                   # Légende contextuelle
│   └── events.ts                    # Bus événements canvas ↔ React
├── components/
│   ├── BlocEditor.tsx               # ★ MODIFIÉ — affichage fichiers cliquables
│   ├── SidePanel.tsx                # Liste blocs + recherche
│   ├── ConsoleIA.tsx                # Chat IA
│   ├── ConfigIA.tsx                 # Config IA
│   ├── TopBar.tsx                   # Barre espace
│   └── BottomBar.tsx                # Zoom, IA, config
└── stores/
    ├── espaceStore.ts               # État espaces
    └── blocsStore.ts                # État blocs + liaisons
```

### Base de données
```
data/atelier.db                      # SQLite
```

Tables pertinentes pour l'upload :
- `contenus_bloc` : id, bloc_id, type (texte|pdf|image|fichier|...), contenu, metadata (JSON), ordre
- `blocs` : id, espace_id, x, y, forme, couleur, largeur, hauteur, titre_ia, resume_ia, entites, mots_cles

---

## ⚠️ PIÈGES CONNUS

1. **Ordre des routes FastAPI** : les routes fixes (`/new-bloc`, `/file/...`) DOIVENT être déclarées AVANT les routes dynamiques (`/{bloc_id}`), sinon FastAPI confond
2. **Pas de venv** : les packages Python sont installés en global (`--break-system-packages`)
3. **Python path** : `C:\Users\YAEL\AppData\Local\Programs\Python\Python313\python.exe`
4. **Processus Python légitimes** : STT Whisper (`pythonw.exe` port MCP) et un autre service — ne pas les tuer
5. **Doublons api.ts** : vérifier qu'il n'y a pas de fonctions dupliquées dans `frontend/src/api.ts` avant d'ajouter du code
6. **Backend reload** : uvicorn en mode `--reload` recharge automatiquement, mais parfois il faut relancer manuellement
7. **StaticFiles bloquant** : ne PAS utiliser `app.mount("/api/uploads", StaticFiles(...))` — ça a bloqué le backend. Utiliser l'endpoint `GET /api/upload/file/...` à la place

---

## 🚀 POUR REPRENDRE

1. Lire ce document
2. Lire `CENTRAL.md` pour le contexte global du projet (si temps)
3. Commencer par **3D — Visualisation multi-contenu** (la plus impactante visuellement) :
   - Ajouter des icônes indicatrices de contenus sur les blocs dans le canvas
   - Améliorer le BlocEditor avec prévisualisation inline
4. Puis **3E — IA stocker_document_web** (enrichit l'IA)
5. Puis finaliser les détails de **3C** (highlight du bloc pendant drag)

---

## 📝 COMMANDES POUR LANCER LE PROJET

```bash
# Terminal 1 — Backend
cd "C:\Users\YAEL\Documents\PROJETS CLAUDE\atelier-visuel\backend"
python main.py
# → http://127.0.0.1:8000

# Terminal 2 — Frontend
cd "C:\Users\YAEL\Documents\PROJETS CLAUDE\atelier-visuel\frontend"
npm run dev
# → http://localhost:3000
```
