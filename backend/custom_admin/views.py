from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.db.models import Sum, Q
from products.serializers import ProductImageSerializer
from products.models import Product
from products.serializers import ProductSerializer
from orders.models import Order

User = get_user_model()


class AdminMetricsView(APIView):
    """Provide aggregated dashboard metrics for the admin console."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({"error": "Access Denied."}, status=status.HTTP_403_FORBIDDEN)

        total_products = Product.objects.count()
        available_products = Product.objects.filter(is_available=True).count()
        out_of_stock_products = Product.objects.filter(stock__lte=0).count()
        total_inventory_units = Product.objects.aggregate(total=Sum('stock'))['total'] or 0
        paid_orders = Order.objects.filter(status='Paid')
        total_sales = paid_orders.aggregate(total_sales=Sum('total_amount'))['total_sales'] or 0
        pending_orders = Order.objects.filter(status='Pending').count()
        processing_orders = Order.objects.filter(status='Processing').count()

        return Response({
            'total_products': total_products,
            'available_products': available_products,
            'out_of_stock_products': out_of_stock_products,
            'total_inventory_units': total_inventory_units,
            'total_sales': float(total_sales),
            'paid_orders': paid_orders.count(),
            'pending_orders': pending_orders,
            'processing_orders': processing_orders,
        }, status=status.HTTP_200_OK)


class CreateAdminUserView(APIView):
    """Allow superusers to create new staff or superuser accounts."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_superuser:
            return Response({"error": "Only superusers can create admin accounts."}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        is_staff = request.data.get('is_staff', True)
        is_superuser = request.data.get('is_superuser', False)

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "An account with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        user.is_staff = bool(is_staff) or bool(is_superuser)
        user.is_superuser = bool(is_superuser)
        user.save()

        return Response({
            'id': user.id,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }, status=status.HTTP_201_CREATED)


class AdminUserManagementView(APIView):
    """Allow superusers to list, block, and remove admin accounts."""
    permission_classes = [IsAuthenticated]

    def _serialize_admin_user(self, user):
        return {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'is_active': user.is_active,
            'created_at': user.created_at.isoformat() if hasattr(user, 'created_at') else None,
        }

    def get(self, request):
        if not request.user.is_superuser:
            return Response({"error": "Only superusers can manage admin accounts."}, status=status.HTTP_403_FORBIDDEN)

        admin_users = User.objects.filter(Q(is_staff=True) | Q(is_superuser=True)).order_by('-is_superuser', '-is_staff', 'email')
        return Response({
            'results': [self._serialize_admin_user(user) for user in admin_users],
            'summary': {
                'total_admins': admin_users.count(),
                'staff_users': admin_users.filter(is_staff=True, is_superuser=False).count(),
                'superusers': admin_users.filter(is_superuser=True).count(),
                'active_admins': admin_users.filter(is_active=True).count(),
                'inactive_admins': admin_users.filter(is_active=False).count(),
            },
        }, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        if not request.user.is_superuser:
            return Response({"error": "Only superusers can manage admin accounts."}, status=status.HTTP_403_FORBIDDEN)

        try:
            admin_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Target admin account not found."}, status=status.HTTP_404_NOT_FOUND)

        if admin_user.pk == request.user.pk:
            return Response({"error": "You cannot modify your own admin account."}, status=status.HTTP_400_BAD_REQUEST)

        if 'is_active' in request.data:
            admin_user.is_active = bool(request.data.get('is_active'))
        if 'is_staff' in request.data:
            admin_user.is_staff = bool(request.data.get('is_staff'))
        if 'is_superuser' in request.data:
            admin_user.is_superuser = bool(request.data.get('is_superuser'))
            if admin_user.is_superuser:
                admin_user.is_staff = True

        admin_user.save()
        return Response(self._serialize_admin_user(admin_user), status=status.HTTP_200_OK)

    def delete(self, request, pk):
        if not request.user.is_superuser:
            return Response({"error": "Only superusers can manage admin accounts."}, status=status.HTTP_403_FORBIDDEN)

        try:
            admin_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Target admin account not found."}, status=status.HTTP_404_NOT_FOUND)

        if admin_user.pk == request.user.pk:
            return Response({"error": "You cannot delete your own admin account."}, status=status.HTTP_400_BAD_REQUEST)

        admin_user.delete()
        return Response({"message": f"Admin account {admin_user.email} removed."}, status=status.HTTP_200_OK)


class VerifyAdminRoleView(APIView):
    """
    Endpoint used by the React AdminProtectedRoute to verify if the 
    active JWT session belongs to an authorized staff member or superuser.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not (user.is_staff or user.is_superuser):
            return Response(
                {"error": "Access Denied. Account holds insufficient administrative scope."},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response({
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser
        }, status=status.HTTP_200_OK)


class AdminProductManagementView(APIView):
    """
    Staff-only endpoints providing full CRUD operations over the product inventory catalog
    directly from the React dashboard interface.
    """
    permission_classes = [IsAuthenticated]

    def check_permissions(self, request):
        super().check_permissions(request)
        if not (request.user.is_staff or request.user.is_superuser):
            self.permission_denied(
                request, message="Access Denied: Administrative privileges required."
            )

    def post(self, request):
        """ Creates a new product in the database """
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        """ Updates an existing product by its ID (supports partial updates) """
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Target product profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """ Deletes a product from the database registry """
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Target product profile not found."}, status=status.HTTP_404_NOT_FOUND)

        product.delete()
        return Response({"message": "Product successfully deleted from system records."}, status=status.HTTP_200_OK)


class AdminProductImageUploadView(APIView):
    """
    Dedicated endpoint allowing administrative users to attach binary image assets
    to a pre-existing Product instance using standard multipart form payloads.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def check_permissions(self, request):
        super().check_permissions(request)
        if not (request.user.is_staff or request.user.is_superuser):
            self.permission_denied(request, message="Administrative privileges required.")

    def post(self, request):
        serializer = ProductImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    