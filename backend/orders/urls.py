from django.urls import path
from .views import (
    CartAPIView,
    CartItemDetailView,
    WishlistDetailView,
    WishlistToggleItemView,
    UserOrderHistoryView,
    AdminOrderListView,
    OrderStatusUpdateView,
    NotificationListView,
    NotificationReadView,
    NotificationReadAllView,
    NotificationDeleteView,
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

    # Order history view
    path("order-history/", UserOrderHistoryView.as_view(), name="order-history"),
    path("admin/orders/", AdminOrderListView.as_view(), name="admin-order-list"),
    path("orders/<int:pk>/status/", OrderStatusUpdateView.as_view(), name="order-status-update"),

    # Notifications Endpoints
    path("notifications/", NotificationListView.as_view(), name="notification-list"),
    path("notifications/<int:pk>/read/", NotificationReadView.as_view(), name="notification-read"),
    path("notifications/read-all/", NotificationReadAllView.as_view(), name="notification-read-all"),
    path("notifications/<int:pk>/", NotificationDeleteView.as_view(), name="notification-delete"),
]