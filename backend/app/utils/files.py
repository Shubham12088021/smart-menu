"""
File upload utilities: validation, sanitization, and storage.
"""

import os
import uuid
import re
from pathlib import Path
from fastapi import UploadFile, HTTPException

# ── Configuration ─────────────────────────────────────────────

UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
}


def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename to prevent path traversal and special characters.
    Returns a safe filename with a UUID prefix for uniqueness.
    """
    # Remove path separators and null bytes
    filename = filename.replace("/", "").replace("\\", "").replace("\x00", "")
    # Keep only alphanumeric, dots, hyphens, underscores
    filename = re.sub(r"[^a-zA-Z0-9._-]", "_", filename)
    # Add UUID prefix for uniqueness
    unique_name = f"{uuid.uuid4().hex[:8]}_{filename}"
    return unique_name


def validate_image(file: UploadFile) -> None:
    """
    Validate an uploaded image file.
    Checks: file extension, MIME type, and file size.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Check extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Check MIME type
    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"MIME type not allowed: {file.content_type}",
        )


async def save_upload(file: UploadFile, subfolder: str = "") -> str:
    """
    Save an uploaded file to disk.
    Returns the relative path to the saved file.
    """
    validate_image(file)

    # Read and check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024 * 1024)} MB",
        )

    # Create subdirectory if needed
    save_dir = UPLOAD_DIR / subfolder if subfolder else UPLOAD_DIR
    save_dir.mkdir(parents=True, exist_ok=True)

    # Sanitize and save
    safe_name = sanitize_filename(file.filename)
    file_path = save_dir / safe_name
    with open(file_path, "wb") as f:
        f.write(content)

    # Return relative path for storage
    relative_path = f"/uploads/{subfolder}/{safe_name}" if subfolder else f"/uploads/{safe_name}"
    return relative_path


def delete_upload(file_path: str) -> bool:
    """Delete an uploaded file. Returns True if deleted."""
    if not file_path:
        return False

    # Strip leading slash and construct full path
    clean_path = file_path.lstrip("/")
    full_path = Path(__file__).parent.parent.parent / clean_path

    if full_path.exists() and full_path.is_file():
        full_path.unlink()
        return True
    return False
