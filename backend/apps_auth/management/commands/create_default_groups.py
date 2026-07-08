from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission

class Command(BaseCommand):
    help = 'Creates default permission groups (roles) and assigns permissions'

    def handle(self, *args, **options):
        # 1. Define roles and their permitted permission codenames
        # Codenames are matched to Django's standard model CRUD permissions.
        role_permissions = {
            'Seller': [
                'view_product', 'add_product', 'change_product', 'delete_product',
                'view_category',
                'view_order', 'change_order',
                'view_customuser', 'change_customuser',
            ],
            'Warehouse Manager': [
                'view_product',
                'view_inventory', 'change_inventory', # future proof/custom
                'view_order',
            ],
            'Finance Manager': [
                'view_order',
                'view_reports', # custom / future proof
            ],
            'Marketing Manager': [
                'view_product', 'change_product',
                'view_category',
            ],
            'Customer Support': [
                'view_customuser', 'change_customuser',
            ],
            'Delivery Manager': [
                'view_order', 'change_order',
            ],
            'Content Manager': [
                'view_product', 'add_product', 'change_product',
                'view_category', 'add_category', 'change_category',
            ],
        }

        for role_name, codenames in role_permissions.items():
            group, created = Group.objects.get_or_create(name=role_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created group: '{role_name}'"))
            else:
                self.stdout.write(f"Group '{role_name}' already exists. Syncing permissions...")

            # Find permissions by codename and assign to group
            # Filter matches permissions globally across all app labels
            perms = Permission.objects.filter(codename__in=codenames)
            group.permissions.set(perms)
            self.stdout.write(self.style.SUCCESS(f"Assigned {perms.count()} permissions to group '{role_name}'"))

        self.stdout.write(self.style.SUCCESS("Role seeding complete!"))
