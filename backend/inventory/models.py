import uuid
from django.db import models
from django.conf import settings

def generate_sku(name, prefix="HM"):
    cleaned_name = "".join([c for c in name if c.isalnum()]).upper()[:4]
    unique_suffix = str(uuid.uuid4().hex[:6]).upper()
    return f"{prefix}-{cleaned_name}-{unique_suffix}"

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
        
    class Meta:
        verbose_name_plural = "Categories"

class Supplier(models.Model):
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True, blank=True)
    barcode = models.CharField(max_length=50, blank=True, null=True, unique=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    brand = models.CharField(max_length=100, blank=True, null=True)
    cost_price = models.DecimalField(max_length=10, max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_length=10, max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=0)  # Overarching quantity across all variants, or base quantity if no variants
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, related_name='products')
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.sku:
            self.sku = generate_sku(self.name, self.brand[:2] if self.brand else "HM")
        super().save(*args, **kwargs)

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=20, blank=True, null=True)  # e.g., S, M, L, XL
    color = models.CharField(max_length=50, blank=True, null=True)  # e.g., Black, White, Red
    sku = models.CharField(max_length=50, unique=True, blank=True)
    quantity = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.product.name} ({self.size} / {self.color})"

    def save(self, *args, **kwargs):
        if not self.sku:
            base_sku = self.product.sku
            size_part = self.size.upper() if self.size else "X"
            color_part = self.color.upper()[:3] if self.color else "XXX"
            self.sku = f"{base_sku}-{size_part}-{color_part}"
        super().save(*args, **kwargs)

class InventoryLog(models.Model):
    LOG_TYPE_CHOICES = (
        ('in', 'Stock In'),
        ('out', 'Stock Out'),
        ('adjustment', 'Stock Adjustment'),
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_logs')
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True, related_name='inventory_logs')
    log_type = models.CharField(max_length=15, choices=LOG_TYPE_CHOICES)
    quantity = models.IntegerField()  # positive for stock in/adjustment positive, negative for stock out/adjustment negative
    reason = models.TextField(blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='inventory_logs')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.log_type} - {self.product.name} - {self.quantity}"
