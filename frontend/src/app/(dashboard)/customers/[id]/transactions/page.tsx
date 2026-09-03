"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowLeft,
  ReceiptText,
  Search,
  UserRound,
} from "lucide-react";
import {
  use,
  useEffect,
  useState,
} from "react";

import {
  getCustomer,
  getCustomerTransactions,
} from "@/lib/api/customers";

import type {
  CustomerDetail,
  CustomerTransaction,
} from "@/types/customers";

const PAGE_SIZE = 20;

type TransactionsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(
    value,
  );
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

function formatDateTime(value: string) {
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

export default function CustomerTransactionsPage({
  params,
}: TransactionsPageProps) {
  const { id } = use(params);

  const customerId = Number(id);

  const isValidCustomerId =
    Number.isInteger(customerId) &&
    customerId > 0;

  const [customer, setCustomer] =
    useState<CustomerDetail | null>(null);

  const [transactions, setTransactions] =
    useState<CustomerTransaction[]>([]);

  const [search, setSearch] =
    useState("");

  const [direction, setDirection] =
    useState("");

  const [ordering, setOrdering] =
    useState("-created_at");

  const [page, setPage] = useState(1);

  const [totalCount, setTotalCount] =
    useState(0);

  const [next, setNext] =
    useState<string | null>(null);

  const [previous, setPrevious] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!isValidCustomerId) {
      return;
    }

    let cancelled = false;

    async function loadCustomer() {
      try {
        const response =
          await getCustomer(customerId);

        if (!cancelled) {
          setCustomer(response);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "دریافت اطلاعات مشتری انجام نشد.",
        );
      }
    }

    loadCustomer();

    return () => {
      cancelled = true;
    };
  }, [
    customerId,
    isValidCustomerId,
  ]);

  useEffect(() => {
    if (!isValidCustomerId) {
      return;
    }

    let cancelled = false;

    async function loadTransactions() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getCustomerTransactions({
            customer: customerId,
            page,
            pageSize: PAGE_SIZE,
            search:
              search.trim() || undefined,
            direction:
              direction || undefined,
            ordering,
          });

        if (cancelled) {
          return;
        }

        setTransactions(
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
          "Customer transactions error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "دریافت گردش حساب انجام نشد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timeout =
      window.setTimeout(
        loadTransactions,
        search ? 300 : 0,
      );

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    customerId,
    isValidCustomerId,
    page,
    search,
    direction,
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
      current === "-created_at"
        ? "created_at"
        : "-created_at",
    );

    setPage(1);
  }

  function goToPrevious() {
    if (!hasPrevious) {
      return;
    }

    setPage((current) =>
      Math.max(1, current - 1),
    );
  }

  function goToNext() {
    if (!hasNext) {
      return;
    }

    setPage((current) => current + 1);
  }

  if (!isValidCustomerId) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-card p-6 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <ReceiptText className="size-5 text-destructive" />
          </div>

          <h1 className="mt-4 text-lg font-semibold">
            شناسه مشتری معتبر نیست
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            شناسه مشتری واردشده معتبر نیست.
          </p>

          <Link
            href="/customers"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <ArrowRight className="size-4" />
            بازگشت به مشتریان
          </Link>
        </div>
      </div>
    );
  }

  if (!customer && loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />

        <div className="h-10 w-64 animate-pulse rounded bg-muted" />

        <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <Link
          href={
            customer
              ? `/customers/${customer.id}`
              : "/customers"
          }
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          {customer?.name ?? "مشتری"}
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
            {customer ? (
              <UserRound className="size-5 text-muted-foreground" />
            ) : (
              <ReceiptText className="size-5 text-muted-foreground" />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              گردش حساب
            </h1>

            {customer && (
              <p className="mt-1 text-sm text-muted-foreground">
                {customer.name}
              </p>
            )}
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* Main Card */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="جستجو در توضیحات..."
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

          {/* Direction */}
          <select
            value={direction}
            onChange={(event) => {
              setDirection(event.target.value);
              setPage(1);
            }}
            className="
              h-10
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

          {/* Ordering */}
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
            {ordering === "-created_at" ? (
              <ArrowDownAZ className="size-4" />
            ) : (
              <ArrowUpAZ className="size-4" />
            )}

            <span>
              جدیدترین
            </span>
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="divide-y divide-border/70">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />

                <div className="h-4 w-28 animate-pulse rounded bg-muted" />

                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />

                <div className="h-4 w-16 animate-pulse rounded bg-muted" />

                <div className="ml-auto h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <ReceiptText className="size-5 text-muted-foreground" />
            </div>

            <p className="mt-4 text-sm font-medium">
              تراکنشی پیدا نشد
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              برای این مشتری با فیلترهای فعلی
              تراکنشی وجود ندارد.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      نوع تراکنش
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      مبلغ
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      جهت
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      سفارش
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      توضیح
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      تاریخ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map(
                    (transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-border/70 last:border-b-0 transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium">
                            {
                              transaction.transaction_type_display
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
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium",
                              getDirectionClass(
                                transaction.direction,
                              ),
                            ].join(" ")}
                          >
                            {
                              transaction.direction_display
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {transaction.order ? (
                            <Link
                              href={`/orders/${transaction.order}`}
                              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                            >
                              #
                              {formatNumber(
                                transaction.order,
                              )}

                              <ArrowLeft className="size-3.5" />
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

                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDateTime(
                              transaction.created_at,
                            )}
                          </span>
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
                  {formatNumber(totalCount)}
                </span>{" "}
                تراکنش
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!hasPrevious}
                  onClick={goToPrevious}
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

                <span className="min-w-24 text-center text-xs text-muted-foreground">
                  صفحه{" "}
                  <span className="font-medium text-foreground">
                    {formatNumber(page)}
                  </span>{" "}
                  از{" "}
                  <span className="font-medium text-foreground">
                    {formatNumber(pageCount)}
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