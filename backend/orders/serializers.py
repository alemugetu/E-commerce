from rest_framework import serializers
from products.serializers import ProductSerializer
from .models import Cart, CartItem, Wishlist, WishlistItem, Order, OrderItem, Notification

class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializes individual items in the cart. 
    Pulls specific read-only fields from the related Product model for the frontend UI.
    """
    product = ProductSerializer(read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'subtotal']


class CartSerializer(serializers.ModelSerializer):
    """
    Serializes the master cart and dynamically calculates the grand total.
    """
    items = CartItemSerializer(many=True, read_only=True)
    cart_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'cart_total', 'updated_at']
        read_only_fields = ['user']

    def get_cart_total(self, obj):
        """
        Calculates the sum of all item subtotals currently in the cart.
        """
        return sum(item.subtotal for item in obj.items.all())
    

class WishlistItemSerializer(serializers.ModelSerializer):
    """
    Serializes individual products saved in the wishlist.
    """
    product = ProductSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'created_at']


class WishlistSerializer(serializers.ModelSerializer):
    """
    Serializes the master wishlist container and embeds all its items.
    """
    # Nests the individual wishlist items directly inside the master response
    items = WishlistItemSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'items', 'created_at']
        read_only_fields = ['user']  # Security: Prevent clients from reassigning list ownership    
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_image = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 
            'product', 
            'product_name', 
            'product_image', 
            'quantity', 
            'price_at_purchase',
            'subtotal'
        ]
        read_only_fields = ['price_at_purchase']

    def get_product_image(self, obj):
        # Safely extracts the primary thumbnail image while respecting the request context for absolute URLs
        request = self.context.get('request')
        if obj.product and hasattr(obj.product, 'images'):
            first_image = obj.product.images.first()
            if first_image and hasattr(first_image, 'image'):
                if first_image.image:
                    return request.build_absolute_uri(first_image.image.url) if request else first_image.image.url
        return "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=60"

    def get_subtotal(self, obj):
        # Natively handles immutable snapshot multiplications cleanly
        return obj.quantity * obj.price_at_purchase


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    formatted_date = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.ReadOnlyField(source='user.email')
    customer_phone = serializers.ReadOnlyField(source='user.phone_number')
    customer_address = serializers.ReadOnlyField(source='user.addresse')

    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'customer_name',
            'customer_email',
            'customer_phone',
            'customer_address',
            'total_amount',
            'status',
            'tx_ref',
            'created_at',
            'updated_at',
            'formatted_date',
            'items'
        ]
        read_only_fields = [
            'user',
            'total_amount',
            'status',
            'tx_ref'
        ]

    def get_formatted_date(self, obj):
        # Emits a clean display layout for your React interface elements
        return obj.created_at.strftime("%b %d, %Y at %I:%M %p")

    def get_customer_name(self, obj):
        # Combine first and last name for display
        user = obj.user
        if user.first_name and user.last_name:
            return f"{user.first_name} {user.last_name}"
        return user.email or "Unknown"
    

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'order', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'order', 'message', 'created_at']
    

        