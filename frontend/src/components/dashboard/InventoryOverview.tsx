"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Boxes,
  CheckCircle2,
} from "lucide-react";

type InventoryIngredient = {
  id: number;
  name: string;
  unit_type: string;
  base_unit: string;
  current_stock: number;
  minimum_stock: number;
  current_inventory_value: number;
  average_unit_cost: number;
  is_active: boolean;
  is_out_of_stock: boolean;
  is_low_stock: boolean;
};

type InventoryOverviewProps = {
  inventory: {
    total_value: number;
    out_of_stock_count: number;
    low_stock_count: number;
    ingredients: InventoryIngredient[];
  };
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

function getStockStatus(
  ingredient: InventoryIngredient,
) {
  if (ingredient.is_out_of_stock) {
    return {
      label: "ناموجود",
      className:
        "bg-destructive/10 text-destructive",
      icon: AlertTriangle,
    };
  }

  if (ingredient.is_low_stock) {
    return {
      label: "موجودی کم",
      className:
        "bg-warning/10 text-warning",
      icon: AlertTriangle,
    };
  }

  return {
    label: "مناسب",
    className:
      "bg-success/10 text-success",
    icon: CheckCircle2,
  };
}

function getUnitLabel(
  unitType: string,
) {
  switch (unitType) {
    case "weight":
      return "کیلوگرم";

    case "volume":
      return "لیتر";

    case "count":
      return "عدد";

    default:
      return unitType;
  }
}

export function InventoryOverview({
  inventory,
}: InventoryOverviewProps) {
  const ingredients = inventory.ingredients
    .filter((item) => item.is_active)
    .slice(0, 5);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            وضعیت موجودی
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            خلاصه وضعیت مواد اولیه و ارزش موجودی
          </p>
        </div>

        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <Boxes className="size-4 text-muted-foreground" />
        </div>
      </div>

      <div className="p-5">
        {/* Main metrics */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-background/50 p-4">
            <p className="text-xs text-muted-foreground">
              ارزش موجودی
            </p>

            <p className="mt-1.5 text-lg font-semibold">
              {formatMoney(
                Number(inventory.total_value),
              )}
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-background/50 p-4">
            <div className="flex items-center gap-2">
              <ArrowDown className="size-3.5 text-warning" />

              <p className="text-xs text-muted-foreground">
                موجودی کم
              </p>
            </div>

            <p className="mt-1.5 text-lg font-semibold">
              {formatNumber(
                inventory.low_stock_count,
              )}
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-background/50 p-4">
            <div className="flex items-center gap-2">
              <ArrowUp className="size-3.5 text-destructive" />

              <p className="text-xs text-muted-foreground">
                ناموجود
              </p>
            </div>

            <p className="mt-1.5 text-lg font-semibold">
              {formatNumber(
                inventory.out_of_stock_count,
              )}
            </p>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium">
              مواد اولیه
            </h3>

            <span className="text-xs text-muted-foreground">
              {formatNumber(
                ingredients.length,
              )} مورد
            </span>
          </div>

          {ingredients.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                ماده اولیه‌ای برای نمایش وجود ندارد.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {ingredients.map(
                (ingredient) => {
                  const status =
                    getStockStatus(
                      ingredient,
                    );

                  const StatusIcon =
                    status.icon;

                  const unit =
                    getUnitLabel(
                      ingredient.unit_type,
                    );

                  return (
                    <div
                      key={ingredient.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Boxes className="size-4 text-muted-foreground" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {ingredient.name}
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatNumber(
                            Number(
                              ingredient.current_stock,
                            ),
                          )}{" "}
                          {unit}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={[
                            "hidden items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium sm:inline-flex",
                            status.className,
                          ].join(" ")}
                        >
                          <StatusIcon className="size-3" />
                          {status.label}
                        </span>

                        <span className="text-left text-xs font-medium text-foreground">
                          {formatMoney(
                            Number(
                              ingredient.current_inventory_value,
                            ),
                          )}
                        </span>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}