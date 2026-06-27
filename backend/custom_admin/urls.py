from django.urls import path
from .views import VerifyAdminRoleView, AdminProductManagementView, AdminProductImageUploadView

urlpatterns = [
    path('verify-role/', VerifyAdminRoleView.as_view(), name='admin-verify-role'),
    path('products/', AdminProductManagementView.as_view(), name='admin-product-list-create'),
    path('products/<int:pk>/', AdminProductManagementView.as_view(), name='admin-product-detail-mutations'),
    path('products/upload-image/', AdminProductImageUploadView.as_view(), name='admin-product-image-upload'), # <-- NEW
]

