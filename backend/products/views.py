from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend # pyright: ignore[reportMissingModuleSource]
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """
    A ViewSet that handles full CRUD logic for Categories.
    - Anyone can read/list categories.
    - Only administrative staff can create or modify them.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        """
        Dynamically applies restriction rules depending on the action type.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Optimizes data queries. If listing top-level categories,
        we only grab root items to avoid double rendering child nodes.
        """
        queryset = super().get_queryset()

        if self.action == 'list':
            return queryset.filter(parent=None, is_available=True)

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
        Administrative staff manage products.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Optimizes product queries.

        Public listings:
        - Only available products
        - Newest first

        Admin users:
        - Can see all products
        """
        queryset = super().get_queryset()

        if self.request.user.is_staff:
            return queryset

        if self.action == 'list':
            return queryset.filter(
                is_available=True
            ).select_related(
                'category'
            ).order_by(
                '-created_at'
            )

        return queryset.filter(
            is_available=True
        ).select_related(
            'category'
        )