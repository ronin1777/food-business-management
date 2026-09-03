"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  PackageX,
  Search,
} from "lucide-react";

import { getInventoryReport } from "@/lib/api/reports";
import type {
  InventoryIngredient,
  InventoryReport as InventoryReportData,
} from "@/types/reports";

import ReportKpiCard from "../ReportKpiCard";
import ReportSection from "../ReportSection";

type InventoryStatus =
  | "all"
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "needs_supply";

function formatNumber(value: number | string): string {
  return new Intl.NumberFormat("fa-IR").format(Number(value));
}

function formatMoney(value: number | string): string {
  return `${formatNumber(value)} تومان`;
}

function formatUnit(value: string): string {
  const units: Record<string, string> = {
    kg: "کیلوگرم",
    kilogram: "کیلوگرم",
    g: "گرم",
    gram: "گرم",
    l: "لیتر",
    liter: "لیتر",
    ml: "میلی‌لیتر",
    milliliter: "میلی‌لیتر",
    pcs: "عدد",
    piece: "عدد",
    unit: "عدد",
  };

  return units[value.toLowerCase()] ?? value;
}

function getStockPercentage(
  currentStock: string,
  minimumStock: string,
): number {
  const current = Number(currentStock);
  const minimum = Number(minimumStock);

  if (minimum <= 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.min((current / minimum) * 100, 100);
}

function getStockBarWidth(
  currentStock: string,
  minimumStock: string,
): string {
  const current = Number(currentStock);
  const minimum = Number(minimumStock);

  if (current <= 0) {
    return "0%";
  }

  if (minimum <= 0) {
    return "100%";
  }

  return `${Math.min((current / minimum) * 100, 100)}%`;
}

function getStatusLabel(
  ingredient: InventoryIngredient,
): string {
  if (ingredient.is_out_of_stock) {
    return "ناموجود";
  }

  if (ingredient.is_low_stock) {
    return "کم‌موجود";
  }

  return "موجود";
}

function getStatusClasses(
  ingredient: InventoryIngredient,
): string {
  if (ingredient.is_out_of_stock) {
    return "bg-destructive/10 text-destructive";
  }

  if (ingredient.is_low_stock) {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }

  return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
}

function getStatusIcon(
  ingredient: InventoryIngredient,
) {
  if (ingredient.is_out_of_stock) {
    return PackageX;
  }

  if (ingredient.is_low_stock) {
    return AlertTriangle;
  }

  return CheckCircle2;
}

function InventoryReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>

      <div className="h-48 animate-pulse rounded-xl border border-border bg-card" />

      <div className="h-[600px] animate-pulse rounded-xl border border-border bg-card" />
    </div>
  );
}

export default function InventoryReport() {
  const [report, setReport] =
    useState<InventoryReportData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<InventoryStatus>("all");
  const [unit, setUnit] = useState("all");

  async function loadReport() {
    try {
      setLoading(true);
      setError(null);

      const response = await getInventoryReport();

      setReport(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "دریافت گزارش موجودی با خطا مواجه شد.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
  }, []);

  const units = useMemo(() => {
    if (!report) {
      return [];
    }

    return Array.from(
      new Set(
        report.ingredients.map(
          (ingredient) => ingredient.base_unit,
        ),
      ),
    );
  }, [report]);

  const filteredIngredients = useMemo(() => {
    if (!report) {
      return [];
    }

    const normalizedSearch =
      search.trim().toLowerCase();

    const filtered = report.ingredients.filter(
      (ingredient) => {
        const matchesSearch =
          !normalizedSearch ||
          ingredient.name
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesUnit =
          unit === "all" ||
          ingredient.base_unit === unit;

        const matchesStatus =
          status === "all" ||
          (status === "out_of_stock" &&
            ingredient.is_out_of_stock) ||
          (status === "low_stock" &&
            !ingredient.is_out_of_stock &&
            ingredient.is_low_stock) ||
          (status === "in_stock" &&
            !ingredient.is_out_of_stock &&
            !ingredient.is_low_stock) ||
          (status === "needs_supply" &&
            (ingredient.is_out_of_stock ||
              ingredient.is_low_stock));

        return (
          matchesSearch &&
          matchesUnit &&
          matchesStatus
        );
      },
    );

    return [...filtered].sort((a, b) => {
      const statusWeight = (
        ingredient: InventoryIngredient,
      ) => {
        if (ingredient.is_out_of_stock) {
          return 0;
        }

        if (ingredient.is_low_stock) {
          return 1;
        }

        return 2;
      };

      return (
        statusWeight(a) -
        statusWeight(b)
      );
    });
  }, [report, search, status, unit]);

  function handleNeedsSupplyClick() {
    setStatus("needs_supply");
    setSearch("");
    setUnit("all");

    requestAnimationFrame(() => {
      document
        .getElementById("inventory-ingredients")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }

  if (loading) {
    return <InventoryReportSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 text-destructive" />

          <div>
            <p className="text-sm font-medium">
              خطا در دریافت گزارش موجودی
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const {
    summary,
    by_unit_type,
  } = report;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* KPI */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportKpiCard
          title="تعداد مواد اولیه"
          value={formatNumber(
            summary.ingredient_count,
          )}
          tone="neutral"
        />

        <ReportKpiCard
          title="ارزش کل موجودی"
          value={formatMoney(
            summary.total_inventory_value,
          )}
          tone="neutral"
        />

        <ReportKpiCard
          title="مواد ناموجود"
          value={formatNumber(
            summary.out_of_stock_count,
          )}
          tone={
            summary.out_of_stock_count > 0
              ? "negative"
              : "positive"
          }
        />

        <ReportKpiCard
          title="مواد کم‌موجود"
          value={formatNumber(
            summary.low_stock_count,
          )}
          tone={
            summary.low_stock_count > 0
              ? "negative"
              : "positive"
          }
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Supply Status */}
      {/* ------------------------------------------------------------------ */}

      {(summary.out_of_stock_count > 0 ||
        summary.low_stock_count > 0) && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-4" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  وضعیت تأمین نیاز به بررسی دارد
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {summary.out_of_stock_count > 0
                    ? `${formatNumber(
                        summary.out_of_stock_count,
                      )} ماده اولیه ناموجود`
                    : "ماده ناموجودی وجود ندارد"}
                  {" و "}
                  {summary.low_stock_count > 0
                    ? `${formatNumber(
                        summary.low_stock_count,
                      )} ماده زیر حداقل موجودی قرار دارد.`
                    : "ماده‌ای زیر حداقل موجودی نیست."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNeedsSupplyClick}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
            >
              مشاهده موارد نیازمند تأمین
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Inventory By Unit */}
      {/* ------------------------------------------------------------------ */}

      <ReportSection
        title="خلاصه موجودی"
        description="نمای کلی موجودی مواد اولیه به تفکیک نوع واحد"
      >
        {by_unit_type.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              اطلاعاتی برای نمایش وجود ندارد.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {by_unit_type.map((item) => (
              <div
                key={item.unit_type}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">
                    {formatUnit(item.unit_type)}
                  </p>

                  <span className="text-xs text-muted-foreground">
                    {formatNumber(
                      item.ingredient_count,
                    )}{" "}
                    ماده
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-lg font-semibold tracking-tight">
                    {formatNumber(item.stock)}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    موجودی
                  </p>
                </div>

                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">
                    ارزش موجودی
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatMoney(
                      item.inventory_value,
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ReportSection>

      {/* ------------------------------------------------------------------ */}
      {/* Ingredients */}
      {/* ------------------------------------------------------------------ */}

      <div id="inventory-ingredients" className="scroll-mt-6">
        <ReportSection
          title="وضعیت مواد اولیه"
          description="موجودی فعلی، حداقل موجودی و ارزش هر ماده اولیه"
          action={
            <span className="text-xs text-muted-foreground">
              {formatNumber(
                filteredIngredients.length,
              )}{" "}
              مورد
            </span>
          }
        >
          {/* Filters */}

          <div className="space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row">
              {/* Search */}

              <div className="relative flex-1">
                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="جستجوی ماده اولیه..."
                  className="h-10 w-full rounded-lg border border-input bg-background pr-9 pl-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>

              {/* Status */}

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target
                      .value as InventoryStatus,
                  )
                }
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                <option value="all">
                  همه وضعیت‌ها
                </option>

                <option value="in_stock">
                  موجود
                </option>

                <option value="low_stock">
                  کم‌موجود
                </option>

                <option value="out_of_stock">
                  ناموجود
                </option>

                <option value="needs_supply">
                  نیازمند تأمین
                </option>
              </select>

              {/* Unit */}

              <select
                value={unit}
                onChange={(event) =>
                  setUnit(event.target.value)
                }
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                <option value="all">
                  همه واحدها
                </option>

                {units.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {formatUnit(item)}
                  </option>
                ))}
              </select>
            </div>

            {/* Active filters */}

            {(search ||
              status !== "all" ||
              unit !== "all") && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  نمایش{" "}
                  <span className="font-medium text-foreground">
                    {formatNumber(
                      filteredIngredients.length,
                    )}
                  </span>{" "}
                  مورد از{" "}
                  <span className="font-medium text-foreground">
                    {formatNumber(
                      report.ingredients.length,
                    )}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatus("all");
                    setUnit("all");
                  }}
                  className="text-xs font-medium text-foreground transition-colors hover:text-primary"
                >
                  پاک کردن فیلترها
                </button>
              </div>
            )}
          </div>

          {/* Table */}

          <div className="mt-5">
            {filteredIngredients.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-5 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <Search className="size-4 text-muted-foreground" />
                </div>

                <p className="mt-3 text-sm font-medium">
                  ماده اولیه‌ای پیدا نشد
                </p>

                <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                  با تغییر عبارت جستجو یا فیلترهای
                  انتخاب‌شده دوباره امتحان کنید.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-right">
                      <th className="px-4 py-3 font-medium text-muted-foreground">
                        ماده اولیه
                      </th>

                      <th className="px-4 py-3 font-medium text-muted-foreground">
                        موجودی
                      </th>

                      <th className="px-4 py-3 font-medium text-muted-foreground">
                        حداقل موجودی
                      </th>

                      <th className="px-4 py-3 font-medium text-muted-foreground">
                        ارزش موجودی
                      </th>

                      <th className="px-4 py-3 font-medium text-muted-foreground">
                        میانگین قیمت واحد
                      </th>

                      <th className="px-4 py-3 font-medium text-muted-foreground">
                        وضعیت
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredIngredients.map(
                      (ingredient) => {
                        const StatusIcon =
                          getStatusIcon(
                            ingredient,
                          );

                        const percentage =
                          getStockPercentage(
                            ingredient.current_stock,
                            ingredient.minimum_stock,
                          );

                        return (
                          <tr
                            key={ingredient.id}
                            className="border-b border-border last:border-0 hover:bg-muted/30"
                          >
                            {/* Ingredient */}

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                  <Boxes className="size-4 text-muted-foreground" />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate font-medium">
                                    {ingredient.name}
                                  </p>

                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {formatUnit(
                                      ingredient.base_unit,
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Current Stock */}

                            <td className="px-4 py-4">
                              <div className="min-w-[180px]">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-medium">
                                    {formatNumber(
                                      ingredient.current_stock,
                                    )}
                                  </span>

                                  <span className="text-xs text-muted-foreground">
                                    {formatNumber(
                                      percentage,
                                    )}
                                    ٪
                                  </span>
                                </div>

                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className={[
                                      "h-full rounded-full transition-all",
                                      ingredient.is_out_of_stock
                                        ? "bg-destructive"
                                        : ingredient.is_low_stock
                                          ? "bg-amber-500"
                                          : "bg-emerald-500",
                                    ].join(" ")}
                                    style={{
                                      width:
                                        getStockBarWidth(
                                          ingredient.current_stock,
                                          ingredient.minimum_stock,
                                        ),
                                    }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Minimum */}

                            <td className="px-4 py-4">
                              <span className="text-muted-foreground">
                                {formatNumber(
                                  ingredient.minimum_stock,
                                )}{" "}
                                {formatUnit(
                                  ingredient.base_unit,
                                )}
                              </span>
                            </td>

                            {/* Inventory Value */}

                            <td className="px-4 py-4">
                              <span className="font-medium">
                                {formatMoney(
                                  ingredient.current_inventory_value,
                                )}
                              </span>
                            </td>

                            {/* Average Cost */}

                            <td className="px-4 py-4">
                              <span className="text-muted-foreground">
                                {formatMoney(
                                  ingredient.average_unit_cost,
                                )}
                              </span>
                            </td>

                            {/* Status */}

                            <td className="px-4 py-4">
                              <span
                                className={[
                                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                                  getStatusClasses(
                                    ingredient,
                                  ),
                                ].join(" ")}
                              >
                                <StatusIcon className="size-3.5" />

                                {getStatusLabel(
                                  ingredient,
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ReportSection>
      </div>
    </div>
  );
}