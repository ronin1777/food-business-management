
"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Users,
  Wallet,
} from "lucide-react";

import { getCustomerReport } from "@/lib/api/reports";
import type {
  CustomerReport,
  TopCustomerByBalance,
  TopCustomerBySales,
} from "@/types/reports";

import ReportKpiCard from "../ReportKpiCard";
import ReportSection from "../ReportSection";

function formatAmount(value: string): string {
  return `${Number(value).toLocaleString("fa-IR")} تومان`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("fa-IR");
}

function CustomerRank({
  index,
}: {
  index: number;
}) {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
      {formatNumber(index + 1)}
    </div>
  );
}

function SalesCustomerRow({
  customer,
  index,
}: {
  customer: TopCustomerBySales;
  index: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <CustomerRank index={index} />

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {customer.customer_name}
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            مشتری #{formatNumber(customer.customer_id)}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-left">
        <p className="text-sm font-semibold">
          {formatAmount(customer.total_sales)}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          فروش
        </p>
      </div>
    </div>
  );
}

function BalanceCustomerRow({
  customer,
  index,
}: {
  customer: TopCustomerByBalance;
  index: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <CustomerRank index={index} />

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {customer.customer_name}
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            مشتری #{formatNumber(customer.customer_id)}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-left">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          {formatAmount(customer.balance)}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          مانده طلب
        </p>
      </div>
    </div>
  );
}

export default function CustomerReport() {
  const [report, setReport] =
    useState<CustomerReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [showReceivablesOnly, setShowReceivablesOnly] =
    useState(false);

  useState(() => {
    let mounted = true;

    async function loadReport() {
      try {
        setLoading(true);
        setError(null);

        const response = await getCustomerReport();

        if (!mounted) return;

        setReport(response.data);
      } catch {
        if (!mounted) return;

        setError(
          "دریافت گزارش مشتریان با خطا مواجه شد.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      mounted = false;
    };
  });

  const filteredSalesCustomers = useMemo(() => {
    if (!report) return [];

    const query = search.trim().toLowerCase();

    return report.top_customers_by_sales.filter(
      (customer) => {
        if (
          query &&
          !customer.customer_name
            .toLowerCase()
            .includes(query)
        ) {
          return false;
        }

        return true;
      },
    );
  }, [report, search]);

  const filteredBalanceCustomers = useMemo(() => {
    if (!report) return [];

    const query = search.trim().toLowerCase();

    return report.top_customers_by_balance.filter(
      (customer) => {
        if (
          query &&
          !customer.customer_name
            .toLowerCase()
            .includes(query)
        ) {
          return false;
        }

        return true;
      },
    );
  }, [report, search]);

  const visibleBalanceCustomers =
    showReceivablesOnly
      ? filteredBalanceCustomers
      : filteredBalanceCustomers;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[145px] animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-[360px] animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-border bg-card">
        <div className="text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="size-5 text-muted-foreground" />
          </div>

          <p className="mt-4 text-sm font-medium">
            {error ?? "گزارش مشتریان در دسترس نیست."}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            لطفاً دوباره تلاش کنید.
          </p>
        </div>
      </div>
    );
  }

  const {
    total_customers,
    active_customers,
    customers_with_receivable,
    total_receivables,
  } = report.summary;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/*                                   KPI                              */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportKpiCard
          title="کل مشتریان"
          value={formatNumber(total_customers)}
          tone="neutral"
        />

        <ReportKpiCard
          title="مشتریان فعال"
          value={formatNumber(active_customers)}
          tone="positive"
        />

        <ReportKpiCard
          title="مشتریان دارای طلب"
          value={formatNumber(
            customers_with_receivable,
          )}
          tone={
            customers_with_receivable > 0
              ? "negative"
              : "neutral"
          }
        />

        <ReportKpiCard
          title="مجموع مطالبات"
          value={formatAmount(total_receivables)}
          tone={
            Number(total_receivables) > 0
              ? "negative"
              : "neutral"
          }
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*                            Receivables Alert                       */}
      {/* ------------------------------------------------------------------ */}

      {customers_with_receivable > 0 && (
        <div
          className="
            rounded-xl
            border
            border-border
            bg-card
            p-5
            shadow-sm
          "
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Wallet className="size-5 text-red-600 dark:text-red-400" />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  وضعیت مطالبات نیاز به بررسی دارد
                </h2>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  از {formatNumber(customers_with_receivable)}{" "}
                  مشتری طلبکار، مجموعاً{" "}
                  <span className="font-medium text-foreground">
                    {formatAmount(total_receivables)}
                  </span>{" "}
                  مطالبات ثبت شده است.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowReceivablesOnly(true);
                setSearch("");

                requestAnimationFrame(() => {
                  document
                    .getElementById(
                      "customer-receivables",
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                });
              }}
              className="
                inline-flex
                h-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-border
                bg-background
                px-3
                text-xs
                font-medium
                transition-colors
                hover:bg-muted
              "
            >
              مشاهده مطالبات
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*                              Search                                */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="جستجوی نام مشتری..."
            className="
              h-10
              w-full
              rounded-lg
              border
              border-border
              bg-background
              pr-9
              pl-3
              text-sm
              outline-none
              transition-colors
              placeholder:text-muted-foreground
              focus:border-ring
              focus:ring-2
              focus:ring-ring/20
            "
          />
        </div>

        <button
          type="button"
          onClick={() =>
            setShowReceivablesOnly(
              (current) => !current,
            )
          }
          className={[
            "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors",
            showReceivablesOnly
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background hover:bg-muted",
          ].join(" ")}
        >
          <Wallet className="size-4" />
          فقط مشتریان دارای طلب
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*                          Main Customer Lists                       */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportSection
          title="مشتریان برتر از نظر فروش"
          description="مشتریانی که بیشترین مبلغ خرید را ثبت کرده‌اند"
          action={
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          }
        >
          {filteredSalesCustomers.length > 0 ? (
            <div className="-mx-5 -my-5">
              {filteredSalesCustomers.map(
                (customer, index) => (
                  <SalesCustomerRow
                    key={customer.customer_id}
                    customer={customer}
                    index={index}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <Users className="size-5 text-muted-foreground" />
              </div>

              <p className="mt-3 text-sm font-medium">
                مشتری‌ای پیدا نشد
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                عبارت جستجو را تغییر دهید.
              </p>
            </div>
          )}
        </ReportSection>

        <div
          id="customer-receivables"
          className="scroll-mt-6"
        >
          <ReportSection
            title="مشتریان دارای بیشترین طلب"
            description="مشتریانی که بیشترین مانده مطالبات را دارند"
            action={
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <ArrowDownRight className="size-4 text-red-600 dark:text-red-400" />
              </div>
            }
          >
            {visibleBalanceCustomers.length > 0 ? (
              <div className="-mx-5 -my-5">
                {visibleBalanceCustomers.map(
                  (customer, index) => (
                    <BalanceCustomerRow
                      key={customer.customer_id}
                      customer={customer}
                      index={index}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <Wallet className="size-5 text-muted-foreground" />
                </div>

                <p className="mt-3 text-sm font-medium">
                  مشتری دارای طلبی پیدا نشد
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  در حال حاضر موردی برای نمایش وجود ندارد.
                </p>
              </div>
            )}
          </ReportSection>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*                              Footer Info                           */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          نمایش{" "}
          {formatNumber(
            Math.max(
              filteredSalesCustomers.length,
              visibleBalanceCustomers.length,
            ),
          )}{" "}
          رکورد برتر
        </span>

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="font-medium text-foreground hover:underline"
          >
            پاک کردن جستجو
          </button>
        )}
      </div>
    </div>
  );
}

