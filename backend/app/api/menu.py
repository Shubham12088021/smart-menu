"""
Menu item management API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.models.models import User, Restaurant, MenuItem, Category
from app.schemas.schemas import MenuItemCreate, MenuItemUpdate, MenuItemResponse, ReorderRequest
from app.utils.auth import get_current_user
from app.utils.files import save_upload, delete_upload
from app.utils.restaurant import get_user_restaurant

router = APIRouter(prefix="/api/menu", tags=["Menu Items"])


@router.get("", response_model=List[MenuItemResponse])
def get_menu_items(
    category_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all menu items, optionally filtered by category."""
    restaurant = get_user_restaurant(current_user, db)
    query = db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant.id)

    if category_id:
        query = query.filter(MenuItem.category_id == category_id)

    items = query.order_by(MenuItem.display_order).all()
    return [MenuItemResponse.model_validate(item) for item in items]


@router.post("", response_model=MenuItemResponse)
def create_menu_item(
    data: MenuItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new menu item."""
    restaurant = get_user_restaurant(current_user, db)

    # Verify category belongs to this restaurant
    category = (
        db.query(Category)
        .filter(Category.id == data.category_id, Category.restaurant_id == restaurant.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Auto display order
    max_order = (
        db.query(MenuItem)
        .filter(MenuItem.category_id == data.category_id)
        .count()
    )

    item = MenuItem(
        restaurant_id=restaurant.id,
        category_id=data.category_id,
        name=data.name,
        description=data.description,
        price=data.price,
        is_veg=data.is_veg,
        is_spicy=data.is_spicy,
        is_bestseller=data.is_bestseller,
        is_available=data.is_available,
        display_order=data.display_order or max_order,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return MenuItemResponse.model_validate(item)


@router.put("/{item_id}", response_model=MenuItemResponse)
def update_menu_item(
    item_id: int,
    data: MenuItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a menu item."""
    restaurant = get_user_restaurant(current_user, db)
    item = (
        db.query(MenuItem)
        .filter(MenuItem.id == item_id, MenuItem.restaurant_id == restaurant.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    update_data = data.model_dump(exclude_unset=True)

    # Validate category if changing
    if "category_id" in update_data:
        category = (
            db.query(Category)
            .filter(Category.id == update_data["category_id"], Category.restaurant_id == restaurant.id)
            .first()
        )
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

    for key, value in update_data.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return MenuItemResponse.model_validate(item)


@router.delete("/{item_id}")
def delete_menu_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a menu item."""
    restaurant = get_user_restaurant(current_user, db)
    item = (
        db.query(MenuItem)
        .filter(MenuItem.id == item_id, MenuItem.restaurant_id == restaurant.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    # Delete associated image
    if item.image:
        delete_upload(item.image)

    db.delete(item)
    db.commit()
    return {"message": "Menu item deleted"}


@router.post("/{item_id}/duplicate", response_model=MenuItemResponse)
def duplicate_menu_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Duplicate a menu item."""
    restaurant = get_user_restaurant(current_user, db)
    original = (
        db.query(MenuItem)
        .filter(MenuItem.id == item_id, MenuItem.restaurant_id == restaurant.id)
        .first()
    )
    if not original:
        raise HTTPException(status_code=404, detail="Menu item not found")

    duplicate = MenuItem(
        restaurant_id=original.restaurant_id,
        category_id=original.category_id,
        name=f"{original.name} (Copy)",
        description=original.description,
        price=original.price,
        is_veg=original.is_veg,
        is_spicy=original.is_spicy,
        is_bestseller=original.is_bestseller,
        is_available=original.is_available,
        display_order=original.display_order + 1,
    )
    db.add(duplicate)
    db.commit()
    db.refresh(duplicate)
    return MenuItemResponse.model_validate(duplicate)


@router.post("/{item_id}/image", response_model=MenuItemResponse)
async def upload_item_image(
    item_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload an image for a menu item."""
    restaurant = get_user_restaurant(current_user, db)
    item = (
        db.query(MenuItem)
        .filter(MenuItem.id == item_id, MenuItem.restaurant_id == restaurant.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    # Delete old image
    if item.image:
        delete_upload(item.image)

    path = await save_upload(file, subfolder="menu")
    item.image = path
    db.commit()
    db.refresh(item)
    return MenuItemResponse.model_validate(item)


@router.put("/reorder/bulk", response_model=List[MenuItemResponse])
def reorder_items(
    data: ReorderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reorder menu items by providing ordered list of IDs."""
    restaurant = get_user_restaurant(current_user, db)

    for index, item_id in enumerate(data.ordered_ids):
        item = (
            db.query(MenuItem)
            .filter(MenuItem.id == item_id, MenuItem.restaurant_id == restaurant.id)
            .first()
        )
        if item:
            item.display_order = index

    db.commit()

    items = (
        db.query(MenuItem)
        .filter(MenuItem.restaurant_id == restaurant.id)
        .order_by(MenuItem.display_order)
        .all()
    )
    return [MenuItemResponse.model_validate(i) for i in items]
