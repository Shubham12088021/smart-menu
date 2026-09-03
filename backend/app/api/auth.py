"""
Authentication API routes: register, login, and current user.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import re

from app.database.database import get_db
from app.models.models import User, Restaurant
from app.schemas.schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def generate_slug(name: str) -> str:
    """Generate a URL-friendly slug from a restaurant name."""
    slug = name.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s-]+", "-", slug)
    return slug.strip("-")


@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user and create their restaurant profile."""

    # Check if username exists
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    # Check if email exists
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )

    db.add(user)
    db.flush()

    # Create default restaurant profile
    slug = generate_slug(data.username + "-restaurant")

    # Ensure slug is unique
    existing = db.query(Restaurant).filter(Restaurant.slug == slug).first()

    if existing:
        slug = f"{slug}-{user.id}"

    restaurant = Restaurant(
        user_id=user.id,
        name=f"{data.full_name or data.username}'s Restaurant",
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

    # Initialize default categories
    from app.utils.restaurant import init_default_categories
    init_default_categories(restaurant.id, db)

    db.refresh(user)

    # Generate token
    # IMPORTANT: JWT "sub" should be a string
    token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""

    user = db.query(User).filter(
        User.username == data.username
    ).first()

    if not user or not verify_password(
        data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    # IMPORTANT: JWT "sub" should be a string
    token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's info."""
    return UserResponse.model_validate(current_user)