"""
Custom Admin Models

AuditLog: records every significant superuser action across the platform.
Populated via Django signals in apps_auth and custom_admin signal handlers.
"""

from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    """
    Immutable ledger of superuser and privileged-user actions.

    Records who did what to which object at what time.
    Rows are NEVER updated or deleted — append-only.
    """

    # ── Action category choices ──────────────────────────────────────────────
    ACTION_CHOICES = [
        # User / account management
        ('user_created',        'User Created'),
        ('user_deleted',        'User Deleted'),
        ('user_blocked',        'User Blocked'),
        ('user_unblocked',      'User Unblocked'),
        ('role_changed',        'Role Changed'),
        ('password_reset',      'Password Reset'),

        # Customer approval workflow
        ('customer_approved',   'Customer Approved'),
        ('customer_rejected',   'Customer Rejected'),

        # Product management
        ('product_created',     'Product Created'),
        ('product_updated',     'Product Updated'),
        ('product_deactivated', 'Product Deactivated'),
        ('product_reactivated', 'Product Reactivated'),

        # Category management
        ('category_created',    'Category Created'),
        ('category_updated',    'Category Updated'),
        ('category_deleted',    'Category Deleted'),

        # Store settings
        ('settings_updated',    'Store Settings Updated'),

        # Order management
        ('order_status_changed','Order Status Changed'),

        # System / auth
        ('login',               'User Login'),
        ('logout',              'User Logout'),
    ]

    # Who performed the action (nullable: preserved even if user is later deleted)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        db_index=True,
    )

    # Categorical label of what happened
    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES,
        db_index=True,
    )

    # Human-readable description of the target entity (e.g., email address, product name, category name)
    target = models.CharField(max_length=255, blank=True)

    # Structured context data (old/new values, IDs, etc.)
    details = models.JSONField(default=dict, blank=True)

    # When it happened — immutable, set on creation
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    # Actor's IP address for security investigations (optional)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        indexes = [
            models.Index(fields=['actor', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
        ]

    def __str__(self):
        actor_email = self.actor.email if self.actor else 'System'
        return f"[{self.timestamp:%Y-%m-%d %H:%M}] {actor_email} → {self.get_action_display()}: {self.target}"

    @classmethod
    def log(cls, actor, action, target='', details=None, request=None):
        """
        Convenience class method for creating audit log entries.

        Usage:
            AuditLog.log(
                actor=request.user,
                action='user_created',
                target=new_user.email,
                details={'role': 'Seller'},
                request=request,
            )
        """
        ip = None
        if request:
            # Extract real IP — handles proxied requests via X-Forwarded-For
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0].strip()
            else:
                ip = request.META.get('REMOTE_ADDR')

        return cls.objects.create(
            actor=actor,
            action=action,
            target=str(target),
            details=details or {},
            ip_address=ip,
        )
