import os
import django
import sys

# Configure Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hamromart.settings")
django.setup()

from django.contrib.auth import get_user_model
from inventory.models import Category, Supplier, Product, ProductVariant, InventoryLog
from pos.models import ReceiptSettings
from customers.models import Customer
from sales.models import Sale, SaleItem

User = get_user_model()

def seed_database():
    print("--- Starting Database Seeding ---")

    # 1. Create Users
    print("Seeding users...")
    
    # Admin
    if not User.objects.filter(username="admin").exists():
        admin = User.objects.create_user(
            username="admin",
            email="admin@hamromart.com",
            password="adminpassword",
            first_name="Admin",
            last_name="Owner",
            role="admin"
        )
        print("Created Admin user (username: admin, password: adminpassword)")
    else:
        print("Admin user already exists.")

    # Manager
    if not User.objects.filter(username="manager").exists():
        manager = User.objects.create_user(
            username="manager",
            email="manager@hamromart.com",
            password="managerpassword",
            first_name="Sanjay",
            last_name="Manager",
            role="manager"
        )
        print("Created Manager user (username: manager, password: managerpassword)")
    else:
        print("Manager user already exists.")

    # Staff
    if not User.objects.filter(username="staff").exists():
        staff = User.objects.create_user(
            username="staff",
            email="staff@hamromart.com",
            password="staffpassword",
            first_name="Rita",
            last_name="Cashier",
            role="staff"
        )
        print("Created Staff user (username: staff, password: staffpassword)")
    else:
        print("Staff user already exists.")

    # 2. Create Receipt Settings
    print("Seeding receipt settings...")
    if not ReceiptSettings.objects.exists():
        ReceiptSettings.objects.create(
            store_name="Hamro Mart Pvt. Ltd.",
            address="New Baneshwor, Kathmandu, Nepal",
            phone="+977-1-4789000",
            pan_number="609584732",
            header_message="Welcome to Hamro Mart! The best style in Nepal.",
            footer_message="Goods once sold are exchangeable within 7 days with valid tax invoice."
        )
        print("Created initial ReceiptSettings.")
    else:
        print("Receipt settings already exist.")

    # 3. Create Categories
    print("Seeding categories...")
    cat_clothing, _ = Category.objects.get_or_create(name="Clothing", description="T-shirts, Shirts, Jackets, Pants")
    cat_footwear, _ = Category.objects.get_or_create(name="Footwear", description="Sneakers, Shoes, Formal footwear")
    cat_accessories, _ = Category.objects.get_or_create(name="Accessories", description="Belts, Hats, Wallets, Socks")
    print("Categories synced.")

    # 4. Create Supplier
    print("Seeding suppliers...")
    supplier, _ = Supplier.objects.get_or_create(
        name="Nepal Apparel Distributors",
        contact_person="Ramesh Shrestha",
        phone="9851088899",
        email="info@nepalapparel.com",
        address="Tripureshwor, Kathmandu"
    )
    print("Suppliers synced.")

    # 5. Create Products & Variants
    print("Seeding products & variants...")
    
    # Product 1: Denim Jacket
    p1, created1 = Product.objects.get_or_create(
        name="Slim Fit Denim Jacket",
        category=cat_clothing,
        brand="DenimCo",
        cost_price=1200.00,
        selling_price=2499.00,
        supplier=supplier
    )
    if created1:
        # Create Variants
        v1_m = ProductVariant.objects.create(product=p1, size="M", color="Classic Blue", quantity=15)
        v1_l = ProductVariant.objects.create(product=p1, size="L", color="Classic Blue", quantity=20)
        v1_xl = ProductVariant.objects.create(product=p1, size="XL", color="Classic Blue", quantity=10)
        
        p1.quantity = 45
        p1.save()

        # Log initial stock in logs
        system_user = User.objects.filter(role="admin").first()
        InventoryLog.objects.create(product=p1, variant=v1_m, log_type='in', quantity=15, reason="Initial Stock In", user=system_user)
        InventoryLog.objects.create(product=p1, variant=v1_l, log_type='in', quantity=20, reason="Initial Stock In", user=system_user)
        InventoryLog.objects.create(product=p1, variant=v1_xl, log_type='in', quantity=10, reason="Initial Stock In", user=system_user)
        print("Created 'Slim Fit Denim Jacket' with 3 variants.")

    # Product 2: Running Shoes
    p2, created2 = Product.objects.get_or_create(
        name="Ultra Comfort Running Shoes",
        category=cat_footwear,
        brand="RunSoft",
        cost_price=1800.00,
        selling_price=3499.00,
        supplier=supplier
    )
    if created2:
        v2_8 = ProductVariant.objects.create(product=p2, size="8", color="Charcoal Black", quantity=10)
        v2_9 = ProductVariant.objects.create(product=p2, size="9", color="Charcoal Black", quantity=15)
        v2_10 = ProductVariant.objects.create(product=p2, size="10", color="Charcoal Black", quantity=12)
        
        p2.quantity = 37
        p2.save()

        system_user = User.objects.filter(role="admin").first()
        InventoryLog.objects.create(product=p2, variant=v2_8, log_type='in', quantity=10, reason="Initial Stock In", user=system_user)
        InventoryLog.objects.create(product=p2, variant=v2_9, log_type='in', quantity=15, reason="Initial Stock In", user=system_user)
        InventoryLog.objects.create(product=p2, variant=v2_10, log_type='in', quantity=12, reason="Initial Stock In", user=system_user)
        print("Created 'Ultra Comfort Running Shoes' with 3 variants.")

    # Product 3: Leather Belt
    p3, created3 = Product.objects.get_or_create(
        name="Premium Brown Leather Belt",
        category=cat_accessories,
        brand="LeatherCraft",
        cost_price=450.00,
        selling_price=999.00,
        supplier=supplier,
        quantity=50  # base product, no variants
    )
    if created3:
        system_user = User.objects.filter(role="admin").first()
        InventoryLog.objects.create(product=p3, log_type='in', quantity=50, reason="Initial Stock In", user=system_user)
        print("Created 'Premium Brown Leather Belt' with no variants (50 stock).")

    # 6. Create Customer
    print("Seeding customer...")
    c1, _ = Customer.objects.get_or_create(
        name="Nil Kumar Shrestha",
        phone="9841234567",
        email="nil@gmail.com",
        address="Baneshwor, Kathmandu",
        loyalty_points=15
    )
    print("Customer seeded.")

    print("--- Database Seeding Completed Successfully ---")

if __name__ == "__main__":
    seed_database()
