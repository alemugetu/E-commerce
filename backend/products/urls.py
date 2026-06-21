from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet , ProductViewSet

# Initialize a standard production default router
router = DefaultRouter()

# Register the Category endpoints
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
# Export generated routes safely to the app ecosystem
urlpatterns = [
    path('', include(router.urls)),
]