from django.contrib import admin
from .models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    """
    Allows managing multiple ProductImages directly inside the Product detail form.
    """
    model = ProductImage
    extra = 1  # Provides one empty slot to upload a new image by default
    max_num = 10  # Enforces a strict guardrail against database bloat


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Configures administration layout for product categorization.
    """
    list_display = ('name', 'parent', 'slug', 'created_at')
    list_filter = ('parent', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}  # Auto-writes the SEO slug as you type the name


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Configures administration layouts, fields, and inline attachments for Products.
    """
    list_display = ('name', 'category', 'price', 'discount_price', 'stock', 'is_available', 'created_at')
    list_filter = ('category', 'is_available', 'created_at')
    search_fields = ('name', 'description', 'brand')
    prepopulated_fields = {'slug': ('name',)}  # Auto-writes the product SEO slug as you type the name
    list_editable = ('price', 'discount_price', 'stock', 'is_available')  # Bulk editable grid fields
    inlines = [ProductImageInline]  # Injects the nested image uploader matrix

    