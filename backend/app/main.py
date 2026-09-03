"""
Smart Digital Menu Designer — FastAPI Application Entry Point.

This is the main entry point for the backend server.
Run with: uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ── Create FastAPI App ────────────────────────────────────────

app = FastAPI(
    title="Smart Digital Menu Designer",
    description="AI-Based Smart Digital Menu Designer & QR Ordering System",
    version="1.0.0",
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ── Static Files (uploads) ───────────────────────────────────

from fastapi.responses import FileResponse
from fastapi import HTTPException

uploads_dir = Path(__file__).parent.parent / "uploads"
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")
app.mount("/api/uploads", StaticFiles(directory=str(uploads_dir)), name="api_uploads")


@app.get("/uploads/{file_path:path}")
@app.get("/api/uploads/{file_path:path}")
async def serve_uploaded_image(file_path: str):
    """Explicitly serve uploaded images with case-insensitive resolution for Linux."""
    clean_path = file_path.strip("/")
    direct = uploads_dir / clean_path
    if direct.exists() and direct.is_file():
        return FileResponse(str(direct))

    # Case-insensitive resolution
    try:
        parts = Path(clean_path).parts
        current = uploads_dir
        for part in parts:
            found = False
            if current.exists() and current.is_dir():
                for entry in current.iterdir():
                    if entry.name.lower() == part.lower():
                        current = entry
                        found = True
                        break
            if not found:
                current = current / part
        if current.exists() and current.is_file():
            return FileResponse(str(current))
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Image not found")

# ── Register API Routes ──────────────────────────────────────

from app.api.auth import router as auth_router
from app.api.restaurant import router as restaurant_router
from app.api.categories import router as categories_router
from app.api.menu import router as menu_router
from app.api.ai import router as ai_router
from app.api.qr import router as qr_router
from app.api.public import router as public_router
from app.api.orders import router as orders_router
from app.api.analytics import router as analytics_router

app.include_router(auth_router)
app.include_router(restaurant_router)
app.include_router(categories_router)
app.include_router(menu_router)
app.include_router(ai_router)
app.include_router(qr_router)
app.include_router(public_router)
app.include_router(orders_router)
app.include_router(analytics_router)


# ── Startup Event ─────────────────────────────────────────────

def auto_link_menu_images(db):
    """Auto-link existing menu images to menu items by name matching."""
    from app.models.models import MenuItem
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
    try:
        items = db.query(MenuItem).all()
        updated = False
        for item in items:
            if not item.image:
                item_lower = item.name.lower()
                for key, img_path in IMAGE_MAP.items():
                    if key in item_lower:
                        item.image = img_path
                        updated = True
                        break
        if updated:
            db.commit()
            print("[OK] Auto-linked food images to menu items")
    except Exception as e:
        print(f"Notice auto-linking images: {e}")


@app.on_event("startup")
def on_startup():
    """Initialize database and seed demo data on first run."""
    from app.database.database import init_db, SessionLocal
    from app.services.seed_data import seed_demo_data

    # Create all tables
    init_db()
    print("[OK] Database initialized")

    # Seed demo data and auto-link food images
    db = SessionLocal()
    try:
        seed_demo_data(db)
        auto_link_menu_images(db)
    finally:
        db.close()


# ── Health Check ──────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "Smart Digital Menu Designer",
        "version": "1.0.0",
    }


@app.get("/")
def root():
    return {
        "message": "Smart Digital Menu Designer API",
        "docs": "/docs",
        "health": "/api/health",
    }
