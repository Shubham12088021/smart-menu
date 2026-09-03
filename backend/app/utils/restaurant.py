"""
Restaurant utility helpers for retrieving or initializing user restaurants and default categories.
"""

from sqlalchemy.orm import Session
import re
from app.models.models import User, Restaurant, Category


def generate_slug(name: str) -> str:
    """Generate a URL-friendly slug from a restaurant name."""
    slug = name.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s-]+", "-", slug)
    return slug.strip("-")


def init_default_categories(restaurant_id: int, db: Session):
    """Ensure a restaurant has default categories."""
    count = db.query(Category).filter(Category.restaurant_id == restaurant_id).count()
    if count == 0:
        default_categories = [
            {"name": "Starters", "description": "Handpicked appetizers and small bites", "order": 0},
            {"name": "Main Course", "description": "Hearty and delicious entrees", "order": 1},
            {"name": "Breads & Rice", "description": "Fresh breads and aromatic rice", "order": 2},
            {"name": "Desserts", "description": "Sweet treats and delights", "order": 3},
            {"name": "Beverages", "description": "Refreshing drinks and refreshments", "order": 4},
        ]
        for cat in default_categories:
            category = Category(
                restaurant_id=restaurant_id,
                name=cat["name"],
                description=cat["description"],
                display_order=cat["order"],
            )
            db.add(category)
        db.commit()


def get_user_restaurant(user: User, db: Session) -> Restaurant:
    """
    Get the restaurant belonging to the current user.
    If none exists, automatically create a default profile and starter categories.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.user_id == user.id).first()
    if not restaurant:
        slug = generate_slug(user.username + "-restaurant")
        existing = db.query(Restaurant).filter(Restaurant.slug == slug).first()
        if existing:
            slug = f"{slug}-{user.id}"

        restaurant = Restaurant(
            user_id=user.id,
            name=f"{user.full_name or user.username}'s Restaurant",
            slug=slug,
            template="modern",
            primary_color="#f97316",
            accent_color="#ea580c",
            font_family="Inter",
            layout_style="comfortable",
            is_published=True,
        )
        db.add(restaurant)
        db.commit()
        db.refresh(restaurant)

    # Make sure default categories exist
    init_default_categories(restaurant.id, db)
    return restaurant
