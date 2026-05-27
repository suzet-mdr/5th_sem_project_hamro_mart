from rest_framework import serializers
from .models import Sale, SaleItem, Expense, DailySummary

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    sku = serializers.CharField(source='product.sku', read_only=True)
    variant_size = serializers.CharField(source='variant.size', read_only=True)
    variant_color = serializers.CharField(source='variant.color', read_only=True)

    class Meta:
        model = SaleItem
        fields = ('id', 'sale', 'product', 'product_name', 'sku', 'variant', 'variant_size', 'variant_color', 'quantity', 'price', 'cost_price', 'total')
        read_only_fields = ('id', 'sale', 'total')

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request', None)
        if request and hasattr(request, 'user'):
            user = request.user
            if not (user.is_authenticated and user.role == 'admin'):
                fields.pop('cost_price', None)
        else:
            fields.pop('cost_price', None)
        return fields

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    cashier_username = serializers.CharField(source='cashier.username', read_only=True)

    class Meta:
        model = Sale
        fields = (
            'id', 'invoice_number', 'customer', 'customer_name', 'customer_phone', 
            'cashier', 'cashier_username', 'subtotal', 'discount', 'tax', 'total', 
            'payment_method', 'payment_status', 'created_at', 'items'
        )
        read_only_fields = ('id', 'invoice_number', 'cashier', 'created_at')

class ExpenseSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('id', 'created_by', 'created_at')

class DailySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailySummary
        fields = '__all__'
