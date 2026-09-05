"use client";

import {
  CalendarDays,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import PersianDatePicker from "@/components/ui/PersianDatePicker";

import type { Ingredient } from "@/types/ingredients";
import type { InventoryTransactionType } from "@/types/inventory";

type Props = {
  ingredients: Ingredient[];

  transactionTypes: readonly {
    value: InventoryTransactionType;
    label: string;
  }[];

  loading?: boolean;
};

export default function InventoryFilters({
  ingredients,
  transactionTypes,
  loading = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(
    key: string,
    value: string,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");

    const query =
      params.toString();

    router.push(
      `${pathname}${query ? `?${query}` : ""}`,
    );
  }

  function clearFilters() {
    const params =
      new URLSearchParams();

    const ordering =
      searchParams.get("ordering");

    if (ordering) {
      params.set(
        "ordering",
        ordering,
      );
    }

    router.push(
      `${pathname}?${params.toString()}`,
    );
  }

  const hasFilters =
    Boolean(
      searchParams.get("search") ||
        searchParams.get("ingredient") ||
        searchParams.get(
          "transaction_type",
        ) ||
        searchParams.get(
          "created_at_after",
        ) ||
        searchParams.get(
          "created_at_before",
        ),
    );

  return (
    <div className="rounded-xl border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />

          <h2 className="font-semibold">
            فیلترها
          </h2>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />

            حذف فیلترها
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <input
          type="text"
          defaultValue={
            searchParams.get(
              "search",
            ) ?? ""
          }
          onChange={(event) =>
            updateParam(
              "search",
              event.target.value,
            )
          }
          placeholder="جستجوی ماده اولیه یا توضیحات..."
          className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30 lg:col-span-2"
        />

        {/* Ingredient */}
        <select
          defaultValue={
            searchParams.get(
              "ingredient",
            ) ?? ""
          }
          onChange={(event) =>
            updateParam(
              "ingredient",
              event.target.value,
            )
          }
          disabled={loading}
          className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">
            همه مواد اولیه
          </option>

          {ingredients.map(
            (ingredient) => (
              <option
                key={ingredient.id}
                value={ingredient.id}
              >
                {ingredient.name}
              </option>
            ),
          )}
        </select>

        {/* Transaction type */}
        <select
          defaultValue={
            searchParams.get(
              "transaction_type",
            ) ?? ""
          }
          onChange={(event) =>
            updateParam(
              "transaction_type",
              event.target.value,
            )
          }
          className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/30"
        >
          <option value="">
            همه عملیات
          </option>

          {transactionTypes.map(
            (type) => (
              <option
                key={type.value}
                value={type.value}
              >
                {type.label}
              </option>
            ),
          )}
        </select>

        {/* From date */}
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute right-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

          <PersianDatePicker
            value={
              searchParams.get(
                "created_at_after",
              ) ?? ""
            }
            onChange={(value) =>
              updateParam(
                "created_at_after",
                value,
              )
            }
            placeholder="از تاریخ"
            disabled={loading}
          />
        </div>

        {/* To date */}
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute right-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

          <PersianDatePicker
            value={
              searchParams.get(
                "created_at_before",
              ) ?? ""
            }
            onChange={(value) =>
              updateParam(
                "created_at_before",
                value,
              )
            }
            placeholder="تا تاریخ"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}