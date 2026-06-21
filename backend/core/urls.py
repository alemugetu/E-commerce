
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    #Authentication Application Route point
    path('api/auth/', include('apps_auth.urls')),
    #This line to map the catalog engine
    path('api/products/', include('products.urls')),
    #For the cart API
    path('api/orders', include('orders.urls')),
]
