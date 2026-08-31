from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.conf import settings




class IngredientUnitType(models.TextChoices):
    WEIGHT = "weight", "وزنی"
    VOLUME = "volume", "حجمی"
    COUNT = "count", "عددی"


BASE_UNIT_BY_TYPE: dict[str, str] = {
    IngredientUnitType.WEIGHT: "g",
    IngredientUnitType.VOLUME: "ml",
    IngredientUnitType.COUNT: "piece",
}



UNIT_TO_BASE_FACTOR: dict[str, Decimal] = {
    "g": Decimal("1"),
    "kg": Decimal("1000"),
    "ml": Decimal("1"),
    "l": Decimal("1000"),
    "piece": Decimal("1"),
}

class Ingredient(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="ingredients",
    )

    name = models.CharField(
        max_length=150,
    )

    unit_type = models.CharField(
        max_length=20,
        choices=IngredientUnitType.choices,
    )

    current_stock = models.DecimalField(
        max_digits=14,
        decimal_places=3,
        default=Decimal("0"),
        validators=[
            MinValueValidator(Decimal("0")),
        ],
    )

    current_inventory_value = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        default=Decimal("0"),
        validators=[
            MinValueValidator(Decimal("0")),
        ],
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]

        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"],
                name="unique_ingredient_name_per_org",
            ),
            models.CheckConstraint(
                condition=models.Q(current_stock__gte=0),
                name="ingredient_stock_gte_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(current_inventory_value__gte=0),
                name="ingredient_inventory_value_gte_zero",
            ),
        ]

    @property
    def base_unit(self) -> str:
        return BASE_UNIT_BY_TYPE[self.unit_type]

    @property
    def average_unit_cost(self) -> Decimal:
        if self.current_stock == Decimal("0"):
            return Decimal("0")

        return (
            self.current_inventory_value
            / self.current_stock
        )

    def __str__(self) -> str:
        return self.name







class InventoryTransactionType(models.TextChoices):
    PURCHASE = "purchase", "خرید"
    ORDER_USAGE = "order_usage", "مصرف سفارش"
    WASTE = "waste", "دورریز"
    ADJUSTMENT = "adjustment", "اصلاح موجودی"
    REVERSAL = "reversal", "معکوس"


class InventoryTransaction(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="inventory_transactions",
    )

    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.PROTECT,
        related_name="inventory_transactions",
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=InventoryTransactionType.choices,
    )

    quantity = models.DecimalField(
        max_digits=14,
        decimal_places=3,
    )

    unit_cost = models.DecimalField(
        max_digits=14,
        decimal_places=6,
        default=Decimal("0"),
        validators=[
            MinValueValidator(Decimal("0")),
        ],
    )

    total_cost = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        default=Decimal("0"),
        validators=[
            MinValueValidator(Decimal("0")),
        ],
    )

    purchase_item = models.ForeignKey(
        "purchases.PurchaseItem",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="inventory_transactions",
    )

    order_item_ingredient = models.ForeignKey(
        "sales.OrderItemIngredient",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="inventory_transactions",
    )

    reverses = models.ForeignKey(
        "self",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="reversal_transactions",
    )

    note = models.TextField(
        blank=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="inventory_transactions_created",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.CheckConstraint(
                condition=~models.Q(quantity=0),
                name="inventory_transaction_quantity_not_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(unit_cost__gte=0),
                name="inventory_transaction_unit_cost_gte_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(total_cost__gte=0),
                name="inventory_transaction_total_cost_gte_zero",
            ),
            models.UniqueConstraint(
                fields=["reverses"],
                condition=models.Q(reverses__isnull=False),
                name="unique_inventory_transaction_reversal",
            ),
        ]

    def __str__(self) -> str:
        return (
            f"{self.ingredient} | "
            f"{self.transaction_type} | "
            f"{self.quantity}"
        )