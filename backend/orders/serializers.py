from rest_framework import serializers
from .models import Cart, CartItem, Wishlist, WishlistItem, Order, OrderItem

class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializes individual items in the cart. 
    Pulls specific read-only fields from the related Product model for the frontend UI.
    """
    product_name = serializers.ReadOnlyField(source='product.name')
    product_price = serializers.ReadOnlyField(source='product.final_price')
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'subtotal']


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
    # Follow the Foreign Key to grab useful UI data without extra database hits
    product_name = serializers.ReadOnlyField(source='product.name')
    product_price = serializers.ReadOnlyField(source='product.final_price')

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_name', 'product_price', 'created_at']


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
    # Fetching helpful metadata so React doesn't just get a blank 'product ID'
    product_name = serializers.ReadOnlyField(source='product.name')
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_at_purchase']
        # The price is the historical snapshot price, it should never be edited via API
        read_only_fields = ['price_at_purchase']

class OrderSerializer(serializers.ModelSerializer):
    # Nested serializer to pull in all items attached to this order
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 
            'user', 
            'total_amount', 
            'status', 
            'tx_ref',
            'created_at', 
            'updated_at',
            'items'
        ]
        # Security: Almost everything on a finalized order is read-only
        read_only_fields = [
            'user', 
            'total_amount', 
            'status', 
            'tx_ref'
        ]        

        