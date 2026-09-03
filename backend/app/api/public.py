"""
Public menu API routes — no authentication required.
These endpoints are accessed by customers scanning QR codes.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database.database import get_db
from app.models.models import Restaurant, Category, MenuItem, Analytics
from app.schemas.schemas import AnalyticsEvent

router = APIRouter(prefix="/api/public", tags=["Public Menu"])


IMAGE_MAP = {
    "crispy corn": "/uploads/menu/b47b891e_crispy_corn.jpg",
    "paneer tikka": "/uploads/menu/6d1d869a_Paneer_tikka.webp",
    "spring roll": "/uploads/menu/c311a8ff_veg_spring_rolls.webp",
    "dal makhani": "/uploads/menu/6cd07bf2_dal_makhani.webp",
    "palak paneer": "/uploads/menu/8b492783_palak_paneer.webp",
    "paneer masala": "/uploads/menu/a669c3f9_paneer_butter_masala_1773818258.webp",
    "butter masala": "/uploads/menu/a669c3f9_paneer_butter_masala_1773818258.webp",
    "biryani": "/uploads/menu/e71b3fd4_veg_biryani.webp",
    "butter naan": "/uploads/menu/e6446f2e_butter_naan.webp",
    "garlic naan": "/uploads/menu/bfc509f8_garlic_naan.webp",
    "paratha": "/uploads/menu/21ed7f57_Lacha_Paratha.jpg",
    "gulab jamun": "/uploads/menu/445b1e82_gulab_jamun.webp",
    "rasmalai": "/uploads/menu/e2c77900_rasmalai.jpg",
    "lassi": "/uploads/menu/8eadab44_mango_lassi.webp",
    "lime soda": "/uploads/menu/80aab30f_fresh_lime_soda.webp",
}


@router.get("/menu/{slug}")
def get_public_menu(slug: str, db: Session = Depends(get_db)):
    """
    Get the full public menu for a restaurant.
    No authentication required — this is what customers see.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.slug == slug).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Track menu view
    analytics_event = Analytics(
        restaurant_id=restaurant.id,
        event_type="menu_view",
    )
    db.add(analytics_event)
    db.commit()

    # Get categories with items
    categories = (
        db.query(Category)
        .filter(Category.restaurant_id == restaurant.id, Category.is_active == True)
        .order_by(Category.display_order)
        .all()
    )

    categories_data = []
    for cat in categories:
        items = (
            db.query(MenuItem)
            .filter(
                MenuItem.category_id == cat.id,
                MenuItem.is_available == True,
            )
            .order_by(MenuItem.display_order)
            .all()
        )
        # Auto-link images
        for item in items:
            if not item.image:
                item_lower = item.name.lower()
                for key, img_path in IMAGE_MAP.items():
                    if key in item_lower:
                        item.image = img_path
                        break
        try:
            db.commit()
        except Exception:
            pass

        categories_data.append({
            "id": cat.id,
            "name": cat.name,
            "description": cat.description,
            "items": [
                {
                    "id": item.id,
                    "name": item.name,
                    "description": item.description,
                    "price": item.price,
                    "image": item.image,
                    "is_veg": item.is_veg,
                    "is_spicy": item.is_spicy,
                    "is_bestseller": item.is_bestseller,
                }
                for item in items
            ],
        })

    return {
        "restaurant": {
            "id": restaurant.id,
            "name": restaurant.name,
            "slug": restaurant.slug,
            "description": restaurant.description,
            "tagline": restaurant.tagline,
            "logo": restaurant.logo,
            "address": restaurant.address,
            "phone": restaurant.phone,
            "email": restaurant.email,
            "opening_hours": restaurant.opening_hours,
            "social_media": restaurant.social_media or {},
            "template": restaurant.template,
            "primary_color": restaurant.primary_color,
            "accent_color": restaurant.accent_color,
            "font_family": restaurant.font_family,
            "layout_style": restaurant.layout_style,
        },
        "categories": categories_data,
    }


@router.post("/analytics")
def track_analytics(data: AnalyticsEvent, db: Session = Depends(get_db)):
    """Track an analytics event (menu view, QR scan, item view)."""
    restaurant = db.query(Restaurant).filter(Restaurant.slug == data.restaurant_slug).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    event = Analytics(
        restaurant_id=restaurant.id,
        event_type=data.event_type,
        item_id=data.item_id,
    )
    db.add(event)
    db.commit()
    return {"message": "Event tracked"}
