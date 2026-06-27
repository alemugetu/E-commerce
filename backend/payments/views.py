from decimal import Decimal
import requests  # type: ignore
import uuid
from types import SimpleNamespace

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from chapa import Chapa  # pyright: ignore[reportMissingImports]
from orders.models import Cart, Order, OrderItem
from orders.services import fulfill_order_pipeline
from products.models import Product


class CreateChapaCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        cart, _ = Cart.objects.get_or_create(user=user)
        cart_items = list(cart.items.select_related('product').all())

        if not cart_items:
            cart_items_payload = request.data.get('cart_items', []) or []

            if not cart_items_payload:
                return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

            for item in cart_items_payload:
                product_id = item.get('id') or item.get('product_id')
                if not product_id:
                    return Response({"error": "Invalid cart item payload."}, status=status.HTTP_400_BAD_REQUEST)

                try:
                    quantity = int(item.get('quantity', 0))
                except (ValueError, TypeError):
                    return Response({"error": "Invalid quantity value in cart payload."}, status=status.HTTP_400_BAD_REQUEST)

                if quantity <= 0:
                    return Response({"error": "Invalid quantity in cart payload."}, status=status.HTTP_400_BAD_REQUEST)

                product = Product.objects.filter(id=product_id).first()
                if not product:
                    return Response({"error": f"Cart product with id {product_id} not found."}, status=status.HTTP_400_BAD_REQUEST)

                cart_items.append(SimpleNamespace(product=product, quantity=quantity))

        total_amount = sum(item.product.get_effective_price * item.quantity for item in cart_items)

        if total_amount <= 0:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a distinct tracking key reference prefix
        tx_ref = f"TX-STORE-ET-{uuid.uuid4().hex[:10].upper()}"

        # 1. VALIDATE STOCK & CREATE ORDER WITH SNAPSHOT INSIDE TRANSACTION
        try:
            with transaction.atomic():
                db_cart_items = cart.items.select_related('product').all()

                if db_cart_items.exists():
                    cart_items = list(db_cart_items)

                if not cart_items:
                    return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
                
                # Validate stock availability BEFORE modifying tables
                for item in cart_items:
                    product = item.product
                    if product.stock < item.quantity:
                        return Response(
                            {"error": f"Insufficient stock for {product.name}. Available: {product.stock}, Requested: {item.quantity}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                # Create the master transaction record row
                order = Order.objects.create(
                    user=user,
                    total_amount=total_amount,
                    tx_ref=tx_ref,
                    status="Pending",
                    is_paid=False
                )
                
                # Create immutable OrderItem snapshots
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
            return Response({"error": f"Error creating order record pipeline: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2. CALL CHAPA OUTSIDE TRANSACTION BLOCKS Safely
        try:
            # FIX 1: Properly initialize the Chapa SDK instance object using your settings API key context
            chapa_instance = Chapa(settings.CHAPA_SECRET_KEY)

            # FIX 2: Dynamically bind server host environments instead of using hardcoded string domains
            backend_base = getattr(settings, 'BACKEND_URL', 'http://127.0.0.1:8000')
            frontend_base = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')

            response = chapa_instance.initialize(
                email=user.email,
                amount=str(total_amount),
                first_name=user.first_name or "Customer",
                last_name=user.last_name or "StoreET",
                tx_ref=tx_ref,
                currency="ETB",
                callback_url=f"{backend_base}/api/payments/webhook/",
                return_url=f"{frontend_base}/checkout-success?tx_ref={tx_ref}"
            )

            if response.get("status") != "success":
                # FIX 3: Preserve ledger sequence histories. Flip the status state instead of deleting rows
                order.status = "Cancelled"
                order.save()
                return Response(
                    {"error": "Payment initialization handshake rejected by gateway.", "details": response},
                    status=status.HTTP_502_BAD_GATEWAY
                )

            checkout_url = response["data"]["checkout_url"]

            return Response({
                "checkout_url": checkout_url,
                "tx_ref": tx_ref,
                "order_id": order.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # FIX 3: Safety state mapping rollback configuration modification
            order.status = "Cancelled"
            order.save()
            return Response(
                {"error": "Critical execution gateway communications crash.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChapaWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        tx_ref = request.data.get("tx_ref")

        if not tx_ref:
            return Response({"error": "Missing tracking context reference value key."}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.filter(tx_ref=tx_ref).first()

        if not order:
            return Response({"error": "Order instance reference lookup not found."}, status=status.HTTP_404_NOT_FOUND)

        # 🔒 IDEMPOTENCY CHECK: Protect against repeated delivery network webhooks double-charging stock
        if order.is_paid:
            return Response({"message": "Transaction profile record has already been successfully compiled and verified."}, status=status.HTTP_200_OK)

        # 🔥 VERIFY WITH CHAPA VIA BACK-CHANNEL HANDSHAKE
        url = f"https://api.chapa.co/v1/transaction/verify/{tx_ref}"
        headers = {"Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}"}

        try:
            resp = requests.get(url, headers=headers, timeout=10)
            data = resp.json()
        except Exception as e:
            return Response({"error": f"Internal communication link dropped during server verify loop: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if resp.status_code != 200 or data.get("status") != "success":
            return Response({"error": "Gateway rejected verification authenticity query authorization parameters."}, status=status.HTTP_400_BAD_REQUEST)

        payment_amount = Decimal(str(data.get("data", {}).get("amount", 0)))

        # 💰 TOTAL BALANCE MATCH INTEGRITY LEDGER CHECK
        if payment_amount != order.total_amount:
            return Response({"error": "Data validation failure: Serialized financial balance mismatch."}, status=status.HTTP_400_BAD_REQUEST)

        # 🎯 COMMIT RECORD REALLOCATION COMPLETION MUTATIONS
        try:
            # We wrap the pipeline call and cart teardown together to guarantee database finalization consistency
            with transaction.atomic():
                # 1. Fire execution service logic. It places row locks, checks stock, decrements inventory, and marks Order as Paid.
                fulfill_order_pipeline(order.id)
                
                # 2. Clear user's database cart records upon successful pipeline completion
                cart = Cart.objects.filter(user=order.user).first()
                if cart:
                    cart.items.all().delete()

            return Response({"message": "Payment verified and order finalized safely."}, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Fulfillment operations error occurred inside execution context: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

        