from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsManagerOrAbove, IsStaff
from .models import Category, Supplier, Product, ProductVariant, InventoryLog
from .serializers import (
    CategorySerializer, 
    SupplierSerializer, 
    ProductSerializer, 
    ProductVariantSerializer, 
    InventoryLogSerializer
)

class BaseInventoryViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [IsStaff()]
        return [IsManagerOrAbove()]

class CategoryViewSet(BaseInventoryViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['name']

class SupplierViewSet(BaseInventoryViewSet):
    queryset = Supplier.objects.all().order_by('name')
    serializer_class = SupplierSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['name', 'contact_person', 'phone', 'email']

class ProductViewSet(BaseInventoryViewSet):
    queryset = Product.objects.all().order_by('-id')
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['name', 'sku', 'barcode', 'brand']
    filterset_fields = ['category', 'brand']

    def get_queryset(self):
        queryset = super().get_queryset()
        low_stock = self.request.query_params.get('low_stock', None)
        if low_stock == 'true':
            queryset = queryset.filter(quantity__lte=10)
        return queryset

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        low_stock_products = Product.objects.filter(quantity__lte=10)
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)

class ProductVariantViewSet(BaseInventoryViewSet):
    queryset = ProductVariant.objects.all().order_by('-id')
    serializer_class = ProductVariantSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product']

class InventoryLogViewSet(viewsets.ModelViewSet):
    queryset = InventoryLog.objects.all().order_by('-created_at')
    serializer_class = InventoryLogSerializer
    
    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [IsStaff()]
        return [IsManagerOrAbove()]

    def perform_create(self, serializer):
        log = serializer.save(user=self.request.user)
        # Update product or variant stock
        quantity_change = log.quantity
        if log.variant:
            variant = log.variant
            variant.quantity += quantity_change
            variant.save()
            
            product = variant.product
            product.quantity += quantity_change
            product.save()
        else:
            product = log.product
            product.quantity += quantity_change
            product.save()
