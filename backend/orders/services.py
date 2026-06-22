from django.db import transaction
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from products.models import Product
from .models import Order, OrderItem


def fulfill_order_pipeline(order_id: int) -> Order:

    with transaction.atomic():

        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=order_id
        )

        # Idempotency
        if order.is_paid or order.status == 'Paid':
            return order

        # 🔥 USE SNAPSHOT ONLY (NO CART)
        order_items = OrderItem.objects.select_related('product').filter(order=order)

        if not order_items.exists():
            raise ValidationError("Order has no items (snapshot missing)")

        for item in order_items:

            product = Product.objects.select_for_update().get(id=item.product_id)

            # stock validation
            if product.stock < item.quantity:
                raise ValidationError(
                    f"Insufficient stock for {product.name}"
                )

            product.stock -= item.quantity
            product.save()

        order.is_paid = True
        order.status = 'Paid'
        order.save()

        return order