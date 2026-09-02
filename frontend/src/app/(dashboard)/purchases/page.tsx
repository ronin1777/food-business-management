"use client";

import Link from "next/link";
import {
  ArrowDownUp,
  ArrowLeft,
  CalendarDays,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { getPurchases } from "@/lib/api/purchases";
import { getSuppliers } from "@/lib/api/suppliers";

import type { Purchase } from "@/types/purchases";
import type { Supplier } from "@/types/suppliers";

const PAGE_SIZE = 20;

function formatNumber(value: number) {
  return new Intl.NumberFormat(
    "fa-IR",
  ).format(value);
}

function formatDateTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

function toIsoDateTime(
  value: string,
) {
  if (!value) {
    return undefined;
  }

  return new Date(
    value,
  ).toISOString();
}

export default function PurchasesPage() {
  const [purchases, setPurchases] =
    useState<Purchase[]>([]);

  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [search, setSearch] =
    useState("");

  const [supplier, setSupplier] =
    useState("");

  const [purchasedAtAfter, setPurchasedAtAfter] =
    useState("");

  const [purchasedAtBefore, setPurchasedAtBefore] =
    useState("");

  const [ordering, setOrdering] =
    useState("-purchased_at");

  const [page, setPage] =
    useState(1);

  const [totalCount, setTotalCount] =
    useState(0);

  const [next, setNext] =
    useState<string | null>(null);

  const [previous, setPrevious] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [suppliersLoading, setSuppliersLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const activeFiltersCount =
    useMemo(() => {
      return [
        supplier,
        purchasedAtAfter,
        purchasedAtBefore,
      ].filter(Boolean).length;
    }, [
      supplier,
      purchasedAtAfter,
      purchasedAtBefore,
    ]);

  /*
   * Load suppliers for filter
   */
  useEffect(() => {
    let cancelled = false;

    async function loadSuppliers() {
      try {
        setSuppliersLoading(true);

        const response =
          await getSuppliers({
            page: 1,
            pageSize: 100,
            ordering: "name",
          });

        if (cancelled) {
          return;
        }

        setSuppliers(
          response.data.results,
        );
      } catch (error) {
        console.error(
          "Suppliers filter error:",
          error,
        );
      } finally {
        if (!cancelled) {
          setSuppliersLoading(false);
        }
      }
    }

    loadSuppliers();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Load purchases
   */
  useEffect(() => {
    let cancelled = false;

    async function loadPurchases() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getPurchases({
            page,
            pageSize: PAGE_SIZE,
            search:
              search.trim() || undefined,
            supplier: supplier
              ? Number(supplier)
              : undefined,
            purchasedAtAfter:
              toIsoDateTime(
                purchasedAtAfter,
              ),
            purchasedAtBefore:
              toIsoDateTime(
                purchasedAtBefore,
              ),
            ordering,
          });

        if (cancelled) {
          return;
        }

        setPurchases(
          response.data.results,
        );

        setTotalCount(
          response.data.count,
        );

        setNext(response.data.next);
        setPrevious(
          response.data.previous,
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Purchases error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "خطایی در دریافت خریدها رخ داد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timeout =
      window.setTimeout(
        loadPurchases,
        search ? 300 : 0,
      );

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    page,
    search,
    supplier,
    purchasedAtAfter,
    purchasedAtBefore,
    ordering,
  ]);

  const pageCount = Math.max(
    1,
    Math.ceil(
      totalCount / PAGE_SIZE,
    ),
  );

  const hasNext = Boolean(next);

  const hasPrevious =
    Boolean(previous);

  function toggleOrdering() {
    setOrdering((current) =>
      current === "-purchased_at"
        ? "purchased_at"
        : "-purchased_at",
    );

    setPage(1);
  }

  function clearFilters() {
    setSupplier("");
    setPurchasedAtAfter("");
    setPurchasedAtBefore("");
    setPage(1);
  }

  function goToPrevious() {
    if (!hasPrevious) {
      return;
    }

    setPage((current) =>
      Math.max(
        1,
        current - 1,
      ),
    );
  }

  function goToNext() {
    if (!hasNext) {
      return;
    }

    setPage(
      (current) => current + 1,
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            مدیریت خرید
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            خریدها
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            مشاهده و مدیریت خرید مواد اولیه
          </p>
        </div>

        <Link
          href="/purchases/new"
          className="
            inline-flex h-10
            items-center justify-center
            gap-2
            rounded-lg
            bg-primary
            px-3.5
            text-sm font-medium
            text-primary-foreground
            shadow-sm
            transition-opacity
            hover:opacity-90
          "
        >
          <Plus className="size-4" />
          خرید جدید
        </Link>
      </section>

      {/* Main Card */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="space-y-4 border-b border-border px-5 py-4">
          {/* Search + Sort */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value,
                  );
                  setPage(1);
                }}
                placeholder="جستجوی تأمین‌کننده یا توضیح..."
                className="
                  h-10 w-full
                  rounded-lg
                  border border-input
                  bg-background
                  pr-9 pl-3
                  text-sm
                  outline-none
                  placeholder:text-muted-foreground
                  focus:border-ring
                  focus:ring-2
                  focus:ring-ring/20
                "
              />
            </div>

            <button
              type="button"
              onClick={toggleOrdering}
              className="
                inline-flex h-10
                items-center justify-center
                gap-2
                rounded-lg
                border border-input
                bg-background
                px-3
                text-sm font-medium
                transition-colors
                hover:bg-accent
              "
            >
              <ArrowDownUp className="size-4" />

              <span>
                {ordering ===
                "-purchased_at"
                  ? "جدیدترین"
                  : "قدیمی‌ترین"}
              </span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            {/* Supplier */}
            <div className="min-w-0 flex-1">
              <label
                htmlFor="purchase-supplier"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                تأمین‌کننده
              </label>

              <select
                id="purchase-supplier"
                value={supplier}
                onChange={(event) => {
                  setSupplier(
                    event.target.value,
                  );
                  setPage(1);
                }}
                disabled={
                  suppliersLoading
                }
                className="
                  h-10 w-full
                  rounded-lg
                  border border-input
                  bg-background
                  px-3
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
                  همه تأمین‌کنندگان
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

            {/* From */}
            <div className="min-w-0 flex-1">
              <label
                htmlFor="purchase-from"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                از تاریخ
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="purchase-from"
                  type="datetime-local"
                  value={
                    purchasedAtAfter
                  }
                  onChange={(event) => {
                    setPurchasedAtAfter(
                      event.target.value,
                    );
                    setPage(1);
                  }}
                  className="
                    h-10 w-full
                    rounded-lg
                    border border-input
                    bg-background
                    pr-9
                    pl-3
                    text-sm
                    outline-none
                    focus:border-ring
                    focus:ring-2
                    focus:ring-ring/20
                  "
                />
              </div>
            </div>

            {/* To */}
            <div className="min-w-0 flex-1">
              <label
                htmlFor="purchase-to"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                تا تاریخ
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="purchase-to"
                  type="datetime-local"
                  value={
                    purchasedAtBefore
                  }
                  onChange={(event) => {
                    setPurchasedAtBefore(
                      event.target.value,
                    );
                    setPage(1);
                  }}
                  className="
                    h-10 w-full
                    rounded-lg
                    border border-input
                    bg-background
                    pr-9
                    pl-3
                    text-sm
                    outline-none
                    focus:border-ring
                    focus:ring-2
                    focus:ring-ring/20
                  "
                />
              </div>
            </div>

            {/* Clear */}
            {activeFiltersCount >
              0 && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="
                  inline-flex h-10
                  shrink-0
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  border border-border
                  bg-background
                  px-3
                  text-xs font-medium
                  text-muted-foreground
                  transition-colors
                  hover:bg-accent
                  hover:text-foreground
                "
              >
                <X className="size-3.5" />
                پاک کردن فیلترها
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="divide-y divide-border/70">
            {Array.from({
              length: 7,
            }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="size-10 shrink-0 animate-pulse rounded-lg bg-muted" />

                <div className="min-w-0 flex-1">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />

                  <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
                </div>

                <div className="hidden h-4 w-32 animate-pulse rounded bg-muted md:block" />

                <div className="hidden h-4 w-28 animate-pulse rounded bg-muted lg:block" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] items-center justify-center px-6">
            <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
              <p className="text-sm font-medium text-destructive">
                خطا در دریافت خریدها
              </p>

              <p className="mt-2 text-sm leading-6 text-destructive/80">
                {error}
              </p>
            </div>
          </div>
        ) : purchases.length ===
          0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-5 text-muted-foreground" />
            </div>

            <p className="mt-4 text-sm font-medium">
              خریدی پیدا نشد
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              فیلترها را تغییر دهید یا اولین خرید را ثبت کنید.
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      خرید
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      تأمین‌کننده
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      تاریخ خرید
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      توضیح
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      عملیات
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {purchases.map(
                    (purchase) => (
                      <tr
                        key={
                          purchase.id
                        }
                        className="
                          border-b border-border/70
                          last:border-b-0
                          transition-colors
                          hover:bg-muted/20
                        "
                      >
                        {/* ID */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <ShoppingBag className="size-4 text-muted-foreground" />
                            </div>

                            <div>
                              <p className="text-sm font-medium">
                                خرید #
                                {formatNumber(
                                  purchase.id,
                                )}
                              </p>

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                ثبت شده
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Supplier */}
                        <td className="px-5 py-4">
                          {purchase.supplier ? (
                            <Link
                              href={`/suppliers/${purchase.supplier}`}
                              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                            >
                              {
                                purchase.supplier_name
                              }
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              بدون تأمین‌کننده
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDateTime(
                              purchase.purchased_at,
                            )}
                          </span>
                        </td>

                        {/* Note */}
                        <td className="max-w-[300px] px-5 py-4">
                          <span className="block truncate text-sm text-muted-foreground">
                            {purchase.note ||
                              "—"}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-left">
                          <Link
                            href={`/purchases/${purchase.id}`}
                            className="
                              inline-flex
                              items-center gap-1.5
                              rounded-md
                              px-2.5 py-1.5
                              text-xs font-medium
                              text-muted-foreground
                              transition-colors
                              hover:bg-accent
                              hover:text-foreground
                            "
                          >
                            مشاهده
                            <ArrowLeft className="size-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                مجموع{" "}
                <span className="font-medium text-foreground">
                  {formatNumber(
                    totalCount,
                  )}
                </span>{" "}
                خرید
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!hasPrevious}
                  onClick={
                    goToPrevious
                  }
                  className="
                    rounded-lg
                    border border-border
                    px-3 py-2
                    text-xs font-medium
                    transition-colors
                    hover:bg-accent
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  قبلی
                </button>

                <span className="min-w-20 text-center text-xs text-muted-foreground">
                  صفحه{" "}
                  <span className="font-medium text-foreground">
                    {formatNumber(
                      page,
                    )}
                  </span>{" "}
                  از{" "}
                  <span className="font-medium text-foreground">
                    {formatNumber(
                      pageCount,
                    )}
                  </span>
                </span>

                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={goToNext}
                  className="
                    rounded-lg
                    border border-border
                    px-3 py-2
                    text-xs font-medium
                    transition-colors
                    hover:bg-accent
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  بعدی
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}