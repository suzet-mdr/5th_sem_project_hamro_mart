from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, LoyaltyPointLogViewSet

router = DefaultRouter()
router.register(r'list', CustomerViewSet, basename='customer')
router.register(r'loyalty-logs', LoyaltyPointLogViewSet, basename='loyaltylog')

urlpatterns = [
    path('', include(router.urls)),
]
