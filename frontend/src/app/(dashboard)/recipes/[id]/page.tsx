"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChefHat,
  CircleAlert,
  Clock3,
  Package,
  Scale,
} from "lucide-react";
import {
  use,
  useEffect,
  useState,
} from "react";

import { getRecipe } from "@/lib/api/recipes";

import type {
  RecipeDetail,
} from "@/types/recipes";

type RecipeDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat(
    "fa-IR",
  ).format(value);
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

export default function RecipeDetailPage({
  params,
}: RecipeDetailPageProps) {
  const { id } = use(params);

  const recipeId = Number(id);

  const [recipe, setRecipe] =
    useState<RecipeDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (
      !Number.isInteger(recipeId) ||
      recipeId <= 0
    ) {
      setError(
        "شناسه دستور تهیه معتبر نیست.",
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadRecipe() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getRecipe(recipeId);

        if (cancelled) {
          return;
        }

        setRecipe(response);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Recipe detail error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "خطایی در دریافت دستور تهیه رخ داد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRecipe();

    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />

        <div className="h-14 w-64 animate-pulse rounded bg-muted" />

        <div className="grid gap-4 lg:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>

        <div className="h-80 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <CircleAlert className="mx-auto size-6 text-destructive" />

          <p className="mt-3 text-sm font-medium text-destructive">
            خطا در دریافت دستور تهیه
          </p>

          <p className="mt-2 text-sm leading-6 text-destructive/80">
            {error ??
              "دستور تهیه پیدا نشد."}
          </p>

          <Link
            href="/recipes"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <ArrowRight className="size-4" />
            بازگشت به دستور تهیه‌ها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <Link
          href="/recipes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          دستور تهیه‌ها
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
              <ChefHat className="size-5 text-muted-foreground" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {recipe.product_name}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                دستور تهیه نسخه{" "}
                <span className="font-medium text-foreground">
                  v
                  {formatNumber(
                    recipe.version,
                  )}
                </span>
              </p>
            </div>
          </div>

          <div
            className={[
              "inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-medium",
              recipe.is_active
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {recipe.is_active
              ? "فعال"
              : "غیرفعال"}
          </div>
        </div>
      </section>

      {/* Recipe Information */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />

          <h2 className="text-sm font-semibold">
            اطلاعات دستور تهیه
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">
              محصول
            </p>

            <Link
              href={`/products/${recipe.product}`}
              className="mt-2 block text-sm font-medium underline-offset-4 hover:underline"
            >
              {recipe.product_name}
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">
              نسخه
            </p>

            <p className="mt-2 text-lg font-semibold">
              v
              {formatNumber(
                recipe.version,
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Clock3 className="size-3.5 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                شروع اعتبار
              </p>
            </div>

            <p className="mt-2 text-sm font-medium">
              {formatDate(
                recipe.valid_from,
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Clock3 className="size-3.5 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                پایان اعتبار
              </p>
            </div>

            <p className="mt-2 text-sm font-medium">
              {recipe.valid_to
                ? formatDate(
                    recipe.valid_to,
                  )
                : "بدون پایان"}
            </p>
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="size-4 text-muted-foreground" />

              <h2 className="text-sm font-semibold">
                مواد اولیه
              </h2>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              مواد مصرفی این نسخه از دستور تهیه
            </p>
          </div>

          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {formatNumber(
              recipe.items.length,
            )}{" "}
            ماده
          </span>
        </div>

        {recipe.items.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <Package className="size-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-sm font-medium">
              ماده اولیه‌ای ثبت نشده است
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    ماده اولیه
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    مقدار
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    واحد
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    مقدار پایه
                  </th>
                </tr>
              </thead>

              <tbody>
                {recipe.items.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border/70 last:border-b-0 transition-colors hover:bg-muted/20"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Package className="size-4 text-muted-foreground" />
                          </div>

                          <div>
                            <p className="text-sm font-medium">
                              {
                                item.ingredient_name
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              ماده #
                              {formatNumber(
                                item.ingredient,
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold">
                          {formatNumber(
                            Number(
                              item.quantity,
                            ),
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                          {item.unit}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(
                            Number(
                              item.base_quantity,
                            ),
                          )}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}