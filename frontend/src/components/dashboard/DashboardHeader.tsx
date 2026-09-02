"use client";

import { Download } from "lucide-react";

import {
  DashboardDateRange,
  type DateRangePreset,
} from "./DashboardDateRange";

type DashboardHeaderProps = {
  dateRange: DateRangePreset;
  onDateRangeChange: (
    preset: DateRangePreset,
  ) => void;
};

export function DashboardHeader({
  dateRange,
  onDateRangeChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
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
          onChange={onDateRangeChange}
        />

        <button
          type="button"
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
          "
        >
          <Download className="size-4" />

          <span>خروجی</span>
        </button>
      </div>
    </div>
  );
}