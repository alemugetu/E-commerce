"""
Custom Admin URL Configuration

Route namespaces:
  /api/custom-admin/   → DEPRECATED (Phase 4) — kept for backward compatibility
  /api/seller/         → Seller-scoped endpoints  
  /api/superuser/      → Superuser-scoped endpoints (includes audit log - Phase 4)

Migration status:
  Phase 1-2: /api/custom-admin/ was primary
  Phase 3:   /api/seller/ and /api/superuser/ introduced
  Phase 4:   /api/custom-admin/ marked deprecated, audit log added to superuser namespace
  Phase 5:   /api/custom-admin/ to be removed
"""

from django.urls import path
from .views import (
    # Role verification
    VerifyRoleView,
    # Shared metrics
    AdminMetricsView,
    # Seller-scoped
    SellerProductManagementView,
    SellerProductImageUploadView,
    # Superuser-scoped
    SuperuserCreateSellerView,
    SuperuserUserManagementView,
    # Audit log (Phase 4)
    AuditLogListView,
    SuperuserStoreSettingsAuditView,
    # Backward-compat aliases
    AdminProductManagementView,
    AdminProductImageUploadView,
    CreateAdminUserView,
    AdminUserManagementView,
    VerifyAdminRoleView,
)


# ─── Legacy namespace (/api/custom-admin/) — DEPRECATED ──────────────────────
# These paths remain active for backward compatibility.
# DO NOT add new endpoints here.
# Scheduled for removal in Phase 5.
urlpatterns = [
    path('verify-role/',           VerifyAdminRoleView.as_view(),           name='admin-verify-role'),
    path('metrics/',               AdminMetricsView.as_view(),              name='admin-metrics'),
    path('users/',                 CreateAdminUserView.as_view(),           name='admin-create-user'),
    path('users/manage/',          AdminUserManagementView.as_view(),       name='admin-users-list'),
    path('users/<int:pk>/',        AdminUserManagementView.as_view(),       name='admin-user-detail'),
    path('products/',              AdminProductManagementView.as_view(),    name='admin-product-list-create'),
    path('products/<int:pk>/',     AdminProductManagementView.as_view(),    name='admin-product-detail-mutations'),
    path('products/upload-image/', AdminProductImageUploadView.as_view(),   name='admin-product-image-upload'),
]


# ─── Seller namespace (/api/seller/) ─────────────────────────────────────────
seller_urlpatterns = [
    path('verify-role/',           VerifyRoleView.as_view(),                name='seller-verify-role'),
    path('metrics/',               AdminMetricsView.as_view(),              name='seller-metrics'),
    path('products/',              SellerProductManagementView.as_view(),   name='seller-product-list-create'),
    path('products/<int:pk>/',     SellerProductManagementView.as_view(),   name='seller-product-detail'),
    path('products/upload-image/', SellerProductImageUploadView.as_view(),  name='seller-product-image-upload'),
]


# ─── Superuser namespace (/api/superuser/) ───────────────────────────────────
superuser_urlpatterns = [
    path('verify-role/',           VerifyRoleView.as_view(),                name='superuser-verify-role'),
    path('metrics/',               AdminMetricsView.as_view(),              name='superuser-metrics'),

    # Team management
    path('users/',                 SuperuserCreateSellerView.as_view(),     name='superuser-create-user'),
    path('users/manage/',          SuperuserUserManagementView.as_view(),   name='superuser-users-list'),
    path('users/<int:pk>/',        SuperuserUserManagementView.as_view(),   name='superuser-user-detail'),

    # Audit log (Phase 4)
    path('audit/',                 AuditLogListView.as_view(),              name='superuser-audit-list'),
    path('settings/audit/',        SuperuserStoreSettingsAuditView.as_view(), name='superuser-settings-audit'),
]
