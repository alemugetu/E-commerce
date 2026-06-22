from decimal import Decimal

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from orders.models import Cart, Order, OrderItem
from orders.services import fulfill_order_pipeline  
from products.models import Product
import requests # type: ignore
import uuid
from chapa import Chapa # pyright: ignore[reportMissingImports]

class CreateChapaCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=404)

        total_amount = cart.get_total_price()

        if total_amount <= 0:
            return Response({"error": "Cart is empty"}, status=400)

        tx_ref = str(uuid.uuid4())

        # 1. VALIDATE STOCK & CREATE ORDER WITH SNAPSHOT INSIDE TRANSACTION
        try:
            with transaction.atomic():
                # Fetch cart items with product details
                cart_items = cart.items.select_related('product').all()
                
                if not cart_items.exists():
                    return Response({"error": "Cart is empty"}, status=400)
                
                # Validate stock availability BEFORE creating order
                for item in cart_items:
                    product = item.product
                    if product.stock < item.quantity:
                        return Response(
                            {"error": f"Insufficient stock for {product.name}. Available: {product.stock}, Requested: {item.quantity}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                # Create pending order
                order = Order.objects.create(
                    user=user,
                    total_amount=total_amount,
                    tx_ref=tx_ref,
                    status="Pending",
                    is_paid=False
                )
                
                # Create OrderItem snapshots from cart items
                for item in cart_items:
                    OrderItem.objects.create(
                        order=order,
                        product=item.product,
                        quantity=item.quantity,
                        price_at_purchase=item.product.get_effective_price
                    )
                
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Error creating order. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2. CALL CHAPA OUTSIDE TRANSACTION
        try:
            response = Chapa.initialize(
                email=user.email,
                amount=str(total_amount),
                first_name=user.first_name,
                last_name=user.last_name,
                tx_ref=tx_ref,
                currency="ETB",
                callback_url="https://yourdomain.com/api/payments/webhook/",
                return_url="https://yourfrontend.com/success"
            )

            if response.get("status") != "success":
                order.delete()
                return Response(
                    {"error": "Payment initialization failed"},
                    status=400
                )

            checkout_url = response["data"]["checkout_url"]

            return Response({
                "checkout_url": checkout_url,
                "order_id": order.id
            })

        except Exception as e:
            # rollback safety
            order.delete()
            return Response(
                {"error": "Chapa error", "details": str(e)},
                status=500
            )


class ChapaWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        tx_ref = request.data.get("tx_ref")

        if not tx_ref:
            return Response({"error": "Missing tx_ref"}, status=400)

        order = Order.objects.filter(tx_ref=tx_ref).first()

        if not order:
            return Response({"error": "Order not found"}, status=404)

        # 🔒 IDEMPOTENCY CHECK
        if order.is_paid:
            return Response({"message": "Already processed"}, status=200)

        # 🔥 VERIFY WITH CHAPA (SERVER TO SERVER)
        url = f"https://api.chapa.co/v1/transaction/verify/{tx_ref}"
        headers = {"Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}"}

        try:
            resp = requests.get(url, headers=headers, timeout=10)
            data = resp.json()
        except Exception as e:
            return Response({"error": "Payment verification failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if resp.status_code != 200 or data.get("status") != "success":
            return Response({"error": "Payment not verified"}, status=status.HTTP_400_BAD_REQUEST)

        payment_amount = Decimal(str(data.get("data", {}).get("amount", 0)))

        # 💰 AMOUNT INTEGRITY CHECK
        if payment_amount != order.total_amount:
            return Response({"error": "Amount mismatch"}, status=status.HTTP_400_BAD_REQUEST)

        # 🎯 FINALIZE ORDER SAFELY
        try:
            with transaction.atomic():
                order.is_paid = True
                order.status = "Paid"
                order.save()

                # Fulfill the order (reduce inventory)
                fulfill_order_pipeline(order.id)
                
                # Clear user's cart after successful payment
                cart = Cart.objects.filter(user=order.user).first()
                if cart:
                    cart.items.all().delete()

            return Response({"message": "Payment verified and order finalized"}, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Error finalizing order"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Payment verified"}, status=200)
    
    