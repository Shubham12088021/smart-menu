"""
Order management API routes.
Customers can place orders (no auth), restaurant owners can manage them (auth required).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.models.models import User, Restaurant, Order, OrderItem, MenuItem
from app.schemas.schemas import OrderCreate, OrderResponse, OrderStatusUpdate
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def get_user_restaurant(user: User, db: Session) -> Restaurant:
    restaurant = db.query(Restaurant).filter(Restaurant.user_id == user.id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


@router.post("", response_model=OrderResponse)
def place_order(data: OrderCreate, db: Session = Depends(get_db)):
    """
    Place a new order — NO authentication required.
    This is called by customers from the public menu.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.slug == data.restaurant_slug).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if not data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    # Calculate total
    total = sum(item.price * item.quantity for item in data.items)

    order = Order(
        restaurant_id=restaurant.id,
        customer_name=data.customer_name or "Guest",
        table_number=data.table_number,
        total=round(total, 2),
        status="pending",
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
