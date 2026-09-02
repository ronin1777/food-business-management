"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { getDashboard } from "@/lib/api/dashboard";

import { BusinessInsights } from "./BusinessInsights";
import {
  DashboardDateRange,
  getDateRangeFromPreset,
  type DateRangePreset,
} from "./DashboardDateRange";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { FinancialOverview } from "./FinancialOverview";
import { InventoryOverview } from "./InventoryOverview";
import { KpiCard } from "./KpiCard";
import { RecentOrders } from "./RecentOrders";
import { SalesProfitChart } from "./SalesProfitChart";
import { TopProducts } from "./TopProducts";

import type {
  DashboardResponse,
} from "@/types/dashboard";

type ChangeDirection =
  | "up"
  | "down"
  | "unchanged";

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

function getChangeType(
  direction: ChangeDirection,
): "positive" | "negative" | "neutral" {
  switch (direction) {
    case "up":
      return "positive";

    case "down":
      return "negative";

    default:
      return "neutral";
  }
}

function getChangeText(
  percentage: number | null,
  direction: ChangeDirection,
) {
  if (percentage === null) {
    return undefined;
  }

  if (direction === "up") {
    return `↑ ${formatNumber(
      percentage,
    )}٪ نسبت به دوره قبل`;
  }

  if (direction === "down") {
    return `↓ ${formatNumber(
      percentage,
    )}٪ نسبت به دوره قبل`;
  }

  return "بدون تغییر نسبت به دوره قبل";
}

function escapeCsvValue(
  value: string | number,
) {
  const stringValue = String(value);

  return `"${stringValue.replaceAll(
    '"',
    '""',
  )}"`;
}

function downloadDashboardCsv(
  data: DashboardResponse["data"],
) {
  const rows: (
    | string
    | number
  )[][] = [
    [
      "شاخص",
      "مقدار فعلی",
      "مقدار قبلی",
      "درصد تغییر",
      "جهت تغییر",
    ],

    [
      "فروش",
      data.kpis.sales.current,
      data.kpis.sales.previous,
      data.kpis.sales
        .percentage_change ?? "",
      data.kpis.sales.direction,
    ],

    [
      "سفارش‌ها",
      data.kpis.orders.current,
      data.kpis.orders.previous,
      data.kpis.orders
        .percentage_change ?? "",
      data.kpis.orders.direction,
    ],

    [
      "سود ناخالص",
      data.kpis.gross_profit.current,
      data.kpis.gross_profit.previous,
      data.kpis.gross_profit
        .percentage_change ?? "",
      data.kpis.gross_profit.direction,
    ],

    [
      "حاشیه سود",
      data.kpis.gross_margin.current,
      data.kpis.gross_margin.previous,
      data.kpis.gross_margin
        .percentage_change ?? "",
      data.kpis.gross_margin.direction,
    ],

    [
      "خرید",
      data.kpis.purchases.current,
      data.kpis.purchases.previous,
      data.kpis.purchases
        .percentage_change ?? "",
      data.kpis.purchases.direction,
    ],

    [
      "مطالبات",
      data.kpis.receivables.current,
      data.kpis.receivables.previous ??
        "",
      data.kpis.receivables
        .percentage_change ?? "",
      data.kpis.receivables.direction,
    ],

    [
      "بدهی تأمین‌کنندگان",
      data.kpis.payables.current,
      data.kpis.payables.previous ??
        "",
      data.kpis.payables
        .percentage_change ?? "",
      data.kpis.payables.direction,
    ],

    [
      "ارزش موجودی",
      data.kpis.inventory_value.current,
      "",
      "",
      "",
    ],
  ];

  const csv = rows
    .map((row) =>
      row
        .map((value) =>
          escapeCsvValue(value),
        )
        .join(","),
    )
    .join("\n");

  const blob = new Blob(
    ["\uFEFF" + csv],
    {
      type: "text/csv;charset=utf-8;",
    },
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download = `dashboard-${data.period.date_from}-${data.period.date_to}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function DashboardContent() {
  const [dateRange, setDateRange] =
    useState<DateRangePreset>(
      "last_30_days",
    );

  const [data, setData] =
    useState<DashboardResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const {
          dateFrom,
          dateTo,
        } = getDateRangeFromPreset(
          dateRange,
        );

        const response =
          await getDashboard({
            dateFrom,
            dateTo,
          });

        if (cancelled) {
          return;
        }

        setData(response);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Dashboard error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "خطایی در دریافت اطلاعات داشبورد رخ داد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  const handleDateRangeChange = (
    preset: DateRangePreset,
  ) => {
    setDateRange(preset);
  };

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium text-destructive">
            خطا در دریافت اطلاعات داشبورد
          </p>

          <p className="mt-2 text-sm leading-6 text-destructive/80">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-border">
        <p className="text-sm text-muted-foreground">
          اطلاعاتی برای نمایش وجود ندارد.
        </p>
      </div>
    );
  }

  const {
    kpis,
    trends,
    products,
    inventory,
    customers,
    suppliers,
    recent_orders,
    insights,
  } = data.data;

  const kpiItems = [
    {
      title: "فروش",
      value: formatMoney(
        Number(kpis.sales.current),
      ),
      change: getChangeText(
        kpis.sales.percentage_change,
        kpis.sales.direction,
      ),
      changeType: getChangeType(
        kpis.sales.direction,
      ),
    },
    {
      title: "سفارش‌ها",
      value: formatNumber(
        Number(kpis.orders.current),
      ),
      change: getChangeText(
        kpis.orders.percentage_change,
        kpis.orders.direction,
      ),
      changeType: getChangeType(
        kpis.orders.direction,
      ),
    },
    {
      title: "سود ناخالص",
      value: formatMoney(
        Number(kpis.gross_profit.current),
      ),
      change: getChangeText(
        kpis.gross_profit.percentage_change,
        kpis.gross_profit.direction,
      ),
      changeType: getChangeType(
        kpis.gross_profit.direction,
      ),
    },
    {
      title: "حاشیه سود",
      value: `${formatNumber(
        Number(kpis.gross_margin.current),
      )}٪`,
      change: getChangeText(
        kpis.gross_margin.percentage_change,
        kpis.gross_margin.direction,
      ),
      changeType: getChangeType(
        kpis.gross_margin.direction,
      ),
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            نمای کلی کسب‌وکار
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            داشبورد
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            عملکرد فروش، سود، موجودی و وضعیت مالی کسب‌وکار را بررسی کنید.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DashboardDateRange
            value={dateRange}
            onChange={handleDateRangeChange}
          />

          <button
            type="button"
            onClick={() =>
              downloadDashboardCsv(data.data)
            }
            className="
              inline-flex h-10
              items-center gap-2
              rounded-lg
              bg-primary
              px-3.5
              text-sm font-medium
              text-primary-foreground
              shadow-sm
              transition-opacity
              hover:opacity-90
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              focus-visible:ring-offset-2
            "
          >
            <Download className="size-4" />

            <span>خروجی</span>
          </button>
        </div>
      </section>

      {/* Refresh Indicator */}
      {loading && (
        <div
          className="h-1 overflow-hidden rounded-full bg-muted"
          aria-label="در حال بروزرسانی داشبورد"
        >
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
      )}

      {/* Refresh Error */}
      {error && (
        <div className="rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
          <p className="text-sm text-warning">
            اطلاعات جدید با خطا مواجه شد؛ آخرین اطلاعات نمایش داده می‌شود.
          </p>
        </div>
      )}

      {/* KPI */}
      <section
        aria-label="شاخص‌های کلیدی"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {kpiItems.map((item) => (
          <KpiCard
            key={item.title}
            title={item.title}
            value={item.value}
            change={item.change}
            changeType={item.changeType}
          />
        ))}
      </section>

      {/* Sales & Profit */}
      <SalesProfitChart
        sales={trends.sales}
        grossProfit={
          trends.gross_profit
        }
      />

      {/* Products + Inventory */}
      <section
        aria-label="محصولات و موجودی"
        className="grid gap-6 lg:grid-cols-2"
      >
        <TopProducts
          products={
            products.top_by_sales
          }
        />

        <InventoryOverview
          inventory={inventory}
        />
      </section>

      {/* Financial Overview */}
      <FinancialOverview
        receivables={kpis.receivables}
        payables={kpis.payables}
        customers={
          customers.top_by_balance
        }
        suppliers={
          suppliers.top_by_balance
        }
      />

      {/* Recent Orders + Business Insights */}
      <section
        aria-label="فعالیت‌های اخیر"
        className="grid gap-6 lg:grid-cols-2"
      >
        <RecentOrders
          orders={recent_orders}
        />

        <BusinessInsights
          insights={insights}
        />
      </section>
    </div>
  );
}