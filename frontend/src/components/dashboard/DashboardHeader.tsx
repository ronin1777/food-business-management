
import {
  DashboardExportButton,
} from "./DashboardExportButton";
import {
  DashboardDateRange,
} from "./DashboardDateRange";

import type { DashboardData } from "@/types/dashboard";
import type { DateRangePreset } from "./dashboard-utils";

type DashboardHeaderProps = {
  dateRange: DateRangePreset;
  data: DashboardData;
};

export function DashboardHeader({
  dateRange,
  data,
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
        />

        <DashboardExportButton
          data={data}
        />
      </div>
    </div>
  );
}

