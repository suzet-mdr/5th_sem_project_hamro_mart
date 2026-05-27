from rest_framework import serializers
from .models import Customer, LoyaltyPointLog

class LoyaltyPointLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyPointLog
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    loyalty_logs = LoyaltyPointLogSerializer(many=True, read_only=True)

    class Meta:
        model = Customer
        fields = ('id', 'name', 'phone', 'email', 'address', 'loyalty_points', 'created_at', 'loyalty_logs')
        read_only_fields = ('id', 'loyalty_points', 'created_at')
