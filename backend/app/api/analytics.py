"""
Analytics API routes.
Provides dashboard statistics from locally stored data.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone

from app.database.database import get_db
from app.models.models import User, Restaurant, Category, MenuItem, Order, OrderItem, Analytics
from app.schemas.schemas import AnalyticsResponse
from app.utils.auth import get_current_user
from app.utils.restaurant import get_user_restaurant

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsResponse)
def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get dashboard analytics and statistics."""
    restaurant = get_user_restaurant(current_user, db)
    rid = restaurant.id

    # Basic counts
    total_items = db.query(MenuItem).filter(MenuItem.restaurant_id == rid).count()
    total_categories = db.query(Category).filter(Category.restaurant_id == rid).count()
    total_orders = db.query(Order).filter(Order.restaurant_id == rid).count()

    # Revenue
    revenue_result = (
        db.query(func.sum(Order.total))
        .filter(Order.restaurant_id == rid, Order.status != "cancelled")
        .scalar()
    )
    total_revenue = round(revenue_result or 0, 2)

    # Analytics events
    total_views = (
        db.query(Analytics)
        .filter(Analytics.restaurant_id == rid, Analytics.event_type == "menu_view")
        .count()
    )
    total_qr_scans = (
        db.query(Analytics)
        .filter(Analytics.restaurant_id == rid, Analytics.event_type == "qr_scan")
        .count()
    )

    # Top viewed items
    top_viewed = (
        db.query(Analytics.item_id, func.count(Analytics.id).label("view_count"))
        .filter(
            Analytics.restaurant_id == rid,
            Analytics.event_type == "item_view",
            Analytics.item_id.isnot(None),
        )
        .group_by(Analytics.item_id)
        .order_by(func.count(Analytics.id).desc())
        .limit(5)
        .all()
    )
    top_items = []
    for item_id, count in top_viewed:
        item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
        if item:
            top_items.append({"name": item.name, "views": count})

    # Top ordered items
    top_ordered_query = (
        db.query(OrderItem.item_name, func.sum(OrderItem.quantity).label("total_qty"))
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.restaurant_id == rid)
        .group_by(OrderItem.item_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    top_ordered = [{"name": name, "orders": int(qty)} for name, qty in top_ordered_query]

    # Recent orders
    recent = (
        db.query(Order)
        .filter(Order.restaurant_id == rid)
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )
    recent_orders = [
        {
            "id": o.id,
            "customer_name": o.customer_name,
            "table_number": o.table_number,
            "total": o.total,
            "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else "",
            "item_count": len(o.items),
        }
        for o in recent
    ]

    # Order trend (last 7 days)
    order_trend = []
    for i in range(6, -1, -1):
        day = datetime.now(timezone.utc) - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
        count = (
            db.query(Order)
            .filter(
                Order.restaurant_id == rid,
                Order.created_at >= day_start,
                Order.created_at <= day_end,
            )
            .count()
        )
        order_trend.append({
            "date": day.strftime("%a"),
            "orders": count,
        })

    return AnalyticsResponse(
        total_items=total_items,
        total_categories=total_categories,
        total_orders=total_orders,
        total_revenue=total_revenue,
        total_views=total_views,
        total_qr_scans=total_qr_scans,
        top_items=top_items,
        top_ordered=top_ordered,
        recent_orders=recent_orders,
        order_trend=order_trend,
    )
