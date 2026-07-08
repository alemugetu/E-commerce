from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend # pyright: ignore[reportMissingModuleSource]
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Category, Product, ProductImage
from .serializers import CategorySerializer, ProductSerializer, ProductImageSerializer
from apps_auth.permissions import IsSeller, IsSuperuser


class CategoryViewSet(viewsets.ModelViewSet):
    """
    Anyone can read categories.
    Superusers manage categories (create / update / delete).
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # Only superusers can mutate category structure
        return [IsSuperuser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            return queryset.filter(parent=None).prefetch_related('children')
        return queryset


class ProductViewSet(viewsets.ModelViewSet):
    """
    A ViewSet that handles full CRUD logic for Products.

    Features:
    - Public users can browse products.
    - Admin users manage products.
    - Pagination support.
    - Search support.
    - Category and field filtering.
    - Price and date ordering.
    """

    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        'category',
        'category__slug',
        'brand',
        'is_available',
    ]

    search_fields = [
        'name',
        'description',
        'brand',
    ]

    ordering_fields = [
        'price',
        'created_at',
        'name',
    ]

    ordering = ['-created_at']

    def get_permissions(self):
        """
        Public users can view products.
        Only superusers can create, update, or delete products.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in permission_classes]

    def check_permissions(self, request):
        """
        Additional check: only superusers can modify products.
        """
        super().check_permissions(request)
        if self.action not in ['list', 'retrieve'] and not request.user.is_superuser:
            self.permission_denied(
                request,
                message='Only superusers can manage products.'
            )

    def get_queryset(self):
        """
        Optimizes product queries.

        Public listings:
        - Only available and active products
        - Newest first

        Admin users:
        - Can see all products including inactive ones
        """
        queryset = super().get_queryset()

        if self.request.user.is_staff:
            return queryset

        if self.action == 'list':
            queryset = queryset.filter(
                is_available=True,
                is_active=True
            ).select_related(
                'category'
            ).prefetch_related(
                'images'
            )

            params = self.request.query_params
            price_min = params.get('price_min')
            price_max = params.get('price_max')
            min_rating = params.get('min_rating')

            if price_min:
                queryset = queryset.filter(price__gte=price_min)
            if price_max:
                queryset = queryset.filter(price__lte=price_max)
            if min_rating:
                queryset = queryset.filter(rating__gte=min_rating)

            return queryset.order_by('-created_at')

        return queryset.filter(
            is_available=True,
            is_active=True
        ).select_related(
            'category'
        ).prefetch_related(
            'images'
        )

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete: mark product as inactive instead of deleting from database.
        This preserves order history and references.
        """
        product = self.get_object()
        product.is_active = False
        product.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        image_file = request.FILES.get('image')
        if image_file:
            ProductImage.objects.create(
                product=product,
                image=image_file,
                is_feature=True,
                alt_text=request.data.get('alt_text', product.name),
            )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)
    
    