"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  CircleAlert,
  ReceiptText,
  Search,
  X,
} from "lucide-react";
import {
  use,
  useEffect,
  useState,
} from "react";

import {
  getSupplier,
  getSupplierTransactions,
} from "@/lib/api/suppliers";

import type {
  SupplierDetail,
  SupplierTransaction,
} from "@/types/suppliers";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatMoney(
  value: number,
) {
  return `${new Intl.NumberFormat(
    "fa-IR",
  ).format(value)} تومان`;
}

function formatNumber(
  value: number,
) {
  return new Intl.NumberFormat(
    "fa-IR",
  ).format(value);
}

function formatDate(
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

function getDirectionClass(
  direction: string,
) {
  if (direction === "debit") {
    return "bg-destructive/10 text-destructive";
  }

  if (direction === "credit") {
    return "bg-success/10 text-success";
  }

  return "bg-muted text-muted-foreground";
}

export default function SupplierTransactionsPage({
  params,
}: PageProps) {
  const { id } = use(params);

  const supplierId = Number(id);

  const [supplier, setSupplier] =
    useState<SupplierDetail | null>(
      null,
    );

  const [
    transactions,
    setTransactions,
  ] = useState<
    SupplierTransaction[]
  >([]);

  const [count, setCount] =
    useState(0);

  const [page, setPage] =
    useState(1);

  const pageSize = 20;

  const [search, setSearch] =
    useState("");

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState("");

  const [direction, setDirection] =
    useState("");

  const [ordering, setOrdering] =
    useState("-created_at");

  const [loading, setLoading] =
    useState(true);

  const [
    supplierLoading,
    setSupplierLoading,
  ] = useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    if (
      !Number.isInteger(
        supplierId,
      ) ||
      supplierId <= 0
    ) {
      setError(
        "شناسه تأمین‌کننده معتبر نیست.",
      );

      setLoading(false);
      setSupplierLoading(false);

      return;
    }

    async function loadSupplier() {
      try {
        setSupplierLoading(true);

        const response =
          await getSupplier(
            supplierId,
          );

        setSupplier(response);
      } catch (error) {
        console.error(
          "Supplier error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "دریافت اطلاعات تأمین‌کننده ناموفق بود.",
        );
      } finally {
        setSupplierLoading(false);
      }
    }

    loadSupplier();
  }, [supplierId]);

  useEffect(() => {
    if (
      !Number.isInteger(
        supplierId,
      ) ||
      supplierId <= 0
    ) {
      return;
    }

    let cancelled = false;

    async function loadTransactions() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getSupplierTransactions(
            {
              page,
              pageSize,
              search:
                appliedSearch ||
                undefined,
              supplier: supplierId,
              direction:
                direction ||
                undefined,
              ordering,
            },
          );

        if (cancelled) {
          return;
        }

        setTransactions(
          response.data.results,
        );

        setCount(
          response.data.count,
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Supplier transactions error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "دریافت تراکنش‌ها ناموفق بود.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [
    supplierId,
    page,
    pageSize,
    appliedSearch,
    direction,
    ordering,
  ]);

  function submitSearch() {
    setPage(1);
    setAppliedSearch(
      search.trim(),
    );
  }

  function clearSearch() {
    setSearch("");
    setAppliedSearch("");
    setPage(1);
  }

  function toggleOrdering(
    field: string,
  ) {
    if (
      ordering === field
    ) {
      setOrdering(`-${field}`);
    } else {
      setOrdering(field);
    }

    setPage(1);
  }

  const totalPages =
    Math.ceil(count / pageSize);

  const firstItem =
    count === 0
      ? 0
      : (page - 1) *
          pageSize +
        1;

  const lastItem =
    Math.min(
      page * pageSize,
      count,
    );

  if (
    supplierLoading &&
    !supplier
  ) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />

        <div className="h-8 w-64 animate-pulse rounded bg-muted" />

        <div className="h-[500px] animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <Link
          href={`/suppliers/${supplierId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          {supplier?.name ??
            "تأمین‌کننده"}
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
                <ReceiptText className="size-5 text-muted-foreground" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  تراکنش‌های تأمین‌کننده
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  {supplier?.name ??
                    "تأمین‌کننده"}
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/suppliers/${supplierId}`}
            className="hidden rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent sm:inline-flex"
          >
            بازگشت
          </Link>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-start gap-2">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />

            <p className="text-sm text-destructive">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  submitSearch();
                }
              }}
              placeholder="جستجو در توضیحات..."
              className="h-10 w-full rounded-lg border border-input bg-background pr-9 pl-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <select
            value={direction}
            onChange={(event) => {
              setDirection(
                event.target.value,
              );
              setPage(1);
            }}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 lg:w-44"
          >
            <option value="">
              همه تراکنش‌ها
            </option>

            <option value="debit">
              بدهکار
            </option>

            <option value="credit">
              بستانکار
            </option>
          </select>

          <button
            type="button"
            onClick={submitSearch}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Search className="size-4" />
            جستجو
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">
              تراکنش‌ها
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {count > 0
                ? `${formatNumber(count)} تراکنش`
                : "تراکنشی ثبت نشده است"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  نوع
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  جهت
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  مبلغ
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  خرید
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  توضیح
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  <button
                    type="button"
                    onClick={() =>
                      toggleOrdering(
                        "created_at",
                      )
                    }
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    تاریخ
                    {ordering ===
                    "created_at" ? (
                      <ArrowUp className="size-3.5" />
                    ) : ordering ===
                      "-created_at" ? (
                      <ArrowDown className="size-3.5" />
                    ) : (
                      <ArrowUpDown className="size-3.5" />
                    )}
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({
                  length: 6,
                }).map(
                  (_, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/70"
                    >
                      {Array.from({
                        length: 6,
                      }).map(
                        (
                          _,
                          cellIndex,
                        ) => (
                          <td
                            key={
                              cellIndex
                            }
                            className="px-5 py-5"
                          >
                            <div className="h-4 w-full animate-pulse rounded bg-muted" />
                          </td>
                        ),
                      )}
                    </tr>
                  ),
                )
              ) : transactions.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center"
                  >
                    <ReceiptText className="mx-auto size-7 text-muted-foreground" />

                    <p className="mt-3 text-sm font-medium">
                      تراکنشی پیدا نشد
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      با فیلتر دیگری دوباره جستجو کنید.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map(
                  (transaction) => (
                    <tr
                      key={
                        transaction.id
                      }
                      className="border-b border-border/70 last:border-b-0 hover:bg-muted/20"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium">
                          {
                            transaction.transaction_type_display
                          }
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          تراکنش #
                          {formatNumber(
                            transaction.id,
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getDirectionClass(
                            transaction.direction,
                          )}`}
                        >
                          {
                            transaction.direction_display
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold">
                          {formatMoney(
                            Number(
                              transaction.amount,
                            ),
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {transaction.purchase ? (
                          <Link
                            href={`/purchases/${transaction.purchase}`}
                            className="text-sm font-medium underline-offset-4 hover:underline"
                          >
                            خرید #
                            {formatNumber(
                              transaction.purchase,
                            )}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>

                      <td className="max-w-[280px] px-5 py-4">
                        <span className="block truncate text-sm text-muted-foreground">
                          {transaction.note ||
                            "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="text-sm">
                          {formatDate(
                            transaction.created_at,
                          )}
                        </span>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {count > 0 && (
          <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              نمایش{" "}
              {formatNumber(
                firstItem,
              )}{" "}
              تا{" "}
              {formatNumber(
                lastItem,
              )}{" "}
              از{" "}
              {formatNumber(count)}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage(
                    (current) =>
                      current - 1,
                  )
                }
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                قبلی
              </button>

              <span className="min-w-20 text-center text-xs text-muted-foreground">
                صفحه{" "}
                {formatNumber(page)}{" "}
                از{" "}
                {formatNumber(
                  totalPages,
                )}
              </span>

              <button
                type="button"
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1,
                  )
                }
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}