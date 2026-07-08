// apps_auth/permission_utils.py

"""Utility permission classes for role‑based access using Django Groups and Permissions.

Provides:
- `IsInGroup` – checks if the authenticated user belongs to a given group name.
- `HasPermissions` – DRF BasePermission that checks a list of permission codenames.

Usage example in a view:
```python
from .permission_utils import HasPermissions

class InventoryView(APIView):
    permission_classes = [HasPermissions]
    required_permissions = ["view_inventory", "change_inventory"]
```
"""

from rest_framework import permissions
from django.contrib.auth.models import Group, Permission


class IsInGroup(permissions.BasePermission):
    """Grant access if the user is a member of the specified group.

    The view should set `required_group` attribute (string).
    """

    message = "User does not belong to the required group."

    def has_permission(self, request, view):
        group_name = getattr(view, "required_group", None)
        if not group_name:
            return False
        return (
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name=group_name).exists()
        )


class HasPermissions(permissions.BasePermission):
    """Grant access if the user has **all** permissions listed in `required_permissions`.

    The view should define a class attribute `required_permissions` as a list of codename strings.
    """

    message = "Insufficient permissions."

    def has_permission(self, request, view):
        perms = getattr(view, "required_permissions", [])
        if not perms:
            # No specific permission required – allow access.
            return True
        if not (request.user and request.user.is_authenticated):
            return False
        # `get_all_permissions` returns strings like "app_label.codename"
        user_perms = request.user.get_all_permissions()
        user_codenames = {p.split('.')[-1] for p in user_perms}
        return set(perms).issubset(user_codenames)
