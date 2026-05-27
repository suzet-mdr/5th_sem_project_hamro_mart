from django.db import models

class ReceiptSettings(models.Model):
    store_name = models.CharField(max_length=200, default="Hamro Mart")
    address = models.TextField(default="Kathmandu, Nepal")
    phone = models.CharField(max_length=50, default="+977-1-4XXXXXX")
    pan_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="VAT/PAN Number")
    header_message = models.TextField(blank=True, null=True, default="Thank you for shopping with us!")
    footer_message = models.TextField(blank=True, null=True, default="Exchange within 7 days with invoice.")

    def __str__(self):
        return self.store_name

    class Meta:
        verbose_name = "Receipt Setting"
        verbose_name_plural = "Receipt Settings"
