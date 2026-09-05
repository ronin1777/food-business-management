"use client";

import { Download } from "lucide-react";

import type { DashboardData } from "@/types/dashboard";

type DashboardExportButtonProps = {
  data: DashboardData;
};

function formatCsvValue(
  value: string | number,
) {
  const stringValue = String(value);

  return `"${stringValue.replaceAll(
    '"',
    '""',
  )}"`;
}

export function DashboardExportButton({
  data,
}: DashboardExportButtonProps) {
  function handleDownload() {
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
        data.kpis.receivables.previous ?? "",
        data.kpis.receivables
          .percentage_change ?? "",
        data.kpis.receivables.direction,
      ],
      [
        "بدهی تأمین‌کنندگان",
        data.kpis.payables.current,
        data.kpis.payables.previous ?? "",
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
            formatCsvValue(value),
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

  return (
    <button
      type="button"
      onClick={handleDownload}
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
  );
}