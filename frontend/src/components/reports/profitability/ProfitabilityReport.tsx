
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import ReportDateRange from "../ReportDateRange";
import ReportKpiCard from "../ReportKpiCard";
import ReportSection from "../ReportSection";

import { getProfitabilityReport } from "@/lib/api/reports";

import type {
  DailyProfitability,
  ProfitabilityReport as ProfitabilityReportData,
  ProfitabilityTopProduct,
} from "@/types/reports";

function getDateOnly(value: string): string {
  return value ? value.slice(0, 10) : "";
}

function formatNumber(value: number | string): string {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "۰";
  }

  return number.toLocaleString("fa-IR");
}

function formatMoney(value: number | string): string {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "۰ تومان";
  }

  return `${number.toLocaleString("fa-IR")} تومان`;
}

function formatPercentage(value: string | null): string {
  if (value === null) {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return `${number.toLocaleString("fa-IR", {
    maximumFractionDigits: 1,
  })}%`;
}

function formatChartDate(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("fa-IR", {
    month: "short",
    day: "numeric",
  });
}

function getDefaultDateRange() {
  const today = new Date();

  const from = new Date(today);
  from.setDate(from.getDate() - 29);

  return {
    dateFrom: from.toISOString(),
    dateTo: today.toISOString(),
  };
}

const chartConfig = {
  sales: {
    label: "فروش",
    color: "var(--primary)",
  },
  material_cost: {
    label: "هزینه مواد",
    color: "var(--muted-foreground)",
  },
  gross_profit: {
    label: "سود ناخالص",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function ProfitabilityReport() {
  const defaultDateRange = getDefaultDateRange();

  const [dateFrom, setDateFrom] = useState(
    defaultDateRange.dateFrom,
  );

  const [dateTo, setDateTo] = useState(
    defaultDateRange.dateTo,
  );

  const [appliedDateFrom, setAppliedDateFrom] =
    useState(defaultDateRange.dateFrom);

  const [appliedDateTo, setAppliedDateTo] =
    useState(defaultDateRange.dateTo);

  const [report, setReport] =
    useState<ProfitabilityReportData | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadReport(
    from: string,
    to: string,
  ) {
    const apiDateFrom = getDateOnly(from);
    const apiDateTo = getDateOnly(to);

    if (!apiDateFrom || !apiDateTo) {
      return;
    }

    if (apiDateFrom > apiDateTo) {
      setError(
        "تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getProfitabilityReport({
        dateFrom: apiDateFrom,
        dateTo: apiDateTo,
      });

      setReport(response.data);
    } catch (err) {
      setReport(null);

      setError(
        err instanceof Error
          ? err.message
          : "دریافت گزارش سودآوری با خطا مواجه شد.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    const apiDateFrom = getDateOnly(dateFrom);
    const apiDateTo = getDateOnly(dateTo);

    if (!apiDateFrom || !apiDateTo) {
      return;
    }

    if (apiDateFrom > apiDateTo) {
      setError(
        "تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.",
      );
      return;
    }

    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
  }

  function handleReset() {
    const defaults = getDefaultDateRange();

    setDateFrom(defaults.dateFrom);
    setDateTo(defaults.dateTo);
    setAppliedDateFrom(defaults.dateFrom);
    setAppliedDateTo(defaults.dateTo);
  }

  useEffect(() => {
    void loadReport(
      appliedDateFrom,
      appliedDateTo,
    );

    // گزارش با بازه اعمال‌شده همگام می‌شود.
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [appliedDateFrom, appliedDateTo]);

  const dailyProfitability = useMemo(() => {
    if (!report) {
      return [];
    }

    return report.daily_profitability.map(
      (item: DailyProfitability) => ({
        ...item,
        salesNumber: Number(item.sales),
        materialCostNumber: Number(
          item.material_cost,
        ),
        grossProfitNumber: Number(
          item.gross_profit,
        ),
        dateLabel: formatChartDate(item.date),
      }),
    );
  }, [report]);

  return (
    <div className="space-y-6">
      <ReportDateRange
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onApply={handleApply}
        onReset={handleReset}
        loading={loading}
      />

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && !report ? (
        <ProfitabilityReportSkeleton />
      ) : report ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ReportKpiCard
              title="فروش کل"
              value={formatMoney(
                report.summary.total_sales.current,
              )}
              previousValue={formatMoney(
                report.summary.total_sales.previous,
              )}
              change={formatPercentage(
                report.summary.total_sales
                  .percentage_change,
              )}
              direction={
                report.summary.total_sales.direction
              }
              tone="neutral"
            />

            <ReportKpiCard
              title="هزینه مواد اولیه"
              value={formatMoney(
                report.summary.total_material_cost
                  .current,
              )}
              previousValue={formatMoney(
                report.summary.total_material_cost
                  .previous,
              )}
              change={formatPercentage(
                report.summary.total_material_cost
                  .percentage_change,
              )}
              direction={
                report.summary.total_material_cost
                  .direction
              }
              tone="neutral"
            />

            <ReportKpiCard
              title="سود ناخالص"
              value={formatMoney(
                report.summary.gross_profit.current,
              )}
              previousValue={formatMoney(
                report.summary.gross_profit.previous,
              )}
              change={formatPercentage(
                report.summary.gross_profit
                  .percentage_change,
              )}
              direction={
                report.summary.gross_profit.direction
              }
              tone={
                report.summary.gross_profit.direction ===
                "down"
                  ? "negative"
                  : "positive"
              }
            />

            <ReportKpiCard
              title="حاشیه سود"
              value={formatPercentage(
                report.summary.gross_margin.current,
              )}
              previousValue={formatPercentage(
                report.summary.gross_margin.previous,
              )}
              change={formatPercentage(
                report.summary.gross_margin
                  .percentage_change,
              )}
              direction={
                report.summary.gross_margin.direction
              }
              tone={
                report.summary.gross_margin.direction ===
                "down"
                  ? "negative"
                  : "positive"
              }
            />

            <ReportKpiCard
              title="تعداد سفارش"
              value={formatNumber(
                report.summary.order_count.current,
              )}
              previousValue={formatNumber(
                report.summary.order_count.previous,
              )}
              change={formatPercentage(
                report.summary.order_count
                  .percentage_change,
              )}
              direction={
                report.summary.order_count.direction
              }
              tone="neutral"
            />

            <ReportKpiCard
              title="میانگین ارزش سفارش"
              value={formatMoney(
                report.summary.average_order_value
                  .current,
              )}
              previousValue={formatMoney(
                report.summary.average_order_value
                  .previous,
              )}
              change={formatPercentage(
                report.summary.average_order_value
                  .percentage_change,
              )}
              direction={
                report.summary.average_order_value
                  .direction
              }
              tone="neutral"
            />
          </div>

          <ReportSection
            title="روند سودآوری"
            description="فروش، هزینه مواد اولیه و سود ناخالص روزانه در بازه انتخاب‌شده"
          >
            {dailyProfitability.length > 0 ? (
              <div className="w-full overflow-hidden">
                <ChartContainer
                  config={chartConfig}
                  className="h-[340px] w-full"
                >
                  <LineChart
                    accessibilityLayer
                    data={dailyProfitability}
                    margin={{
                      top: 12,
                      right: 12,
                      left: 12,
                      bottom: 12,
                    }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="dateLabel"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={24}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={80}
                      tickFormatter={(value) =>
                        formatNumber(value)
                      }
                    />

                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          indicator="line"
                          labelFormatter={(value) =>
                            `تاریخ: ${value}`
                          }
                          formatter={(value, name) => {
                            if (
                              name === "فروش" ||
                              name === "هزینه مواد" ||
                              name === "سود ناخالص"
                            ) {
                              return (
                                <span className="font-medium">
                                  {formatMoney(
                                    Number(value),
                                  )}
                                </span>
                              );
                            }

                            return (
                              <span className="font-medium">
                                {String(value)}
                              </span>
                            );
                          }}
                        />
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="salesNumber"
                      name="فروش"
                      stroke="var(--color-sales)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="materialCostNumber"
                      name="هزینه مواد"
                      stroke="var(--color-material_cost)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{
                        r: 4,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="grossProfitNumber"
                      name="سود ناخالص"
                      stroke="var(--color-gross_profit)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            ) : (
              <EmptyState
                text="در این بازه داده‌ای برای نمایش سودآوری وجود ندارد."
              />
            )}
          </ReportSection>

          <div className="grid gap-6 xl:grid-cols-2">
            <ReportSection
              title="محصولات پُرسود"
              description="۱۰ محصول برتر بر اساس سود ناخالص"
            >
              <TopProducts
                products={report.top_products}
              />
            </ReportSection>

            <ReportSection
              title="سودآوری روزانه"
              description="جزئیات فروش، هزینه مواد و سود ناخالص"
            >
              <DailyProfitabilityTable
                data={report.daily_profitability}
              />
            </ReportSection>
          </div>
        </>
      ) : (
        <EmptyState
          text="برای نمایش گزارش، یک بازه تاریخی انتخاب کنید."
        />
      )}
    </div>
  );
}

function TopProducts({
  products,
}: {
  products: ProfitabilityTopProduct[];
}) {
  if (!products.length) {
    return (
      <EmptyState
        text="محصولی برای نمایش در این بازه وجود ندارد."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-border text-right text-xs text-muted-foreground">
            <th className="w-14 pb-3 text-center font-medium">
              رتبه
            </th>

            <th className="pb-3 font-medium">
              محصول
            </th>

            <th className="pb-3 text-left font-medium">
              تعداد
            </th>

            <th className="pb-3 text-left font-medium">
              فروش
            </th>

            <th className="pb-3 text-left font-medium">
              هزینه مواد
            </th>

            <th className="pb-3 text-left font-medium">
              سود ناخالص
            </th>

            <th className="pb-3 text-left font-medium">
              حاشیه سود
            </th>
          </tr>
        </thead>

        <tbody>
          {products.map((product, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;

            return (
              <tr
                key={product.product_id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="py-3 text-center">
                  <RankBadge
                    rank={rank}
                    highlighted={isTopThree}
                  />
                </td>

                <td className="py-3">
                  <span
                    className={
                      isTopThree
                        ? "font-semibold"
                        : "font-medium"
                    }
                  >
                    {product.product_name}
                  </span>
                </td>

                <td className="py-3 text-left tabular-nums">
                  {formatNumber(
                    product.quantity_sold,
                  )}
                </td>

                <td className="py-3 text-left tabular-nums">
                  {formatMoney(product.sales)}
                </td>

                <td className="py-3 text-left tabular-nums">
                  {formatMoney(
                    product.material_cost,
                  )}
                </td>

                <td className="py-3 text-left font-medium tabular-nums">
                  {formatMoney(
                    product.gross_profit,
                  )}
                </td>

                <td className="py-3 text-left font-medium tabular-nums">
                  {formatPercentage(
                    product.gross_margin,
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

function RankBadge({
  rank,
  highlighted,
}: {
  rank: number;
  highlighted: boolean;
}) {
  if (!highlighted) {
    return (
      <span className="inline-flex size-7 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
        {formatNumber(rank)}
      </span>
    );
  }

  return (
    <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
      {formatNumber(rank)}
    </span>
  );
}

function DailyProfitabilityTable({
  data,
}: {
  data: DailyProfitability[];
}) {
  if (!data.length) {
    return (
      <EmptyState
        text="اطلاعات روزانه‌ای برای نمایش وجود ندارد."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-sm">
        <thead>
          <tr className="border-b border-border text-right text-xs text-muted-foreground">
            <th className="pb-3 font-medium">
              تاریخ
            </th>

            <th className="pb-3 text-left font-medium">
              فروش
            </th>

            <th className="pb-3 text-left font-medium">
              هزینه مواد
            </th>

            <th className="pb-3 text-left font-medium">
              سود ناخالص
            </th>

            <th className="pb-3 text-left font-medium">
              سفارش
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr
              key={item.date}
              className="border-b border-border/60 last:border-0"
            >
              <td className="py-3">
                {formatChartDate(item.date)}
              </td>

              <td className="py-3 text-left font-medium tabular-nums">
                {formatMoney(item.sales)}
              </td>

              <td className="py-3 text-left tabular-nums">
                {formatMoney(item.material_cost)}
              </td>

              <td className="py-3 text-left font-medium tabular-nums">
                {formatMoney(item.gross_profit)}
              </td>

              <td className="py-3 text-left tabular-nums">
                {formatNumber(item.order_count)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <p className="text-sm text-muted-foreground">
        {text}
      </p>
    </div>
  );
}

function ProfitabilityReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-[130px] animate-pulse rounded-xl border border-border bg-card"
            />
          ),
        )}
      </div>

      <div className="h-[440px] animate-pulse rounded-xl border border-border bg-card" />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-[400px] animate-pulse rounded-xl border border-border bg-card" />

        <div className="h-[400px] animate-pulse rounded-xl border border-border bg-card" />
      </div>
    </div>
  );
}

