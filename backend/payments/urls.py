from django.urls import path
from .views import CreateChapaCheckoutView, ChapaWebhookView

app_name = 'payments'

urlpatterns = [
    path('checkout/chapa/', CreateChapaCheckoutView.as_view(), name='chapa-checkout'),
    
    # Webhook endpoint for Chapa payment verification (server-to-server)
    path('webhook/', ChapaWebhookView.as_view(), name='chapa-webhook'),
]