from django.urls import path
from .views import CreateChapaCheckoutView, ChapaWebhookView

urlpatterns = [
path('checkout/chapa/', CreateChapaCheckoutView.as_view(), name='chapa-checkout'),
    
    # Endpoint where Chapa or React redirects to verify payments
    path('payments/verify/', ChapaWebhookView.as_view(), name='chapa-verify'),
]