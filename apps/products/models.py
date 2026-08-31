from decimal import Decimal
from apps.inventory.models import Ingredient, IngredientUnitType
from django.core.exceptions import ValidationError

from django.core.validators import MinValueValidator
from django.db import models


class Product(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="products",
    )

    name = models.CharField(max_length=150)

    selling_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
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
                name="unique_product_name_per_organization",
            ),
        ]

    def __str__(self) -> str:
        return self.name




class Recipe(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="recipes",
    )

    version = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )

    valid_from = models.DateTimeField()

    valid_to = models.DateTimeField(
        null=True,
        blank=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["product", "-version"]

        constraints = [
            models.UniqueConstraint(
                fields=["product", "version"],
                name="unique_recipe_version_per_product",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.product.name} - v{self.version}"




class RecipeItem(models.Model):
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.PROTECT,
        related_name="items",
    )

    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.PROTECT,
        related_name="recipe_items",
    )

    quantity = models.DecimalField(
        max_digits=14,
        decimal_places=3,
    )

    unit = models.CharField(
        max_length=10,
    )

    base_quantity = models.DecimalField(
        max_digits=14,
        decimal_places=3,
    )

    class Meta:
        ordering = ["id"]

        constraints = [
            models.UniqueConstraint(
                fields=["recipe", "ingredient"],
                name="unique_ingredient_per_recipe",
            ),
            models.CheckConstraint(
                condition=models.Q(quantity__gt=0),
                name="recipe_item_quantity_gt_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(base_quantity__gt=0),
                name="recipe_item_base_quantity_gt_zero",
            ),
        ]

    def clean(self) -> None:
        super().clean()

        ingredient = getattr(self, "ingredient", None)

        if ingredient is None:
            return

        allowed_units: dict[str, set[str]] = {
            "weight": {"g", "kg"},
            "volume": {"ml", "l"},
            "count": {"piece"},
        }

        allowed_for_type = allowed_units.get(
            ingredient.unit_type,
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
        return f"{self.recipe} - {self.ingredient}"