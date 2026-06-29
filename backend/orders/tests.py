from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from orders.models import Cart, CartItem
from products.models import Category, Product


class CartItemSubtotalTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='tester@example.com',
            password='secret1234',
        )
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            category=self.category,
            name='Phone',
            slug='phone',
            brand='Acme',
            description='Smartphone',
            price=Decimal('100.00'),
            discount_price=Decimal('80.00'),
            stock=5,
        )
        self.cart = Cart.objects.create(user=self.user)

    def test_product_final_price_uses_discounted_value(self):
        self.assertEqual(self.product.final_price, Decimal('80.00'))

    def test_cart_item_subtotal_uses_effective_price(self):
        item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=3)
        self.assertEqual(item.subtotal, Decimal('240.00'))
