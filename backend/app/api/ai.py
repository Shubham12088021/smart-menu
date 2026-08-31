"""
AI assistant API routes.
Uses Gemini (production) or Ollama (local dev) for AI-powered content generation.
Gracefully falls back when AI is unavailable.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import User
from app.schemas.schemas import (
    AIDescriptionRequest, AITaglineRequest,
    AICategoryDescriptionRequest, AIResponse,
)
from app.utils.auth import get_current_user
from app.services.ai_service import create_ai_service

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])
ai_service = create_ai_service()


@router.get("/status")
async def get_ai_status():
    """Check if the AI service is available."""
    available = await ai_service.check_availability()
    provider = ai_service.provider_name
    return {
        "available": available,
        "provider": provider,
        "model": ai_service.model if hasattr(ai_service, "model") else "",
        "message": f"AI assistant ({provider}) is ready" if available else "AI assistant is unavailable. You can still enter descriptions manually.",
    }


@router.post("/description", response_model=AIResponse)
async def generate_description(
    data: AIDescriptionRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a food item description using AI."""
    result = await ai_service.generate_item_description(
        item_name=data.item_name,
        category=data.category,
        cuisine=data.cuisine,
        is_veg=data.is_veg,
    )
    return result


@router.post("/tagline", response_model=AIResponse)
async def generate_tagline(
    data: AITaglineRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate restaurant tagline suggestions using AI."""
    result = await ai_service.generate_tagline(
        restaurant_name=data.restaurant_name,
        cuisine=data.cuisine,
        style=data.style,
        description=data.description,
    )
    return result


@router.post("/category-description", response_model=AIResponse)
async def generate_category_description(
    data: AICategoryDescriptionRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a category description using AI."""
    result = await ai_service.generate_category_description(
        category_name=data.category_name,
        cuisine=data.cuisine,
    )
    return result
