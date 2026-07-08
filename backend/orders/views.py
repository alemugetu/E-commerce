from rest_framework import views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from products.models import Product
from .models import Cart, CartItem, Notification
from .serializers import CartSerializer
from .models import Cart, CartItem, Wishlist, WishlistItem, Order
from .serializers import CartSerializer, CartItemSerializer, WishlistSerializer, WishlistItemSerializer, OrderSerializer, NotificationSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.db import transaction
from .services import fulfill_order_pipeline
from chapa import Chapa  # type: ignore[import]
import requests # type: ignore
import uuid
from apps_auth.permissions import IsSeller

class CartAPIView(APIView):
    """
    Handles retrieving the user's master cart and adding new items to it.
    """
    # Strictly lock this endpoint down to logged-in users with valid JWTs
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Fetch the cart for the user. If they don't have one, create it instantly.
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Add an item to the cart
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        # Extract data from the React frontend's JSON payload
        product_id = request.data.get('product_id')
        try:
            quantity = int(request.data.get('quantity', 1))
        except (ValueError, TypeError):
            return Response(
                {"error": "Quantity must be a valid integer."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate quantity range
        if quantity <= 0 or quantity > 10000:
            return Response(
                {"error": "Quantity must be between 1 and 10000."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ensure the product actually exists in the database
        product = get_object_or_404(Product, id=product_id)

        # Check if this exact product is already in the user's cart
        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product,
            defaults={'quantity': quantity}
        )

        # If it was already in the cart, simply increase the quantity
        if not item_created:
            cart_item.quantity += quantity
            cart_item.save()

        # Return the updated master cart back to the frontend
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartItemDetailView(APIView):
    """
    Handles updating the quantity of a specific item or removing it entirely.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        # Ensure the user is only updating an item that belongs to THEIR cart
        cart_item = get_object_or_404(CartItem, id=pk, cart__user=request.user)
        try:
            new_quantity = int(request.data.get('quantity', cart_item.quantity))
        except (ValueError, TypeError):
            return Response(
                {"error": "Quantity must be a valid integer."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate quantity range
        if new_quantity < 0 or new_quantity > 10000:
            return Response(
                {"error": "Quantity must be between 0 and 10000. Use 0 to remove item."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_quantity <= 0:
            cart_item.delete()
        else:
            cart_item.quantity = new_quantity
            cart_item.save()
        
        cart = Cart.objects.get(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        # Securely delete the item
        cart_item = get_object_or_404(CartItem, id=pk, cart__user=request.user)
        cart_item.delete()
        cart = Cart.objects.get(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class WishlistDetailView(views.APIView):
    """
    Retrieves the authenticated user's master wishlist.
    Creates a blank wishlist if one doesn't exist yet.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class WishlistToggleItemView(views.APIView):
    """
    Toggles a product in the wishlist. 
    Adds the product if it isn't there, or removes it if it is already saved.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_id):
        # 1. Fetch or create the user's wishlist container
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        
        # 2. Verify the requested product actually exists in the catalog
        from products.models import Product # Local import to prevent circular dependencies
        product = get_object_or_404(Product, id=product_id)

        # 3. Check if the item is already saved
        wishlist_item = WishlistItem.objects.filter(wishlist=wishlist, product=product).first()

        if wishlist_item:
            # If it exists, the user is un-favoriting it (Toggle Off)
            wishlist_item.delete()
            return Response({"detail": "Product removed from wishlist."}, status=status.HTTP_200_OK)
        else:
            # If it doesn't exist, the user is favoriting it (Toggle On)
            WishlistItem.objects.create(wishlist=wishlist, product=product)
            return Response({"detail": "Product added to wishlist."}, status=status.HTTP_201_CREATED)
        
        
class CheckoutAPIView(APIView):
    """
    Converts the user's database cart into an active Order and initializes 
    the secure Chapa payment gateway transaction.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # Fetch the user's database cart container
        try:
            cart = Cart.objects.get(user=user)
            cart_items = cart.items.all() # Pulls related CartItem records
        except Cart.DoesNotExist:
            return Response({"error": "No active cart found for this account."}, status=status.HTTP_404_NOT_FOUND)

        if not cart_items.exists():
            return Response({"error": "Your cart is empty. Cannot initiate checkout."}, status=status.HTTP_400_BAD_REQUEST)

        # Use Django's atomic transaction context block to protect data integrity
        with transaction.atomic():
            total_amount = 0
            order_items_to_create = []

            # 1. Loop through database items to compute the absolute untampered total
            for item in cart_items:
                product = item.product
                
                # Verify product availability status
                if not getattr(product, 'is_available', True):
                    return Response(
                        {"error": f"Product '{product.name}' is no longer available. Please remove it from your cart."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

                item_subtotal = product.final_price * item.quantity
                total_amount += item_subtotal

                # Stage the OrderItem data structures
                order_items_to_create.append({
                    'product': product,
                    'quantity': item.quantity,
                    'price_at_purchase': product.final_price
                })

            # 2. Build a unique tracking reference string for Chapa auditing
            unique_tx_ref = f"TX-STORE-ET-{uuid.uuid4().hex[:10].upper()}"

            # 3. Instantiate the master order snapshot using your exact schema parameters
            from orders.models import Order, OrderItem  # Localized import to prevent cross-app circular traps
            
            order = Order.objects.create(
                user=user,
                total_amount=total_amount,
                tx_ref=unique_tx_ref,
                status='Pending',
                is_paid=False
            )

            # 4. Bulk write row items to optimize database performance
            for item_data in order_items_to_create:
                OrderItem.objects.create(
                    order=order,
                    product=item_data['product'],
                    quantity=item_data['quantity'],
                    price_at_purchase=item_data['price_at_purchase']
                )

        # 5. Connect to the Chapa API using the imported Chapa SDK instance wrapper
        try:
            # Fallback to test keys if environment variable configurations aren't injected yet
            secret_key = getattr(settings, 'CHAPA_SECRET_KEY', 'CHAPA_TEST-MOCKSECRETKEY')
            chapa = Chapa(secret_key)

            # Build initialization options map
            checkout_data = {
                'amount': float(order.total_amount),
                'currency': 'ETB',
                'email': user.email,
                'first_name': user.first_name or "Customer",
                'last_name': user.last_name or "StoreET",
                'tx_ref': order.tx_ref,
                'callback_url': f"http://127.0.0.1:8000/api/orders/webhook/chapa/",
                'return_url': f"http://localhost:5173/checkout-success?tx_ref={order.tx_ref}",
                'customization': {
                    'title': 'STORE.ET Electronics Fulfillment',
                    'description': f'Payment for Order Reference #{order.id}'
                }
            }

            # Fire initial signature handshakes to Chapa servers
            response = chapa.initialize(**checkout_data)

            if response.get('status') == 'success':
                # Return the hosted checkout link back to the React client application
                return Response({
                    "checkout_url": response['data']['checkout_url'],
                    "tx_ref": order.tx_ref
                }, status=status.HTTP_201_CREATED)
            else:
                # Mark order status failed if gateway signature bounds crash
                order.status = 'Cancelled'
                order.save()
                return Response({"error": "Chapa initialization handshake failed.", "details": response}, status=status.HTTP_502_BAD_GATEWAY)

        except Exception as e:
            order.status = 'Cancelled'
            order.save()
            return Response({"error": "Communication failure with Chapa payment processing networks.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrderHistoryPagination(PageNumberPagination):
    """ Custom pagination schema to control page sizes for order logs """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class UserOrderHistoryView(APIView):
    """
    Retrieves a paginated, chronologically sorted collection of past
    orders submitted by the authenticated user session.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        orders = (
            Order.objects.filter(user=user)
            .order_by('-created_at')
            .prefetch_related(
                'items__product__category',
                'items__product__images'
            )
        )

        paginator = OrderHistoryPagination()
        paginated_queryset = paginator.paginate_queryset(orders, request, view=self)

        serializer = OrderSerializer(
            paginated_queryset,
            many=True,
            context={'request': request}
        )

        return paginator.get_paginated_response(serializer.data)


class AdminOrderListView(APIView):
    """
    Retrieves all orders for sellers and superusers to view and manage.
    """
    permission_classes = [IsSeller]

    def get(self, request):
        orders = (
            Order.objects.all()
            .order_by('-created_at')
            .prefetch_related(
                'items__product__category',
                'items__product__images'
            )
            .select_related('user')
        )

        paginator = OrderHistoryPagination()
        paginated_queryset = paginator.paginate_queryset(orders, request, view=self)

        serializer = OrderSerializer(
            paginated_queryset,
            many=True,
            context={'request': request}
        )

        return paginator.get_paginated_response(serializer.data)


class OrderStatusUpdateView(APIView):
    """Allow sellers and superusers to update an order status."""
    permission_classes = [IsSeller]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        new_status = request.data.get('status', '').strip()

        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({"error": "Invalid order status."}, status=status.HTTP_400_BAD_REQUEST)

        old_status = order.status
        order.status = new_status
        if new_status == 'Paid':
            order.is_paid = True
        elif new_status in {'Cancelled', 'Pending'}:
            order.is_paid = False

        order.save(update_fields=['status', 'is_paid', 'updated_at'])

        # Create notification only if status actually changed
        if old_status != new_status:
            Notification.objects.create(
                user=order.user,
                order=order,
                message=f"Order #{order.id} status updated to {new_status}"
            )
            # ── Audit log ────────────────────────────────────────────────────
            try:
                from custom_admin.models import AuditLog
                AuditLog.log(
                    actor=request.user,
                    action='order_status_changed',
                    target=f"Order #{order.id}",
                    details={
                        'order_id': order.id,
                        'old_status': old_status,
                        'new_status': new_status,
                        'customer': order.user.email,
                        'changed_by': request.user.email,
                    },
                    request=request,
                )
            except Exception:
                pass  # Audit failure must never break the primary flow

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificationReadAllView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        notifications = Notification.objects.filter(user=request.user, is_read=False)
        notifications.update(is_read=True)
        return Response({"message": "All notifications marked as read"}, status=status.HTTP_200_OK)


class NotificationDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
     
    