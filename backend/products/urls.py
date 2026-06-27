from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet , ProductViewSet

# Initialize a standard production default router
router = DefaultRouter()

# Register the Category endpoints
# Expose categories under `/api/products/categories/` while keeping
# the product collection at `/api/products/` (router prefix = empty string)
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'', ProductViewSet, basename='product')
# Export generated routes safely to the app ecosystem
urlpatterns = [
    path('', include(router.urls)),
]
