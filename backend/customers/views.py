from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import IsStaff
from .models import Customer, LoyaltyPointLog
from .serializers import CustomerSerializer, LoyaltyPointLogSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-id')
    serializer_class = CustomerSerializer
    permission_classes = [IsStaff]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['name', 'phone', 'email']

    @action(detail=False, methods=['get'])
    def search_by_phone(self, request):
        phone = request.query_params.get('phone', None)
        if not phone:
            return Response({"error": "Phone number parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            customer = Customer.objects.get(phone=phone)
            serializer = self.get_serializer(customer)
            return Response(serializer.data)
        except Customer.DoesNotExist:
            return Response({"message": "Customer not found."}, status=status.HTTP_404_NOT_FOUND)

class LoyaltyPointLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LoyaltyPointLog.objects.all().order_by('-created_at')
    serializer_class = LoyaltyPointLogSerializer
    permission_classes = [IsStaff]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['customer']
