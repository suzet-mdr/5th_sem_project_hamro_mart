import uuid
from django.db import models
from django.conf import settings

def generate_invoice_number():
    unique_suffix = str(uuid.uuid4().hex[:6]).upper()
    return f"INV-{unique_suffix}"

class Sale(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('esewa', 'eSewa'),
        ('khalti', 'Khalti'),
        ('card', 'Card'),
        ('banking', 'E-Banking'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    invoice_number = models.CharField(max_length=50, unique=True, blank=True)
    customer = models.ForeignKey('customers.Customer', on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')
    cashier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='sales')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='completed')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.invoice_number} - {self.total}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = generate_invoice_number()
        super().save(*args, **kwargs)

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('inventory.Product', on_delete=models.SET_NULL, null=True, related_name='sale_items')
    variant = models.ForeignKey('inventory.ProductVariant', on_delete=models.SET_NULL, null=True, blank=True, related_name='sale_items')
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # selling price at transaction time
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)  # cost price at transaction time (admin only calculation)
    total = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.sale.invoice_number} - {self.product.name if self.product else 'Deleted Product'}"

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.price
        super().save(*args, **kwargs)

class Expense(models.Model):
    CATEGORY_CHOICES = (
        ('rent', 'Rent'),
        ('utilities', 'Utilities'),
        ('salaries', 'Salaries'),
        ('marketing', 'Marketing'),
        ('inventory', 'Inventory Purchase'),
        ('others', 'Others'),
    )
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='others')
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='expenses')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.amount}"

class DailySummary(models.Model):
    date = models.DateField(unique=True)
    total_sales_count = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    total_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    total_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)

    def __str__(self):
        return f"{self.date} - Rev: {self.total_revenue} | Prof: {self.total_profit}"
