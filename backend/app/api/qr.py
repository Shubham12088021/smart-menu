"""
QR code generation API routes.
Uses the free `qrcode` Python library.
"""

import io
import qrcode
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import os

from app.database.database import get_db
from app.models.models import User, Restaurant
from app.schemas.schemas import QRGenerateRequest
from app.utils.auth import get_current_user
from app.utils.restaurant import get_user_restaurant

router = APIRouter(prefix="/api/qr", tags=["QR Code"])


def get_base_frontend_url(request: Request, frontend_url: Optional[str] = None) -> str:
    """Resolve the frontend URL dynamically with robust fallbacks."""
    if frontend_url:
        return frontend_url.rstrip("/")
    
    # Try Origin or Referer header from frontend
    origin = request.headers.get("origin")
    if origin:
        return origin.rstrip("/")
    
    referer = request.headers.get("referer")
    if referer:
        # Extract protocol + host
        from urllib.parse import urlparse
        parsed = urlparse(referer)
        if parsed.scheme and parsed.netloc:
            return f"{parsed.scheme}://{parsed.netloc}"

    return os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")


def generate_qr_image(url: str) -> io.BytesIO:
    """Generate a QR code image as bytes."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


@router.post("/generate")
def generate_qr(
    request: Request,
    data: QRGenerateRequest = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate QR code for the restaurant's public menu."""
    restaurant = get_user_restaurant(current_user, db)
    base_url = get_base_frontend_url(request, data.menu_url if data else None)

    menu_url = f"{base_url}/menu/{restaurant.slug}"
    if data and data.menu_url:
        menu_url = data.menu_url

    return {
        "menu_url": menu_url,
        "slug": restaurant.slug,
        "restaurant_name": restaurant.name,
    }


@router.get("/download/{slug}")
def download_qr(slug: str, request: Request, frontend_url: Optional[str] = None):
    """Download QR code as PNG image."""
    base_url = get_base_frontend_url(request, frontend_url)
    menu_url = f"{base_url}/menu/{slug}"
    buffer = generate_qr_image(menu_url)

    return StreamingResponse(
        buffer,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=qr-{slug}.png"},
    )


@router.get("/image/{slug}")
def get_qr_image(slug: str, request: Request, frontend_url: Optional[str] = None):
    """Get QR code as inline PNG image for display."""
    base_url = get_base_frontend_url(request, frontend_url)
    menu_url = f"{base_url}/menu/{slug}"
    buffer = generate_qr_image(menu_url)

    return StreamingResponse(
        buffer,
        media_type="image/png",
    )

