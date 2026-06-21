from decimal import Decimal

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from orders.models import Cart, Order
from orders.services import fulfill_order_pipeline  
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

        # 1. CREATE ORDER FIRST (NO EXTERNAL CALL INSIDE TRANSACTION)
        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            tx_ref=tx_ref,
            status="pending",
            is_paid=False
        )

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

        resp = requests.get(url, headers=headers)
        data = resp.json()

        if resp.status_code != 200 or data.get("status") != "success":
            return Response({"error": "Payment not verified"}, status=400)

        payment_amount = Decimal(data["data"]["amount"])

        # 💰 AMOUNT INTEGRITY CHECK
        if payment_amount != order.total_amount:
            return Response({"error": "Amount mismatch"}, status=400)

        # 🎯 FINALIZE ORDER SAFELY
        with transaction.atomic():
            order.is_paid = True
            order.status = "paid"
            order.save()

            fulfill_order_pipeline(order.id)

        return Response({"message": "Payment verified"}, status=200)
    
    