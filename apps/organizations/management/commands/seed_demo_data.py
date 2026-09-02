from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.inventory.models import Ingredient
from apps.organizations.models import Organization
from apps.products.models import Product, Recipe, RecipeItem
from apps.purchases.models import (
    Purchase,
    PurchaseItem,
    Supplier,
)
from apps.sales.models import (
    Customer,
    Order,
    OrderItem,
    OrderStatus,
)


class Command(BaseCommand):
    help = "Create demo data for local development."

    @transaction.atomic
    def handle(self, *args, **options):
        try:
            user = User.objects.select_related(
                "organization"
            ).get(username="testuser")
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(
                    "User 'testuser' does not exist."
                )
            )
            return

        organization = user.organization

        self.stdout.write(
            f"Using organization: "
            f"{organization.id} - "
            f"{organization.name}"
        )

        now = timezone.now()

        # =========================================================
        # Customers
        # =========================================================

        customer1, _ = Customer.objects.get_or_create(
            organization=organization,
            name="علی رضایی",
            defaults={
                "phone": "09121234567",
                "note": "Demo customer",
                "is_active": True,
            },
        )

        customer2, _ = Customer.objects.get_or_create(
            organization=organization,
            name="سارا احمدی",
            defaults={
                "phone": "09129876543",
                "note": "Demo customer",
                "is_active": True,
            },
        )

        # =========================================================
        # Suppliers
        # =========================================================

        supplier1, _ = Supplier.objects.get_or_create(
            organization=organization,
            name="تأمین‌کننده نمونه",
            defaults={
                "phone": "02112345678",
                "note": "Demo supplier",
                "is_active": True,
            },
        )

        # =========================================================
        # Ingredients
        # =========================================================

        coffee_beans, _ = Ingredient.objects.get_or_create(
            organization=organization,
            name="دانه قهوه",
            defaults={
                "unit_type": "weight",
                "current_stock": Decimal("35"),
                "current_inventory_value": Decimal(
                    "52500000"
                ),
                "minimum_stock": Decimal("10"),
                "is_active": True,
            },
        )

        milk, _ = Ingredient.objects.get_or_create(
            organization=organization,
            name="شیر",
            defaults={
                "unit_type": "volume",
                "current_stock": Decimal("8"),
                "current_inventory_value": Decimal(
                    "2400000"
                ),
                "minimum_stock": Decimal("10"),
                "is_active": True,
            },
        )

        cups, _ = Ingredient.objects.get_or_create(
            organization=organization,
            name="لیوان",
            defaults={
                "unit_type": "count",
                "current_stock": Decimal("250"),
                "current_inventory_value": Decimal(
                    "5000000"
                ),
                "minimum_stock": Decimal("100"),
                "is_active": True,
            },
        )

        # =========================================================
        # Products
        # =========================================================

        espresso, _ = Product.objects.get_or_create(
            organization=organization,
            name="اسپرسو",
            defaults={
                "selling_price": Decimal("85000"),
                "is_active": True,
            },
        )

        latte, _ = Product.objects.get_or_create(
            organization=organization,
            name="لاته",
            defaults={
                "selling_price": Decimal("120000"),
                "is_active": True,
            },
        )

        cappuccino, _ = Product.objects.get_or_create(
            organization=organization,
            name="کاپوچینو",
            defaults={
                "selling_price": Decimal("110000"),
                "is_active": True,
            },
        )

        americano, _ = Product.objects.get_or_create(
            organization=organization,
            name="آمریکانو",
            defaults={
                "selling_price": Decimal("95000"),
                "is_active": True,
            },
        )

        mocha, _ = Product.objects.get_or_create(
            organization=organization,
            name="موکا",
            defaults={
                "selling_price": Decimal("135000"),
                "is_active": True,
            },
        )

        # =========================================================
        # Recipes
        # =========================================================

        recipes = [
            (
                espresso,
                [
                    (
                        coffee_beans,
                        Decimal("0.018"),
                        "kg",
                        Decimal("0.018"),
                    ),
                    (
                        cups,
                        Decimal("1"),
                        "عدد",
                        Decimal("1"),
                    ),
                ],
            ),
            (
                latte,
                [
                    (
                        coffee_beans,
                        Decimal("0.018"),
                        "kg",
                        Decimal("0.018"),
                    ),
                    (
                        milk,
                        Decimal("0.25"),
                        "liter",
                        Decimal("0.25"),
                    ),
                    (
                        cups,
                        Decimal("1"),
                        "عدد",
                        Decimal("1"),
                    ),
                ],
            ),
            (
                cappuccino,
                [
                    (
                        coffee_beans,
                        Decimal("0.018"),
                        "kg",
                        Decimal("0.018"),
                    ),
                    (
                        milk,
                        Decimal("0.18"),
                        "liter",
                        Decimal("0.18"),
                    ),
                    (
                        cups,
                        Decimal("1"),
                        "عدد",
                        Decimal("1"),
                    ),
                ],
            ),
            (
                americano,
                [
                    (
                        coffee_beans,
                        Decimal("0.018"),
                        "kg",
                        Decimal("0.018"),
                    ),
                    (
                        cups,
                        Decimal("1"),
                        "عدد",
                        Decimal("1"),
                    ),
                ],
            ),
            (
                mocha,
                [
                    (
                        coffee_beans,
                        Decimal("0.018"),
                        "kg",
                        Decimal("0.018"),
                    ),
                    (
                        milk,
                        Decimal("0.20"),
                        "liter",
                        Decimal("0.20"),
                    ),
                    (
                        cups,
                        Decimal("1"),
                        "عدد",
                        Decimal("1"),
                    ),
                ],
            ),
        ]

        for product, items in recipes:
            recipe, _ = Recipe.objects.get_or_create(
                product=product,
                version=1,
                defaults={
                    "valid_from": now - timedelta(days=30),
                    "valid_to": None,
                    "is_active": True,
                },
            )

            for (
                ingredient,
                quantity,
                unit,
                base_quantity,
            ) in items:
                RecipeItem.objects.get_or_create(
                    recipe=recipe,
                    ingredient=ingredient,
                    defaults={
                        "quantity": quantity,
                        "unit": unit,
                        "base_quantity": base_quantity,
                    },
                )

        # =========================================================
        # Purchases
        # =========================================================

        purchase1, _ = Purchase.objects.get_or_create(
            organization=organization,
            supplier=supplier1,
            note="DEMO_PURCHASE_001",
            defaults={
                "status": "completed",
                "purchased_at": now
                - timedelta(days=12),
            },
        )

        PurchaseItem.objects.get_or_create(
            purchase=purchase1,
            ingredient=coffee_beans,
            defaults={
                "quantity": Decimal("20"),
                "unit": "kg",
                "base_quantity": Decimal("20"),
                "unit_price": Decimal("1500000"),
                "discount": Decimal("0"),
                "total_price": Decimal("30000000"),
            },
        )

        purchase2, _ = Purchase.objects.get_or_create(
            organization=organization,
            supplier=supplier1,
            note="DEMO_PURCHASE_002",
            defaults={
                "status": "completed",
                "purchased_at": now
                - timedelta(days=5),
            },
        )

        PurchaseItem.objects.get_or_create(
            purchase=purchase2,
            ingredient=milk,
            defaults={
                "quantity": Decimal("30"),
                "unit": "liter",
                "base_quantity": Decimal("30"),
                "unit_price": Decimal("300000"),
                "discount": Decimal("0"),
                "total_price": Decimal("9000000"),
            },
        )

        # =========================================================
        # Orders
        # =========================================================

        order1, _ = Order.objects.get_or_create(
            organization=organization,
            note="DEMO_ORDER_001",
            defaults={
                "customer": customer1,
                "payment_status": "paid",
                "status": OrderStatus.COMPLETED,
                "ordered_at": now
                - timedelta(days=2),
            },
        )

        OrderItem.objects.get_or_create(
            order=order1,
            product=espresso,
            defaults={
                "recipe": Recipe.objects.get(
                    product=espresso,
                    version=1,
                ),
                "quantity": 5,
                "unit_price": Decimal("85000"),
                "total_price": Decimal("425000"),
                "material_cost": Decimal("125000"),
            },
        )

        order2, _ = Order.objects.get_or_create(
            organization=organization,
            note="DEMO_ORDER_002",
            defaults={
                "customer": customer2,
                "payment_status": "partially_paid",
                "status": OrderStatus.COMPLETED,
                "ordered_at": now
                - timedelta(days=6),
            },
        )

        OrderItem.objects.get_or_create(
            order=order2,
            product=latte,
            defaults={
                "recipe": Recipe.objects.get(
                    product=latte,
                    version=1,
                ),
                "quantity": 8,
                "unit_price": Decimal("120000"),
                "total_price": Decimal("960000"),
                "material_cost": Decimal("288000"),
            },
        )

        order3, _ = Order.objects.get_or_create(
            organization=organization,
            note="DEMO_ORDER_003",
            defaults={
                "customer": customer1,
                "payment_status": "unpaid",
                "status": OrderStatus.CANCELLED,
                "ordered_at": now
                - timedelta(days=3),
            },
        )

        OrderItem.objects.get_or_create(
            order=order3,
            product=mocha,
            defaults={
                "recipe": Recipe.objects.get(
                    product=mocha,
                    version=1,
                ),
                "quantity": 3,
                "unit_price": Decimal("135000"),
                "total_price": Decimal("405000"),
                "material_cost": Decimal("120000"),
            },
        )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "Demo data created successfully."
            )
        )

        self.stdout.write(
            f"Organization: {organization.name}"
        )
        self.stdout.write(
            "Customers: 2 | Supplier: 1 | "
            "Products: 5 | Ingredients: 3"
        )
        self.stdout.write(
            "Purchases: 2 | Orders: 3"
        )