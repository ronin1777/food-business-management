from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models, transaction

from apps.inventory.models import (
    Ingredient,
    UNIT_TO_BASE_FACTOR,
)
from apps.organizations.models import Organization

from .models import Product, Recipe, RecipeItem


class ProductService:
    @staticmethod
    def create_product(
        *,
        organization: Organization,
        name: str,
        selling_price: Decimal,
        is_active: bool = True,
    ) -> Product:
        name = name.strip()

        if not name:
            raise ValidationError(
                {
                    "name": (
                        "نام محصول نمی‌تواند خالی باشد."
                    )
                }
            )

        if selling_price < Decimal("0"):
            raise ValidationError(
                {
                    "selling_price": (
                        "قیمت فروش نمی‌تواند منفی باشد."
                    )
                }
            )

        if Product.objects.filter(
            organization=organization,
            name=name,
        ).exists():
            raise ValidationError(
                {
                    "name": (
                        "محصولی با این نام قبلاً وجود دارد."
                    )
                }
            )

        return Product.objects.create(
            organization=organization,
            name=name,
            selling_price=selling_price,
            is_active=is_active,
        )

    @staticmethod
    def update_product(
        *,
        organization: Organization,
        product: Product,
        name: str | None = None,
        selling_price: Decimal | None = None,
        is_active: bool | None = None,
    ) -> Product:
        if product.organization_id != organization.id:
            raise ValidationError(
                {
                    "product": (
                        "این محصول متعلق به "
                        "کسب‌وکار شما نیست."
                    )
                }
            )

        if name is not None:
            name = name.strip()

            if not name:
                raise ValidationError(
                    {
                        "name": (
                            "نام محصول نمی‌تواند خالی باشد."
                        )
                    }
                )

            if Product.objects.filter(
                organization=organization,
                name=name,
            ).exclude(pk=product.pk).exists():
                raise ValidationError(
                    {
                        "name": (
                            "محصولی با این نام قبلاً وجود دارد."
                        )
                    }
                )

            product.name = name

        if selling_price is not None:
            if selling_price < Decimal("0"):
                raise ValidationError(
                    {
                        "selling_price": (
                            "قیمت فروش نمی‌تواند منفی باشد."
                        )
                    }
                )

            product.selling_price = selling_price

        if is_active is not None:
            product.is_active = is_active

        product.save()

        return product


class RecipeService:
    @staticmethod
    @transaction.atomic
    def create_recipe(
        *,
        organization: Organization,
        product: Product,
        valid_from,
        valid_to,
        is_active: bool,
        items: list[dict],
    ) -> Recipe:
        if product.organization_id != organization.id:
            raise ValidationError(
                {
                    "product": (
                        "این محصول متعلق به "
                        "کسب‌وکار شما نیست."
                    )
                }
            )

        if not product.is_active:
            raise ValidationError(
                {
                    "product": (
                        "این محصول غیرفعال است."
                    )
                }
            )

        if not items:
            raise ValidationError(
                {
                    "items": (
                        "Recipe باید حداقل یک ماده اولیه "
                        "داشته باشد."
                    )
                }
            )

        if valid_to is not None and valid_to <= valid_from:
            raise ValidationError(
                {
                    "valid_to": (
                        "تاریخ پایان باید بعد از "
                        "تاریخ شروع باشد."
                    )
                }
            )

        # Lock the product so concurrent requests
        # cannot generate duplicate recipe versions.
        product = (
            Product.objects
            .select_for_update()
            .get(pk=product.pk)
        )

        # Check whether the new validity range overlaps
        # an existing recipe.
        if valid_to is None:
            overlapping = (
                Recipe.objects
                .filter(
                    product=product,
                    valid_from__lte=valid_from,
                )
                .filter(
                    models.Q(valid_to__isnull=True)
                    | models.Q(valid_to__gt=valid_from)
                )
            )
        else:
            overlapping = (
                Recipe.objects
                .filter(
                    product=product,
                    valid_from__lt=valid_to,
                )
                .filter(
                    models.Q(valid_to__isnull=True)
                    | models.Q(valid_to__gt=valid_from)
                )
            )

        if overlapping.exists():
            raise ValidationError(
                {
                    "valid_from": (
                        "بازه زمانی این Recipe با "
                        "Recipe دیگری تداخل دارد."
                    )
                }
            )

        latest_version = (
            Recipe.objects
            .filter(product=product)
            .order_by("-version")
            .values_list("version", flat=True)
            .first()
            or 0
        )

        recipe = Recipe.objects.create(
            product=product,
            version=latest_version + 1,
            valid_from=valid_from,
            valid_to=valid_to,
            is_active=is_active,
        )

        for item_data in items:
            RecipeService._create_recipe_item(
                recipe=recipe,
                organization=organization,
                item_data=item_data,
            )

        return recipe

    @staticmethod
    def _create_recipe_item(
        *,
        recipe: Recipe,
        organization: Organization,
        item_data: dict,
    ) -> RecipeItem:
        ingredient: Ingredient = item_data["ingredient"]

        if ingredient.organization_id != organization.id:
            raise ValidationError(
                {
                    "ingredient": (
                        "این ماده اولیه متعلق به "
                        "کسب‌وکار شما نیست."
                    )
                }
            )

        if not ingredient.is_active:
            raise ValidationError(
                {
                    "ingredient": (
                        "این ماده اولیه غیرفعال است."
                    )
                }
            )

        quantity = Decimal(
            str(item_data["quantity"])
        )

        if quantity <= Decimal("0"):
            raise ValidationError(
                {
                    "quantity": (
                        "مقدار ماده اولیه باید "
                        "بیشتر از صفر باشد."
                    )
                }
            )

        unit = str(item_data["unit"])

        valid_units = {
            "weight": {"g", "kg"},
            "volume": {"ml", "l"},
            "count": {"piece"},
        }.get(
            ingredient.unit_type,
            set(),
        )

        if unit not in valid_units:
            raise ValidationError(
                {
                    "unit": (
                        "واحد انتخاب‌شده برای "
                        "این ماده اولیه معتبر نیست."
                    )
                }
            )

        base_quantity = (
            quantity * UNIT_TO_BASE_FACTOR[unit]
        )

        return RecipeItem.objects.create(
            recipe=recipe,
            ingredient=ingredient,
            quantity=quantity,
            unit=unit,
            base_quantity=base_quantity,
        )