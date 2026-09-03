
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpDown,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Package,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import InventoryAdjustmentDialog from "@/components/inventory/InventoryAdjustmentDialog";
import InventoryWasteDialog from "@/components/inventory/InventoryWasteDialog";
import PersianDatePicker from "@/components/ui/PersianDatePicker";

import { getIngredients } from "@/lib/api/ingredients";
import { getInventoryTransactions } from "@/lib/api/inventory";

import type { Ingredient } from "@/types/ingredients";
import type {
  InventoryTransaction,
  InventoryTransactionType,
} from "@/types/inventory";

const TRANSACTION_TYPES: {
  value: InventoryTransactionType;
  label: string;
}[] = [
  {
    value: "purchase",
    label: "خرید",
  },
  {
    value: "order_usage",
    label: "مصرف سفارش",
  },
  {
    value: "waste",
    label: "دورریز",
  },
  {
    value: "adjustment",
    label: "اصلاح موجودی",
  },
  {
    value: "reversal",
    label: "معکوس",
  },
];

function formatNumber(
  value: number,
  maximumFractionDigits = 3,
) {
  return Number(value).toLocaleString("fa-IR", {
    maximumFractionDigits,
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fa-IR");
}

export default function InventoryPage() {
  const [transactions, setTransactions] =
    useState<InventoryTransaction[]>([]);

  const [ingredients, setIngredients] =
    useState<Ingredient[]>([]);

  const [search, setSearch] = useState("");
  const [selectedIngredient, setSelectedIngredient] =
    useState("");

  const [transactionType, setTransactionType] =
    useState<InventoryTransactionType | "">("");

  const [dateAfter, setDateAfter] = useState("");
  const [dateBefore, setDateBefore] = useState("");

  const [ordering, setOrdering] =
    useState("-created_at");

  const [page, setPage] = useState(1);

  const [totalCount, setTotalCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [ingredientsLoading, setIngredientsLoading] =
    useState(true);

  const [error, setError] = useState<string | null>(null);

  const [adjustmentOpen, setAdjustmentOpen] =
    useState(false);

  const [wasteOpen, setWasteOpen] =
    useState(false);

  const [reloadToken, setReloadToken] = useState(0);

  const pageSize = 20;

  // Load ingredients for filter and inventory operations
  useEffect(() => {
    async function loadIngredients() {
      try {
        setIngredientsLoading(true);

        const response = await getIngredients({
          page: 1,
          pageSize: 100,
          ordering: "name",
        });

        setIngredients(response.data.results);
      } catch (error) {
        console.error(
          "Failed to load ingredients:",
          error,
        );
      } finally {
        setIngredientsLoading(false);
      }
    }

    loadIngredients();
  }, [reloadToken]);

  // Load transactions
  useEffect(() => {
    const timer = setTimeout(() => {
      async function loadTransactions() {
        try {
          setLoading(true);
          setError(null);

          const response =
            await getInventoryTransactions({
              page,
              pageSize,

              ingredient:
                selectedIngredient
                  ? Number(selectedIngredient)
                  : undefined,

              transaction_type:
                transactionType || undefined,

              search:
                search.trim() || undefined,

              created_at_after: dateAfter
                ? `${dateAfter.slice(0, 10)}T00:00:00`
                : undefined,

              created_at_before: dateBefore
                ? `${dateBefore.slice(0, 10)}T23:59:59.999999`
                : undefined,

              ordering,
            });

          setTransactions(response.data.results);
          setTotalCount(response.data.count);
          setNext(response.data.next);
          setPrevious(response.data.previous);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "خطا در دریافت گردش موجودی.",
          );
        } finally {
          setLoading(false);
        }
      }

      loadTransactions();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    page,
    search,
    selectedIngredient,
    transactionType,
    dateAfter,
    dateBefore,
    ordering,
    reloadToken,
  ]);

  function handleFilterChange(
    callback: () => void,
  ) {
    callback();
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setSelectedIngredient("");
    setTransactionType("");
    setDateAfter("");
    setDateBefore("");
    setOrdering("-created_at");
    setPage(1);
  }

  const hasFilters =
    search.trim() ||
    selectedIngredient ||
    transactionType ||
    dateAfter ||
    dateBefore;

  function toggleOrdering() {
    setPage(1);

    setOrdering((current) =>
      current === "-created_at"
        ? "created_at"
        : "-created_at",
    );
  }

  function handleInventoryOperationSuccess() {
    setReloadToken((current) => current + 1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            گردش موجودی
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            مشاهده و بررسی تمام تراکنش‌های انبار
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAdjustmentOpen(true)}
            className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            اصلاح موجودی
          </button>

          <button
            type="button"
            onClick={() => setWasteOpen(true)}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            ثبت دورریز
          </button>

          <div className="mr-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="size-4" />

            <span>
              {formatNumber(totalCount, 0)} تراکنش
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-background">
        <div className="flex items-center justify-between border-b p-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />

            <h2 className="font-semibold">
              فیلترها
            </h2>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3.5" />
              حذف فیلترها
            </button>
          )}
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                handleFilterChange(() =>
                  setSearch(event.target.value),
                )
              }
              placeholder="جستجوی ماده اولیه یا توضیحات..."
              className="h-10 w-full rounded-lg border bg-background pr-9 pl-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
            />
          </div>

          {/* Ingredient */}
          <select
            value={selectedIngredient}
            onChange={(event) =>
              handleFilterChange(() =>
                setSelectedIngredient(
                  event.target.value,
                ),
              )
            }
            disabled={ingredientsLoading}
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/30"
          >
            <option value="">
              همه مواد اولیه
            </option>

            {ingredients.map((ingredient) => (
              <option
                key={ingredient.id}
                value={ingredient.id}
              >
                {ingredient.name}
              </option>
            ))}
          </select>

          {/* Transaction Type */}
          <select
            value={transactionType}
            onChange={(event) =>
              handleFilterChange(() =>
                setTransactionType(
                  event.target.value as
                    | InventoryTransactionType
                    | "",
                ),
              )
            }
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/30"
          >
            <option value="">
              همه عملیات
            </option>

            {TRANSACTION_TYPES.map((type) => (
              <option
                key={type.value}
                value={type.value}
              >
                {type.label}
              </option>
            ))}
          </select>

          {/* Date From */}
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute right-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

            <PersianDatePicker
              value={dateAfter}
              onChange={(value) =>
                handleFilterChange(() =>
                  setDateAfter(value),
                )
              }
              placeholder="از تاریخ"
              disabled={loading}
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute right-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

            <PersianDatePicker
              value={dateBefore}
              onChange={(value) =>
                handleFilterChange(() =>
                  setDateBefore(value),
                )
              }
              placeholder="تا تاریخ"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-background">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-semibold">
              تراکنش‌های انبار
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {totalCount > 0
                ? `${formatNumber(totalCount, 0)} تراکنش ثبت شده است`
                : "تراکنشی برای نمایش وجود ندارد"}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleOrdering}
            className="inline-flex size-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted"
            title={
              ordering === "-created_at"
                ? "قدیمی‌ترین"
                : "جدیدترین"
            }
          >
            <ArrowUpDown className="size-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">
              در حال دریافت تراکنش‌ها...
            </p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto size-9 text-muted-foreground/40" />

            <p className="mt-3 text-sm font-medium">
              تراکنشی پیدا نشد
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              با تغییر فیلترها دوباره جستجو کنید.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20 text-right text-muted-foreground">
                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    نوع عملیات
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    ماده اولیه
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    مقدار
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    بهای واحد
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    ارزش
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    تاریخ
                  </th>

                  <th className="px-5 py-3" />
                </tr>
              </thead>

              <tbody>
                {transactions.map(
                  (transaction) => {
                    const isIncrease =
                      transaction.quantity > 0;

                    return (
                      <tr
                        key={transaction.id}
                        className="border-b transition-colors last:border-0 hover:bg-muted/20"
                      >
                        {/* Type */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                                isIncrease
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-red-500/10 text-red-600"
                              }`}
                            >
                              {isIncrease ? (
                                <ArrowDownLeft className="size-4" />
                              ) : (
                                <ArrowUpRight className="size-4" />
                              )}
                            </div>

                            <span className="whitespace-nowrap font-medium">
                              {
                                transaction.transaction_type_display
                              }
                            </span>
                          </div>
                        </td>

                        {/* Ingredient */}
                        <td className="px-5 py-4">
                          <Link
                            href={`/ingredients/${transaction.ingredient}`}
                            className="font-medium transition-colors hover:underline"
                          >
                            {
                              transaction.ingredient_name
                            }
                          </Link>
                        </td>

                        {/* Quantity */}
                        <td
                          className={`whitespace-nowrap px-5 py-4 font-medium ${
                            isIncrease
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {isIncrease ? "+" : ""}

                          {formatNumber(
                            transaction.quantity,
                          )}
                        </td>

                        {/* Unit Cost */}
                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                          {formatNumber(
                            transaction.unit_cost,
                            6,
                          )}

                          <span className="mr-1 text-xs">
                            تومان
                          </span>
                        </td>

                        {/* Total Cost */}
                        <td className="whitespace-nowrap px-5 py-4 font-medium">
                          {formatNumber(
                            transaction.total_cost,
                            2,
                          )}

                          <span className="mr-1 text-xs font-normal text-muted-foreground">
                            تومان
                          </span>
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                          {formatDate(
                            transaction.created_at,
                          )}
                        </td>

                        {/* Details */}
                        <td className="px-5 py-4">
                          <Link
                            href={`/inventory/${transaction.id}`}
                            className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                            title="جزئیات"
                          >
                            <ArrowLeft className="size-4 text-muted-foreground" />
                          </Link>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading &&
          !error &&
          transactions.length > 0 && (
            <div className="flex items-center justify-between border-t px-5 py-4">
              <p className="text-xs text-muted-foreground">
                صفحه {formatNumber(page, 0)}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!previous}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1),
                    )
                  }
                  className="flex size-8 items-center justify-center rounded-lg border transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight className="size-4" />
                </button>

                <button
                  type="button"
                  disabled={!next}
                  onClick={() =>
                    setPage((current) =>
                      current + 1,
                    )
                  }
                  className="flex size-8 items-center justify-center rounded-lg border transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Inventory Adjustment Dialog */}
      <InventoryAdjustmentDialog
        open={adjustmentOpen}
        ingredients={ingredients}
        onClose={() => setAdjustmentOpen(false)}
        onSuccess={handleInventoryOperationSuccess}
      />

      {/* Inventory Waste Dialog */}
      <InventoryWasteDialog
        open={wasteOpen}
        ingredients={ingredients}
        onClose={() => setWasteOpen(false)}
        onSuccess={handleInventoryOperationSuccess}
      />
    </div>
  );
}

