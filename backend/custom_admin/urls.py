from django.urls import path
from .views import (
    VerifyAdminRoleView,
    AdminProductManagementView,
    AdminProductImageUploadView,
    AdminMetricsView,
    CreateAdminUserView, 
)

urlpatterns = [
    path('verify-role/',          VerifyAdminRoleView.as_view(),          name='admin-verify-role'),
    path('metrics/',              AdminMetricsView.as_view(),              name='admin-metrics'),
    path('users/',                CreateAdminUserView.as_view(),           name='admin-create-user'),
    path('products/',             AdminProductManagementView.as_view(),    name='admin-product-list-create'),
    path('products/<int:pk>/',    AdminProductManagementView.as_view(),    name='admin-product-detail-mutations'),
    path('products/upload-image/', AdminProductImageUploadView.as_view(), name='admin-product-image-upload'),
]
