from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models

from apps.inventory.models import Ingredient, IngredientUnitType


class Supplier(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="suppliers",
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

        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"],
                name="unique_supplier_name_per_organization",
            ),
        ]

    def __str__(self) -> str:
        return self.name


class Purchase(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="purchases",
    )

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="purchases",
    )

    purchased_at = models.DateTimeField()

    note = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-purchased_at"]

    def __str__(self) -> str:
        return f"Purchase #{self.pk}"


class PurchaseItem(models.Model):
    purchase = models.ForeignKey(
        Purchase,
        on_delete=models.PROTECT,
        related_name="items",
    )

    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.PROTECT,
        related_name="purchase_items",
    )

    quantity = models.DecimalField(
        max_digits=14,
        decimal_places=3,
        validators=[],
    )

    unit = models.CharField(
        max_length=10,
    )

    base_quantity = models.DecimalField(
        max_digits=14,
        decimal_places=3,
    )

    unit_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    discount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0"),
    )

    total_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

        constraints = [
            models.CheckConstraint(
                condition=models.Q(quantity__gt=0),
                name="purchase_item_quantity_gt_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(base_quantity__gt=0),
                name="purchase_item_base_quantity_gt_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(unit_price__gte=0),
                name="purchase_item_unit_price_gte_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(discount__gte=0),
                name="purchase_item_discount_gte_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(total_price__gte=0),
                name="purchase_item_total_price_gte_zero",
            ),
        ]

    def clean(self) -> None:
        super().clean()

        if not self.ingredient:
            return

        allowed_units: dict[str, set[str]] = {
            "weight": {"g", "kg"},
            "volume": {"ml", "l"},
            "count": {"piece"},
        }

        allowed_for_type = allowed_units.get(
            self.ingredient.unit_type,
            set(),
        )

        if self.unit not in allowed_for_type:
            raise ValidationError(
                {
                    "unit": (
                        "واحد انتخاب‌شده برای این ماده اولیه معتبر نیست."
                    )
                }
            )

    def __str__(self) -> str:
        return f"{self.ingredient} - {self.quantity} {self.unit}"




class PurchaseAdditionalCostType(models.TextChoices):
    SHIPPING = "shipping", "حمل"
    LOADING = "loading", "بارگیری"
    DELIVERY = "delivery", "ارسال"
    OTHER = "other", "سایر"


class PurchaseAdditionalCost(models.Model):
    purchase = models.ForeignKey(
        Purchase,
        on_delete=models.PROTECT,
        related_name="additional_costs",
    )

    cost_type = models.CharField(
        max_length=20,
        choices=PurchaseAdditionalCostType.choices,
    )

    amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    note = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(amount__gt=0),
                name="purchase_additional_cost_amount_gt_zero",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.cost_type} - {self.amount}"