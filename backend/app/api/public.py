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
