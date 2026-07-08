
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static 
from custom_admin.urls import seller_urlpatterns, superuser_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication Application Route point
    path('api/auth/', include('apps_auth.urls')),
    
    # Catalog & product endpoints
    path('api/products/', include('products.urls')),
    
    # Cart & Order APIs
    path('api/orders/', include('orders.urls')),
    
    # Payment processing
    path('api/payments/', include('payments.urls')),
    
    # Site settings (store info, social media, SEO)
    path('api/site_settings/', include('site_settings.urls')),
    
    # ─── Dashboard Admin Endpoints ───────────────────────────────────────────
    # Legacy namespace — kept for backward compatibility during migration
    path('api/custom-admin/', include('custom_admin.urls')),
    
    # NEW: Seller-scoped namespace (Phase 2+)
    path('api/seller/', include((seller_urlpatterns, 'seller'), namespace='seller')),
    
    # NEW: Superuser-scoped namespace (Phase 3+)
    path('api/superuser/', include((superuser_urlpatterns, 'superuser'), namespace='superuser')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
