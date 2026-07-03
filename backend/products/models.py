from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator
from decimal import Decimal

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    
    # Self-referencing field allowing nested subcategories. 
    # If parent is null, it's a top-level root category.
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='children'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        # Displays the full hierarchy breadcrumb path in Django Admin
        full_path = [self.name]
        k = self.parent
        while k is not None:
            full_path.append(k.name)
            k = k.parent
        return ' -> '.join(full_path[::-1])

    def save(self, *args, **kwargs):
        # Auto-generate a slug from the name if it wasn't manually provided
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Product(models.Model):
    category = models.ForeignKey(
        Category, 
        on_delete=models.RESTRICT, 
        related_name='products',
        db_index=True
    )
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, unique=True, db_index=True, blank=True)
    brand = models.CharField(max_length=100, db_index=True)
    description = models.TextField(blank=True)
    
    # Pricing handling using DecimalField for financial precision
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    discount_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Inventory control management
    stock = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)  # Soft delete flag
    # Reviews and ratings tracking aggregates
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    num_reviews = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def final_price(self):
        """Return the effective selling price after applying any discount."""
        if self.discount_price is not None and self.discount_price < self.price:
            return self.discount_price
        return self.price

    @property
    def get_effective_price(self):
        """Backward-compatible helper property for active promotional pricing."""
        return self.final_price
    
class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        related_name='images'
    )
    image = models.ImageField(upload_to='products/%Y/%m/%d/')
    is_feature = models.BooleanField(default=False)
    alt_text = models.CharField(max_length=255, blank=True, help_text="SEO-friendly image description")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_feature', 'created_at']

    def __str__(self):
        return f"Image for {self.product.name}"

    def save(self, *args, **kwargs):
        # Business Logic: Enforce that only ONE image can be marked as the feature/thumbnail at a time per product.
        if self.is_feature:
            ProductImage.objects.filter(product=self.product, is_feature=True).update(is_feature=False)
        super().save(*args, **kwargs)

        