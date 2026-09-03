"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
ArrowDownRight,
ArrowUpRight,
Minus,
} from "lucide-react";
import {
CartesianGrid,
Line,
LineChart,
XAxis,
YAxis,
} from "recharts";

import { getSalesReport } from "@/lib/api/reports";
import type {
DailySales,
SalesReport as SalesReportData,
} from "@/types/reports";

import {
ChartContainer,
ChartTooltip,
ChartTooltipContent,
type ChartConfig,
} from "@/components/ui/chart";

import ReportDateRange from "../ReportDateRange";
import ReportKpiCard from "../ReportKpiCard";
import ReportSection from "../ReportSection";

const chartConfig = {
sales: {
label: "فروش",
color: "hsl(var(--chart-1))",
},
} satisfies ChartConfig;

function formatNumber(value: string | number) {
return new Intl.NumberFormat("fa-IR").format(
Number(value),
);
}

function formatMoney(value: string | number) {
return `${formatNumber(value)} تومان`;
}

function formatPercentage(value: string | null) {
if (value === null) {
return "جدید";
}

const number = Number(value);

const formatted = new Intl.NumberFormat("fa-IR", {
maximumFractionDigits: 1,
minimumFractionDigits: 0,
}).format(Math.abs(number));

return `${number > 0 ? "+" : number < 0 ? "-" : ""}${formatted}٪`;
}

function formatChartDate(value: string) {
return new Intl.DateTimeFormat("fa-IR", {
month: "short",
day: "numeric",
}).format(new Date(value));
}

function getComparisonTone(
direction: "up" | "down" | "unchanged",
) {
if (direction === "up") {
return "positive" as const;
}

if (direction === "down") {
return "negative" as const;
}

return "neutral" as const;
}

function getDateOnly(value: string) {
if (!value) {
return "";
}

return value.slice(0, 10);
}

function SalesChart({
data,
}: {
data: DailySales[];
}) {
const chartData = useMemo(
() =>
data.map((item) => ({
...item,
dateLabel: formatChartDate(item.date),
salesValue: Number(item.sales),
})),
[data],
);

if (!data.length) {
return ( <div className="flex h-[320px] items-center justify-center"> <p className="text-sm text-muted-foreground">
در این بازه داده‌ای برای نمایش نمودار وجود ندارد. </p> </div>
);
}

return ( <ChartContainer
   config={chartConfig}
   className="h-[320px] w-full"
 >
<LineChart
accessibilityLayer
data={chartData}
margin={{
top: 12,
right: 12,
left: 12,
bottom: 0,
}}
> <CartesianGrid
       vertical={false}
       strokeDasharray="4 4"
     />


    <XAxis
      dataKey="dateLabel"
      tickLine={false}
      axisLine={false}
      tickMargin={10}
      tick={{
        fontSize: 11,
      }}
    />

    <YAxis
      tickLine={false}
      axisLine={false}
      tickMargin={8}
      width={55}
      tick={{
        fontSize: 11,
      }}
      tickFormatter={(value) =>
        new Intl.NumberFormat("fa-IR", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(value)
      }
    />

    <ChartTooltip
      cursor={{
        strokeDasharray: "4 4",
      }}
      content={
        <ChartTooltipContent
          formatter={(value) =>
            `${formatMoney(String(value))}`
          }
        />
      }
    />

    <Line
      type="monotone"
      dataKey="salesValue"
      name="فروش"
      stroke="var(--color-sales)"
      strokeWidth={2}
      dot={false}
      activeDot={{
        r: 4,
      }}
    />
  </LineChart>
</ChartContainer>


);
}

function DailySalesTable({
data,
}: {
data: DailySales[];
}) {
if (!data.length) {
return ( <div className="flex min-h-[220px] items-center justify-center"> <p className="text-sm text-muted-foreground">
اطلاعات روزانه‌ای برای این بازه وجود ندارد. </p> </div>
);
}

return ( <div className="overflow-x-auto"> <table className="w-full min-w-[520px] text-sm"> <thead> <tr className="border-b border-border text-xs text-muted-foreground"> <th className="pb-3 text-right font-medium">
تاریخ </th>


        <th className="pb-3 text-right font-medium">
          فروش
        </th>

        <th className="pb-3 text-right font-medium">
          سفارش
        </th>

        <th className="pb-3 text-left font-medium">
          روند
        </th>
      </tr>
    </thead>

    <tbody>
      {data.map((item, index) => {
        const previous = data[index - 1];

        const currentSales = Number(item.sales);
        const previousSales = previous
          ? Number(previous.sales)
          : currentSales;

        const direction =
          currentSales > previousSales
            ? "up"
            : currentSales < previousSales
              ? "down"
              : "unchanged";

        return (
          <tr
            key={item.date}
            className="border-b border-border last:border-0"
          >
            <td className="py-3 font-medium">
              {formatChartDate(item.date)}
            </td>

            <td className="py-3">
              {formatMoney(item.sales)}
            </td>

            <td className="py-3 text-muted-foreground">
              {formatNumber(item.order_count)}
            </td>

            <td className="py-3 text-left">
              {direction === "up" && (
                <ArrowUpRight className="mr-auto size-4 text-emerald-600 dark:text-emerald-400" />
              )}

              {direction === "down" && (
                <ArrowDownRight className="mr-auto size-4 text-red-600 dark:text-red-400" />
              )}

              {direction === "unchanged" && (
                <Minus className="mr-auto size-4 text-muted-foreground" />
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>


);
}

function TopProducts({
data,
}: {
data: SalesReportData["top_products"];
}) {
if (!data.length) {
return ( <div className="flex min-h-[220px] items-center justify-center"> <p className="text-sm text-muted-foreground">
محصولی برای نمایش وجود ندارد. </p> </div>
);
}

return ( <div className="space-y-1">
{data.map((product, index) => ( <div
       key={product.product_id}
       className="
         flex
         items-center
         gap-3
         rounded-lg
         px-2
         py-3
         transition-colors
         hover:bg-muted/60
       "
     > <div
         className="
           flex
           size-8
           shrink-0
           items-center
           justify-center
           rounded-full
           bg-muted
           text-xs
           font-semibold
         "
       >
{formatNumber(index + 1)} </div>


      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {product.product_name}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatNumber(product.quantity_sold)} عدد فروش
        </p>
      </div>

      <p className="shrink-0 text-sm font-semibold">
        {formatMoney(product.sales)}
      </p>
    </div>
  ))}
</div>


);
}

function SalesLoadingState() {
return ( <div className="space-y-6"> <div className="h-[126px] animate-pulse rounded-xl border border-border bg-muted/40" />


  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {[1, 2, 3].map((item) => (
      <div
        key={item}
        className="h-[150px] animate-pulse rounded-xl border border-border bg-muted/40"
      />
    ))}
  </div>

  <div className="h-[390px] animate-pulse rounded-xl border border-border bg-muted/40" />

  <div className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
    <div className="h-[390px] animate-pulse rounded-xl border border-border bg-muted/40" />
    <div className="h-[390px] animate-pulse rounded-xl border border-border bg-muted/40" />
  </div>
</div>


);
}

export default function SalesReport() {
const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");

const [report, setReport] =
useState<SalesReportData | null>(null);

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const loadReport = useCallback(
async (from: string, to: string) => {
if (!from || !to) {
return;
}


  setLoading(true);
  setError("");

  try {
    const response = await getSalesReport({
      dateFrom: getDateOnly(from),
      dateTo: getDateOnly(to),
    });

    setReport(response.data);
  } catch (error) {
    setReport(null);

    setError(
      error instanceof Error
        ? error.message
        : "دریافت گزارش فروش با خطا مواجه شد.",
    );
  } finally {
    setLoading(false);
  }
},
[],
```

);

useEffect(() => {
// فعلاً تاریخ پیش‌فرض را عمداً خودکار از Date نمی‌سازیم.
// کاربر بازه را با PersianDatePicker انتخاب می‌کند.
}, []);

function handleApply() {
loadReport(dateFrom, dateTo);
}

function handleReset() {
setDateFrom("");
setDateTo("");
setReport(null);
setError("");
}

const hasReport = report !== null;

return ( <div className="space-y-6"> <ReportDateRange
     dateFrom={dateFrom}
     dateTo={dateTo}
     onDateFromChange={setDateFrom}
     onDateToChange={setDateTo}
     onApply={handleApply}
     onReset={handleReset}
     loading={loading}
   />


  {loading && <SalesLoadingState />}

  {!loading && error && (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-destructive">
          دریافت گزارش فروش ناموفق بود
        </p>

        <p className="text-sm text-muted-foreground">
          {error}
        </p>

        <button
          type="button"
          onClick={handleApply}
          className="
            mt-3
            w-fit
            rounded-lg
            border
            border-border
            bg-background
            px-3
            py-2
            text-sm
            font-medium
            hover:bg-accent
          "
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  )}

  {!loading && !error && !hasReport && (
    <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-border bg-card shadow-sm">
      <div className="max-w-md px-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <span className="text-lg">📊</span>
        </div>

        <h2 className="mt-4 text-sm font-semibold">
          بازه گزارش را انتخاب کنید
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          برای مشاهده آمار فروش، روند روزانه و
          پرفروش‌ترین محصولات، ابتدا تاریخ شروع و پایان
          گزارش را انتخاب کنید.
        </p>
      </div>
    </div>
  )}

  {!loading && !error && report && (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ReportKpiCard
          title="فروش کل"
          value={formatMoney(
            report.summary.total_sales.current,
          )}
          change={formatPercentage(
            report.summary.total_sales.percentage_change,
          )}
          direction={
            report.summary.total_sales.direction
          }
          tone={getComparisonTone(
            report.summary.total_sales.direction,
          )}
        />

        <ReportKpiCard
          title="تعداد سفارش"
          value={formatNumber(
            report.summary.order_count.current,
          )}
          change={formatPercentage(
            report.summary.order_count.percentage_change,
          )}
          direction={
            report.summary.order_count.direction
          }
          tone={getComparisonTone(
            report.summary.order_count.direction,
          )}
        />

        <ReportKpiCard
          title="میانگین ارزش سفارش"
          value={formatMoney(
            report.summary.average_order_value.current,
          )}
          change={formatPercentage(
            report.summary.average_order_value
              .percentage_change,
          )}
          direction={
            report.summary.average_order_value.direction
          }
          tone={getComparisonTone(
            report.summary.average_order_value.direction,
          )}
        />
      </div>

      <ReportSection
        title="روند فروش"
        description="میزان فروش روزانه در بازه انتخاب‌شده"
      >
        <SalesChart data={report.daily_sales} />
      </ReportSection>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
        <ReportSection
          title="پرفروش‌ترین محصولات"
          description="۱۰ محصول برتر بر اساس میزان فروش"
        >
          <TopProducts
            data={report.top_products}
          />
        </ReportSection>

        <ReportSection
          title="جزئیات روزانه"
          description="تفکیک فروش و تعداد سفارش‌ها در هر روز"
        >
          <DailySalesTable
            data={report.daily_sales}
          />
        </ReportSection>
      </div>
    </>
  )}
</div>


);
}
