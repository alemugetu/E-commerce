from django.urls import path
from .views import (
    CartAPIView, 
    CartItemDetailView,
    WishlistDetailView,
    WishlistToggleItemView,
    UserOrderHistoryView
    
)


app_name = 'orders'

urlpatterns = [
    # GET to view cart, POST to add item
    path('cart/', CartAPIView.as_view(), name='cart-manage'),
    
    # PATCH to update quantity, DELETE to remove item completely
    path('cart/items/<int:pk>/', CartItemDetailView.as_view(), name='cart-item-detail'),

    # Wishlist Endpoints
    path('wishlist/', WishlistDetailView.as_view(), name='wishlist-detail'),
    path('wishlist/toggle/<int:product_id>/', WishlistToggleItemView.as_view(), name='wishlist-toggle'),

    #Order history view 
    # Orders
    # =====================
    path("order-history/", UserOrderHistoryView.as_view(), name="order-history"),



]