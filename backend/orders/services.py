# orders/services.py
from django.db import transaction
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from products.models import Product
from .models import Order, OrderItem, Cart


def fulfill_order_pipeline(order_id: int) -> Order:
    """
    Executes the atomic transactional pipeline to finalize an order.
    Converts CartItems to OrderItems, reduces stock, and marks status as Paid.
    """
    # Wrap everything in a database transaction block for absolute data safety
    with transaction.atomic():
        # 1. Fetch the targeted order and lock the row for editing
        order = get_object_or_404(Order.objects.select_for_update(), id=order_id)
        
        # Idempotency safety: If this order was already processed by a parallel process, stop immediately
        if order.is_paid or order.status == 'paid':
            return order

        # 2. Retrieve the customer's active shopping cart
        try:
            # We select_related the items and products to minimize SQL queries inside the loop
            cart = Cart.objects.prefetch_related('items__product').get(user=order.user)
        except Cart.DoesNotExist:
            raise ValidationError("Fulfillment failed: Active shopping cart could not be located.")

        # 3. Loop through cart items, migrate them to order items, and adjust inventory
        for cart_item in cart.items.all():
            product = cart_item.product
            
            # Critical stock level check right before debiting
            if product.stock_quantity < cart_item.quantity:
                raise ValidationError(
                    f"Insufficient stock for item: {product.name}. "
                    f"Requested: {cart_item.quantity}, Available: {product.stock_quantity}"
                )

            # Deduct the stock quantity permanently from inventory
            product.stock_quantity -= cart_item.quantity
            product.save()

            # Create the immutable snapshot record for this order line item
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=cart_item.quantity,
                price_at_purchase=product.final_price # Snapshotting the exact price paid
            )

        # 4. Finalize the main Order tracking record state
        order.is_paid = True
        order.status = 'paid'
        order.save()

        # 5. Clear out the temporary shopping cart so it returns to an empty state
        cart.items.all().delete()
        
        return order