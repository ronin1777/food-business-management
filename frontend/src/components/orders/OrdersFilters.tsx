"use client";

import {
  ArrowDownAZ,
  ArrowUpAZ,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import type {
  OrderPaymentStatus,
  OrderStatus,
} from "@/types/orders";

export function OrdersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(
    key: string,
    value: string,
  ) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");

    const query = params.toString();

    router.push(
      `${pathname}${query ? `?${query}` : ""}`,
    );
  }

  function resetFilters() {
    const ordering =
      searchParams.get("ordering");

    const params = new URLSearchParams();

    if (ordering) {
      params.set("ordering", ordering);
    }

    router.push(
      `${pathname}?${params.toString()}`,
    );
  }

  const hasFilters =
    Boolean(searchParams.get("search")) ||
    Boolean(searchParams.get("status")) ||
    Boolean(
      searchParams.get("paymentStatus"),
    );

  const ordering =
    searchParams.get("ordering") ||
    "-ordered_at";

  return (
    <div className="border-b border-border px-5 py-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <input
            defaultValue={
              searchParams.get("search") ?? ""
            }
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="hidden size-4 text-muted-foreground sm:block" />

            <select
              defaultValue={
                searchParams.get("status") ?? ""
              }
              onChange={(event) =>
                updateFilter(
                  "status",
                  event.target.value as
                    | OrderStatus
                    | "",
                )
              }
              className="
                h-10 min-w-[100px] sm:min-w-[130px]
                max-w-[140px] sm:max-w-none
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

          <select
            defaultValue={
              searchParams.get(
                "paymentStatus",
              ) ?? ""
            }
            onChange={(event) =>
              updateFilter(
                "paymentStatus",
                event.target.value as
                  | OrderPaymentStatus
                  | "",
              )
            }
            className="
              h-10 min-w-[120px] sm:min-w-[150px]
              max-w-[150px] sm:max-w-none
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

          <button
            type="button"
            onClick={() =>
              updateFilter(
                "ordering",
                ordering === "-ordered_at"
                  ? "ordered_at"
                  : "-ordered_at",
              )
            }
            className="
              inline-flex h-10
              flex-shrink-0
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
            {ordering === "-ordered_at" ? (
              <ArrowDownAZ className="size-4" />
            ) : (
              <ArrowUpAZ className="size-4" />
            )}

            <span>تاریخ</span>
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="
                inline-flex h-10
                flex-shrink-0
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
    </div>
  );
}