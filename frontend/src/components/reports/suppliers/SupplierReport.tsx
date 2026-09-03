
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Truck,
  Wallet,
} from "lucide-react";

import { getSupplierReport } from "@/lib/api/reports";
import type {
  SupplierReport,
  TopSupplierByBalance,
  TopSupplierByPurchases,
} from "@/types/reports";

import ReportKpiCard from "../ReportKpiCard";
import ReportSection from "../ReportSection";

function formatAmount(value: string): string {
  return `${Number(value).toLocaleString("fa-IR")} تومان`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("fa-IR");
}

function SupplierRank({
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

function PurchaseSupplierRow({
  supplier,
  index,
}: {
  supplier: TopSupplierByPurchases;
  index: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <SupplierRank index={index} />

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {supplier.supplier_name}
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            تأمین‌کننده #{formatNumber(supplier.supplier_id)}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-left">
        <p className="text-sm font-semibold">
          {formatAmount(supplier.total_purchases)}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          خرید
        </p>
      </div>
    </div>
  );
}

function BalanceSupplierRow({
  supplier,
  index,
}: {
  supplier: TopSupplierByBalance;
  index: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <SupplierRank index={index} />

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {supplier.supplier_name}
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            تأمین‌کننده #{formatNumber(supplier.supplier_id)}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-left">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          {formatAmount(supplier.balance)}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          مانده بدهی
        </p>
      </div>
    </div>
  );
}

export default function SupplierReport() {
  const [report, setReport] =
    useState<SupplierReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [showPayablesOnly, setShowPayablesOnly] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadReport() {
      try {
        setLoading(true);
        setError(null);

        const response = await getSupplierReport();

        if (!mounted) return;

        setReport(response.data);
      } catch {
        if (!mounted) return;

        setError(
          "دریافت گزارش تأمین‌کنندگان با خطا مواجه شد.",
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
  }, []);

  const filteredPurchaseSuppliers = useMemo(() => {
    if (!report) return [];

    const query = search.trim().toLowerCase();

    return report.top_suppliers_by_purchases.filter(
      (supplier) => {
        if (
          query &&
          !supplier.supplier_name
            .toLowerCase()
            .includes(query)
        ) {
          return false;
        }

        return true;
      },
    );
  }, [report, search]);

  const filteredBalanceSuppliers = useMemo(() => {
    if (!report) return [];

    const query = search.trim().toLowerCase();

    return report.top_suppliers_by_balance.filter(
      (supplier) => {
        if (
          query &&
          !supplier.supplier_name
            .toLowerCase()
            .includes(query)
        ) {
          return false;
        }

        return true;
      },
    );
  }, [report, search]);

  const visibleBalanceSuppliers =
    showPayablesOnly
      ? filteredBalanceSuppliers
      : filteredBalanceSuppliers;

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
            {error ??
              "گزارش تأمین‌کنندگان در دسترس نیست."}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            لطفاً دوباره تلاش کنید.
          </p>
        </div>
      </div>
    );
  }

  const {
    total_suppliers,
    active_suppliers,
    suppliers_with_payable,
    total_payables,
  } = report.summary;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/*                                   KPI                              */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportKpiCard
          title="کل تأمین‌کنندگان"
          value={formatNumber(total_suppliers)}
          tone="neutral"
        />

        <ReportKpiCard
          title="تأمین‌کنندگان فعال"
          value={formatNumber(active_suppliers)}
          tone="positive"
        />

        <ReportKpiCard
          title="تأمین‌کنندگان دارای بدهی"
          value={formatNumber(suppliers_with_payable)}
          tone={
            suppliers_with_payable > 0
              ? "negative"
              : "neutral"
          }
        />

        <ReportKpiCard
          title="مجموع بدهی‌ها"
          value={formatAmount(total_payables)}
          tone={
            Number(total_payables) > 0
              ? "negative"
              : "neutral"
          }
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*                            Payables Alert                          */}
      {/* ------------------------------------------------------------------ */}

      {suppliers_with_payable > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Wallet className="size-5 text-red-600 dark:text-red-400" />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  وضعیت بدهی‌ها نیاز به بررسی دارد
                </h2>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  به {formatNumber(suppliers_with_payable)}{" "}
                  تأمین‌کننده بدهکار هستیم و مجموع بدهی‌ها{" "}
                  <span className="font-medium text-foreground">
                    {formatAmount(total_payables)}
                  </span>{" "}
                  است.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowPayablesOnly(true);
                setSearch("");

                requestAnimationFrame(() => {
                  document
                    .getElementById(
                      "supplier-payables",
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                });
              }}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
            >
              مشاهده بدهی‌ها
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
            placeholder="جستجوی نام تأمین‌کننده..."
            className="h-10 w-full rounded-lg border border-border bg-background pr-9 pl-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>

        <button
          type="button"
          onClick={() =>
            setShowPayablesOnly(
              (current) => !current,
            )
          }
          className={[
            "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors",
            showPayablesOnly
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background hover:bg-muted",
          ].join(" ")}
        >
          <Wallet className="size-4" />
          فقط تأمین‌کنندگان بدهکار
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*                         Main Supplier Lists                        */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportSection
          title="تأمین‌کنندگان برتر از نظر خرید"
          description="تأمین‌کنندگانی که بیشترین مبلغ خرید از آن‌ها ثبت شده است"
          action={
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          }
        >
          {filteredPurchaseSuppliers.length > 0 ? (
            <div className="-mx-5 -my-5">
              {filteredPurchaseSuppliers.map(
                (supplier, index) => (
                  <PurchaseSupplierRow
                    key={supplier.supplier_id}
                    supplier={supplier}
                    index={index}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <Truck className="size-5 text-muted-foreground" />
              </div>

              <p className="mt-3 text-sm font-medium">
                تأمین‌کننده‌ای پیدا نشد
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                عبارت جستجو را تغییر دهید.
              </p>
            </div>
          )}
        </ReportSection>

        <div
          id="supplier-payables"
          className="scroll-mt-6"
        >
          <ReportSection
            title="تأمین‌کنندگان دارای بیشترین بدهی"
            description="تأمین‌کنندگانی که بیشترین مانده بدهی را دارند"
            action={
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <ArrowDownRight className="size-4 text-red-600 dark:text-red-400" />
              </div>
            }
          >
            {visibleBalanceSuppliers.length > 0 ? (
              <div className="-mx-5 -my-5">
                {visibleBalanceSuppliers.map(
                  (supplier, index) => (
                    <BalanceSupplierRow
                      key={supplier.supplier_id}
                      supplier={supplier}
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
                  تأمین‌کننده بدهکاری پیدا نشد
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
              filteredPurchaseSuppliers.length,
              visibleBalanceSuppliers.length,
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

