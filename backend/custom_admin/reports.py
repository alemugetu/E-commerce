"""
Reports utilities — generate structured analytics data for the superuser dashboard.

All functions return serialisable dicts ready to be sent directly in DRF responses.
Queries are optimised with aggregation — no Python-level looping over large datasets.
"""

from datetime import date, timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncDate, TruncMonth
from django.contrib.auth import get_user_model

User = get_user_model()


def get_date_range(period: str):
    """
    Convert a named period string into (start_date, end_date).

    Supported periods: 7d, 30d, 90d, 12m
    Default: 30d
    """
    today = timezone.now().date()
    mapping = {
        '7d':  timedelta(days=7),
        '30d': timedelta(days=30),
        '90d': timedelta(days=90),
        '12m': timedelta(days=365),
    }
    delta = mapping.get(period, timedelta(days=30))
    return today - delta, today


def revenue_over_time(start_date, end_date, granularity='day'):
    """
    Returns daily or monthly revenue aggregates for paid orders.

    granularity: 'day' | 'month'
    Returns: list of { date: str, revenue: float, orders: int }
    """
    from orders.models import Order

    trunc_fn = TruncDate if granularity == 'day' else TruncMonth

    qs = (
        Order.objects
        .filter(status='Paid', created_at__date__gte=start_date, created_at__date__lte=end_date)
        .annotate(period=trunc_fn('created_at'))
        .values('period')
        .annotate(revenue=Sum('total_amount'), orders=Count('id'))
        .order_by('period')
    )

    return [
        {
            'date': str(row['period']),
            'revenue': float(row['revenue'] or 0),
            'orders': row['orders'],
        }
        for row in qs
    ]


def top_products(start_date, end_date, limit=10):
    """
    Returns the top N products by quantity sold in the date range.

    Returns: list of { product_id, name, units_sold, revenue }
    """
    from orders.models import OrderItem

    qs = (
        OrderItem.objects
        .filter(order__status='Paid', order__created_at__date__gte=start_date, order__created_at__date__lte=end_date)
        .values('product__id', 'product__name')
        .annotate(
            units_sold=Sum('quantity'),
            revenue=Sum('price_at_purchase'),
        )
        .order_by('-units_sold')[:limit]
    )

    return [
        {
            'product_id': row['product__id'],
            'name': row['product__name'],
            'units_sold': row['units_sold'],
            'revenue': float(row['revenue'] or 0),
        }
        for row in qs
    ]


def customer_acquisition(start_date, end_date):
    """
    Returns daily new customer registrations in the date range.

    Returns: list of { date: str, new_customers: int }
    """
    qs = (
        User.objects
        .filter(is_staff=False, is_superuser=False, created_at__date__gte=start_date, created_at__date__lte=end_date)
        .annotate(period=TruncDate('created_at'))
        .values('period')
        .annotate(new_customers=Count('id'))
        .order_by('period')
    )

    return [
        {
            'date': str(row['period']),
            'new_customers': row['new_customers'],
        }
        for row in qs
    ]


def order_status_summary(start_date, end_date):
    """
    Returns a count breakdown of orders by status for the period.

    Returns: list of { status: str, count: int, revenue: float }
    """
    from orders.models import Order

    qs = (
        Order.objects
        .filter(created_at__date__gte=start_date, created_at__date__lte=end_date)
        .values('status')
        .annotate(count=Count('id'), revenue=Sum('total_amount'))
        .order_by('-count')
    )

    return [
        {
            'status': row['status'],
            'count': row['count'],
            'revenue': float(row['revenue'] or 0),
        }
        for row in qs
    ]


def platform_summary(start_date, end_date):
    """
    Top-level KPI summary for the selected period.
    Used for the KPI cards at the top of the reports page.
    """
    from orders.models import Order

    paid_orders = Order.objects.filter(
        status='Paid',
        created_at__date__gte=start_date,
        created_at__date__lte=end_date,
    )

    total_revenue = paid_orders.aggregate(t=Sum('total_amount'))['t'] or 0
    total_orders  = Order.objects.filter(
        created_at__date__gte=start_date,
        created_at__date__lte=end_date,
    ).count()
    new_customers = User.objects.filter(
        is_staff=False, is_superuser=False,
        created_at__date__gte=start_date,
        created_at__date__lte=end_date,
    ).count()

    return {
        'total_revenue': float(total_revenue),
        'paid_orders':   paid_orders.count(),
        'total_orders':  total_orders,
        'new_customers': new_customers,
    }
