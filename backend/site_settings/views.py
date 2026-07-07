from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.exceptions import PermissionDenied
from .models import StoreSettings
from .serializers import StoreSettingsSerializer


class StoreSettingsAPIView(RetrieveUpdateAPIView):
    """
    GET  /api/site_settings/store/settings/ — public, no auth required.
    PATCH /api/site_settings/store/settings/ — admin/superuser only.
    PUT is intentionally disabled; always use PATCH for partial updates.
    """
    serializer_class = StoreSettingsSerializer
    # Disable the full PUT method — only partial PATCH is allowed for writes
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_permissions(self):
        """
        Dynamically set permissions per HTTP method:
        - GET/HEAD/OPTIONS → anyone (public store info)
        - PATCH → admin/superuser only
        """
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_object(self):
        """Always return the singleton instance (pk=1), creating it on first request."""
        obj, _ = StoreSettings.objects.get_or_create(pk=1)
        return obj

    def partial_update(self, request, *args, **kwargs):
        """Enforce PATCH-only (partial=True) so admins can update individual fields."""
        kwargs['partial'] = True
        return super().partial_update(request, *args, **kwargs)
