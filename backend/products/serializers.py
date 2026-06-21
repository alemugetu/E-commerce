from rest_framework import serializers
from .models import Category, Product, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for the hierarchical Category model.
    Recursively pulls child subcategories to deliver a clean nested tree to the UI.
    """
    # Using 'children' related_name to recursively embed sub-categories.
    # read_only=True ensures this structural tree is only modified explicitly or via admin.
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 
            'name', 
            'slug', 
            'parent', 
            'children', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def get_children(self, obj):
        """
        Calculates and serializes subcategories recursively.
        """
        # obj.children references the related_name on the parent ForeignKey.
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True, context=self.context).data
        return []


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
    """
    Master Serializer for Product data.
    Embeds structural Category metadata and arrays of matching ProductImages.
    """
    # Explicitly pull in the primary relationship structures
    images = ProductImageSerializer(many=True, read_only=True)
    
    # We serialize the category detail using a shallow representation, 
    # but keep the category ID writeable for product creation adjustments.
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'category',
            'category_detail',
            'name',
            'slug',
            'brand',
            'description',
            'price',
            'discount_price',
            'stock_quantity',
            'is_available',
            'images',
            'rating',
            'num_reviews',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

