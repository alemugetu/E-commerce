from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from orders.models import Cart, CartItem, Order
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


class OrderStatusUpdateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = get_user_model().objects.create_user(
            email='admin@example.com',
            password='secret1234',
            is_staff=True,
            is_active=True,
        )
        self.customer = get_user_model().objects.create_user(
            email='customer@example.com',
            password='secret1234',
            is_active=True,
        )
        self.order = Order.objects.create(
            user=self.customer,
            total_amount=Decimal('100.00'),
            status='Pending',
            tx_ref='TX-123',
            is_paid=False,
        )

    def test_staff_user_can_update_order_status(self):
        self.client.force_authenticate(self.admin_user)
        response = self.client.patch(
            reverse('orders:order-status-update', kwargs={'pk': self.order.pk}),
            {'status': 'Processing'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'Processing')

    def test_non_staff_user_cannot_update_order_status(self):
        self.client.force_authenticate(self.customer)
        response = self.client.patch(
            reverse('orders:order-status-update', kwargs={'pk': self.order.pk}),
            {'status': 'Delivered'},
            format='json',
        )
        self.assertEqual(response.status_code, 403)
