"use client";

import {
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import type { Ingredient } from "@/types/ingredients";
import type { Product } from "@/types/products";

export type RecipeFormItem = {
  ingredient: string;
  quantity: string;
  unit: string;
};

export type RecipeFormValues = {
  product: string;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  items: RecipeFormItem[];
};

type RecipeFormProps = {
  products: Product[];
  ingredients: Ingredient[];
  loadingOptions?: boolean;
  loading?: boolean;
  error?: string | null;
  onSubmit: (
    values: RecipeFormValues,
  ) => Promise<void>;
};

export default function RecipeForm({
  products,
  ingredients,
  loadingOptions = false,
  loading = false,
  error = null,
  onSubmit,
}: RecipeFormProps) {
  const [product, setProduct] =
    useState("");

  const [validFrom, setValidFrom] =
    useState("");

  const [validTo, setValidTo] =
    useState("");

  const [isActive, setIsActive] =
    useState(true);

  const [items, setItems] =
    useState<RecipeFormItem[]>([
      {
        ingredient: "",
        quantity: "",
        unit: "",
      },
    ]);

  const [validationError, setValidationError] =
    useState<string | null>(null);

  function addItem() {
    setItems((current) => [
      ...current,
      {
        ingredient: "",
        quantity: "",
        unit: "",
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    );
  }

  function updateItem(
    index: number,
    field: keyof RecipeFormItem,
    value: string,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function handleIngredientChange(
    index: number,
    ingredientId: string,
  ) {
    const ingredient =
      ingredients.find(
        (item) =>
          String(item.id) ===
          ingredientId,
      );

    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ingredient:
                ingredientId,
              unit:
                item.unit ||
                ingredient?.base_unit ||
                "",
            }
          : item,
      ),
    );
  }

  function toIsoDateTime(
    value: string,
  ): string {
    return new Date(
      value,
    ).toISOString();
  }

  async function handleSubmit() {
    if (!product) {
      setValidationError(
        "انتخاب محصول الزامی است.",
      );
      return;
    }

    if (!validFrom) {
      setValidationError(
        "تاریخ شروع اعتبار الزامی است.",
      );
      return;
    }

    if (
      validTo &&
      new Date(validTo) <
        new Date(validFrom)
    ) {
      setValidationError(
        "تاریخ پایان اعتبار نمی‌تواند قبل از تاریخ شروع باشد.",
      );
      return;
    }

    if (items.length === 0) {
      setValidationError(
        "حداقل یک ماده اولیه باید ثبت شود.",
      );
      return;
    }

    for (
      let index = 0;
      index < items.length;
      index += 1
    ) {
      const item = items[index];

      if (!item.ingredient) {
        setValidationError(
          `ماده اولیه ردیف ${index + 1} انتخاب نشده است.`,
        );
        return;
      }

      const quantity = Number(
        item.quantity,
      );

      if (
        !Number.isFinite(quantity) ||
        quantity < 0.001
      ) {
        setValidationError(
          `مقدار ماده اولیه ردیف ${index + 1} باید حداقل ۰٫۰۰۱ باشد.`,
        );
        return;
      }

      if (!item.unit.trim()) {
        setValidationError(
          `واحد ماده اولیه ردیف ${index + 1} الزامی است.`,
        );
        return;
      }
    }

    const duplicateIngredients =
      items.some(
        (item, index) =>
          items.findIndex(
            (other) =>
              other.ingredient ===
              item.ingredient,
          ) !== index,
      );

    if (duplicateIngredients) {
      setValidationError(
        "یک ماده اولیه نمی‌تواند بیشتر از یک بار در این Recipe ثبت شود.",
      );
      return;
    }

    setValidationError(null);

    await onSubmit({
      product,
      valid_from:
        toIsoDateTime(validFrom),
      valid_to: validTo
        ? toIsoDateTime(validTo)
        : "",
      is_active: isActive,
      items,
    });
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <section>
        <Link
          href="/recipes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          دستور تهیه‌ها
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            دستور تهیه جدید
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            محصول، بازه اعتبار و مواد اولیه مورد نیاز را مشخص کنید.
          </p>
        </div>
      </section>

      <div className="space-y-5">
        {/* General Information */}
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">
              اطلاعات کلی
            </h2>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">
            {/* Product */}
            <div>
              <label
                htmlFor="recipe-product"
                className="mb-2 block text-sm font-medium"
              >
                محصول
                <span className="mr-1 text-destructive">
                  *
                </span>
              </label>

              <div className="relative">
                <select
                  id="recipe-product"
                  value={product}
                  onChange={(event) =>
                    setProduct(
                      event.target.value,
                    )
                  }
                  disabled={
                    loadingOptions ||
                    loading
                  }
                  className="
                    h-11 w-full appearance-none
                    rounded-lg border border-input
                    bg-background
                    px-3 pr-9
                    text-sm
                    outline-none
                    focus:border-ring
                    focus:ring-2
                    focus:ring-ring/20
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <option value="">
                    انتخاب محصول
                  </option>

                  {products
                    .filter(
                      (item) =>
                        item.is_active,
                    )
                    .map(
                      (item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.name}
                        </option>
                      ),
                    )}
                </select>

                <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Active */}
            <div className="flex items-end">
              <label className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) =>
                    setIsActive(
                      event.target.checked,
                    )
                  }
                  disabled={loading}
                  className="size-4 accent-[var(--success)]"
                />

                <div>
                  <p className="text-sm font-medium">
                    Recipe فعال باشد
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    این نسخه در فرآیندهای جدید قابل استفاده باشد.
                  </p>
                </div>
              </label>
            </div>

            {/* Valid From */}
            <div>
              <label
                htmlFor="recipe-valid-from"
                className="mb-2 block text-sm font-medium"
              >
                شروع اعتبار
                <span className="mr-1 text-destructive">
                  *
                </span>
              </label>

              <input
                id="recipe-valid-from"
                type="datetime-local"
                value={validFrom}
                onChange={(event) =>
                  setValidFrom(
                    event.target.value,
                  )
                }
                disabled={loading}
                className="
                  h-11 w-full
                  rounded-lg border border-input
                  bg-background px-3
                  text-sm
                  outline-none
                  focus:border-ring
                  focus:ring-2
                  focus:ring-ring/20
                "
              />
            </div>

            {/* Valid To */}
            <div>
              <label
                htmlFor="recipe-valid-to"
                className="mb-2 block text-sm font-medium"
              >
                پایان اعتبار
              </label>

              <input
                id="recipe-valid-to"
                type="datetime-local"
                value={validTo}
                onChange={(event) =>
                  setValidTo(
                    event.target.value,
                  )
                }
                disabled={loading}
                className="
                  h-11 w-full
                  rounded-lg border border-input
                  bg-background px-3
                  text-sm
                  outline-none
                  focus:border-ring
                  focus:ring-2
                  focus:ring-ring/20
                "
              />

              <p className="mt-2 text-xs text-muted-foreground">
                خالی بگذارید تا Recipe بدون تاریخ پایان باشد.
              </p>
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">
                مواد اولیه
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                مواد و مقدار مورد نیاز برای این نسخه از Recipe
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              disabled={loading}
              className="
                inline-flex h-9
                items-center justify-center gap-2
                rounded-lg
                border border-border
                bg-background
                px-3
                text-xs font-medium
                transition-colors
                hover:bg-accent
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Plus className="size-3.5" />
              افزودن ماده
            </button>
          </div>

          <div className="divide-y divide-border/70">
            {items.map((item, index) => {
              const selectedIngredient =
                ingredients.find(
                  (ingredient) =>
                    String(
                      ingredient.id,
                    ) ===
                    item.ingredient,
                );

              return (
                <div
                  key={index}
                  className="p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      ماده {index + 1}
                    </span>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(index)
                        }
                        disabled={loading}
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        aria-label="حذف ماده"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_180px_180px]">
                    {/* Ingredient */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-muted-foreground">
                        ماده اولیه
                      </label>

                      <div className="relative">
                        <select
                          value={
                            item.ingredient
                          }
                          onChange={(
                            event,
                          ) =>
                            handleIngredientChange(
                              index,
                              event.target
                                .value,
                            )
                          }
                          disabled={
                            loadingOptions ||
                            loading
                          }
                          className="
                            h-10 w-full appearance-none
                            rounded-lg
                            border border-input
                            bg-background
                            px-3 pr-9
                            text-sm
                            outline-none
                            focus:border-ring
                            focus:ring-2
                            focus:ring-ring/20
                          "
                        >
                          <option value="">
                            انتخاب ماده اولیه
                          </option>

                          {ingredients
                            .filter(
                              (
                                ingredient,
                              ) =>
                                ingredient.is_active ||
                                ingredient.id.toString() ===
                                  item.ingredient,
                            )
                            .map(
                              (
                                ingredient,
                              ) => (
                                <option
                                  key={
                                    ingredient.id
                                  }
                                  value={
                                    ingredient.id
                                  }
                                >
                                  {
                                    ingredient.name
                                  }
                                </option>
                              ),
                            )}
                        </select>

                        <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      </div>

                      {selectedIngredient && (
                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                          واحد پایه:{" "}
                          {
                            selectedIngredient.base_unit
                          }
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-muted-foreground">
                        مقدار
                      </label>

                      <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={
                          item.quantity
                        }
                        onChange={(event) =>
                          updateItem(
                            index,
                            "quantity",
                            event.target
                              .value,
                          )
                        }
                        disabled={loading}
                        placeholder="مثلاً 18"
                        dir="ltr"
                        className="
                          h-10 w-full
                          rounded-lg
                          border border-input
                          bg-background
                          px-3
                          text-left
                          text-sm
                          outline-none
                          focus:border-ring
                          focus:ring-2
                          focus:ring-ring/20
                        "
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-muted-foreground">
                        واحد
                      </label>

                      <input
                        type="text"
                        maxLength={10}
                        value={item.unit}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "unit",
                            event.target
                              .value,
                          )
                        }
                        disabled={loading}
                        placeholder="مثلاً g"
                        dir="ltr"
                        className="
                          h-10 w-full
                          rounded-lg
                          border border-input
                          bg-background
                          px-3
                          text-left
                          text-sm
                          outline-none
                          focus:border-ring
                          focus:ring-2
                          focus:ring-ring/20
                        "
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Error */}
        {(validationError ||
          error) && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {validationError ??
              error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link
            href="/recipes"
            className="
              inline-flex h-10
              items-center justify-center
              rounded-lg
              border border-border
              bg-background
              px-4
              text-sm font-medium
              transition-colors
              hover:bg-accent
            "
          >
            انصراف
          </Link>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              loading ||
              loadingOptions
            }
            className="
              inline-flex h-10
              items-center justify-center
              gap-2
              rounded-lg
              bg-primary
              px-4
              text-sm font-medium
              text-primary-foreground
              shadow-sm
              transition-opacity
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}

            {loading
              ? "در حال ذخیره..."
              : "ثبت دستور تهیه"}
          </button>
        </div>
      </div>
    </div>
  );
}