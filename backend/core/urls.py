
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static 

urlpatterns = [
    path('admin/', admin.site.urls),
    #Authentication Application Route point
    path('api/auth/', include('apps_auth.urls')),
    #This line to map the catalog engine
    path('api/products/', include('products.urls')),
    #For the cart API
    path('api/orders/', include('orders.urls')),
    #For payments
    path('api/payments/', include('payments.urls')),
    #For admin dashboard control endpoints
    path('api/custom-admin/', include('custom_admin.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
