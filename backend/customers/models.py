from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    loyalty_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.phone})"

class LoyaltyPointLog(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='loyalty_logs')
    points = models.IntegerField()  # positive for earn, negative for redeem
    reason = models.CharField(max_length=255)  # e.g., "Earned from INV-XXXX", "Redeemed for discount"
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.name} - {self.points} points ({self.reason})"
