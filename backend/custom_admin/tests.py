from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient


class AdminUserManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.User = get_user_model()
        self.superuser = self.User.objects.create_superuser(
            email='super@example.com',
            password='secret123',
        )
        self.staff_user = self.User.objects.create_user(
            email='staff@example.com',
            password='secret123',
            is_staff=True,
            is_active=True,
        )
        self.other_staff_user = self.User.objects.create_user(
            email='staff2@example.com',
            password='secret123',
            is_staff=True,
            is_active=True,
        )

    def test_superuser_can_list_and_manage_admin_users(self):
        self.client.force_authenticate(self.superuser)

        list_response = self.client.get(reverse('admin-users-list'))
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.data['summary']['staff_users'], 2)
        self.assertEqual(list_response.data['summary']['superusers'], 1)

        block_response = self.client.patch(
            reverse('admin-user-detail', kwargs={'pk': self.staff_user.pk}),
            {'is_active': False},
            format='json',
        )
        self.assertEqual(block_response.status_code, 200)
        self.staff_user.refresh_from_db()
        self.assertFalse(self.staff_user.is_active)

        delete_response = self.client.delete(
            reverse('admin-user-detail', kwargs={'pk': self.other_staff_user.pk})
        )
        self.assertEqual(delete_response.status_code, 200)
        self.assertFalse(self.User.objects.filter(pk=self.other_staff_user.pk).exists())

    def test_non_superuser_cannot_manage_admin_users(self):
        self.client.force_authenticate(self.staff_user)

        response = self.client.get(reverse('admin-users-list'))
        self.assertEqual(response.status_code, 403)
