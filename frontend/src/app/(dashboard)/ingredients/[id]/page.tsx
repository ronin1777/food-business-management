"use client";

import Link from "next/link";
import {
  ArrowRight,
  Beaker,
  CalendarDays,
  CircleAlert,
  Coins,
  Package,
  Pencil,
  Scale,
} from "lucide-react";
import {
  use,
  useEffect,
  useState,
} from "react";

import { getIngredient } from "@/lib/api/ingredients";

import type {
  Ingredient,
} from "@/types/ingredients";

type IngredientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat(
    "fa-IR",
  ).format(value);
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat(
    "fa-IR",
    {
      maximumFractionDigits: 6,
    },
  ).format(value);
}

function formatMoney(value: number) {
  return `${formatDecimal(value)} تومان`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(new Date(value));
}

export default function IngredientDetailPage({
  params,
}: IngredientDetailPageProps) {
  const { id } = use(params);

  const ingredientId = Number(id);

  const [ingredient, setIngredient] =
    useState<Ingredient | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (
      !Number.isInteger(
        ingredientId,
      ) ||
      ingredientId <= 0
    ) {
      setError(
        "شناسه ماده اولیه معتبر نیست.",
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadIngredient() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getIngredient(
            ingredientId,
          );

        if (cancelled) {
          return;
        }

        setIngredient(response);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Ingredient detail error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "خطایی در دریافت اطلاعات ماده اولیه رخ داد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadIngredient();

    return () => {
      cancelled = true;
    };
  }, [ingredientId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />

        <div className="h-14 w-64 animate-pulse rounded bg-muted" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>

        <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (error || !ingredient) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <CircleAlert className="mx-auto size-6 text-destructive" />

          <p className="mt-3 text-sm font-medium text-destructive">
            خطا در دریافت اطلاعات ماده اولیه
          </p>

          <p className="mt-2 text-sm leading-6 text-destructive/80">
            {error ??
              "ماده اولیه پیدا نشد."}
          </p>

          <Link
            href="/ingredients"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <ArrowRight className="size-4" />
            بازگشت به مواد اولیه
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/ingredients"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowRight className="size-4" />
            مواد اولیه
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
              <Beaker className="size-5 text-muted-foreground" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {ingredient.name}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                ماده اولیه شماره #
                {formatNumber(
                  ingredient.id,
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/ingredients/${ingredient.id}/edit`}
            className="
              inline-flex h-9
              items-center justify-center
              gap-2
              rounded-lg
              border border-border
              bg-background
              px-3
              text-xs font-medium
              transition-colors
              hover:bg-accent
            "
          >
            <Pencil className="size-3.5" />
            ویرایش
          </Link>

          <div
            className={[
              "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium",
              ingredient.is_active
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {ingredient.is_active
              ? "فعال"
              : "غیرفعال"}
          </div>
        </div>
      </section>

      {/* Basic Information */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Beaker className="size-4 text-muted-foreground" />

          <h2 className="text-sm font-semibold">
            اطلاعات ماده اولیه
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">
              نام
            </p>

            <p className="mt-2 text-sm font-semibold">
              {ingredient.name}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Scale className="size-3.5 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                نوع واحد
              </p>
            </div>

            <p className="mt-2 text-sm font-semibold">
              {ingredient.unit_type}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              واحد پایه:{" "}
              {ingredient.base_unit}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                تاریخ ایجاد
              </p>
            </div>

            <p className="mt-2 text-sm font-medium">
              {formatDate(
                ingredient.created_at,
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">
              آخرین بروزرسانی
            </p>

            <p className="mt-2 text-sm font-medium">
              {formatDate(
                ingredient.updated_at,
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Inventory Summary */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />

          <h2 className="text-sm font-semibold">
            وضعیت موجودی
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">
              موجودی فعلی
            </p>

            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold">
                {formatDecimal(
                  Number(
                    ingredient.current_stock,
                  ),
                )}
              </span>

              <span className="text-xs text-muted-foreground">
                {ingredient.base_unit}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Coins className="size-3.5 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                ارزش موجودی
              </p>
            </div>

            <p className="mt-2 text-xl font-semibold">
              {formatMoney(
                Number(
                  ingredient.current_inventory_value,
                ),
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">
              میانگین هزینه هر واحد
            </p>

            <p className="mt-2 text-xl font-semibold">
              {formatMoney(
                Number(
                  ingredient.average_unit_cost,
                ),
              )}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              بر اساس واحد پایه
            </p>
          </div>
        </div>
      </section>

      {/* Inventory Transactions Placeholder */}
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">
            گردش موجودی
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            ورود، مصرف، اصلاح و دورریز این ماده اولیه
          </p>
        </div>

        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted">
            <Package className="size-5 text-muted-foreground" />
          </div>

          <p className="mt-3 text-sm font-medium">
            گردش موجودی در مرحله بعد اضافه می‌شود
          </p>

          <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
            صفحه گردش تراکنش‌های انبار با API مربوط به
            InventoryTransaction در مرحله Inventory ساخته خواهد شد.
          </p>
        </div>
      </section>
    </div>
  );
}