from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
   
)
from apps_auth.views import RegisterView
from .views import CustomerProfileDetailView, ForgotPasswordView, ConfirmPasswordResetView

app_name = 'apps_auth'

urlpatterns = [
    # 1. Registration Endpoint
    path('register/', RegisterView.as_view(), name='auth_register'),
    # 2. Login Endpoint (Obtain JWT Access & Refresh Token Pair)
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # 3. Refresh Endpoint (Issue new Access Token using Refresh Token)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', CustomerProfileDetailView.as_view(), name='customer-profile-detail' ),
    path('forgot-password/', ForgotPasswordView.as_view(), name='api-forgot-password'),
    path('reset-password-confirm/', ConfirmPasswordResetView.as_view(), name='api-reset-password-confirm'),
         ]

