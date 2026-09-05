import { getDashboardServer } from "@/lib/api/dashboard-server";

import { getDateRangeFromPreset } from "./dashboard-utils";
import { KpiCard } from "./KpiCard";
import { SalesProfitChart } from "./SalesProfitChart";
import { TopProducts } from "./TopProducts";
import { InventoryOverview } from "./InventoryOverview";
import { FinancialOverview } from "./FinancialOverview";
import { RecentOrders } from "./RecentOrders";
import { BusinessInsights } from "./BusinessInsights";
import { DashboardHeader } from "./DashboardHeader";

type DashboardContentProps = {
  range?: string;
};

export async function DashboardContent({
  range = "last_30_days",
}: DashboardContentProps) {
  const preset =
    range === "last_7_days" ||
    range === "last_30_days" ||
    range === "this_month" ||
    range === "last_month"
      ? range
      : "last_30_days";

  const { dateFrom, dateTo } =
    getDateRangeFromPreset(preset);

  const response =
    await getDashboardServer({
      dateFrom,
      dateTo,
    });

  if (!response.data) {
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
  } = response.data;

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("fa-IR", {
      maximumFractionDigits: 2,
    }).format(value);

  const formatMoney = (value: number) =>
    `${formatNumber(value)} تومان`;

  const getChangeType = (
    direction: "up" | "down" | "unchanged",
  ) => {
    if (direction === "up") {
      return "positive" as const;
    }

    if (direction === "down") {
      return "negative" as const;
    }

    return "neutral" as const;
  };

  const getChangeText = (
    percentage: number | null,
    direction: "up" | "down" | "unchanged",
  ) => {
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
  };

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
      <DashboardHeader
  dateRange={preset}
  data={response.data}
/>

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

      <SalesProfitChart
        sales={trends.sales}
        grossProfit={trends.gross_profit}
      />

      <section
        aria-label="محصولات و موجودی"
        className="grid gap-6 lg:grid-cols-2"
      >
        <TopProducts
          products={products.top_by_sales}
        />

        <InventoryOverview
          inventory={inventory}
        />
      </section>

      <FinancialOverview
        receivables={kpis.receivables}
        payables={kpis.payables}
        customers={customers.top_by_balance}
        suppliers={suppliers.top_by_balance}
      />

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