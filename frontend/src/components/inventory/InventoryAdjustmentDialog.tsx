"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { createInventoryAdjustment } from "@/lib/api/inventory";
import type { Ingredient } from "@/types/ingredients";

type InventoryAdjustmentDialogProps = {
  open: boolean;
  ingredients: Ingredient[];
  onClose: () => void;
  onSuccess: () => void;
};

export default function InventoryAdjustmentDialog({
  open,
  ingredients,
  onClose,
  onSuccess,
}: InventoryAdjustmentDialogProps) {
  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedIngredient = useMemo(
    () =>
      ingredients.find(
        (ingredient) => ingredient.id === Number(ingredientId),
      ),
    [ingredients, ingredientId],
  );

  const numericQuantity = Number(quantity);

  const isIncrease =
    quantity !== "" &&
    Number.isFinite(numericQuantity) &&
    numericQuantity > 0;

  const isDecrease =
    quantity !== "" &&
    Number.isFinite(numericQuantity) &&
    numericQuantity < 0;

  useEffect(() => {
    if (!open) {
      setIngredientId("");
      setQuantity("");
      setUnitCost("");
      setNote("");
      setError("");
      setLoading(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!ingredientId) {
      setError("ماده اولیه را انتخاب کنید.");
      return;
    }

    if (!selectedIngredient?.is_active) {
      setError("ماده اولیه انتخاب‌شده غیرفعال است.");
      return;
    }

    if (
      quantity.trim() === "" ||
      !Number.isFinite(numericQuantity) ||
      numericQuantity === 0
    ) {
      setError("مقدار باید عددی غیر از صفر باشد.");
      return;
    }

    if (isIncrease) {
      if (
        unitCost.trim() === "" ||
        !Number.isFinite(Number(unitCost)) ||
        Number(unitCost) < 0
      ) {
        setError("برای افزایش موجودی، بهای واحد را وارد کنید.");
        return;
      }
    }

    setLoading(true);

    try {
      await createInventoryAdjustment({
        ingredient: Number(ingredientId),
        quantity: numericQuantity,
        unit_cost: isIncrease ? Number(unitCost) : null,
        note: note.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ثبت اصلاح موجودی با خطا مواجه شد.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-adjustment-title"
        className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-xl"
        dir="rtl"
      >
        <div className="border-b border-border px-6 py-5">
          <h2
            id="inventory-adjustment-title"
            className="text-lg font-semibold"
          >
            اصلاح موجودی
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            برای افزایش مقدار مثبت و برای کاهش مقدار منفی وارد کنید.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="adjustment-ingredient"
                className="text-sm font-medium"
              >
                ماده اولیه
              </label>

              <select
                id="adjustment-ingredient"
                value={ingredientId}
                onChange={(event) => setIngredientId(event.target.value)}
                disabled={loading}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                <option value="">انتخاب ماده اولیه</option>

                {ingredients.map((ingredient) => (
                  <option
                    key={ingredient.id}
                    value={ingredient.id}
                    disabled={!ingredient.is_active}
                  >
                    {ingredient.name}
                    {!ingredient.is_active ? " (غیرفعال)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="adjustment-quantity"
                className="text-sm font-medium"
              >
                مقدار
              </label>

              <div className="flex items-center gap-2">
                <input
                  id="adjustment-quantity"
                  type="number"
                  step="0.001"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  disabled={loading}
                  placeholder="مثلاً 5 یا -2"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                />

                {selectedIngredient && (
                  <span className="min-w-12 text-sm text-muted-foreground">
                    {selectedIngredient.base_unit}
                  </span>
                )}
              </div>

              {quantity !== "" && numericQuantity !== 0 && (
                <p className="text-xs text-muted-foreground">
                  {isIncrease
                    ? "موجودی افزایش پیدا می‌کند."
                    : isDecrease
                      ? "موجودی کاهش پیدا می‌کند."
                      : ""}
                </p>
              )}
            </div>

            {isIncrease && (
              <div className="space-y-2">
                <label
                  htmlFor="adjustment-unit-cost"
                  className="text-sm font-medium"
                >
                  بهای واحد
                </label>

                <input
                  id="adjustment-unit-cost"
                  type="number"
                  min="0"
                  step="0.000001"
                  value={unitCost}
                  onChange={(event) => setUnitCost(event.target.value)}
                  disabled={loading}
                  placeholder="بهای هر واحد"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
            )}

            {isDecrease && (
              <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                بهای کاهش موجودی بر اساس میانگین بهای فعلی ماده اولیه
                محاسبه می‌شود.
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="adjustment-note"
                className="text-sm font-medium"
              >
                توضیحات
              </label>

              <textarea
                id="adjustment-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={loading}
                rows={3}
                placeholder="دلیل اصلاح موجودی..."
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-start gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-lg border border-input px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "در حال ثبت..." : "ثبت اصلاح موجودی"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}