from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsStaff
from sales.models import Sale
from .models import PaymentLog
from .serializers import PaymentLogSerializer, PaymentVerifySerializer

class PaymentLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PaymentLog.objects.all().order_by('-created_at')
    serializer_class = PaymentLogSerializer
    permission_classes = [IsStaff]

class PaymentVerifyView(APIView):
    permission_classes = [IsStaff]

    def post(self, request):
        serializer = PaymentVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        invoice_number = data['invoice_number']
        payment_method = data['payment_method']
        transaction_id = data['transaction_id']
        amount = data['amount']

        try:
            sale = Sale.objects.get(invoice_number=invoice_number)
        except Sale.DoesNotExist:
            return Response({"error": f"Sale invoice {invoice_number} not found."}, status=status.HTTP_404_NOT_FOUND)

        # Mock successful payment gateway verification check
        # In a real environment, you'd send an HTTP request to eSewa/Khalti API here.
        # e.g., eSewa: request POST to epay_payment/confirm with refId and amount.
        # For development, we auto-verify successfully.
        
        log = PaymentLog.objects.create(
            invoice_number=invoice_number,
            payment_method=payment_method,
            transaction_id=transaction_id,
            amount=amount,
            status='success',
            response_payload=f"DEVELOPMENT MOCK: Auto-verified transaction {transaction_id} successfully."
        )

        sale.payment_status = 'completed'
        sale.save()

        return Response({
            "message": "Payment verified and recorded successfully.",
            "payment_log": PaymentLogSerializer(log).data
        }, status=status.HTTP_200_OK)
