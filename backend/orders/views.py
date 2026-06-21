from rest_framework import views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from products.models import Product
from .models import Cart, CartItem
from .serializers import CartSerializer
from .models import Cart, CartItem, Wishlist, WishlistItem
from .serializers import CartSerializer, CartItemSerializer, WishlistSerializer, WishlistItemSerializer
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.db import transaction
from .services import fulfill_order_pipeline
from chapa import Chapa  # type: ignore[import]
import requests # type: ignore
import uuid

class CartAPIView(APIView):
    """
    Handles retrieving the user's master cart and adding new items to it.
    """
    # Strictly lock this endpoint down to logged-in users with valid JWTs
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Fetch the cart for the user. If they don't have one, create it instantly.
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Add an item to the cart
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        # Extract data from the React frontend's JSON payload
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        # Ensure the product actually exists in the database
        product = get_object_or_404(Product, id=product_id)

        # Check if this exact product is already in the user's cart
        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product,
            defaults={'quantity': quantity}
        )

        # If it was already in the cart, simply increase the quantity
        if not item_created:
            cart_item.quantity += quantity
            cart_item.save()

        # Return the updated master cart back to the frontend
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartItemDetailView(APIView):
    """
    Handles updating the quantity of a specific item or removing it entirely.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        # Ensure the user is only updating an item that belongs to THEIR cart
        cart_item = get_object_or_404(CartItem, id=pk, cart__user=request.user)
        new_quantity = int(request.data.get('quantity', cart_item.quantity))

        if new_quantity <= 0:
            cart_item.delete()
        else:
            cart_item.quantity = new_quantity
            cart_item.save()

        return Response({'message': 'Cart item updated successfully'}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        # Securely delete the item
        cart_item = get_object_or_404(CartItem, id=pk, cart__user=request.user)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class WishlistDetailView(views.APIView):
    """
    Retrieves the authenticated user's master wishlist.
    Creates a blank wishlist if one doesn't exist yet.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data, status=status.HTTP_200_OK)


class WishlistToggleItemView(views.APIView):
    """
    Toggles a product in the wishlist. 
    Adds the product if it isn't there, or removes it if it is already saved.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_id):
        # 1. Fetch or create the user's wishlist container
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        
        # 2. Verify the requested product actually exists in the catalog
        from products.models import Product # Local import to prevent circular dependencies
        product = get_object_or_404(Product, id=product_id)

        # 3. Check if the item is already saved
        wishlist_item = WishlistItem.objects.filter(wishlist=wishlist, product=product).first()

        if wishlist_item:
            # If it exists, the user is un-favoriting it (Toggle Off)
            wishlist_item.delete()
            return Response({"detail": "Product removed from wishlist."}, status=status.HTTP_200_OK)
        else:
            # If it doesn't exist, the user is favoriting it (Toggle On)
            WishlistItem.objects.create(wishlist=wishlist, product=product)
            return Response({"detail": "Product added to wishlist."}, status=status.HTTP_201_CREATED)
        
        