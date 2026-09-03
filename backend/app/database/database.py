"""
Database configuration and session management.
Supports SQLite (local dev) and PostgreSQL (production).
Auto-detects based on DATABASE_URL.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./menu.db")

# Render uses "postgres://" but SQLAlchemy requires "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite requires check_same_thread=False for FastAPI's async usage
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    pool_pre_ping=True,  # Reconnect on stale connections (important for PostgreSQL)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependency that provides a database session.
    Yields a session and ensures it is closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_migrations():
    """Ensure newly added columns and tables exist across SQLite and PostgreSQL."""
    from sqlalchemy import inspect, text
    results = []
    try:
        inspector = inspect(engine)
        tables = set(inspector.get_table_names())

        # 1. Orders table migrations
        if "orders" in tables:
            cols = {col["name"].lower() for col in inspector.get_columns("orders")}
            needed_orders = [
                ("payment_method", "VARCHAR(20) DEFAULT 'cash'"),
                ("payment_status", "VARCHAR(20) DEFAULT 'pending'"),
                ("razorpay_order_id", "VARCHAR(100) DEFAULT ''"),
                ("razorpay_payment_id", "VARCHAR(100) DEFAULT ''"),
                ("notes", "TEXT DEFAULT ''"),
                ("table_number", "VARCHAR(20) DEFAULT ''"),
                ("customer_name", "VARCHAR(100) DEFAULT 'Guest'"),
            ]
            with engine.begin() as conn:
                for col_name, col_def in needed_orders:
                    if col_name.lower() not in cols:
                        try:
                            conn.execute(text(f"ALTER TABLE orders ADD COLUMN {col_name} {col_def};"))
                            results.append(f"Added column orders.{col_name}")
                            print(f"[MIGRATION] Added column orders.{col_name}")
                        except Exception as e:
                            results.append(f"Notice adding orders.{col_name}: {e}")

        # 2. Restaurants table migrations
        if "restaurants" in tables:
            cols = {col["name"].lower() for col in inspector.get_columns("restaurants")}
            needed_rest = [
                ("template", "VARCHAR(50) DEFAULT 'modern'"),
                ("primary_color", "VARCHAR(20) DEFAULT '#f97316'"),
                ("accent_color", "VARCHAR(20) DEFAULT '#ea580c'"),
                ("font_family", "VARCHAR(50) DEFAULT 'Inter'"),
                ("layout_style", "VARCHAR(20) DEFAULT 'comfortable'"),
                ("is_published", "BOOLEAN DEFAULT TRUE"),
                ("tagline", "VARCHAR(300) DEFAULT ''"),
                ("logo", "VARCHAR(500) DEFAULT ''"),
            ]
            with engine.begin() as conn:
                for col_name, col_def in needed_rest:
                    if col_name.lower() not in cols:
                        try:
                            conn.execute(text(f"ALTER TABLE restaurants ADD COLUMN {col_name} {col_def};"))
                            results.append(f"Added column restaurants.{col_name}")
                            print(f"[MIGRATION] Added column restaurants.{col_name}")
                        except Exception as e:
                            results.append(f"Notice adding restaurants.{col_name}: {e}")

        # 3. Menu items table migrations
        if "menu_items" in tables:
            cols = {col["name"].lower() for col in inspector.get_columns("menu_items")}
            needed_items = [
                ("image", "VARCHAR(500) DEFAULT ''"),
                ("is_veg", "BOOLEAN DEFAULT TRUE"),
                ("is_spicy", "BOOLEAN DEFAULT FALSE"),
                ("is_bestseller", "BOOLEAN DEFAULT FALSE"),
                ("is_available", "BOOLEAN DEFAULT TRUE"),
                ("display_order", "INTEGER DEFAULT 0"),
            ]
            with engine.begin() as conn:
                for col_name, col_def in needed_items:
                    if col_name.lower() not in cols:
                        try:
                            conn.execute(text(f"ALTER TABLE menu_items ADD COLUMN {col_name} {col_def};"))
                            results.append(f"Added column menu_items.{col_name}")
                            print(f"[MIGRATION] Added column menu_items.{col_name}")
                        except Exception as e:
                            results.append(f"Notice adding menu_items.{col_name}: {e}")

        # 4. Order items table migrations (PostgreSQL allow nullable menu_item_id)
        if "order_items" in tables and not str(engine.url).startswith("sqlite"):
            with engine.begin() as conn:
                try:
                    conn.execute(text("ALTER TABLE order_items ALTER COLUMN menu_item_id DROP NOT NULL;"))
                    results.append("Made order_items.menu_item_id nullable")
                except Exception:
                    pass

        return results
    except Exception as e:
        print(f"[MIGRATION ERROR] {e}")
        return [f"Error: {e}"]


def init_db():
    """Create all database tables and apply pending schema migrations."""
    from app.models.models import (
        User, Restaurant, Category, MenuItem,
        Order, OrderItem, Analytics
    )
    Base.metadata.create_all(bind=engine)
    run_migrations()

