from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for the AuditLog model.
    
    Enriches the response with:
    - actor_email: the email of the user who performed the action
    - action_label: human-readable label from ACTION_CHOICES
    - formatted_timestamp: localised display string
    """
    actor_email = serializers.SerializerMethodField()
    action_label = serializers.CharField(source='get_action_display', read_only=True)
    formatted_timestamp = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'actor_email',
            'action',
            'action_label',
            'target',
            'details',
            'ip_address',
            'timestamp',
            'formatted_timestamp',
        ]
        read_only_fields = fields  # Audit logs are strictly read-only from the API

    def get_actor_email(self, obj):
        return obj.actor.email if obj.actor else 'System'

    def get_formatted_timestamp(self, obj):
        return obj.timestamp.strftime('%b %d, %Y at %I:%M %p UTC')
