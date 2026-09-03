import os
import re
import uuid
from pathlib import Path
from urllib.parse import urlparse
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
BUCKET = os.getenv("SUPABASE_BUCKET", "menu-images")

_client = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    from supabase import create_client
    _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def sanitize_filename(filename: str) -> str:
    filename = filename.replace("/", "").replace("\\", "").replace("\x00", "")
    filename = re.sub(r"[^a-zA-Z0-9._-]", "_", filename).lower()
    return f"{uuid.uuid4().hex[:8]}_{filename}"


def validate_image(file: UploadFile) -> None:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"MIME type not allowed: {file.content_type}")


async def save_upload(file: UploadFile, subfolder: str = "") -> str:
    validate_image(file)

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024 * 1024)} MB")

    safe_name = sanitize_filename(file.filename)

    if _client:
        key = f"{subfolder}/{safe_name}" if subfolder else safe_name
        _client.storage.from_(BUCKET).upload(
            key,
            content,
            {"content-type": file.content_type or "image/webp", "upsert": "true"},
        )
        return _client.storage.from_(BUCKET).get_public_url(key)

    save_dir = UPLOAD_DIR / subfolder if subfolder else UPLOAD_DIR
    save_dir.mkdir(parents=True, exist_ok=True)
    with open(save_dir / safe_name, "wb") as f:
        f.write(content)
    return f"/uploads/{subfolder}/{safe_name}" if subfolder else f"/uploads/{safe_name}"


def delete_upload(file_path: str) -> bool:
    if not file_path:
        return False

    if file_path.startswith("http"):
        if not _client or f"/{BUCKET}/" not in file_path:
            return False
        key = urlparse(file_path).path.split(f"/{BUCKET}/", 1)[-1]
        _client.storage.from_(BUCKET).remove([key])
        return True

    full_path = Path(__file__).parent.parent.parent / file_path.lstrip("/")
    if full_path.exists() and full_path.is_file():
        full_path.unlink()
        return True
    return False