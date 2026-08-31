from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models


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