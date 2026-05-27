from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, F, Count, Avg
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta

from accounts.permissions import IsAdmin
from sales.models import Sale, SaleItem, Expense
from inventory.models import Product
from customers.models import Customer

User = get_user_model()

class AnalyticsSummaryView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if not start_date_str or not end_date_str:
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=30)
        else:
            try:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        sales = Sale.objects.filter(created_at__date__range=[start_date, end_date])
        
        total_revenue = sales.aggregate(sum_total=Sum('total'))['sum_total'] or 0.0
        total_sales_count = sales.count()
        average_order_value = sales.aggregate(avg_total=Avg('total'))['avg_total'] or 0.0

        total_cost = SaleItem.objects.filter(sale__in=sales).aggregate(
            sum_cost=Sum(F('quantity') * F('cost_price'))
        )['sum_cost'] or 0.0

        gross_profit = float(total_revenue) - float(total_cost)

        total_expenses = Expense.objects.filter(date__range=[start_date, end_date]).aggregate(
            sum_amount=Sum('amount')
        )['sum_amount'] or 0.0

        net_profit = gross_profit - float(total_expenses)

        low_stock_count = Product.objects.filter(quantity__lte=10).count()
        total_customers = Customer.objects.count()
        total_staff = User.objects.exclude(role='admin').count()

        return Response({
            "start_date": start_date,
            "end_date": end_date,
            "total_revenue": total_revenue,
            "total_sales_count": total_sales_count,
            "average_order_value": average_order_value,
            "total_cost": total_cost,
            "gross_profit": gross_profit,
            "total_expenses": total_expenses,
            "net_profit": net_profit,
            "low_stock_count": low_stock_count,
            "total_customers": total_customers,
            "total_staff": total_staff
        })

class CategorySalesView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        items = SaleItem.objects.filter(product__category__isnull=False)
        category_stats = items.values(category_name=F('product__category__name'))\
            .annotate(
                total_qty=Sum('quantity'), 
                total_revenue=Sum('total'),
                total_cost=Sum(F('quantity') * F('cost_price'))
            )\
            .order_by('-total_revenue')
            
        stats = []
        for stat in category_stats:
            revenue = float(stat['total_revenue'] or 0)
            cost = float(stat['total_cost'] or 0)
            profit = revenue - cost
            stats.append({
                "category": stat['category_name'],
                "quantity_sold": stat['total_qty'],
                "revenue": revenue,
                "profit": profit
            })

        return Response(stats)

class TopProductsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        top_products = SaleItem.objects.values(
                product_id=F('product__id'), 
                product_name=F('product__name'),
                sku=F('product__sku')
            )\
            .annotate(
                quantity_sold=Sum('quantity'),
                revenue=Sum('total')
            )\
            .order_by('-quantity_sold')[:10]
            
        return Response(top_products)

class TopCustomersView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        top_customers = Sale.objects.filter(customer__isnull=False)\
            .values(
                customer_id=F('customer__id'), 
                customer_name=F('customer__name'), 
                phone=F('customer__phone')
            )\
            .annotate(
                total_spent=Sum('total'),
                orders_count=Count('id')
            )\
            .order_by('-total_spent')[:10]

        return Response(top_customers)
