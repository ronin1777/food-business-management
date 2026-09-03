
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { ApiError } from "@/lib/api/client";
import { createInventoryWaste } from "@/lib/api/inventory";
import type { Ingredient } from "@/types/ingredients";

type InventoryWasteDialogProps = {
  open: boolean;
  ingredients: Ingredient[];
  onClose: () => void;
  onSuccess: () => void;
};

export default function InventoryWasteDialog({
  open,
  ingredients,
  onClose,
  onSuccess,
}: InventoryWasteDialogProps) {
  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
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

  useEffect(() => {
    if (!open) {
      setIngredientId("");
      setQuantity("");
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
      numericQuantity <= 0
    ) {
      setError("مقدار دورریز باید بیشتر از صفر باشد.");
      return;
    }

    setLoading(true);

    try {
      await createInventoryWaste({
        ingredient: Number(ingredientId),
        quantity: numericQuantity,
        note: note.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const errors = err.errors;

        if (
          errors &&
          typeof errors === "object" &&
          "quantity" in errors
        ) {
          const quantityErrors = (
            errors as {
              quantity?: unknown;
            }
          ).quantity;

          if (
            Array.isArray(quantityErrors) &&
            typeof quantityErrors[0] === "string"
          ) {
            setError(quantityErrors[0]);
            return;
          }
        }

        if (
          errors &&
          typeof errors === "object" &&
          "ingredient" in errors
        ) {
          const ingredientErrors = (
            errors as {
              ingredient?: unknown;
            }
          ).ingredient;

          if (
            Array.isArray(ingredientErrors) &&
            typeof ingredientErrors[0] === "string"
          ) {
            setError(ingredientErrors[0]);
            return;
          }
        }

        setError(err.message);
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "ثبت دورریز با خطا مواجه شد.",
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
        aria-labelledby="inventory-waste-title"
        className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-xl"
        dir="rtl"
      >
        <div className="border-b border-border px-6 py-5">
          <h2
            id="inventory-waste-title"
            className="text-lg font-semibold"
          >
            ثبت دورریز
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            مقدار ماده اولیه‌ای که دور ریخته شده را ثبت کنید.
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
                htmlFor="waste-ingredient"
                className="text-sm font-medium"
              >
                ماده اولیه
              </label>

              <select
                id="waste-ingredient"
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
                htmlFor="waste-quantity"
                className="text-sm font-medium"
              >
                مقدار دورریز
              </label>

              <div className="flex items-center gap-2">
                <input
                  id="waste-quantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  disabled={loading}
                  placeholder="مثلاً 2.5"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                />

                {selectedIngredient && (
                  <span className="min-w-12 text-sm text-muted-foreground">
                    {selectedIngredient.base_unit}
                  </span>
                )}
              </div>
            </div>

            {selectedIngredient && (
              <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                موجودی فعلی:{" "}
                <span className="font-medium text-foreground">
                  {selectedIngredient.current_stock.toLocaleString("fa-IR")}
                </span>{" "}
                {selectedIngredient.base_unit}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="waste-note"
                className="text-sm font-medium"
              >
                توضیحات
              </label>

              <textarea
                id="waste-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={loading}
                rows={3}
                placeholder="دلیل دورریز..."
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
              {loading ? "در حال ثبت..." : "ثبت دورریز"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

