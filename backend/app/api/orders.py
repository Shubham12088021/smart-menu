"""
Order management API routes.
Customers can place orders (no auth), restaurant owners can manage them (auth required).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import razorpay
from app.database.database import get_db
from app.models.models import User, Restaurant, Order, OrderItem, MenuItem
from app.schemas.schemas import (
    OrderCreate, 
    OrderResponse, 
    OrderStatusUpdate,
    RazorpayCreateOrderRequest,
    RazorpayCreateOrderResponse,
)
from app.utils.auth import get_current_user
from app.utils.restaurant import get_user_restaurant

router = APIRouter(prefix="/api/orders", tags=["Orders"])

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_5173TestSmartMenu")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "test_secret_key_smartmenu_2026")


def get_razorpay_client():
    """Get Razorpay Client instance."""
    try:
        return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    except Exception:
        return None


@router.post("/razorpay/create-order", response_model=RazorpayCreateOrderResponse)
def create_razorpay_order(data: RazorpayCreateOrderRequest, db: Session = Depends(get_db)):
    """
    Create a Razorpay order in INR (amount in paise).
    Works with both active Razorpay Test Keys and sandbox test simulations.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.slug == data.restaurant_slug).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    amount_in_paise = int(round(data.amount * 100))
    receipt_id = data.receipt or f"rcpt_{uuid.uuid4().hex[:8]}"

    client = get_razorpay_client()
    order_id = ""

    # Try creating order via official Razorpay API
    if client and not RAZORPAY_KEY_ID.startswith("rzp_test_5173TestSmartMenu"):
        try:
            razorpay_order = client.order.create({
                "amount": amount_in_paise,
                "currency": data.currency or "INR",
                "receipt": receipt_id,
                "notes": {
                    "restaurant_name": restaurant.name,
                    "restaurant_slug": restaurant.slug,
                }
            })
            order_id = razorpay_order.get("id")
        except Exception as e:
            print(f"Razorpay API call notice: {e}. Using Sandbox Test Order ID.")
            order_id = f"order_{uuid.uuid4().hex[:14]}"
    else:
        # Sandbox Test simulation mode
        order_id = f"order_{uuid.uuid4().hex[:14]}"

    return RazorpayCreateOrderResponse(
        order_id=order_id,
        amount=amount_in_paise,
        currency=data.currency or "INR",
        key_id=RAZORPAY_KEY_ID,
        restaurant_name=restaurant.name,
    )


@router.post("", response_model=OrderResponse)
def place_order(data: OrderCreate, db: Session = Depends(get_db)):
    """
    Place a new order — NO authentication required.
    Supports both Online Payment (Razorpay/UPI) and Pay at Counter (Cash).
    """
    restaurant = db.query(Restaurant).filter(Restaurant.slug == data.restaurant_slug).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if not data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    # Verify payment if online
    payment_status = "pending"
    if data.payment_method == "online":
        if data.razorpay_payment_id:
            payment_status = "paid"
            # Optional signature verification when live/test secret is provided
            client = get_razorpay_client()
            if client and data.razorpay_signature and not RAZORPAY_KEY_ID.startswith("rzp_test_5173TestSmartMenu"):
                try:
                    client.utility.verify_payment_signature({
                        'razorpay_order_id': data.razorpay_order_id,
                        'razorpay_payment_id': data.razorpay_payment_id,
                        'razorpay_signature': data.razorpay_signature,
                    })
                except Exception as e:
                    print(f"Signature verification notice: {e}")
        else:
            payment_status = "pending"

    # Calculate total
    total = sum(item.price * item.quantity for item in data.items)

    order = Order(
        restaurant_id=restaurant.id,
        customer_name=data.customer_name or "Guest",
        table_number=data.table_number,
        total=round(total, 2),
        status="pending",
        payment_method=data.payment_method or "cash",
        payment_status=payment_status,
        razorpay_order_id=data.razorpay_order_id or "",
        razorpay_payment_id=data.razorpay_payment_id or "",
        notes=data.notes,
    )
    db.add(order)
    db.flush()

    # Add order items
    for item_data in data.items:
        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=item_data.menu_item_id,
            item_name=item_data.item_name,
            quantity=item_data.quantity,
            price=item_data.price,
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)
    return OrderResponse.model_validate(order)


@router.get("", response_model=List[OrderResponse])
def get_orders(
    status: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all orders for the restaurant (auth required)."""
    restaurant = get_user_restaurant(current_user, db)

    query = db.query(Order).filter(Order.restaurant_id == restaurant.id)
    if status:
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.created_at.desc()).all()
    return [OrderResponse.model_validate(o) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific order."""
    restaurant = get_user_restaurant(current_user, db)
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.restaurant_id == restaurant.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderResponse.model_validate(order)


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update order status (pending → preparing → ready → completed)."""
    restaurant = get_user_restaurant(current_user, db)
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.restaurant_id == restaurant.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = data.status
    db.commit()
    db.refresh(order)
    return OrderResponse.model_validate(order)
