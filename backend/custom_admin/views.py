"""
Custom Admin Views — Seller & Superuser Dashboard Endpoints

Permission strategy:
  - IsSeller       → product CRUD, order management, customer approvals, metrics
  - IsSuperuser    → user provisioning, role management, system-wide operations

All inline if-checks have been replaced with DRF permission classes.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.db.models import Sum, Q
from django.utils import timezone

from apps_auth.permissions import IsSeller, IsSuperuser
from products.serializers import ProductImageSerializer, ProductSerializer
from products.models import Product
from orders.models import Order
from .models import AuditLog
from .serializers import AuditLogSerializer

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
# SHARED — accessible by both Sellers and Superusers
# ─────────────────────────────────────────────────────────────────────────────

class AdminMetricsView(APIView):
    """
    Aggregated dashboard metrics.
    Sellers see product/order metrics.
    Superusers see the same plus platform-wide counts.
    """
    permission_classes = [IsSeller]

    def get(self, request):
        total_products = Product.objects.count()
        available_products = Product.objects.filter(is_available=True).count()
        out_of_stock_products = Product.objects.filter(stock__lte=0).count()
        total_inventory_units = Product.objects.aggregate(total=Sum('stock'))['total'] or 0

        paid_orders = Order.objects.filter(status='Paid')
        total_sales = paid_orders.aggregate(total_sales=Sum('total_amount'))['total_sales'] or 0
        pending_orders = Order.objects.filter(status='Pending').count()
        processing_orders = Order.objects.filter(status='Processing').count()

        # Base metrics available to all seller-level users
        metrics = {
            'total_products': total_products,
            'available_products': available_products,
            'out_of_stock_products': out_of_stock_products,
            'total_inventory_units': total_inventory_units,
            'total_sales': float(total_sales),
            'paid_orders': paid_orders.count(),
            'pending_orders': pending_orders,
            'processing_orders': processing_orders,
        }

        # Superusers get additional platform-wide user counts
        if request.user.is_superuser:
            total_customers = User.objects.filter(is_staff=False, is_superuser=False).count()
            total_sellers = User.objects.filter(is_staff=True, is_superuser=False).count()
            pending_customers = User.objects.filter(
                is_staff=False, is_superuser=False, approval_status='pending'
            ).count()
            metrics.update({
                'total_customers': total_customers,
                'total_sellers': total_sellers,
                'pending_customers': pending_customers,
            })

        return Response(metrics, status=status.HTTP_200_OK)


class VerifyRoleView(APIView):
    """
    Role verification endpoint consumed by React protected route components.
    Returns the authenticated user's role flags so the frontend can make
    routing decisions after session restoration.
    
    Previously: VerifyAdminRoleView (only checked staff/superuser, both got same response)
    Now: Returns granular role data so the frontend can route to /seller or /admin correctly.
    """
    permission_classes = [IsSeller]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            # Derived seller flag — true when is_staff but NOT superuser
            "is_seller": user.is_staff and not user.is_superuser,
        }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# SELLER SCOPE — Product management & image uploads
# ─────────────────────────────────────────────────────────────────────────────

class SellerProductManagementView(APIView):
    """
    Full product CRUD for seller-level users and superusers.
    
    POST   /api/seller/products/           → create product
    PUT    /api/seller/products/<pk>/      → full update
    PATCH  /api/seller/products/<pk>/      → partial update
    DELETE /api/seller/products/<pk>/      → soft-delete (deactivate)
    """
    permission_classes = [IsSeller]

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """Explicit partial update — identical behavior to PUT with partial=True."""
        return self.put(request, pk)

    def delete(self, request, pk):
        """
        Soft-delete: sets is_active=False to preserve order history references.
        Hard-delete is intentionally not supported — orders reference products.
        """
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        product.is_active = False
        product.is_available = False
        product.save(update_fields=['is_active', 'is_available'])
        return Response(
            {"message": f'"{product.name}" has been deactivated and hidden from the store.'},
            status=status.HTTP_200_OK
        )


class SellerProductImageUploadView(APIView):
    """
    Multipart image upload endpoint for attaching images to existing products.
    """
    permission_classes = [IsSeller]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = ProductImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
# SUPERUSER SCOPE — User & seller account management
# ─────────────────────────────────────────────────────────────────────────────

class SuperuserCreateSellerView(APIView):
    """
    Superuser-only: provision new seller (staff) or superuser accounts.

    POST /api/superuser/users/
    """
    permission_classes = [IsSuperuser]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        # Default: create a seller (is_staff=True, is_superuser=False)
        is_staff = request.data.get('is_staff', True)
        is_superuser = request.data.get('is_superuser', False)

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "An account with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        # Superuser flag forces is_staff=True as well
        user.is_superuser = bool(is_superuser)
        user.is_staff = bool(is_staff) or bool(is_superuser)
        user.approval_status = 'approved'
        user.is_active = True
        user.save()

        # Handle role group association
        role_group = request.data.get('role_group')
        if role_group and not user.is_superuser:
            from django.contrib.auth.models import Group
            group, _ = Group.objects.get_or_create(name=role_group)
            user.groups.add(group)

        # Get serialized role label
        groups = list(user.groups.values_list('name', flat=True))
        role_label = 'Superuser' if user.is_superuser else (groups[0] if groups else 'Seller')

        # ── Audit log ────────────────────────────────────────────────────────
        AuditLog.log(
            actor=request.user,
            action='user_created',
            target=user.email,
            details={
                'role': role_label,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'created_by': request.user.email,
            },
            request=request,
        )

        return Response({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'role': role_label,
        }, status=status.HTTP_201_CREATED)


class SuperuserUserManagementView(APIView):
    """
    Superuser-only: list, update role/status, and remove seller/superuser accounts.

    GET    /api/superuser/users/manage/    → list all privileged users
    PATCH  /api/superuser/users/<pk>/      → update role flags or active status
    DELETE /api/superuser/users/<pk>/      → permanently remove account
    """
    permission_classes = [IsSuperuser]

    def _serialize_user(self, user):
        groups = list(user.groups.values_list('name', flat=True))
        role_label = 'Superuser' if user.is_superuser else (groups[0] if groups else 'Seller')
        return {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'is_active': user.is_active,
            'role': role_label,
            'created_at': user.created_at.isoformat() if hasattr(user, 'created_at') else None,
        }

    def get(self, request):
        privileged_users = User.objects.filter(
            Q(is_staff=True) | Q(is_superuser=True)
        ).order_by('-is_superuser', '-is_staff', 'email')

        return Response({
            'results': [self._serialize_user(u) for u in privileged_users],
            'summary': {
                'total': privileged_users.count(),
                'sellers': privileged_users.filter(is_staff=True, is_superuser=False).count(),
                'superusers': privileged_users.filter(is_superuser=True).count(),
                'active': privileged_users.filter(is_active=True).count(),
                'inactive': privileged_users.filter(is_active=False).count(),
            },
        }, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        try:
            target = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User account not found."}, status=status.HTTP_404_NOT_FOUND)

        # Prevent superusers from locking themselves out
        if target.pk == request.user.pk:
            return Response(
                {"error": "You cannot modify your own account from this panel."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Capture old values before mutation for audit context
        old_is_active = target.is_active
        old_is_staff = target.is_staff
        old_is_superuser = target.is_superuser

        # Apply only the fields provided in the request body
        if 'is_active' in request.data:
            target.is_active = bool(request.data['is_active'])
        if 'is_staff' in request.data:
            target.is_staff = bool(request.data['is_staff'])
        if 'is_superuser' in request.data:
            target.is_superuser = bool(request.data['is_superuser'])
            # Superusers must always have is_staff=True
            if target.is_superuser:
                target.is_staff = True
        if 'role_group' in request.data:
            role_group = request.data['role_group']
            # Clear existing groups, then add the new one
            target.groups.clear()
            if role_group and role_group != 'Superuser' and role_group != 'Customer':
                from django.contrib.auth.models import Group
                group, _ = Group.objects.get_or_create(name=role_group)
                target.groups.add(group)

        target.save()

        # ── Audit log ────────────────────────────────────────────────────────
        if 'is_active' in request.data and old_is_active != target.is_active:
            action = 'user_unblocked' if target.is_active else 'user_blocked'
            AuditLog.log(
                actor=request.user,
                action=action,
                target=target.email,
                details={'is_active': target.is_active, 'changed_by': request.user.email},
                request=request,
            )

        if ('is_staff' in request.data or 'is_superuser' in request.data) and (
            old_is_staff != target.is_staff or old_is_superuser != target.is_superuser
        ):
            AuditLog.log(
                actor=request.user,
                action='role_changed',
                target=target.email,
                details={
                    'old_role': 'Superuser' if old_is_superuser else ('Seller' if old_is_staff else 'Customer'),
                    'new_role': 'Superuser' if target.is_superuser else ('Seller' if target.is_staff else 'Customer'),
                    'changed_by': request.user.email,
                },
                request=request,
            )

        return Response(self._serialize_user(target), status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            target = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User account not found."}, status=status.HTTP_404_NOT_FOUND)

        if target.pk == request.user.pk:
            return Response(
                {"error": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = target.email
        role = 'Superuser' if target.is_superuser else 'Seller'

        # ── Audit log (before delete so actor info is still valid) ───────────
        AuditLog.log(
            actor=request.user,
            action='user_deleted',
            target=email,
            details={'role': role, 'deleted_by': request.user.email},
            request=request,
        )

        target.delete()
        return Response(
            {"message": f"Account {email} has been permanently removed."},
            status=status.HTTP_200_OK
        )


# ─────────────────────────────────────────────────────────────────────────────
# AUDIT LOG — superuser-only read access
# ─────────────────────────────────────────────────────────────────────────────

class AuditLogListView(APIView):
    """
    Superuser-only: retrieve paginated audit log entries.

    GET /api/superuser/audit/
    
    Query params:
      page        — page number (default: 1)
      page_size   — results per page (default: 25, max: 100)
      action      — filter by action type (e.g., ?action=user_created)
      actor_email — filter by actor email (partial match)
      date_from   — ISO 8601 start date (e.g., ?date_from=2025-01-01)
      date_to     — ISO 8601 end date   (e.g., ?date_to=2025-12-31)
    """
    permission_classes = [IsSuperuser]

    def get(self, request):
        qs = AuditLog.objects.select_related('actor').order_by('-timestamp')

        # ── Filters ──────────────────────────────────────────────────────────
        action_filter = request.query_params.get('action')
        if action_filter:
            qs = qs.filter(action=action_filter)

        actor_email = request.query_params.get('actor_email', '').strip()
        if actor_email:
            qs = qs.filter(actor__email__icontains=actor_email)

        date_from = request.query_params.get('date_from')
        if date_from:
            try:
                from django.utils.dateparse import parse_date
                parsed = parse_date(date_from)
                if parsed:
                    qs = qs.filter(timestamp__date__gte=parsed)
            except (ValueError, TypeError):
                pass

        date_to = request.query_params.get('date_to')
        if date_to:
            try:
                from django.utils.dateparse import parse_date
                parsed = parse_date(date_to)
                if parsed:
                    qs = qs.filter(timestamp__date__lte=parsed)
            except (ValueError, TypeError):
                pass

        # ── Pagination ───────────────────────────────────────────────────────
        try:
            page = max(1, int(request.query_params.get('page', 1)))
            page_size = min(100, max(1, int(request.query_params.get('page_size', 25))))
        except (ValueError, TypeError):
            page, page_size = 1, 25

        total = qs.count()
        offset = (page - 1) * page_size
        entries = qs[offset: offset + page_size]

        serializer = AuditLogSerializer(entries, many=True)

        return Response({
            'count': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size,
            'has_next': (offset + page_size) < total,
            'has_prev': page > 1,
            'results': serializer.data,
            # Available action types for frontend filter UI
            'action_choices': [
                {'value': k, 'label': v}
                for k, v in AuditLog.ACTION_CHOICES
            ],
        }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# STORE SETTINGS — superuser audit integration
# ─────────────────────────────────────────────────────────────────────────────

class SuperuserReportsView(APIView):
    """
    Comprehensive analytics for /api/superuser/reports/

    Query params:
      period — '7d' | '30d' | '90d' | '12m'  (default: 30d)

    Returns:
      summary       — KPI cards (revenue, orders, new customers)
      revenue_chart — daily/monthly revenue + order count
      top_products  — top 10 by units sold
      acquisition   — daily new customer registrations
      order_status  — breakdown by status
    """
    permission_classes = [IsSuperuser]

    def get(self, request):
        from .reports import (
            get_date_range, revenue_over_time,
            top_products, customer_acquisition,
            order_status_summary, platform_summary,
        )

        period = request.query_params.get('period', '30d')
        start_date, end_date = get_date_range(period)

        # Use monthly granularity for 12m to keep data points manageable
        granularity = 'month' if period == '12m' else 'day'

        return Response({
            'period': period,
            'start_date': str(start_date),
            'end_date': str(end_date),
            'summary': platform_summary(start_date, end_date),
            'revenue_chart': revenue_over_time(start_date, end_date, granularity),
            'top_products': top_products(start_date, end_date),
            'acquisition': customer_acquisition(start_date, end_date),
            'order_status': order_status_summary(start_date, end_date),
        }, status=status.HTTP_200_OK)


class SuperuserStoreSettingsAuditView(APIView):
    """
    Thin wrapper that logs a settings_updated audit entry whenever
    PATCH /api/site_settings/store/settings/ is called by a superuser.
    
    Called by the frontend after a successful store settings PATCH.
    
    POST /api/superuser/settings/audit/
    """
    permission_classes = [IsSuperuser]

    def post(self, request):
        changed_fields = request.data.get('changed_fields', [])
        AuditLog.log(
            actor=request.user,
            action='settings_updated',
            target='Store Settings',
            details={
                'changed_fields': changed_fields,
                'updated_by': request.user.email,
            },
            request=request,
        )
        return Response({'logged': True}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# BACKWARD COMPATIBILITY ALIASES
# These map old view names to their new equivalents so existing frontend
# calls to /api/custom-admin/* continue to work during the migration.
# Phase 4 marks them deprecated — Phase 5 will retire these.
# ─────────────────────────────────────────────────────────────────────────────

# Old name → new class
AdminProductManagementView = SellerProductManagementView
AdminProductImageUploadView = SellerProductImageUploadView
CreateAdminUserView = SuperuserCreateSellerView
AdminUserManagementView = SuperuserUserManagementView
VerifyAdminRoleView = VerifyRoleView
