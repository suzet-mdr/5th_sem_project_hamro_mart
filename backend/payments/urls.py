from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentLogViewSet, PaymentVerifyView

router = DefaultRouter()
router.register(r'logs', PaymentLogViewSet, basename='paymentlog')

urlpatterns = [
    path('verify/', PaymentVerifyView.as_view(), name='payment_verify'),
    path('', include(router.urls)),
]
