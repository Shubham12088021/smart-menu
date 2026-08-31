"""
AI Service — Supports Google Gemini (production) and Ollama (local dev).
Gracefully handles unavailability — the app works fine without AI.

Set AI_PROVIDER env var:
  - "gemini"  → Google Gemini API (needs GEMINI_API_KEY)
  - "ollama"  → Local Ollama instance
  - "auto"    → Try Gemini first, fall back to Ollama (default)
"""

import os
import httpx
from typing import Optional
from abc import ABC, abstractmethod

from app.schemas.schemas import AIResponse


# ── Base AI Service ──────────────────────────────────────────────

class BaseAIService(ABC):
    """Abstract base for AI providers."""

    @abstractmethod
    async def check_availability(self) -> bool:
        pass

    @abstractmethod
    async def _generate(self, prompt: str) -> Optional[str]:
        pass

    async def generate_item_description(
        self,
        item_name: str,
        category: str = "",
        cuisine: str = "",
        is_veg: bool = True,
    ) -> AIResponse:
        """Generate a compelling food item description."""
        veg_label = "vegetarian" if is_veg else "non-vegetarian"
        category_info = f" in the {category} category" if category else ""
        cuisine_info = f" from {cuisine} cuisine" if cuisine else ""

        prompt = (
            f"Write a short, appetizing menu description (1-2 sentences, max 30 words) "
            f"for a {veg_label} food item called '{item_name}'{category_info}{cuisine_info}. "
            f"Make it sound delicious and professional. "
            f"Return ONLY the description text, nothing else."
        )

        result = await self._generate(prompt)

        if result:
            result = result.strip("\"'").strip()
            return AIResponse(success=True, content=result)

        return AIResponse(
            success=False,
            message="AI assistant is currently unavailable. You can enter the description manually.",
        )

    async def generate_tagline(
        self,
        restaurant_name: str,
        cuisine: str = "",
        style: str = "",
        description: str = "",
    ) -> AIResponse:
        """Generate restaurant tagline suggestions."""
        cuisine_info = f" serving {cuisine} cuisine" if cuisine else ""
        style_info = f" with a {style} style" if style else ""
        desc_info = f" Description: {description}" if description else ""

        prompt = (
            f"Generate exactly 5 short, catchy taglines for a restaurant called '{restaurant_name}'"
            f"{cuisine_info}{style_info}.{desc_info} "
            f"Each tagline should be under 10 words. "
            f"Return them as a numbered list (1. 2. 3. 4. 5.), one per line. "
            f"Return ONLY the taglines, nothing else."
        )

        result = await self._generate(prompt)

        if result:
            lines = result.strip().split("\n")
            suggestions = []
            for line in lines:
                cleaned = line.strip()
                for prefix in ["1.", "2.", "3.", "4.", "5.", "-", "*", "•"]:
                    if cleaned.startswith(prefix):
                        cleaned = cleaned[len(prefix):].strip()
                        break
                cleaned = cleaned.strip("\"'").strip()
                if cleaned and len(cleaned) > 3:
                    suggestions.append(cleaned)

            if suggestions:
                return AIResponse(success=True, suggestions=suggestions[:5])

        return AIResponse(
            success=False,
            message="AI assistant is currently unavailable. You can enter a tagline manually.",
        )

    async def generate_category_description(
        self,
        category_name: str,
        cuisine: str = "",
    ) -> AIResponse:
        """Generate a brief category description."""
        cuisine_info = f" in {cuisine} cuisine" if cuisine else ""

        prompt = (
            f"Write a short, inviting description (1 sentence, max 20 words) "
            f"for a restaurant menu category called '{category_name}'{cuisine_info}. "
            f"Return ONLY the description text, nothing else."
        )

        result = await self._generate(prompt)

        if result:
            result = result.strip("\"'").strip()
            return AIResponse(success=True, content=result)

        return AIResponse(
            success=False,
            message="AI assistant is currently unavailable. You can enter the description manually.",
        )


# ── Gemini AI Service ────────────────────────────────────────────

class GeminiAIService(BaseAIService):
    """Google Gemini API — free tier (15 requests/min)."""

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        self._client = None

    def _get_client(self):
        """Lazy-load the Gemini client."""
        if self._client is None and self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._client = genai.GenerativeModel(self.model_name)
            except Exception:
                self._client = None
        return self._client

    async def check_availability(self) -> bool:
        """Check if Gemini API is configured and reachable."""
        if not self.api_key:
            return False
        try:
            client = self._get_client()
            return client is not None
        except Exception:
            return False

    async def _generate(self, prompt: str) -> Optional[str]:
        """Generate text using Google Gemini."""
        try:
            client = self._get_client()
            if client is None:
                return None
            response = client.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
            return None
        except Exception:
            return None

    @property
    def provider_name(self):
        return "gemini"

    @property
    def model(self):
        return self.model_name

    @property
    def base_url(self):
        return "https://generativelanguage.googleapis.com"


# ── Ollama AI Service ────────────────────────────────────────────

class OllamaAIService(BaseAIService):
    """Local Ollama instance for development."""

    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "llama3.2")
        self.timeout = 60.0

    async def check_availability(self) -> bool:
        """Check if Ollama is running and responsive."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception:
            return False

    async def _generate(self, prompt: str) -> Optional[str]:
        """Send a prompt to Ollama and return the generated text."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "num_predict": 200,
                        },
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("response", "").strip()
                return None
        except Exception:
            return None

    @property
    def provider_name(self):
        return "ollama"


# ── AI Service Factory ──────────────────────────────────────────

def create_ai_service() -> BaseAIService:
    """
    Create the appropriate AI service based on AI_PROVIDER env var.
    - "gemini": Use Google Gemini API
    - "ollama": Use local Ollama
    - "auto" (default): Use Gemini if API key is set, else Ollama
    """
    provider = os.getenv("AI_PROVIDER", "auto").lower()

    if provider == "gemini":
        return GeminiAIService()
    elif provider == "ollama":
        return OllamaAIService()
    else:  # auto
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        if gemini_key:
            return GeminiAIService()
        return OllamaAIService()
