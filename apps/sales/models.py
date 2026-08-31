from django.db import models
from django.conf import settings
from django.db import models
from decimal import Decimal

from django.core.validators import MinValueValidator



class Customer(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="customers",
    )

    name = models.CharField(max_length=150)

    phone = models.CharField(
        max_length=30,
        blank=True,
    )

    note = models.TextField(
        blank=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name



class OrderStatus(models.TextChoices):
    COMPLETED = "completed", "ثبت شده"
    CANCELLED = "cancelled", "لغو شده"

class OrderPaymentStatus(models.TextChoices):
    UNPAID = "unpaid", "پرداخت نشده"
    PARTIALLY_PAID = "partially_paid", "نیمه پرداخت"
    PAID = "paid", "پرداخت شده"


class Order(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="orders",
    )

    payment_status = models.CharField(
    max_length=20,
    choices=OrderPaymentStatus.choices,
    default=OrderPaymentStatus.UNPAID,
)

    customer = models.ForeignKey(
        "sales.Customer",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="orders",
    )

    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.COMPLETED,
    )

    ordered_at = models.DateTimeField()

    note = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-ordered_at"]

    def __str__(self) -> str:
        return f"Order #{self.pk}"




class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.PROTECT,
        related_name="items",
    )

    product = models.ForeignKey(
        "products.Product",
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    recipe = models.ForeignKey(
        "products.Recipe",
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    quantity = models.PositiveIntegerField()

    unit_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    total_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    material_cost = models.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

        constraints = [
            models.CheckConstraint(
                condition=models.Q(quantity__gt=0),
                name="order_item_quantity_gt_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(unit_price__gte=0),
                name="order_item_unit_price_gte_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(total_price__gte=0),
                name="order_item_total_price_gte_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(material_cost__gte=0),
                name="order_item_material_cost_gte_zero",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.product.name} x {self.quantity}"




class OrderItemIngredient(models.Model):
    order_item = models.ForeignKey(
        OrderItem,
        on_delete=models.PROTECT,
        related_name="ingredient_usages",
    )

    ingredient = models.ForeignKey(
        "inventory.Ingredient",
        on_delete=models.PROTECT,
        related_name="order_item_usages",
    )

    quantity = models.DecimalField(
        max_digits=14,
        decimal_places=3,
        validators=[MinValueValidator(Decimal("0.001"))],
    )

    unit_cost = models.DecimalField(
        max_digits=14,
        decimal_places=6,
        validators=[MinValueValidator(Decimal("0"))],
    )

    total_cost = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0"))],
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

        constraints = [
            models.UniqueConstraint(
                fields=["order_item", "ingredient"],
                name="unique_ingredient_per_order_item",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.ingredient.name} - {self.quantity}"



class CustomerPaymentMethod(models.TextChoices):
    CASH = "cash", "نقدی"
    CARD = "card", "کارت"
    TRANSFER = "transfer", "انتقال بانکی"


class CustomerPayment(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="customer_payments",
    )

    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="payments",
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="customer_payments",
    )

    amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    method = models.CharField(
        max_length=20,
        choices=CustomerPaymentMethod.choices,
    )

    paid_at = models.DateTimeField()

    note = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-paid_at"]

        constraints = [
            models.CheckConstraint(
                condition=models.Q(amount__gt=0),
                name="customer_payment_amount_gt_zero",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.customer} - {self.amount}"



class CustomerTransactionType(models.TextChoices):
    SALE = "sale", "فروش"
    PAYMENT = "payment", "پرداخت"
    REFUND = "refund", "برگشت وجه"
    ADJUSTMENT = "adjustment", "اصلاح حساب"


class CustomerAccountDirection(models.TextChoices):
    DEBIT = "debit", "بدهکار"
    CREDIT = "credit", "بستانکار"


class CustomerTransaction(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="customer_transactions",
    )

    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="account_transactions",
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=CustomerTransactionType.choices,
    )

    direction = models.CharField(
        max_length=10,
        choices=CustomerAccountDirection.choices,
    )

    amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="customer_transactions",
    )

    payment = models.ForeignKey(
        CustomerPayment,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="account_transactions",
    )

    note = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

        constraints = [
            models.CheckConstraint(
                condition=models.Q(amount__gt=0),
                name="customer_transaction_amount_gt_zero",
            ),
        ]

    def __str__(self) -> str:
        return (
            f"{self.customer} - "
            f"{self.transaction_type} - "
            f"{self.amount}"
        )