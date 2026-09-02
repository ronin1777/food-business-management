"use client";

import {
  ArrowDownAZ,
  ArrowUpAZ,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import type {
  OrderFilters,
  OrderPaymentStatus,
  OrderStatus,
} from "@/types/orders";

type OrdersFiltersProps = {
  filters: OrderFilters;
  onChange: (
    filters: OrderFilters,
  ) => void;
};

export function OrdersFilters({
  filters,
  onChange,
}: OrdersFiltersProps) {
  const hasFilters =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.paymentStatus);

  function updateFilter(
    key: keyof OrderFilters,
    value:
      | string
      | OrderStatus
      | OrderPaymentStatus
      | undefined,
  ) {
    onChange({
      ...filters,
      page: 1,
      [key]: value || undefined,
    });
  }

  function resetFilters() {
    onChange({
      page: 1,
      pageSize: 20,
      ordering: "-ordered_at",
    });
  }

  return (
    <div className="border-b border-border px-5 py-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={filters.search ?? ""}
            onChange={(event) =>
              updateFilter(
                "search",
                event.target.value,
              )
            }
            placeholder="جستجوی نام مشتری یا یادداشت..."
            className="
              h-10 w-full
              rounded-lg
              border border-input
              bg-background
              pr-9 pl-3
              text-sm
              outline-none
              placeholder:text-muted-foreground
              focus:border-ring
              focus:ring-2
              focus:ring-ring/20
            "
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="hidden size-4 text-muted-foreground sm:block" />

          <select
            value={filters.status ?? ""}
            onChange={(event) =>
              updateFilter(
                "status",
                event.target.value as
                  | OrderStatus
                  | undefined,
              )
            }
            className="
              h-10 min-w-[130px]
              rounded-lg
              border border-input
              bg-background
              px-3
              text-sm
              outline-none
              focus:border-ring
              focus:ring-2
              focus:ring-ring/20
            "
          >
            <option value="">
              همه وضعیت‌ها
            </option>

            <option value="completed">
              ثبت شده
            </option>

            <option value="cancelled">
              لغو شده
            </option>
          </select>
        </div>

        {/* Payment */}
        <select
          value={filters.paymentStatus ?? ""}
          onChange={(event) =>
            updateFilter(
              "paymentStatus",
              event.target.value as
                | OrderPaymentStatus
                | undefined,
            )
          }
          className="
            h-10 min-w-[150px]
            rounded-lg
            border border-input
            bg-background
            px-3
            text-sm
            outline-none
            focus:border-ring
            focus:ring-2
            focus:ring-ring/20
          "
        >
          <option value="">
            همه پرداخت‌ها
          </option>

          <option value="paid">
            پرداخت شده
          </option>

          <option value="partially_paid">
            نیمه پرداخت
          </option>

          <option value="unpaid">
            پرداخت نشده
          </option>
        </select>

        {/* Ordering */}
        <button
          type="button"
          onClick={() =>
            updateFilter(
              "ordering",
              filters.ordering ===
                "-ordered_at"
                ? "ordered_at"
                : "-ordered_at",
            )
          }
          className="
            inline-flex h-10
            items-center justify-center gap-2
            rounded-lg
            border border-input
            bg-background
            px-3
            text-sm
            text-foreground
            transition-colors
            hover:bg-accent
          "
        >
          {filters.ordering ===
          "-ordered_at" ? (
            <ArrowDownAZ className="size-4" />
          ) : (
            <ArrowUpAZ className="size-4" />
          )}

          <span>تاریخ</span>
        </button>

        {/* Reset */}
        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="
              inline-flex h-10
              items-center justify-center gap-2
              rounded-lg
              px-3
              text-sm
              text-muted-foreground
              transition-colors
              hover:bg-accent
              hover:text-foreground
            "
          >
            <X className="size-4" />
            <span>پاک کردن</span>
          </button>
        )}
      </div>
    </div>
  );
}