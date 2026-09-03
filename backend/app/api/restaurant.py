"""
Restaurant profile API routes.
"""

import re
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import User, Restaurant
from app.schemas.schemas import RestaurantUpdate, RestaurantResponse
from app.utils.auth import get_current_user
from app.utils.files import save_upload, delete_upload
from app.utils.restaurant import get_user_restaurant

router = APIRouter(prefix="/api/restaurant", tags=["Restaurant"])


@router.get("", response_model=RestaurantResponse)
def get_restaurant(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current user's restaurant profile."""
    restaurant = get_user_restaurant(current_user, db)
    return RestaurantResponse.model_validate(restaurant)


@router.put("", response_model=RestaurantResponse)
def update_restaurant(
    data: RestaurantUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update restaurant profile settings."""
    restaurant = get_user_restaurant(current_user, db)

    update_data = data.model_dump(exclude_unset=True)

    # If name changes, update slug
    if "name" in update_data and update_data["name"]:
        new_slug = re.sub(r"[^a-z0-9\s-]", "", update_data["name"].lower())
        new_slug = re.sub(r"[\s-]+", "-", new_slug).strip("-")
        # Check uniqueness
        existing = db.query(Restaurant).filter(
            Restaurant.slug == new_slug,
            Restaurant.id != restaurant.id,
        ).first()
        if existing:
            new_slug = f"{new_slug}-{restaurant.id}"
        restaurant.slug = new_slug

    for key, value in update_data.items():
        setattr(restaurant, key, value)

    db.commit()
    db.refresh(restaurant)
    return RestaurantResponse.model_validate(restaurant)


@router.post("/logo", response_model=RestaurantResponse)
async def upload_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload restaurant logo image."""
    restaurant = get_user_restaurant(current_user, db)

    # Delete old logo if exists
    if restaurant.logo:
        delete_upload(restaurant.logo)

    # Save new logo
    path = await save_upload(file, subfolder="logos")
    restaurant.logo = path
    db.commit()
    db.refresh(restaurant)
    return RestaurantResponse.model_validate(restaurant)
