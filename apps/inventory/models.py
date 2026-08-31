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


class Ingredient(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="ingredients",
    )

    name = models.CharField(max_length=150)

    unit_type = models.CharField(
        max_length=20,
        choices=IngredientUnitType.choices,
    )

    current_stock = models.DecimalField(
        max_digits=14,
        decimal_places=3,
        default=Decimal("0"),
        validators=[MinValueValidator(Decimal("0"))],
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"],
                name="unique_ingredient_name_per_org",
            ),
        ]

    @property
    def base_unit(self) -> str:
        return BASE_UNIT_BY_TYPE[self.unit_type]

    def __str__(self) -> str:
        return self.name







class InventoryTransactionType(models.TextChoices):
    PURCHASE = "purchase", "خرید"
    ORDER_USAGE = "order_usage", "مصرف سفارش"
    WASTE = "waste", "دورریز"
    ADJUSTMENT = "adjustment", "اصلاح موجودی"


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

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.CheckConstraint(
                condition=~models.Q(quantity=0),
                name="inventory_transaction_quantity_not_zero",
            ),
        ]

    def __str__(self) -> str:
        return (
            f"{self.ingredient} | "
            f"{self.transaction_type} | "
            f"{self.quantity}"
        )