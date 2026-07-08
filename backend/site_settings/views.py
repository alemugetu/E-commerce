from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny
from .models import StoreSettings
from .serializers import StoreSettingsSerializer
from apps_auth.permissions import IsSuperuser


class StoreSettingsAPIView(RetrieveUpdateAPIView):
    """
    GET  /api/site_settings/store/settings/ — public, no auth required.
    PATCH /api/site_settings/store/settings/ — superuser only (Phase 4).
    PUT is intentionally disabled; always use PATCH for partial updates.
    """
    serializer_class = StoreSettingsSerializer
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_permissions(self):
        """
        - GET/HEAD/OPTIONS → public (store info displayed on public site)
        - PATCH → superuser only
        """
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return [AllowAny()]
        return [IsSuperuser()]

    def get_object(self):
        """Always return the singleton instance (pk=1), creating it on first request."""
        obj, _ = StoreSettings.objects.get_or_create(pk=1)
        return obj

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().partial_update(request, *args, **kwargs)
