from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory

from accounts.permissions import IsAdmin, IsManagerOrAbove, IsStaff
from inventory.models import Product, Category
from inventory.serializers import ProductSerializer

User = get_user_model()

class CustomUserTestCase(TestCase):
    def test_user_creation_roles(self):
        admin = User.objects.create_user(username="testadmin", password="password", role="admin")
        self.assertTrue(admin.is_admin)
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

        manager = User.objects.create_user(username="testmanager", password="password", role="manager")
        self.assertTrue(manager.is_manager)
        self.assertTrue(manager.is_staff)
        self.assertFalse(manager.is_superuser)

        staff = User.objects.create_user(username="teststaff", password="password", role="staff")
        self.assertTrue(staff.is_staff_member)
        self.assertFalse(staff.is_staff)
        self.assertFalse(staff.is_superuser)

class PermissionsTestCase(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.create_user(username="admin", password="password", role="admin")
        self.manager = User.objects.create_user(username="manager", password="password", role="manager")
        self.staff = User.objects.create_user(username="staff", password="password", role="staff")
        
    def test_is_admin_permission(self):
        permission = IsAdmin()
        
        request = self.factory.get('/api/users/')
        request.user = self.admin  # Directly assign to WSGIRequest
        self.assertTrue(permission.has_permission(request, None))

        request = self.factory.get('/api/users/')
        request.user = self.manager
        self.assertFalse(permission.has_permission(request, None))

    def test_is_manager_or_above_permission(self):
        permission = IsManagerOrAbove()
        
        request = self.factory.get('/api/inventory/')
        request.user = self.admin
        self.assertTrue(permission.has_permission(request, None))

        request = self.factory.get('/api/inventory/')
        request.user = self.manager
        self.assertTrue(permission.has_permission(request, None))

        request = self.factory.get('/api/inventory/')
        request.user = self.staff
        self.assertFalse(permission.has_permission(request, None))

class SerializerCostPriceTestCase(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.create_user(username="admin", password="password", role="admin")
        self.staff = User.objects.create_user(username="staff", password="password", role="staff")
        
        self.category = Category.objects.create(name="Shirts")
        self.product = Product.objects.create(
            name="Casual T-Shirt",
            category=self.category,
            cost_price=350.00,
            selling_price=799.00,
            quantity=10
        )

    def test_cost_price_visible_to_admin(self):
        request = self.factory.get('/api/inventory/products/')
        request.user = self.admin
        
        serializer = ProductSerializer(self.product, context={'request': request})
        self.assertIn('cost_price', serializer.data)
        self.assertEqual(float(serializer.data['cost_price']), 350.00)

    def test_cost_price_hidden_from_staff(self):
        request = self.factory.get('/api/inventory/products/')
        request.user = self.staff
        
        serializer = ProductSerializer(self.product, context={'request': request})
        self.assertNotIn('cost_price', serializer.data)
