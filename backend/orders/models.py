from django.db import models
from django.conf import settings
from products.models import Product


class Cart(models.Model):
    """
    Master cart container uniquely tied to a specific user.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart belongs to {self.user.email}"
    def get_total_price(self):
        """
        Calculates the grand total of the cart.
        It uses the 'subtotal' property from the CartItem model.
        """
        # self.items.all() works because of related_name='items' in CartItem
        return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
    """
    Individual product line items within a specific cart.
    """
    cart = models.ForeignKey(
        Cart, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        # A cart shouldn't have multiple separate rows for the exact same product.
        # If a user adds the same product again, we just increase the quantity of the existing row.
        unique_together = ('cart', 'product')
        ordering = ['id']

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    @property
    def subtotal(self):
        """Calculates the total cost for this specific line item."""
        return self.product.final_price * self.quantity
    
class Wishlist(models.Model):
    """
    A master container holding a user's saved-for-later items.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wishlist - {self.user.email}"

class WishlistItem(models.Model):
    """
    The individual products saved inside a user's Wishlist.
    """
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevents a user from adding the exact same product to their wishlist twice
        unique_together = ('wishlist', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} in {self.wishlist.user.email}'s Wishlist"

class Order(models.Model):
    """
    The master financial and shipping snapshot for a checkout event.
    """
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Paid', 'Paid'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    
    # Financials & Tracking
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    tx_ref = models.CharField(max_length=266, unique=True)
    
   
    is_paid = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.user.email} - {self.status}"


class OrderItem(models.Model):
    """
    Immutable snapshot rows of what was bought and at what price.
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT) # PROTECT prevents deleting a product if it has been ordered
    
    quantity = models.PositiveIntegerField(default=1)
    
    # We copy the price here! If the product price changes later, this historical record remains untouched.
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} (Order #{self.order.id})"
        
    @property
    def subtotal(self):
        return self.quantity * self.price_at_purchase  
    

class Notification(models.Model):
    """
    Notifications for order status updates
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.email} - {self.message[:50]}"  
    
          