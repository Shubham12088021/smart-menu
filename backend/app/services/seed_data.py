"""
Seed data — Creates a demo restaurant "Urban Spice" with sample menu items.
This makes the app look populated immediately for demonstration.
"""

from sqlalchemy.orm import Session
from app.models.models import User, Restaurant, Category, MenuItem, Order, OrderItem
from app.utils.auth import hash_password


def seed_demo_data(db: Session):
    """
    Create the demo restaurant 'Urban Spice' if it doesn't exist.
    Called on application startup.
    """
    # Check if demo user already exists
    existing = db.query(User).filter(User.username == "demo").first()
    if existing:
        return  # Already seeded

    # ── Create demo user ──────────────────────────────────────
    demo_user = User(
        username="demo",
        email="demo@urbanspice.com",
        hashed_password=hash_password("demo123"),
        full_name="Demo Admin",
    )
    db.add(demo_user)
    db.flush()

    # ── Create restaurant ─────────────────────────────────────
    restaurant = Restaurant(
        user_id=demo_user.id,
        name="Urban Spice",
        slug="urban-spice",
        description="A modern Indian restaurant blending traditional flavors with contemporary presentation. We source the freshest ingredients to create memorable dining experiences.",
        tagline="Traditional Flavours, Modern Taste",
        address="42 MG Road, Connaught Place, New Delhi 110001",
        phone="+91 98765 43210",
        email="hello@urbanspice.com",
        opening_hours="Mon-Sun: 11:00 AM - 11:00 PM",
        social_media={"instagram": "@urbanspice", "facebook": "urbanspice"},
        template="modern",
        primary_color="#f97316",
        accent_color="#ea580c",
        font_family="Inter",
        layout_style="comfortable",
        is_published=True,
    )
    db.add(restaurant)
    db.flush()

    # ── Create categories ─────────────────────────────────────
    categories_data = [
        {"name": "Starters", "description": "Begin your culinary journey with our handpicked appetizers", "order": 0},
        {"name": "Main Course", "description": "Hearty and flavorful dishes that define Indian cuisine", "order": 1},
        {"name": "Breads", "description": "Freshly baked breads straight from the tandoor", "order": 2},
        {"name": "Desserts", "description": "End your meal on a sweet note", "order": 3},
        {"name": "Beverages", "description": "Refreshing drinks to complement your meal", "order": 4},
    ]

    categories = {}
    for cat_data in categories_data:
        cat = Category(
            restaurant_id=restaurant.id,
            name=cat_data["name"],
            description=cat_data["description"],
            display_order=cat_data["order"],
        )
        db.add(cat)
        db.flush()
        categories[cat_data["name"]] = cat

    # ── Create menu items ─────────────────────────────────────

    menu_items = [
        # Starters
        {
            "category": "Starters", "name": "Paneer Tikka",
            "description": "Soft cottage cheese cubes marinated in aromatic spices and grilled to perfection in a clay oven.",
            "price": 280, "is_veg": True, "is_spicy": True, "is_bestseller": True, "order": 0,
        },
        {
            "category": "Starters", "name": "Veg Spring Rolls",
            "description": "Crispy golden rolls stuffed with fresh vegetables and served with sweet chili sauce.",
            "price": 220, "is_veg": True, "is_spicy": False, "is_bestseller": False, "order": 1,
        },
        {
            "category": "Starters", "name": "Chicken Malai Tikka",
            "description": "Tender chicken pieces marinated in creamy cashew paste and grilled until golden.",
            "price": 320, "is_veg": False, "is_spicy": False, "is_bestseller": True, "order": 2,
        },
        {
            "category": "Starters", "name": "Crispy Corn",
            "description": "Golden fried corn kernels tossed with herbs, spices and a hint of lemon zest.",
            "price": 200, "is_veg": True, "is_spicy": True, "is_bestseller": False, "order": 3,
        },

        # Main Course
        {
            "category": "Main Course", "name": "Butter Chicken",
            "description": "Succulent tandoori chicken simmered in a rich, creamy tomato-butter gravy with aromatic spices.",
            "price": 380, "is_veg": False, "is_spicy": False, "is_bestseller": True, "order": 0,
        },
        {
            "category": "Main Course", "name": "Dal Makhani",
            "description": "Black lentils slow-cooked overnight with butter and cream for an incredibly rich flavor.",
            "price": 280, "is_veg": True, "is_spicy": False, "is_bestseller": True, "order": 1,
        },
        {
            "category": "Main Course", "name": "Palak Paneer",
            "description": "Fresh spinach puree with soft paneer cubes, tempered with garlic and cumin.",
            "price": 300, "is_veg": True, "is_spicy": False, "is_bestseller": False, "order": 2,
        },
        {
            "category": "Main Course", "name": "Veg Biryani",
            "description": "Aromatic basmati rice layered with seasonal vegetables, saffron, and whole spices.",
            "price": 320, "is_veg": True, "is_spicy": True, "is_bestseller": False, "order": 3,
        },
        {
            "category": "Main Course", "name": "Mutton Rogan Josh",
            "description": "Tender lamb pieces braised in a Kashmiri-style gravy with fragrant whole spices.",
            "price": 450, "is_veg": False, "is_spicy": True, "is_bestseller": False, "order": 4,
        },

        # Breads
        {
            "category": "Breads", "name": "Butter Naan",
            "description": "Soft leavened bread brushed with melted butter, baked in a traditional tandoor.",
            "price": 60, "is_veg": True, "is_spicy": False, "is_bestseller": True, "order": 0,
        },
        {
            "category": "Breads", "name": "Garlic Naan",
            "description": "Tandoor-baked naan topped with fresh garlic, coriander, and a drizzle of butter.",
            "price": 80, "is_veg": True, "is_spicy": False, "is_bestseller": False, "order": 1,
        },
        {
            "category": "Breads", "name": "Laccha Paratha",
            "description": "Multi-layered flaky whole wheat bread, crispy on the outside and soft within.",
            "price": 70, "is_veg": True, "is_spicy": False, "is_bestseller": False, "order": 2,
        },

        # Desserts
        {
            "category": "Desserts", "name": "Gulab Jamun",
            "description": "Soft milk-solid dumplings soaked in warm rose-flavored sugar syrup.",
            "price": 150, "is_veg": True, "is_spicy": False, "is_bestseller": True, "order": 0,
        },
        {
            "category": "Desserts", "name": "Rasmalai",
            "description": "Delicate cottage cheese patties immersed in chilled saffron-cardamom milk.",
            "price": 180, "is_veg": True, "is_spicy": False, "is_bestseller": False, "order": 1,
        },

        # Beverages
        {
            "category": "Beverages", "name": "Masala Chai",
            "description": "Traditional Indian tea brewed with aromatic spices, ginger, and fresh milk.",
            "price": 80, "is_veg": True, "is_spicy": False, "is_bestseller": True, "order": 0,
        },
        {
            "category": "Beverages", "name": "Mango Lassi",
            "description": "Creamy yogurt smoothie blended with sweet Alphonso mangoes and a touch of cardamom.",
            "price": 150, "is_veg": True, "is_spicy": False, "is_bestseller": True, "order": 1,
        },
        {
            "category": "Beverages", "name": "Fresh Lime Soda",
            "description": "Sparkling soda with fresh lime juice — choose sweet or salted.",
            "price": 100, "is_veg": True, "is_spicy": False, "is_bestseller": False, "order": 2,
        },
    ]

    for item_data in menu_items:
        item = MenuItem(
            restaurant_id=restaurant.id,
            category_id=categories[item_data["category"]].id,
            name=item_data["name"],
            description=item_data["description"],
            price=item_data["price"],
            is_veg=item_data["is_veg"],
            is_spicy=item_data["is_spicy"],
            is_bestseller=item_data["is_bestseller"],
            display_order=item_data["order"],
        )
        db.add(item)

    # ── Create sample orders ──────────────────────────────────
    sample_orders = [
        {"customer": "Rahul S.", "table": "T-4", "total": 840, "status": "completed"},
        {"customer": "Priya M.", "table": "T-7", "total": 620, "status": "preparing"},
        {"customer": "Amit K.", "table": "T-2", "total": 1150, "status": "pending"},
    ]

    for order_data in sample_orders:
        order = Order(
            restaurant_id=restaurant.id,
            customer_name=order_data["customer"],
            table_number=order_data["table"],
            total=order_data["total"],
            status=order_data["status"],
        )
        db.add(order)

    db.commit()
    print("[OK] Demo data seeded: Urban Spice restaurant with menu items and sample orders")
