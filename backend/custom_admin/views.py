from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
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
        user.is_staff = bool(is_staff)
        user.is_superuser = bool(is_superuser)
        user.save()

        return Response({
            'id': user.id,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }, status=status.HTTP_201_CREATED)


class VerifyAdminRoleView(APIView):
    """
    Endpoint used by the React AdminProtectedRoute to verify if the 
    active JWT session belongs to an authorized staff member or superuser.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Enforce strict validation against your CustomUser properties
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
        # Extra explicit safety guard directly inside the view execution cycle
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
    parser_classes = [MultiPartParser, FormParser] # Required to process binary file transmissions cleanly

    def check_permissions(self, request):
        super().check_permissions(request)
        if not (request.user.is_staff or request.user.is_superuser):
            self.permission_denied(request, message="Administrative privileges required.")

    def post(self, request):
        # We pass request.data directly to your product image serializer
        serializer = ProductImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)    
    