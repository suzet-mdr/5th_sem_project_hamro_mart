from rest_framework import serializers
from .models import Category, Supplier, Product, ProductVariant, InventoryLog

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ProductVariant
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'barcode', 'category', 'category_name', 
            'brand', 'cost_price', 'selling_price', 'quantity', 'supplier', 
            'supplier_name', 'image', 'created_at', 'updated_at', 'variants'
        ]
        read_only_fields = ('id', 'sku', 'quantity')

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request', None)
        # If user is not authenticated or not an admin, exclude cost_price
        if request and hasattr(request, 'user'):
            user = request.user
            if not (user.is_authenticated and user.role == 'admin'):
                fields.pop('cost_price', None)
        else:
            # If there's no request context (e.g. backend task / shell), exclude by default for safety
            fields.pop('cost_price', None)
        return fields

class InventoryLogSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    variant_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = InventoryLog
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'user')

    def get_variant_name(self, obj):
        if obj.variant:
            return f"{obj.variant.size} / {obj.variant.color}"
        return None
