from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient


class CustomerApprovalFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.User = get_user_model()
        self.admin = self.User.objects.create_user(
            email='admin@example.com',
            password='secret1234',
            is_staff=True,
            is_active=True,
            approval_status='approved',
        )
        self.pending_customer = self.User.objects.create_user(
            email='pending@example.com',
            password='secret1234',
            approval_status='pending',
        )
        self.approved_customer = self.User.objects.create_user(
            email='approved@example.com',
            password='secret1234',
            approval_status='approved',
        )

    def test_pending_customer_cannot_login(self):
        response = self.client.post(
            reverse('apps_auth:token_obtain_pair'),
            {'email': 'pending@example.com', 'password': 'secret1234'},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('approval', str(response.data).lower())

    def test_admin_can_approve_or_reject_customers(self):
        self.client.force_authenticate(self.admin)

        list_response = self.client.get(reverse('apps_auth:admin-customers-list'))
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.data['summary']['pending'], 1)

        approve_response = self.client.patch(
            reverse('apps_auth:admin-customer-detail', kwargs={'pk': self.pending_customer.pk}),
            {'approval_status': 'approved'},
            format='json',
        )
        self.assertEqual(approve_response.status_code, 200)
        self.pending_customer.refresh_from_db()
        self.assertEqual(self.pending_customer.approval_status, 'approved')
        self.assertTrue(self.pending_customer.is_active)

        reject_response = self.client.patch(
            reverse('apps_auth:admin-customer-detail', kwargs={'pk': self.approved_customer.pk}),
            {'approval_status': 'rejected'},
            format='json',
        )
        self.assertEqual(reject_response.status_code, 200)
        self.approved_customer.refresh_from_db()
        self.assertFalse(self.approved_customer.is_active)
