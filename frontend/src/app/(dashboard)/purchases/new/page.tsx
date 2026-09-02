"use client";

import Link from "next/link";
import {
  ArrowRight,
  Plus,
  Trash2,
  ShoppingCart,
  CircleAlert,
  Save,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createPurchase,
} from "@/lib/api/purchases";

import {
  getSuppliers,
} from "@/lib/api/suppliers";

import {
  getIngredients,
} from "@/lib/api/ingredients";

import type {
  Supplier,
} from "@/types/suppliers";

import type {
  Ingredient,
} from "@/types/ingredients";

type PurchaseItemForm = {
  id: number;
  ingredient: string;
  quantity: string;
  unit: string;
  unit_price: string;
  discount: string;
};

function createEmptyItem(
  id: number,
): PurchaseItemForm {
  return {
    id,
    ingredient: "",
    quantity: "",
    unit: "",
    unit_price: "",
    discount: "0",
  };
}

function formatMoney(
  value: number,
) {
  return `${new Intl.NumberFormat(
    "fa-IR",
  ).format(value)} تومان`;
}

export default function NewPurchasePage() {
  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [ingredients, setIngredients] =
    useState<Ingredient[]>([]);

  const [supplier, setSupplier] =
    useState("");

  const [purchasedAt, setPurchasedAt] =
    useState(() => {
      const now = new Date();

      return new Date(
        now.getTime() -
          now.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);
    });

  const [note, setNote] =
    useState("");

  const [items, setItems] =
    useState<PurchaseItemForm[]>([
      createEmptyItem(1),
    ]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [fieldError, setFieldError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoading(true);
        setError(null);

        const [
          suppliersResponse,
          ingredientsResponse,
        ] = await Promise.all([
          getSuppliers({
            page: 1,
            pageSize: 100,
          }),
          getIngredients({
            page: 1,
            pageSize: 100,
          }),
        ]);

        setSuppliers(
          suppliersResponse.data.results,
        );

        setIngredients(
          ingredientsResponse.data.results,
        );
      } catch (error) {
        console.error(
          "Purchase options error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "دریافت اطلاعات اولیه ناموفق بود.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, []);

  const total = useMemo(() => {
    return items.reduce(
      (sum, item) => {
        const quantity =
          Number(item.quantity) || 0;

        const unitPrice =
          Number(item.unit_price) || 0;

        const discount =
          Number(item.discount) || 0;

        const lineTotal =
          quantity * unitPrice -
          discount;

        return (
          sum +
          Math.max(lineTotal, 0)
        );
      },
      0,
    );
  }, [items]);

  function updateItem(
    id: number,
    field: keyof PurchaseItemForm,
    value: string,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function handleIngredientChange(
    id: number,
    ingredientId: string,
  ) {
    const selected =
      ingredients.find(
        (item) =>
          String(item.id) ===
          ingredientId,
      );

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ingredient:
                ingredientId,
              unit:
                selected?.base_unit ?? "",
            }
          : item,
      ),
    );
  }

  function addItem() {
    const nextId =
      items.length > 0
        ? Math.max(
            ...items.map(
              (item) => item.id,
            ),
          ) + 1
        : 1;

    setItems((current) => [
      ...current,
      createEmptyItem(nextId),
    ]);
  }

  function removeItem(id: number) {
    if (items.length === 1) {
      return;
    }

    setItems((current) =>
      current.filter(
        (item) => item.id !== id,
      ),
    );
  }

  function validate() {
    if (items.length === 0) {
      return "حداقل یک قلم برای خرید وارد کنید.";
    }

    for (
      let index = 0;
      index < items.length;
      index++
    ) {
      const item = items[index];

      if (!item.ingredient) {
        return `ماده اولیه ردیف ${index + 1} انتخاب نشده است.`;
      }

      if (
        !item.quantity ||
        Number(item.quantity) <= 0
      ) {
        return `مقدار ردیف ${index + 1} باید بیشتر از صفر باشد.`;
      }

      if (!item.unit.trim()) {
        return `واحد ردیف ${index + 1} وارد نشده است.`;
      }

      if (
        item.unit_price === "" ||
        Number(item.unit_price) < 0
      ) {
        return `قیمت واحد ردیف ${index + 1} معتبر نیست.`;
      }

      if (
        item.discount !== "" &&
        Number(item.discount) < 0
      ) {
        return `تخفیف ردیف ${index + 1} معتبر نیست.`;
      }
    }

    const ingredientIds =
      items.map(
        (item) => item.ingredient,
      );

    if (
      new Set(ingredientIds).size !==
      ingredientIds.length
    ) {
      return "یک ماده اولیه نمی‌تواند در چند ردیف تکرار شود.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError =
      validate();

    if (validationError) {
      setFieldError(
        validationError,
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setFieldError(null);

      const payload = {
        supplier: supplier
          ? Number(supplier)
          : null,

        purchased_at:
          new Date(
            purchasedAt,
          ).toISOString(),

        note: note.trim(),

        items: items.map((item) => ({
          ingredient: Number(
            item.ingredient,
          ),
          quantity: Number(
            item.quantity,
          ),
          unit: item.unit.trim(),
          unit_price: Number(
            item.unit_price,
          ),
          discount:
            item.discount === ""
              ? 0
              : Number(
                  item.discount,
                ),
        })),

        additional_costs: [],
      };

      const response =
        await createPurchase(
          payload,
        );

      window.location.href = `/purchases/${response.id}`;
    } catch (error) {
      console.error(
        "Create purchase error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "ثبت خرید ناموفق بود.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-20 animate-pulse rounded bg-muted" />

        <div className="h-10 w-56 animate-pulse rounded bg-muted" />

        <div className="h-[500px] animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (error && !submitting) {
    return (
      <div className="space-y-6">
        <Link
          href="/purchases"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          خریدها
        </Link>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <div className="flex items-center gap-2 text-destructive">
            <CircleAlert className="size-5" />

            <span className="text-sm font-medium">
              خطا در دریافت اطلاعات اولیه
            </span>
          </div>

          <p className="mt-2 text-sm text-destructive/80">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <Link
          href="/purchases"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          خریدها
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
            <ShoppingCart className="size-5 text-muted-foreground" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              ثبت خرید جدید
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              ثبت خرید مواد اولیه و قیمت واقعی خرید
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Basic Info */}
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">
              اطلاعات خرید
            </h2>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="supplier"
                className="mb-2 block text-xs font-medium"
              >
                تأمین‌کننده
              </label>

              <select
                id="supplier"
                value={supplier}
                onChange={(event) =>
                  setSupplier(
                    event.target.value,
                  )
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                <option value="">
                  بدون تأمین‌کننده
                </option>

                {suppliers.map(
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
            </div>

            <div>
              <label
                htmlFor="purchasedAt"
                className="mb-2 block text-xs font-medium"
              >
                تاریخ خرید
              </label>

              <input
                id="purchasedAt"
                type="datetime-local"
                value={purchasedAt}
                onChange={(event) =>
                  setPurchasedAt(
                    event.target.value,
                  )
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="note"
                className="mb-2 block text-xs font-medium"
              >
                یادداشت
              </label>

              <textarea
                id="note"
                value={note}
                onChange={(event) =>
                  setNote(
                    event.target.value,
                  )
                }
                rows={3}
                placeholder="توضیحات مربوط به خرید..."
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
        </section>

        {/* Items */}
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">
                اقلام خرید
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                برای هر ماده، قیمت واقعی خرید را وارد کنید.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
            >
              <Plus className="size-3.5" />
              افزودن قلم
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-[270px] px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    ماده اولیه
                  </th>

                  <th className="w-[150px] px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    مقدار
                  </th>

                  <th className="w-[180px] px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    قیمت واحد
                  </th>

                  <th className="w-[160px] px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    تخفیف
                  </th>

                  <th className="w-[180px] px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    مبلغ
                  </th>

                  <th className="w-[50px]" />
                </tr>
              </thead>

              <tbody>
                {items.map(
                  (item, index) => {
                    const lineTotal =
                      Math.max(
                        (Number(
                          item.quantity,
                        ) || 0) *
                          (Number(
                            item.unit_price,
                          ) || 0) -
                          (Number(
                            item.discount,
                          ) || 0),
                        0,
                      );

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-border/70 last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <select
                            value={
                              item.ingredient
                            }
                            onChange={(
                              event,
                            ) =>
                              handleIngredientChange(
                                item.id,
                                event.target
                                  .value,
                              )
                            }
                            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                          >
                            <option value="">
                              انتخاب ماده اولیه
                            </option>

                            {ingredients.map(
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

                          <div className="mt-1 text-[11px] text-muted-foreground">
                            ردیف{" "}
                            {index + 1}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0.001"
                              step="0.001"
                              value={
                                item.quantity
                              }
                              onChange={(
                                event,
                              ) =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  event.target
                                    .value,
                                )
                              }
                              placeholder="0"
                              className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                            />

                            <input
                              type="text"
                              value={
                                item.unit
                              }
                              onChange={(
                                event,
                              ) =>
                                updateItem(
                                  item.id,
                                  "unit",
                                  event.target
                                    .value,
                                )
                              }
                              placeholder="واحد"
                              className="h-10 w-20 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                            />
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              item.unit_price
                            }
                            onChange={(
                              event,
                            ) =>
                              updateItem(
                                item.id,
                                "unit_price",
                                event.target
                                  .value,
                              )
                            }
                            placeholder="0"
                            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                          />

                          <p className="mt-1 text-[11px] text-muted-foreground">
                            تومان
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              item.discount
                            }
                            onChange={(
                              event,
                            ) =>
                              updateItem(
                                item.id,
                                "discount",
                                event.target
                                  .value,
                              )
                            }
                            placeholder="0"
                            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                          />

                          <p className="mt-1 text-[11px] text-muted-foreground">
                            تومان
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold">
                            {formatMoney(
                              lineTotal,
                            )}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.id,
                              )
                            }
                            disabled={
                              items.length ===
                              1
                            }
                            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
                            aria-label="حذف ردیف"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Error */}
        {(fieldError || error) && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-start gap-2">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />

              <p className="text-sm text-destructive">
                {fieldError ||
                  error}
              </p>
            </div>
          </div>
        )}

        {/* Summary + Actions */}
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                مبلغ کل خرید
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {formatMoney(total)}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Link
                href="/purchases"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent"
              >
                انصراف
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="size-4" />

                {submitting
                  ? "در حال ثبت..."
                  : "ثبت خرید"}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}