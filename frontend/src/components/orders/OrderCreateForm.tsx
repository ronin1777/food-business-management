"use client";

import {
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import PersianDatePicker from "@/components/ui/PersianDatePicker";

import { ApiError } from "@/lib/api/client";
import { getCustomers } from "@/lib/api/customers";
import { createOrder } from "@/lib/api/orders";
import { getProducts } from "@/lib/api/products";

import type { Customer } from "@/types/customers";
import type { Product } from "@/types/products";

type OrderItemForm = {
  id: string;
  product: Product | null;
  quantity: number;
};

type OrderCreateFormProps = {
  onSuccess?: (orderId: number) => void;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

export function OrderCreateForm({
  onSuccess,
}: OrderCreateFormProps) {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [productSearch, setProductSearch] =
    useState("");

  const [customerOpen, setCustomerOpen] =
    useState(false);

  const [productOpen, setProductOpen] =
    useState<string | null>(null);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [orderedAt, setOrderedAt] =
    useState("");

  const [items, setItems] =
    useState<OrderItemForm[]>([]);

  const [note, setNote] =
    useState("");

  const [loadingCustomers, setLoadingCustomers] =
    useState(false);

  const [loadingProducts, setLoadingProducts] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [fieldErrors, setFieldErrors] =
    useState<Record<string, string>>({});

  /*
   * ----------------------------------------------------------
   * Initial Client State
   * ----------------------------------------------------------
   */

  useEffect(() => {
    setOrderedAt(
      new Date().toISOString(),
    );

    setItems([
      {
        id: crypto.randomUUID(),
        product: null,
        quantity: 1,
      },
    ]);
  }, []);

  /*
   * ----------------------------------------------------------
   * Customers
   * ----------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      try {
        setLoadingCustomers(true);

        const response =
          await getCustomers({
            page: 1,
            pageSize: 20,
            search:
              customerSearch.trim() ||
              undefined,
            ordering: "name",
          });

        if (cancelled) {
          return;
        }

        setCustomers(
          response.data.results.filter(
            (customer) =>
              customer.is_active,
          ),
        );
      } catch (error) {
        console.error(
          "Customers error:",
          error,
        );
      } finally {
        if (!cancelled) {
          setLoadingCustomers(false);
        }
      }
    }

    const timeout = window.setTimeout(
      loadCustomers,
      customerSearch ? 300 : 0,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [customerSearch]);

  /*
   * ----------------------------------------------------------
   * Products
   * ----------------------------------------------------------
   */

  useEffect(() => {
    if (!orderedAt) {
      return;
    }

    let cancelled = false;

    async function loadProducts() {
      try {
        setLoadingProducts(true);

        const response =
          await getProducts({
            page: 1,
            pageSize: 50,
            search:
              productSearch.trim() ||
              undefined,
            ordering: "name",
            orderedAt:
              new Date(
                orderedAt,
              ).toISOString(),
          });

        if (cancelled) {
          return;
        }

        const activeProducts =
          response.data.results.filter(
            (product) =>
              product.is_active,
          );

        setProducts(activeProducts);

        /*
         * ----------------------------------------------------
         * Validate already selected products
         * ----------------------------------------------------
         *
         * اگر تاریخ سفارش تغییر کرده باشد، ممکن است
         * Recipe محصولی که قبلاً انتخاب شده دیگر معتبر نباشد.
         *
         * در این حالت انتخاب محصول را پاک می‌کنیم.
         */

        const validProductIds =
          new Set(
            activeProducts
              .filter(
                (product) =>
                  product.has_valid_recipe !==
                  false,
              )
              .map(
                (product) =>
                  product.id,
              ),
          );

        setItems((current) =>
          current.map((item) => {
            if (
              !item.product
            ) {
              return item;
            }

            if (
              !validProductIds.has(
                item.product.id,
              )
            ) {
              return {
                ...item,
                product: null,
              };
            }

            return item;
          }),
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Products error:",
          error,
        );
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    }

    const timeout = window.setTimeout(
      loadProducts,
      productSearch ? 300 : 0,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [productSearch, orderedAt]);

  /*
   * ----------------------------------------------------------
   * Preview
   * ----------------------------------------------------------
   */

  const estimatedTotal = useMemo(() => {
    return items.reduce(
      (total, item) => {
        if (!item.product) {
          return total;
        }

        return (
          total +
          Number(
            item.product.selling_price,
          ) *
            item.quantity
        );
      },
      0,
    );
  }, [items]);

  /*
   * ----------------------------------------------------------
   * Items
   * ----------------------------------------------------------
   */

  function addItem() {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        product: null,
        quantity: 1,
      },
    ]);
  }

  function removeItem(
    itemId: string,
  ) {
    setItems((current) =>
      current.filter(
        (item) => item.id !== itemId,
      ),
    );
  }

  function updateQuantity(
    itemId: string,
    quantity: number,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: Math.max(
                1,
                quantity,
              ),
            }
          : item,
      ),
    );
  }

  function selectProduct(
    itemId: string,
    product: Product,
  ) {
    if (
      product.has_valid_recipe === false
    ) {
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              product,
            }
          : item,
      ),
    );

    setProductOpen(null);
    setProductSearch("");
  }

  /*
   * ----------------------------------------------------------
   * Submit
   * ----------------------------------------------------------
   */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setFieldErrors({});

    if (!orderedAt) {
      setError(
        "تاریخ سفارش الزامی است.",
      );
      return;
    }

    if (items.length === 0) {
      setError(
        "سفارش باید حداقل یک قلم داشته باشد.",
      );
      return;
    }

    const invalidItem = items.find(
      (item) =>
        !item.product ||
        item.quantity <= 0,
    );

    if (invalidItem) {
      setError(
        "لطفاً محصول و تعداد تمام اقلام را کامل کنید.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await createOrder({
          customer:
            selectedCustomer?.id ??
            null,

          ordered_at:
            new Date(
              orderedAt,
            ).toISOString(),

          items: items.map((item) => ({
            product:
              item.product!.id,
            quantity: item.quantity,
          })),

          note,
        });

      onSuccess?.(response.id);
    } catch (error) {
      console.error(
        "Create order error:",
        error,
      );

      /*
       * ------------------------------------------------------
       * API Error
       * ------------------------------------------------------
       */

      if (error instanceof ApiError) {
        console.error(
          "Create order status:",
          error.status,
        );

        console.error(
          "Create order errors:",
          error.errors,
        );

        setError(error.message);

        if (
          typeof error.errors ===
            "object" &&
          error.errors !== null
        ) {
          const normalizedErrors: Record<
            string,
            string
          > = {};

          const errors =
            error.errors as Record<
              string,
              unknown
            >;

          for (const [
            field,
            value,
          ] of Object.entries(errors)) {
            if (Array.isArray(value)) {
              const message = value.find(
                (item) =>
                  typeof item ===
                  "string",
              );

              if (message) {
                normalizedErrors[
                  field
                ] = message;
              }
            } else if (
              typeof value === "string"
            ) {
              normalizedErrors[field] =
                value;
            }
          }

          setFieldErrors(
            normalizedErrors,
          );
        }

        return;
      }

      /*
       * ------------------------------------------------------
       * Unknown / non-API Error
       * ------------------------------------------------------
       */

      setError(
        error instanceof Error
          ? error.message
          : "ثبت سفارش با خطا مواجه شد.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* General Information */}
      <section className="overflow-visible rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">
            اطلاعات سفارش
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            مشتری و زمان ثبت سفارش را مشخص کنید.
          </p>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          {/* Customer */}
          <div className="relative">
            <label className="text-sm font-medium">
              مشتری
            </label>

            <button
              type="button"
              onClick={() =>
                setCustomerOpen(
                  (current) => !current,
                )
              }
              className="
                mt-2 flex h-11 w-full
                items-center justify-between
                rounded-lg
                border border-input
                bg-background
                px-3
                text-right text-sm
                transition-colors
                hover:bg-accent
              "
            >
              <div className="flex min-w-0 items-center gap-2">
                <User className="size-4 shrink-0 text-muted-foreground" />

                <span
                  className={
                    selectedCustomer
                      ? "truncate text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {selectedCustomer
                    ? selectedCustomer.name
                    : "انتخاب مشتری"}
                </span>
              </div>

              <ChevronDown className="size-4 text-muted-foreground" />
            </button>

            {customerOpen && (
              <div
                className="
                  absolute inset-x-0 top-full z-30 mt-2
                  overflow-hidden
                  rounded-xl
                  border border-border
                  bg-popover
                  shadow-xl
                "
              >
                <div className="border-b border-border p-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      autoFocus
                      value={customerSearch}
                      onChange={(event) =>
                        setCustomerSearch(
                          event.target.value,
                        )
                      }
                      placeholder="جستجوی مشتری..."
                      className="
                        h-9 w-full
                        rounded-lg
                        border border-input
                        bg-background
                        pr-9 pl-3
                        text-sm
                        outline-none
                        focus:ring-2
                        focus:ring-ring/20
                      "
                    />
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto p-1.5">
                  {loadingCustomers ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : customers.length ===
                    0 ? (
                    <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                      مشتری فعالی پیدا نشد.
                    </p>
                  ) : (
                    customers.map(
                      (customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(
                              customer,
                            );
                            setCustomerOpen(
                              false,
                            );
                            setCustomerSearch(
                              "",
                            );
                          }}
                          className="
                            flex w-full
                            items-center justify-between
                            rounded-lg
                            px-3 py-2.5
                            text-right
                            transition-colors
                            hover:bg-accent
                          "
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {customer.name}
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {customer.phone}
                            </p>
                          </div>

                          {selectedCustomer?.id ===
                            customer.id && (
                            <Check className="size-4 text-success" />
                          )}
                        </button>
                      ),
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ordered At */}
          <div>
            <label
              htmlFor="ordered-at"
              className="text-sm font-medium"
            >
              تاریخ سفارش
            </label>

            <div className="mt-2">
              <PersianDatePicker
                value={orderedAt}
                onChange={setOrderedAt}
                placeholder="انتخاب تاریخ سفارش"
                disabled={submitting}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Order Items */}
      <section className="overflow-visible rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">
              اقلام سفارش
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              محصولات موردنظر و تعداد آن‌ها را اضافه کنید.
            </p>
          </div>

          <span className="text-xs text-muted-foreground">
            {formatNumber(items.length)} قلم
          </span>
        </div>

        <div className="p-5">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="
                  rounded-xl
                  border border-border/70
                  bg-background/50
                  p-4
                "
              >
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_120px_150px_auto] md:items-end">
                  {/* Product */}
                  <div className="relative">
                    <label className="text-xs font-medium text-muted-foreground">
                      محصول{" "}
                      {formatNumber(index + 1)}
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setProductOpen(
                          productOpen ===
                            item.id
                            ? null
                            : item.id,
                        )
                      }
                      className="
                        mt-2 flex h-11 w-full
                        items-center
                        justify-between
                        rounded-lg
                        border border-input
                        bg-background
                        px-3
                        text-right text-sm
                        transition-colors
                        hover:bg-accent
                      "
                    >
                      <span
                        className={
                          item.product
                            ? "truncate text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {item.product
                          ? item.product.name
                          : "انتخاب محصول"}
                      </span>

                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    </button>

                    {productOpen ===
                      item.id && (
                      <div
                        className="
                          absolute inset-x-0 top-full z-30 mt-2
                          overflow-hidden
                          rounded-xl
                          border border-border
                          bg-popover
                          shadow-xl
                        "
                      >
                        <div className="border-b border-border p-3">
                          <div className="relative">
                            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                              autoFocus
                              value={productSearch}
                              onChange={(
                                event,
                              ) =>
                                setProductSearch(
                                  event.target
                                    .value,
                                )
                              }
                              placeholder="جستجوی محصول..."
                              className="
                                h-9 w-full
                                rounded-lg
                                border border-input
                                bg-background
                                pr-9 pl-3
                                text-sm
                                outline-none
                                focus:ring-2
                                focus:ring-ring/20
                              "
                            />
                          </div>
                        </div>

                        <div className="max-h-56 overflow-y-auto p-1.5">
                          {loadingProducts ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="size-4 animate-spin text-muted-foreground" />
                            </div>
                          ) : products.length ===
                            0 ? (
                            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                              محصول فعالی پیدا نشد.
                            </p>
                          ) : (
                            products.map(
                              (product) => {
                                const hasValidRecipe =
                                  product.has_valid_recipe !==
                                    false;

                                return (
                                  <button
                                    key={
                                      product.id
                                    }
                                    type="button"
                                    disabled={
                                      !hasValidRecipe
                                    }
                                    onClick={() =>
                                      selectProduct(
                                        item.id,
                                        product,
                                      )
                                    }
                                    className={`
                                      flex w-full
                                      items-center justify-between
                                      gap-4
                                      rounded-lg
                                      px-3 py-2.5
                                      text-right
                                      transition-colors
                                      ${
                                        hasValidRecipe
                                          ? "hover:bg-accent"
                                          : "cursor-not-allowed opacity-50"
                                      }
                                    `}
                                  >
                                    <div className="min-w-0">
                                      <span className="block truncate text-sm font-medium">
                                        {
                                          product.name
                                        }
                                      </span>

                                      {!hasValidRecipe && (
                                        <span className="mt-0.5 block text-xs text-destructive">
                                          بدون دستور تهیه معتبر
                                        </span>
                                      )}
                                    </div>

                                    <span className="shrink-0 text-xs text-muted-foreground">
                                      {formatMoney(
                                        Number(
                                          product.selling_price,
                                        ),
                                      )}
                                    </span>
                                  </button>
                                );
                              },
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label
                      htmlFor={`quantity-${item.id}`}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      تعداد
                    </label>

                    <input
                      id={`quantity-${item.id}`}
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(
                          item.id,
                          Number(
                            event.target.value,
                          ),
                        )
                      }
                      className="
                        mt-2 h-11 w-full
                        rounded-lg
                        border border-input
                        bg-background
                        px-3
                        text-sm
                        outline-none
                        focus:border-ring
                        focus:ring-2
                        focus:ring-ring/20
                      "
                    />
                  </div>

                  {/* Estimated price */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      مبلغ تقریبی
                    </p>

                    <div className="mt-2 flex h-11 items-center rounded-lg bg-muted/60 px-3 text-sm font-medium">
                      {item.product
                        ? formatMoney(
                            Number(
                              item.product
                                .selling_price,
                            ) *
                              item.quantity,
                          )
                        : "—"}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    disabled={
                      items.length === 1
                    }
                    onClick={() =>
                      removeItem(item.id)
                    }
                    aria-label="حذف قلم"
                    className="
                      inline-flex size-11
                      items-center justify-center
                      rounded-lg
                      border border-border
                      text-muted-foreground
                      transition-colors
                      hover:border-destructive/20
                      hover:bg-destructive/5
                      hover:text-destructive
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="
              mt-4 inline-flex
              h-10 items-center gap-2
              rounded-lg
              border border-dashed border-border
              px-3.5
              text-sm font-medium
              text-muted-foreground
              transition-colors
              hover:bg-accent
              hover:text-foreground
            "
          >
            <Plus className="size-4" />
            افزودن محصول
          </button>
        </div>
      </section>

      {/* Note + Summary */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <label
            htmlFor="order-note"
            className="text-sm font-medium"
          >
            یادداشت
            <span className="mr-1 text-xs font-normal text-muted-foreground">
              (اختیاری)
            </span>
          </label>

          <textarea
            id="order-note"
            rows={5}
            value={note}
            onChange={(event) =>
              setNote(event.target.value)
            }
            placeholder="یادداشت مربوط به این سفارش..."
            className="
              mt-2 w-full
              resize-none
              rounded-lg
              border border-input
              bg-background
              px-3 py-2.5
              text-sm
              leading-6
              outline-none
              placeholder:text-muted-foreground
              focus:border-ring
              focus:ring-2
              focus:ring-ring/20
            "
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground">
            مبلغ تقریبی سفارش
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {formatMoney(estimatedTotal)}
          </p>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            مبلغ نهایی هنگام ثبت سفارش توسط سیستم محاسبه می‌شود.
          </p>
        </div>
      </section>

      {/* Error */}
      {(error ||
        Object.keys(fieldErrors).length >
          0) && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          {Object.entries(fieldErrors).map(
            ([field, message]) => (
              <p
                key={field}
                className="mt-1 text-xs text-destructive"
              >
                {message}
              </p>
            ),
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() =>
            window.history.back()
          }
          disabled={submitting}
          className="
            inline-flex h-11
            items-center justify-center gap-2
            rounded-lg
            border border-border
            bg-card
            px-4
            text-sm font-medium
            transition-colors
            hover:bg-accent
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <X className="size-4" />
          انصراف
        </button>

        <button
          type="submit"
          disabled={
            submitting ||
            !orderedAt ||
            items.length === 0
          }
          className="
            inline-flex h-11
            items-center justify-center gap-2
            rounded-lg
            bg-primary
            px-5
            text-sm font-medium
            text-primary-foreground
            shadow-sm
            transition-opacity
            hover:opacity-90
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              در حال ثبت...
            </>
          ) : (
            <>
              <Check className="size-4" />
              ثبت سفارش
            </>
          )}
        </button>
      </div>
    </form>
  );
}