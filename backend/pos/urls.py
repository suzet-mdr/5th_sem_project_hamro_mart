from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReceiptSettingsViewSet, CheckoutView

router = DefaultRouter()
router.register(r'receipt-settings', ReceiptSettingsViewSet, basename='receiptsettings')

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='pos_checkout'),
    path('', include(router.urls)),
]
