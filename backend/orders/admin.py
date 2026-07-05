from django.contrib import admin
from .models import Order, OrderItem, Notification


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    raw_id_fields = ['product']
    readonly_fields = ['product', 'quantity', 'price_at_purchase']
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'user',
        'total_amount',
        'status',
        'is_paid',
        'tx_ref',
        'created_at'
    ]

    list_filter = ['status', 'is_paid', 'created_at']
    search_fields = ['tx_ref', 'user__email', 'user__first_name', 'id']
    readonly_fields = ['tx_ref', 'total_amount', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    ordering = ['-created_at']

    def has_add_permission(self, request):
        return False


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'order', 'message', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['message', 'user__email']
    readonly_fields = ['user', 'order', 'message', 'created_at']
    ordering = ['-created_at']
    