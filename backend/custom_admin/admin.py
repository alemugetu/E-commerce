from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'actor', 'action', 'target', 'ip_address')
    list_filter = ('action',)
    search_fields = ('actor__email', 'target', 'action')
    readonly_fields = ('actor', 'action', 'target', 'details', 'ip_address', 'timestamp')
    ordering = ('-timestamp',)

    def has_add_permission(self, request):
        return False  # Audit logs are created by the system only

    def has_change_permission(self, request, obj=None):
        return False  # Audit logs are immutable

    def has_delete_permission(self, request, obj=None):
        return False  # Audit logs cannot be deleted
