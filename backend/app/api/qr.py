"""
QR code generation API routes.
Uses the free `qrcode` Python library.
"""

import io
import qrcode
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import os

from app.database.database import get_db
from app.models.models import User, Restaurant
from app.schemas.schemas import QRGenerateRequest
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/qr", tags=["QR Code"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def get_user_restaurant(user: User, db: Session) -> Restaurant:
    restaurant = db.query(Restaurant).filter(Restaurant.user_id == user.id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


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
    data: QRGenerateRequest = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate QR code for the restaurant's public menu."""
    restaurant = get_user_restaurant(current_user, db)

    menu_url = f"{FRONTEND_URL}/menu/{restaurant.slug}"
    if data and data.menu_url:
        menu_url = data.menu_url

    return {
        "menu_url": menu_url,
        "slug": restaurant.slug,
        "restaurant_name": restaurant.name,
    }


@router.get("/download/{slug}")
def download_qr(slug: str):
    """Download QR code as PNG image."""
    menu_url = f"{FRONTEND_URL}/menu/{slug}"
    buffer = generate_qr_image(menu_url)

    return StreamingResponse(
        buffer,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=qr-{slug}.png"},
    )


@router.get("/image/{slug}")
def get_qr_image(slug: str):
    """Get QR code as inline PNG image for display."""
    menu_url = f"{FRONTEND_URL}/menu/{slug}"
    buffer = generate_qr_image(menu_url)

    return StreamingResponse(
        buffer,
        media_type="image/png",
    )
