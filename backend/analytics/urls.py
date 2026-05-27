from django.urls import path
from .views import AnalyticsSummaryView, CategorySalesView, TopProductsView, TopCustomersView

urlpatterns = [
    path('summary/', AnalyticsSummaryView.as_view(), name='analytics_summary'),
    path('category-sales/', CategorySalesView.as_view(), name='analytics_category_sales'),
    path('top-products/', TopProductsView.as_view(), name='analytics_top_products'),
    path('top-customers/', TopCustomersView.as_view(), name='analytics_top_customers'),
]
