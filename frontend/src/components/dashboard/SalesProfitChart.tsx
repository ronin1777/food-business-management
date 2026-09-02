"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SalesProfitChartProps = {
  sales: {
    date: string;
    value: number;
  }[];

  grossProfit: {
    date: string;
    value: number;
  }[];
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    value?: number;
  }>;
  label?: string;
};

type LegendProps = {
  payload?: Array<{
    dataKey?: string;
  }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function CustomTooltip({
  active,
  payload,
  label,
}: ChartTooltipProps) {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  const sales = payload.find(
    (item) => item.dataKey === "sales",
  );

  const grossProfit = payload.find(
    (item) =>
      item.dataKey === "grossProfit",
  );

  return (
    <div
      className="
        min-w-[210px]
        rounded-xl
        border border-border
        bg-popover
        p-3
        shadow-2xl
      "
    >
      <div className="mb-3 border-b border-border pb-2">
        <p className="text-xs font-medium text-muted-foreground">
          {label ? formatDate(label) : ""}
        </p>
      </div>

      <div className="space-y-3">
        {sales && (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span
                className="
                  size-2.5 rounded-full
                  bg-[var(--chart-sales)]
                "
              />

              <span className="text-xs text-muted-foreground">
                فروش
              </span>
            </div>

            <span className="text-xs font-semibold text-foreground">
              {formatMoney(
                Number(sales.value ?? 0),
              )}
            </span>
          </div>
        )}

        {grossProfit && (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span
                className="
                  size-2.5 rounded-full
                  bg-[var(--chart-profit)]
                "
              />

              <span className="text-xs text-muted-foreground">
                سود ناخالص
              </span>
            </div>

            <span className="text-xs font-semibold text-foreground">
              {formatMoney(
                Number(
                  grossProfit.value ?? 0,
                ),
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomLegend({
  payload,
}: LegendProps) {
  if (!payload?.length) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-6 pt-3">
      {payload.map((item) => {
        const isSales =
          item.dataKey === "sales";

        return (
          <div
            key={item.dataKey}
            className="flex items-center gap-2"
          >
            <span
              className={
                isSales
                  ? "size-2.5 rounded-full bg-[var(--chart-sales)]"
                  : "size-2.5 rounded-full bg-[var(--chart-profit)]"
              }
            />

            <span className="text-xs text-muted-foreground">
              {isSales
                ? "فروش"
                : "سود ناخالص"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function SalesProfitChart({
  sales,
  grossProfit,
}: SalesProfitChartProps) {
  const data = sales.map((item) => {
    const profit =
      grossProfit.find(
        (profitItem) =>
          profitItem.date === item.date,
      );

    return {
      date: item.date,
      sales: Number(item.value),
      grossProfit: Number(
        profit?.value ?? 0,
      ),
    };
  });

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            فروش و سود
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            روند فروش و سود ناخالص در دوره انتخاب‌شده
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[360px] w-full px-2 pb-4 pt-6 sm:px-4">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              داده‌ای برای نمایش وجود ندارد.
            </p>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={data}
              margin={{
                top: 8,
                right: 12,
                left: 6,
                bottom: 0,
              }}
            >
              <defs>
                {/* Sales gradient */}
                <linearGradient
                  id="salesGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--chart-sales)"
                    stopOpacity={0.28}
                  />

                  <stop
                    offset="60%"
                    stopColor="var(--chart-sales)"
                    stopOpacity={0.10}
                  />

                  <stop
                    offset="100%"
                    stopColor="var(--chart-sales)"
                    stopOpacity={0.02}
                  />
                </linearGradient>

                {/* Gross profit gradient */}
                <linearGradient
                  id="profitGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--chart-profit)"
                    stopOpacity={0.16}
                  />

                  <stop
                    offset="100%"
                    stopColor="var(--chart-profit)"
                    stopOpacity={0.015}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 5"
                vertical={false}
                opacity={0.8}
              />

              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                }}
                tickLine={{
                  stroke: "var(--border)",
                }}
                axisLine={{
                  stroke: "var(--border)",
                }}
                tickMargin={10}
                minTickGap={24}
              />

              <YAxis
                tickFormatter={(value) =>
                  formatNumber(
                    Number(value),
                  )
                }
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                }}
                tickLine={{
                  stroke: "var(--border)",
                }}
                axisLine={{
                  stroke: "var(--border)",
                }}
                width={76}
                tickMargin={8}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke:
                    "var(--muted-foreground)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                  opacity: 0.45,
                }}
              />

              <Legend
                verticalAlign="bottom"
                content={<CustomLegend />}
              />

              {/* Sales */}
              <Area
                type="monotone"
                dataKey="sales"
                stroke="var(--chart-sales)"
                strokeWidth={2.5}
                fill="url(#salesGradient)"
                fillOpacity={1}
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 3,
                  stroke: "var(--card)",
                  fill: "var(--chart-sales)",
                }}
                connectNulls
              />

              {/* Gross profit */}
              <Area
                type="monotone"
                dataKey="grossProfit"
                stroke="var(--chart-profit)"
                strokeWidth={2}
                fill="url(#profitGradient)"
                fillOpacity={1}
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 3,
                  stroke: "var(--card)",
                  fill: "var(--chart-profit)",
                }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}