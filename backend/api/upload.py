"""API — Upload de fichiers dans les blocs.

Flux :
1. POST /api/upload/new-bloc     →  crée un bloc + stocke le fichier
2. POST /api/upload/{bloc_id}    →  ajoute un fichier dans un bloc existant
3. GET  /api/upload/file/{path}  →  sert un fichier uploadé
"""

import os
import uuid
import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from db.database import get_db
from services.import_parser import parse_uploaded_file
from services.indexation import indexer_bloc

router = APIRouter()

# Répertoire racine des uploads
UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Types MIME acceptés → type contenu_bloc
MIME_MAP = {
    # Documents
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "fichier",  # docx
    "application/msword": "fichier",  # doc
    # Images
    "image/png": "image",
    "image/jpeg": "image",
    "image/webp": "image",
    "image/gif": "image",
    "image/svg+xml": "image",
    # Texte
    "text/plain": "texte",
    "text/markdown": "texte",
    "text/html": "texte",
    "text/css": "texte",
    "text/csv": "fichier",
    # Code / Data
    "application/json": "fichier",
    "application/javascript": "texte",
    "text/javascript": "texte",
    "application/xml": "texte",
    "text/xml": "texte",
    "application/x-yaml": "texte",
    # Audio
    "audio/mpeg": "fichier",
    "audio/mp3": "fichier",
    "audio/wav": "fichier",
    "audio/ogg": "fichier",
    "audio/flac": "fichier",
    "audio/m4a": "fichier",
    "audio/x-m4a": "fichier",
}

# Extensions acceptées en fallback → type contenu_bloc
EXT_MAP = {
    # Documents
    ".pdf": "pdf",
    ".docx": "fichier",
    ".doc": "fichier",
    # Images
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".webp": "image",
    ".gif": "image",
    ".svg": "image",
    # Texte / Markdown
    ".txt": "texte",
    ".text": "texte",
    ".md": "texte",
    ".markdown": "texte",
    ".mdx": "texte",
    # Code Python
    ".py": "texte",
    ".pyw": "texte",
    ".pyi": "texte",
    # Code JavaScript / TypeScript
    ".js": "texte",
    ".jsx": "texte",
    ".ts": "texte",
    ".tsx": "texte",
    ".mjs": "texte",
    # Code Web
    ".html": "texte",
    ".htm": "texte",
    ".css": "texte",
    ".scss": "texte",
    # Code divers
    ".java": "texte",
    ".c": "texte",
    ".cpp": "texte",
    ".h": "texte",
    ".cs": "texte",
    ".go": "texte",
    ".rs": "texte",
    ".rb": "texte",
    ".php": "texte",
    ".swift": "texte",
    ".sql": "texte",
    ".sh": "texte",
    ".bash": "texte",
    ".ps1": "texte",
    ".bat": "texte",
    # Config / Data
    ".json": "fichier",
    ".csv": "fichier",
    ".tsv": "fichier",
    ".yaml": "texte",
    ".yml": "texte",
    ".toml": "texte",
    ".ini": "texte",
    ".cfg": "texte",
    ".env": "texte",
    ".xml": "texte",
    # Documentation
    ".rst": "texte",
    ".tex": "texte",
    ".org": "texte",
    ".log": "texte",
    # Audio / Podcast
    ".mp3": "fichier",
    ".wav": "fichier",
    ".m4a": "fichier",
    ".ogg": "fichier",
    ".flac": "fichier",
    ".aac": "fichier",
    ".opus": "fichier",
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 Mo


# Extensions de code source (pour détection spécifique)
CODE_EXTENSIONS = {
    ".py", ".pyw", ".pyi", ".js", ".jsx", ".ts", ".tsx", ".mjs",
    ".html", ".htm", ".css", ".scss", ".java", ".c", ".cpp", ".h",
    ".cs", ".go", ".rs", ".rb", ".php", ".swift", ".sql", ".sh",
    ".bash", ".ps1", ".bat",
}

AUDIO_EXTENSIONS_SET = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac", ".opus"}


def detect_content_type(filename: str, content_type: str | None) -> str:
    """Détermine le type de contenu_bloc à partir du MIME ou de l'extension."""
    ext = Path(filename).suffix.lower()
    
    # Détection fine par extension d'abord (plus fiable que MIME)
    if ext == ".docx" or ext == ".doc":
        return "fichier"  # sera parsé comme DOCX par import_parser
    if ext in AUDIO_EXTENSIONS_SET:
        return "fichier"  # sera parsé comme audio par import_parser
    if ext == ".json":
        return "fichier"  # sera parsé comme JSON par import_parser
    if ext in (".csv", ".tsv"):
        return "fichier"  # sera parsé comme CSV par import_parser
    
    if content_type and content_type in MIME_MAP:
        return MIME_MAP[content_type]
    return EXT_MAP.get(ext, "fichier")


async def _store_file(content: bytes, espace_id: str, bloc_id: str, original_filename: str, file_content_type: str | None):
    """Stocke un fichier et crée le contenu_bloc. Retourne (contenu_id, content_type, relative_path, extracted_text)."""
    db = await get_db()
    content_type = detect_content_type(original_filename, file_content_type)

    # Répertoire de stockage
    bloc_upload_dir = UPLOADS_DIR / espace_id / bloc_id
    bloc_upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(original_filename).suffix.lower() or ".bin"
    stored_filename = f"{uuid.uuid4().hex[:12]}{ext}"
    file_path = bloc_upload_dir / stored_filename

    with open(file_path, "wb") as f:
        f.write(content)

    relative_path = f"{espace_id}/{bloc_id}/{stored_filename}"
    now = datetime.now(timezone.utc).isoformat()
    contenu_id = str(uuid.uuid4())

    # Compter les contenus existants pour l'ordre
    existing = await db.execute_fetchall(
        "SELECT COUNT(*) as cnt FROM contenus_bloc WHERE bloc_id = ?", (bloc_id,)
    )
    ordre = dict(existing[0])["cnt"]

    # Détection fine du sous-type pour les icônes
    detail_type = None
    if ext in CODE_EXTENSIONS:
        detail_type = "code"
    elif ext in (".docx", ".doc"):
        detail_type = "docx"
    elif ext in AUDIO_EXTENSIONS_SET:
        detail_type = "audio"
    elif ext == ".json":
        detail_type = "json"
    elif ext in (".csv", ".tsv"):
        detail_type = "csv"

    metadata = json.dumps({
        "original_filename": original_filename,
        "stored_path": relative_path,
        "size_bytes": len(content),
        "mime_type": file_content_type,
        **({
            "detail_type": detail_type,
        } if detail_type else {}),
    }, ensure_ascii=False)

    await db.execute(
        """INSERT INTO contenus_bloc (id, bloc_id, type, contenu, metadata, ordre, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (contenu_id, bloc_id, content_type, relative_path, metadata, ordre, now),
    )
    await db.commit()

    # Extraire le texte (PDF, texte brut, etc.)
    extracted_text = await parse_uploaded_file(str(file_path), content_type, original_filename)

    if extracted_text:
        texte_id = str(uuid.uuid4())
        await db.execute(
            """INSERT INTO contenus_bloc (id, bloc_id, type, contenu, metadata, ordre, created_at)
               VALUES (?, ?, 'texte', ?, ?, ?, ?)""",
            (texte_id, bloc_id, extracted_text,
             json.dumps({"source": original_filename, "extracted": True}, ensure_ascii=False),
             ordre + 1, now),
        )
        await db.commit()

    # Indexer via IA
    await indexer_bloc(bloc_id)

    # Mettre à jour updated_at du bloc
    await db.execute("UPDATE blocs SET updated_at = ? WHERE id = ?", (now, bloc_id))
    await db.commit()

    return contenu_id, content_type, relative_path, extracted_text


# ══════════════════════════════════════════════════════════════
# YOUTUBE — Import de vidéo par URL
# ══════════════════════════════════════════════════════════════

from pydantic import BaseModel

class YouTubeImportRequest(BaseModel):
    url: str
    espace_id: str
    x: float = 0
    y: float = 0
    bloc_id: str | None = None  # Si fourni, ajoute au bloc existant


@router.post("/youtube", status_code=201)
async def import_youtube(data: YouTubeImportRequest):
    """Importe une vidéo YouTube : stocke l'URL + extrait la transcription pour indexation."""
    from services.import_parser import parse_youtube_url

    db = await get_db()
    now = datetime.now(timezone.utc).isoformat()

    # Extraire les infos YouTube
    yt = await parse_youtube_url(data.url)

    if not yt.get("video_id"):
        raise HTTPException(status_code=400, detail=yt.get("error", "URL YouTube invalide"))

    bloc_id = data.bloc_id
    titre = yt.get("title") or f"YouTube: {yt['video_id']}"
    created_new = False

    # Créer un nouveau bloc si nécessaire
    if not bloc_id:
        bloc_id = str(uuid.uuid4())
        await db.execute(
            """INSERT INTO blocs (id, espace_id, x, y, forme, couleur, largeur, hauteur, titre_ia, created_at, updated_at)
               VALUES (?, ?, ?, ?, 'rounded-rect', 'mauve', 240, 140, ?, ?, ?)""",
            (bloc_id, data.espace_id, data.x, data.y, titre[:60], now, now),
        )
        created_new = True

    # Stocker l'URL vidéo
    contenu_url_id = str(uuid.uuid4())
    thumbnail_url = f"https://img.youtube.com/vi/{yt['video_id']}/hqdefault.jpg"
    await db.execute(
        """INSERT INTO contenus_bloc (id, bloc_id, type, contenu, metadata, ordre, created_at)
           VALUES (?, ?, 'video_ref', ?, ?, 0, ?)""",
        (contenu_url_id, bloc_id, data.url,
         json.dumps({
             "video_id": yt["video_id"],
             "title": yt.get("title"),
             "thumbnail": thumbnail_url,
             "source": "youtube",
         }, ensure_ascii=False), now),
    )

    # Stocker la transcription si disponible
    transcript_stored = False
    if yt.get("transcript"):
        contenu_text_id = str(uuid.uuid4())
        await db.execute(
            """INSERT INTO contenus_bloc (id, bloc_id, type, contenu, metadata, ordre, created_at)
               VALUES (?, ?, 'texte', ?, ?, 1, ?)""",
            (contenu_text_id, bloc_id, yt["transcript"],
             json.dumps({"extracted": True, "source": "youtube_transcript", "video_id": yt["video_id"]}, ensure_ascii=False),
             now),
        )
        transcript_stored = True

        # Mettre à jour resume_ia
        resume = yt["transcript"][:200] + "..." if len(yt["transcript"]) > 200 else yt["transcript"]
        await db.execute(
            "UPDATE blocs SET resume_ia = ?, updated_at = ? WHERE id = ?",
            (resume, now, bloc_id),
        )

    await db.commit()

    # Indexer via IA
    from services.indexation import indexer_bloc
    await indexer_bloc(bloc_id)

    # Récupérer le bloc
    rows = await db.execute_fetchall("SELECT * FROM blocs WHERE id = ?", (bloc_id,))
    bloc = dict(rows[0]) if rows else {}

    return {
        "bloc": bloc,
        "video_id": yt["video_id"],
        "title": yt.get("title"),
        "transcript_stored": transcript_stored,
        "transcript_error": yt.get("error"),
        "created_new_bloc": created_new,
    }


# ══════════════════════════════════════════════════════════════
# ROUTES D'UPLOAD DE FICHIERS
# IMPORTANT : les routes fixes (/new-bloc, /file/...) AVANT /{bloc_id}
# sinon FastAPI interprète "new-bloc" comme un bloc_id
# ══════════════════════════════════════════════════════════════


@router.post("/new-bloc", status_code=201)
async def upload_file_new_bloc(
    file: UploadFile = File(...),
    espace_id: str = Form(""),
    x: float = Form(0),
    y: float = Form(0),
):
    """Upload un fichier en créant un nouveau bloc à la position (x, y)."""
    db = await get_db()

    if not espace_id:
        raise HTTPException(status_code=400, detail="espace_id requis")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Fichier trop volumineux")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Fichier vide")

    original_filename = file.filename or "document"
    content_type = detect_content_type(original_filename, file.content_type)

    # Créer le bloc
    now = datetime.now(timezone.utc).isoformat()
    bloc_id = str(uuid.uuid4())

    # Couleur automatique selon le type de fichier
    ext = Path(original_filename).suffix.lower()
    if content_type == "pdf":
        couleur = "orange"
    elif content_type == "image":
        couleur = "yellow"
    elif content_type == "texte" and ext in CODE_EXTENSIONS:
        couleur = "blue"    # Code = logique
    elif content_type == "texte":
        couleur = "green"   # Texte/markdown = matière première
    elif ext in AUDIO_EXTENSIONS_SET:
        couleur = "violet"  # Audio/podcast = sens profond
    elif ext in (".docx", ".doc"):
        couleur = "orange"  # Documents Word = même famille que PDF
    elif ext == ".json":
        couleur = "blue"    # JSON = structure logique
    else:
        couleur = "blue"    # Défaut

    await db.execute(
        """INSERT INTO blocs (id, espace_id, x, y, forme, couleur, largeur, hauteur, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'rounded-rect', ?, 220, 140, ?, ?)""",
        (bloc_id, espace_id, x, y, couleur, now, now),
    )
    await db.commit()

    # Stocker le fichier + extraire texte + indexer
    contenu_id, ct, relative_path, extracted_text = await _store_file(
        content, espace_id, bloc_id, original_filename, file.content_type
    )

    # Récupérer le bloc complet
    rows = await db.execute_fetchall("SELECT * FROM blocs WHERE id = ?", (bloc_id,))
    bloc = dict(rows[0])

    return {
        "bloc": bloc,
        "contenu_id": contenu_id,
        "type": ct,
        "filename": original_filename,
        "file_path": relative_path,
        "extracted_text_length": len(extracted_text) if extracted_text else 0,
    }


@router.get("/file/{espace_id}/{bloc_id}/{filename}")
async def serve_uploaded_file(espace_id: str, bloc_id: str, filename: str):
    """Sert un fichier uploadé (PDF, image, etc.)."""
    from fastapi.responses import FileResponse

    file_path = UPLOADS_DIR / espace_id / bloc_id / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Fichier non trouvé")

    if not str(file_path.resolve()).startswith(str(UPLOADS_DIR.resolve())):
        raise HTTPException(status_code=403, detail="Accès interdit")

    return FileResponse(str(file_path))


@router.post("/{bloc_id}", status_code=201)
async def upload_file_to_bloc(bloc_id: str, file: UploadFile = File(...)):
    """Upload un fichier dans un bloc existant."""
    db = await get_db()

    rows = await db.execute_fetchall("SELECT * FROM blocs WHERE id = ?", (bloc_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Bloc non trouvé")

    bloc = dict(rows[0])
    espace_id = bloc["espace_id"]

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Fichier trop volumineux")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Fichier vide")

    original_filename = file.filename or "document"

    contenu_id, content_type, relative_path, extracted_text = await _store_file(
        content, espace_id, bloc_id, original_filename, file.content_type
    )

    return {
        "contenu_id": contenu_id,
        "type": content_type,
        "filename": original_filename,
        "file_path": relative_path,
        "size_bytes": len(content),
        "text_extracted": bool(extracted_text),
    }
