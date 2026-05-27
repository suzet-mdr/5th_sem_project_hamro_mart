from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SaleViewSet, ExpenseViewSet, ReportSummaryView

router = DefaultRouter()
router.register(r'records', SaleViewSet, basename='sale')
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    path('trend/', ReportSummaryView.as_view(), name='sales_trend'),
    path('', include(router.urls)),
]
