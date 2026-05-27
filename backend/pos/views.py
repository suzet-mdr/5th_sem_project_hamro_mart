from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from accounts.permissions import IsStaff, IsManagerOrAbove
from inventory.models import Product, ProductVariant, InventoryLog
from sales.models import Sale, SaleItem
from customers.models import Customer, LoyaltyPointLog
from .models import ReceiptSettings
from .serializers import ReceiptSettingsSerializer, CheckoutSerializer
from sales.serializers import SaleSerializer

class ReceiptSettingsViewSet(viewsets.ModelViewSet):
    queryset = ReceiptSettings.objects.all()
    serializer_class = ReceiptSettingsSerializer
    
    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [IsStaff()]
        return [IsManagerOrAbove()]

class CheckoutView(APIView):
    permission_classes = [IsStaff]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        discount = data.get('discount', 0.0)
        tax = data.get('tax', 0.0)
        payment_method = data.get('payment_method', 'cash')
        
        customer_id = data.get('customer')
        customer = None
        if customer_id:
            try:
                customer = Customer.objects.get(id=customer_id)
            except Customer.DoesNotExist:
                return Response({"error": f"Customer with ID {customer_id} not found."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. First Pass: Validate stock availability
        items_to_process = []
        subtotal = 0.0
        
        for item_data in data['items']:
            product_id = item_data['product']
            variant_id = item_data.get('variant')
            quantity = item_data['quantity']
            
            try:
                product = Product.objects.select_for_update().get(id=product_id)
            except Product.DoesNotExist:
                return Response({"error": f"Product with ID {product_id} not found."}, status=status.HTTP_400_BAD_REQUEST)
            
            variant = None
            if variant_id:
                try:
                    variant = ProductVariant.objects.select_for_update().get(id=variant_id, product=product)
                except ProductVariant.DoesNotExist:
                    return Response({"error": f"Variant with ID {variant_id} not found for product {product.name}."}, status=status.HTTP_400_BAD_REQUEST)
                
                # Check variant stock
                if variant.quantity < quantity:
                    return Response({
                        "error": f"Out of stock: {product.name} ({variant.size}/{variant.color}) has only {variant.quantity} units, but {quantity} were requested."
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Check product base stock
                if product.quantity < quantity:
                    return Response({
                        "error": f"Out of stock: {product.name} has only {product.quantity} units, but {quantity} were requested."
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Subtotal calculation
            subtotal += float(product.selling_price) * quantity
            items_to_process.append({
                'product': product,
                'variant': variant,
                'quantity': quantity,
                'price': product.selling_price,
                'cost_price': product.cost_price
            })

        # Calculations
        subtotal_dec = subtotal
        total = float(subtotal_dec) - float(discount) + float(tax)
        if total < 0:
            total = 0.0

        # 2. Create the Sale record
        sale = Sale.objects.create(
            customer=customer,
            cashier=request.user,
            subtotal=subtotal_dec,
            discount=discount,
            tax=tax,
            total=total,
            payment_method=payment_method,
            payment_status='completed'
        )

        # 3. Process items: Deduct stock, generate logs, and create sale items
        for item in items_to_process:
            prod = item['product']
            var = item['variant']
            qty = item['quantity']
            
            if var:
                var.quantity -= qty
                var.save()
                
                # Deduct base product quantity
                prod.quantity -= qty
                prod.save()
            else:
                prod.quantity -= qty
                prod.save()

            # Create InventoryLog
            InventoryLog.objects.create(
                product=prod,
                variant=var,
                log_type='out',
                quantity=-qty,
                reason=f"POS Sale Invoice #{sale.invoice_number}",
                user=request.user
            )

            # Create SaleItem
            SaleItem.objects.create(
                sale=sale,
                product=prod,
                variant=var,
                quantity=qty,
                price=item['price'],
                cost_price=item['cost_price'],
                total=qty * item['price']
            )

        # 4. Loyalty points accumulation (e.g. 1 point per Rs. 100 spent)
        if customer:
            earned_points = int(total // 100)
            if earned_points > 0:
                customer.loyalty_points += earned_points
                customer.save()
                
                LoyaltyPointLog.objects.create(
                    customer=customer,
                    points=earned_points,
                    reason=f"Earned from invoice {sale.invoice_number}"
                )

        # Return serialized sale details for receipt display
        sale_serializer = SaleSerializer(sale, context={'request': request})
        
        # Include custom receipt settings in the response if they exist
        receipt_setting = ReceiptSettings.objects.first()
        receipt_data = ReceiptSettingsSerializer(receipt_setting).data if receipt_setting else {}

        return Response({
            "message": "Checkout completed successfully.",
            "sale": sale_serializer.data,
            "receipt_settings": receipt_data
        }, status=status.HTTP_201_CREATED)
