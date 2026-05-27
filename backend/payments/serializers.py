from rest_framework import serializers
from .models import PaymentLog

class PaymentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentLog
        fields = '__all__'

class PaymentVerifySerializer(serializers.Serializer):
    invoice_number = serializers.CharField(required=True)
    payment_method = serializers.CharField(required=True)
    transaction_id = serializers.CharField(required=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
