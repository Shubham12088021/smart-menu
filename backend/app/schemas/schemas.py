"""
Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ── Auth Schemas ──────────────────────────────────────────────

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=100)
    password: str = Field(..., min_length=6)
    full_name: str = ""


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Restaurant Schemas ────────────────────────────────────────

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tagline: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    opening_hours: Optional[str] = None
    social_media: Optional[dict] = None
    template: Optional[str] = None
    primary_color: Optional[str] = None
    accent_color: Optional[str] = None
    font_family: Optional[str] = None
    layout_style: Optional[str] = None
    is_published: Optional[bool] = None


class RestaurantResponse(BaseModel):
    id: int
    user_id: int
    name: str
    slug: str
    description: str
    tagline: str
    logo: str
    address: str
    phone: str
    email: str
    opening_hours: str
    social_media: dict
    template: str
    primary_color: str
    accent_color: str
    font_family: str
    layout_style: str
    is_published: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Category Schemas ──────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = ""
    display_order: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(BaseModel):
    id: int
    restaurant_id: int
    name: str
    description: str
    display_order: int
    is_active: bool

    class Config:
        from_attributes = True


class CategoryWithItems(CategoryResponse):
    menu_items: List["MenuItemResponse"] = []


# ── Menu Item Schemas ─────────────────────────────────────────

class MenuItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    price: float = Field(..., ge=0)
    category_id: int
    is_veg: bool = True
    is_spicy: bool = False
    is_bestseller: bool = False
    is_available: bool = True
    display_order: int = 0


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    category_id: Optional[int] = None
    is_veg: Optional[bool] = None
    is_spicy: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    is_available: Optional[bool] = None
    display_order: Optional[int] = None


class MenuItemResponse(BaseModel):
    id: int
    restaurant_id: int
    category_id: int
    name: str
    description: str
    price: float
    image: str
    is_veg: bool
    is_spicy: bool
    is_bestseller: bool
    is_available: bool
    display_order: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Order Schemas ─────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    menu_item_id: int
    item_name: str
    quantity: int = Field(..., ge=1)
    price: float = Field(..., ge=0)


class OrderCreate(BaseModel):
    restaurant_slug: str
    customer_name: str = "Guest"
    table_number: str = ""
    notes: str = ""
    payment_method: str = "cash"  # "online" or "cash"
    payment_status: str = "pending"  # "pending", "paid", "failed"
    razorpay_order_id: Optional[str] = ""
    razorpay_payment_id: Optional[str] = ""
    razorpay_signature: Optional[str] = ""
    items: List[OrderItemCreate]


class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: Optional[int] = None
    item_name: Optional[str] = "Item"
    quantity: Optional[int] = 1
    price: Optional[float] = 0.0

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    restaurant_id: int
    customer_name: Optional[str] = "Guest"
    table_number: Optional[str] = ""
    total: Optional[float] = 0.0
    status: Optional[str] = "pending"
    payment_method: Optional[str] = "cash"
    payment_status: Optional[str] = "pending"
    razorpay_order_id: Optional[str] = ""
    razorpay_payment_id: Optional[str] = ""
    notes: Optional[str] = ""
    created_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|preparing|ready|completed|cancelled)$")


class RazorpayCreateOrderRequest(BaseModel):
    amount: float = Field(..., gt=0)
    currency: str = "INR"
    restaurant_slug: str
    receipt: Optional[str] = None


class RazorpayCreateOrderResponse(BaseModel):
    order_id: str
    amount: int  # in paise
    currency: str
    key_id: str
    restaurant_name: str



# ── AI Schemas ────────────────────────────────────────────────

class AIDescriptionRequest(BaseModel):
    item_name: str
    category: str = ""
    cuisine: str = ""
    is_veg: bool = True


class AITaglineRequest(BaseModel):
    restaurant_name: str
    cuisine: str = ""
    style: str = ""
    description: str = ""


class AICategoryDescriptionRequest(BaseModel):
    category_name: str
    cuisine: str = ""


class AIResponse(BaseModel):
    success: bool
    content: str = ""
    suggestions: List[str] = []
    message: str = ""


# ── Analytics Schemas ─────────────────────────────────────────

class AnalyticsEvent(BaseModel):
    restaurant_slug: str
    event_type: str
    item_id: Optional[int] = None


class AnalyticsResponse(BaseModel):
    total_items: int = 0
    total_categories: int = 0
    total_orders: int = 0
    total_revenue: float = 0.0
    total_views: int = 0
    total_qr_scans: int = 0
    top_items: list = []
    top_ordered: list = []
    recent_orders: list = []
    order_trend: list = []


# ── Reorder Schema ───────────────────────────────────────────

class ReorderRequest(BaseModel):
    ordered_ids: List[int]


# ── QR Schema ────────────────────────────────────────────────

class QRGenerateRequest(BaseModel):
    menu_url: Optional[str] = None


# Forward ref update
CategoryWithItems.model_rebuild()
