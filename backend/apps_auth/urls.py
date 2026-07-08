from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from apps_auth.views import RegisterView
from .views import CustomerProfileDetailView, ForgotPasswordView, ConfirmPasswordResetView, CustomerApprovalManagementView, UserPermissionsView
from .serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Overrides the default login view to use CustomTokenObtainPairSerializer,
    which injects is_staff, is_superuser, email, and name claims into the JWT.
    Without this, role-based routing on the frontend receives no role data.
    """
    serializer_class = CustomTokenObtainPairSerializer


app_name = 'apps_auth'

urlpatterns = [
    # 1. Registration Endpoint
    path('register/', RegisterView.as_view(), name='auth_register'),
    # 2. Login Endpoint — uses custom serializer to embed role claims (is_staff, is_superuser)
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # 3. Refresh Endpoint (Issue new Access Token using Refresh Token)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', CustomerProfileDetailView.as_view(), name='customer-profile-detail'),
    path('permissions/', UserPermissionsView.as_view(), name='user-permissions'),
    path('customers/', CustomerApprovalManagementView.as_view(), name='admin-customers-list'),
    path('customers/<int:pk>/', CustomerApprovalManagementView.as_view(), name='admin-customer-detail'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='api-forgot-password'),
    path('reset-password-confirm/', ConfirmPasswordResetView.as_view(), name='api-reset-password-confirm'),
]

