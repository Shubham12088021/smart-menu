"""
Category management API routes.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.models.models import User, Restaurant, Category
from app.schemas.schemas import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryWithItems, ReorderRequest
from app.utils.auth import get_current_user
from app.utils.restaurant import get_user_restaurant

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryWithItems])
def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all categories with their menu items."""
    restaurant = get_user_restaurant(current_user, db)
    categories = (
        db.query(Category)
        .filter(Category.restaurant_id == restaurant.id)
        .order_by(Category.display_order)
        .all()
    )
    return [CategoryWithItems.model_validate(c) for c in categories]


@router.post("", response_model=CategoryResponse)
def create_category(
    data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new menu category."""
    restaurant = get_user_restaurant(current_user, db)

    # Auto-set display order to end
    max_order = (
        db.query(Category)
        .filter(Category.restaurant_id == restaurant.id)
        .count()
    )

    category = Category(
        restaurant_id=restaurant.id,
        name=data.name,
        description=data.description,
        display_order=data.display_order or max_order,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return CategoryResponse.model_validate(category)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a category."""
    restaurant = get_user_restaurant(current_user, db)
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.restaurant_id == restaurant.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)

    db.commit()
    db.refresh(category)
    return CategoryResponse.model_validate(category)


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a category and all its menu items."""
    restaurant = get_user_restaurant(current_user, db)
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.restaurant_id == restaurant.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(category)
    db.commit()
    return {"message": "Category deleted"}


@router.put("/reorder/bulk", response_model=List[CategoryResponse])
def reorder_categories(
    data: ReorderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reorder categories by providing ordered list of IDs."""
    restaurant = get_user_restaurant(current_user, db)

    for index, cat_id in enumerate(data.ordered_ids):
        category = (
            db.query(Category)
            .filter(Category.id == cat_id, Category.restaurant_id == restaurant.id)
            .first()
        )
        if category:
            category.display_order = index

    db.commit()

    categories = (
        db.query(Category)
        .filter(Category.restaurant_id == restaurant.id)
        .order_by(Category.display_order)
        .all()
    )
    return [CategoryResponse.model_validate(c) for c in categories]
