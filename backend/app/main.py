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

uploads_dir = Path(__file__).parent.parent / "uploads"
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

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

@app.on_event("startup")
def on_startup():
    """Initialize database and seed demo data on first run."""
    from app.database.database import init_db, SessionLocal
    from app.services.seed_data import seed_demo_data

    # Create all tables
    init_db()
    print("[OK] Database initialized")

    # Seed demo data
    db = SessionLocal()
    try:
        seed_demo_data(db)
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
