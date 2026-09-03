"use client";

import { Download, FileBarChart } from "lucide-react";

export default function ReportsHeader() {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileBarChart className="size-4" />
          <span>تحلیل کسب‌وکار</span>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            گزارش‌ها
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            عملکرد فروش، خرید، سودآوری و وضعیت مالی کسب‌وکار را
            دقیق‌تر بررسی کنید.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="
          inline-flex
          h-10
          items-center
          justify-center
          gap-2
          rounded-lg
          border
          border-border
          bg-background
          px-3.5
          text-sm
          font-medium
          text-foreground
          shadow-sm
          transition-colors
          hover:bg-accent
          focus:outline-none
          focus:ring-2
          focus:ring-ring/20
        "
      >
        <Download className="size-4" />
        خروجی گزارش
      </button>
    </header>
  );
}