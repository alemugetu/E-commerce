"""
Custom DRF Permission Classes for Role-Based Access Control

These classes replace scattered inline permission checks (if user.is_staff, etc.)
with centralized, reusable, testable permission logic.

Usage in views:
    class MyView(APIView):
        permission_classes = [IsSeller]  # or IsSuperuser, IsCustomer, etc.
"""

from rest_framework import permissions


class IsSeller(permissions.BasePermission):
    """
    Grants access to users with the Seller role (is_staff=True) OR Superusers.
    Superusers inherit all seller capabilities.
    
    Use this for endpoints that sellers should access:
    - Product management
    - Inventory updates
    - Order processing
    - Customer approval
    """
    message = "Access denied. Seller privileges required."

    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and (request.user.is_staff or request.user.is_superuser)
        )


class IsSellerOnly(permissions.BasePermission):
    """
    Grants access ONLY to Seller users (is_staff=True, is_superuser=False).
    Explicitly excludes superusers.
    
    Use this if you need seller-specific behavior that superusers should NOT see
    (rare — most seller endpoints should use IsSeller instead).
    """
    message = "Access denied. This endpoint is for sellers only."

    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.is_staff 
            and not request.user.is_superuser
        )


class IsSuperuser(permissions.BasePermission):
    """
    Grants access exclusively to Superusers (is_superuser=True).
    
    Use this for platform-wide administrative operations:
    - User/seller management
    - Global store settings
    - Categories management
    - System reports and audit logs
    - Role assignment
    """
    message = "Access denied. Superuser privileges required."

    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.is_superuser
        )


class IsCustomer(permissions.BasePermission):
    """
    Grants access to regular customers (is_staff=False, is_superuser=False).
    
    Use this for customer-only endpoints:
    - Personal profile updates
    - Order history viewing
    - Cart and wishlist management
    """
    message = "Access denied. This endpoint is for customers only."

    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and not request.user.is_staff 
            and not request.user.is_superuser
        )


class IsSellerOrSuperuser(permissions.BasePermission):
    """
    Explicit alias for IsSeller (same behavior).
    Provided for semantic clarity in code where the dual role access needs emphasis.
    """
    message = "Access denied. Seller or Superuser privileges required."

    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and (request.user.is_staff or request.user.is_superuser)
        )


class IsAuthenticatedCustomer(permissions.BasePermission):
    """
    Authenticated user who is a customer with approved status.
    Combines authentication check with customer role and approval verification.
    """
    message = "Access denied. Approved customer account required."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Must be a customer (not staff/superuser)
        if request.user.is_staff or request.user.is_superuser:
            return False
        
        # Must have approved status
        return getattr(request.user, 'approval_status', None) == 'approved'
