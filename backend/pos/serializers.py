from rest_framework import serializers
from .models import ReceiptSettings

class ReceiptSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReceiptSettings
        fields = '__all__'

class CheckoutItemSerializer(serializers.Serializer):
    product = serializers.IntegerField(required=True)
    variant = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(required=True, min_value=1)

class CheckoutSerializer(serializers.Serializer):
    customer = serializers.IntegerField(required=False, allow_null=True)
    discount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    tax = serializers.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    payment_method = serializers.ChoiceField(choices=(
        ('cash', 'Cash'),
        ('esewa', 'eSewa'),
        ('khalti', 'Khalti'),
        ('card', 'Card'),
        ('banking', 'E-Banking'),
    ), default='cash')
    items = CheckoutItemSerializer(many=True, required=True)
