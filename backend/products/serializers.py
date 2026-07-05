from rest_framework import serializers
from .models import Category, Product, ProductImage
from django.utils.text import slugify

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for the hierarchical Category model.
    Recursively pulls child subcategories to deliver a clean nested tree to the UI.
    """
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'parent',
            'children',
            'product_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def get_children(self, obj):
        """
        Calculates and serializes subcategories recursively.
        """
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True, context=self.context).data
        return []

    def get_product_count(self, obj):
        """Count available products in this category and all subcategories."""
        category_ids = [obj.id]
        stack = list(obj.children.all())
        while stack:
            category = stack.pop()
            category_ids.append(category.id)
            stack.extend(category.children.all())

        return Product.objects.filter(
            category_id__in=category_ids,
            is_available=True,
            is_active=True,
        ).count()


class ProductImageSerializer(serializers.ModelSerializer):
    """
    Serializer for Product images.
    Ensures that relative database file paths are transformed into absolute asset URLs.
    """
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'is_feature']

    def get_image_url(self, obj):
        """
        Converts internal media paths to absolute URLs (e.g., http://localhost:8000/media/...)
        """
        request = self.context.get('request')
        if obj.image and request is not None:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url
        return None


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_detail', 'name', 'slug', 'brand',
            'description', 'price', 'discount_price', 'stock', 'is_available',
            'is_active', 'images', 'rating', 'num_reviews', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    # 🛠️ SENIOR FIX: Auto-populate the slug from the name before database write validation triggers
    def create(self, validated_data):
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)
    
