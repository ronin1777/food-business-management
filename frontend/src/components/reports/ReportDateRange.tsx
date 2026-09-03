"use client";

import { CalendarDays, RotateCcw } from "lucide-react";

import PersianDatePicker from "@/components/ui/PersianDatePicker";

type ReportDateRangeProps = {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  loading?: boolean;
};

export default function ReportDateRange({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApply,
  onReset,
  loading = false,
}: ReportDateRangeProps) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between lg:p-5">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          <div className="w-full sm:max-w-[240px]">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              از تاریخ
            </label>

            <PersianDatePicker
              value={dateFrom}
              onChange={onDateFromChange}
              placeholder="تاریخ شروع"
            />
          </div>

          <div className="w-full sm:max-w-[240px]">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              تا تاریخ
            </label>

            <PersianDatePicker
              value={dateTo}
              onChange={onDateToChange}
              placeholder="تاریخ پایان"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="
              inline-flex
              h-10
              items-center
              gap-2
              rounded-lg
              border
              border-border
              bg-background
              px-3
              text-sm
              font-medium
              hover:bg-accent
            "
          >
            <RotateCcw className="size-4" />
            بازنشانی
          </button>

          <button
            type="button"
            onClick={onApply}
            disabled={loading}
            className="
              inline-flex
              h-10
              min-w-[100px]
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-primary
              px-4
              text-sm
              font-medium
              text-primary-foreground
              shadow-sm
              transition-opacity
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <CalendarDays className="size-4" />

            {loading ? "در حال بررسی..." : "اعمال"}
          </button>
        </div>
      </div>
    </section>
  );
}