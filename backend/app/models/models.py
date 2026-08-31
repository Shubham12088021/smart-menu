"""
SQLAlchemy ORM Models.
Defines all database tables and their relationships.
"""

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text,
    DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database.database import Base


class User(Base):
    """Restaurant owner / admin user."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    restaurant = relationship("Restaurant", back_populates="owner", uselist=False)


class Restaurant(Base):
    """Restaurant profile and settings."""
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(200), nullable=False, default="My Restaurant")
    slug = Column(String(200), unique=True, index=True, nullable=False)
    description = Column(Text, default="")
    tagline = Column(String(300), default="")
    logo = Column(String(500), default="")
    address = Column(Text, default="")
    phone = Column(String(20), default="")
    email = Column(String(100), default="")
    opening_hours = Column(Text, default="")
    social_media = Column(JSON, default=dict)

    # Design settings
    template = Column(String(50), default="modern")
    primary_color = Column(String(20), default="#f97316")
    accent_color = Column(String(20), default="#ea580c")
    font_family = Column(String(50), default="Inter")
    layout_style = Column(String(20), default="comfortable")

    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    owner = relationship("User", back_populates="restaurant")
    categories = relationship("Category", back_populates="restaurant", cascade="all, delete-orphan", order_by="Category.display_order")
    menu_items = relationship("MenuItem", back_populates="restaurant", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="restaurant", cascade="all, delete-orphan")
    analytics = relationship("Analytics", back_populates="restaurant", cascade="all, delete-orphan")


class Category(Base):
    """Menu category (e.g., Starters, Main Course, Beverages)."""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    restaurant = relationship("Restaurant", back_populates="categories")
    menu_items = relationship("MenuItem", back_populates="category", cascade="all, delete-orphan", order_by="MenuItem.display_order")


class MenuItem(Base):
    """Individual menu item within a category."""
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    price = Column(Float, nullable=False, default=0.0)
    image = Column(String(500), default="")
    is_veg = Column(Boolean, default=True)
    is_spicy = Column(Boolean, default=False)
    is_bestseller = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    restaurant = relationship("Restaurant", back_populates="menu_items")
    category = relationship("Category", back_populates="menu_items")
    order_items = relationship("OrderItem", back_populates="menu_item")


class Order(Base):
    """Customer order."""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    customer_name = Column(String(100), default="Guest")
    table_number = Column(String(20), default="")
    total = Column(Float, default=0.0)
    status = Column(String(20), default="pending")  # pending, preparing, ready, completed, cancelled
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    restaurant = relationship("Restaurant", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """Individual item within an order."""
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    item_name = Column(String(200), nullable=False)
    quantity = Column(Integer, default=1)
    price = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")


class Analytics(Base):
    """Simple analytics event tracking."""
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # menu_view, qr_scan, item_view
    item_id = Column(Integer, nullable=True)
    event_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    restaurant = relationship("Restaurant", back_populates="analytics")
