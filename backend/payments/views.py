from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Cart, Order
from orders.services import fulfill_order_pipeline  
import requests # type: ignore
import uuid
from chapa import Chapa # pyright: ignore[reportMissingImports]

chapa = Chapa(settings.CHAPA_SECRET_KEY)

class CreateChapaCheckoutView(APIView):
    """
    Step 1: Creates a pending order in our database, 
    then initializes a Chapa session for the total amount.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response({"error": "Shopping cart not found."}, status=status.HTTP_404_NOT_FOUND)

        total_amount = cart.get_total_price()  

        if total_amount <= 0:
            return Response({"error": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        tx_ref = str(uuid.uuid4())

        # Use a transaction to ensure both the database order and Chapa link are created safely
        with transaction.atomic():
            # Create the initial pending order record
            order = Order.objects.create(
                user=user,
                total_amount=total_amount,
                tx_ref=tx_ref,
                status='pending' # Initial status before payment
            )

            try:
                response = chapa.initialize(
                    email=user.email,
                    amount=str(total_amount),
                    first_name=user.first_name,
                    last_name=user.last_name,
                    tx_ref=tx_ref,
                    currency="ETB",
                    callback_url="https://yourdomain.com/api/payments/verify/", 
                    return_url="https://your-frontend.com/checkout/success"
                )

                if response.get('status') == 'success':
                    checkout_url = response.get('data', {}).get('checkout_url')
                    return Response({'checkout_url': checkout_url, 'order_id': order.id}, status=status.HTTP_200_OK)
                else:
                    # Force database rollback if Chapa initialization fails
                    raise Exception("Chapa initialization failed.")
                    
            except Exception as e:
                return Response(
                    {"error": "Could not initialize payment with Chapa.", "details": str(e)}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )


class ChapaPaymentVerifyView(APIView):
    """
    Step 2: Verification endpoint that triggers our fulfillment pipeline 
    once Chapa confirms the payment was successful.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tx_ref = request.query_params.get('tx_ref')
        
        if not tx_ref:
            return Response({"error": "Transaction reference is required."}, status=status.HTTP_400_BAD_REQUEST)

        order = get_object_or_404(Order, tx_ref=tx_ref)

        # If already processed by a webhook/callback, return early (Idempotency)
        if order.is_paid:
            return Response({"message": "Payment already verified.", "status": order.status}, status=status.HTTP_200_OK)

        # Call Chapa to verify the status directly server-to-server
        url = f"https://api.chapa.co/v1/transaction/verify/{tx_ref}"
        headers = {"Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}"}
        
        try:
            response = requests.get(url, headers=headers)
            data = response.json()
            
            if response.status_code == 200 and data.get('status') == 'success':
                # EXECUTING OUR FULFILLMENT PIPELINE!
                # This drops cart items, moves them to order items, reduces stock, and marks as paid.
                finalized_order = fulfill_order_pipeline(order.id)
                
                return Response(
                    {"message": "Payment verified and order finalized successfully.", "status": finalized_order.status}, 
                    status=status.HTTP_200_OK
                )
            
            return Response({"error": "Payment verification failed at gateway."}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({"error": "Network error during verification.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

