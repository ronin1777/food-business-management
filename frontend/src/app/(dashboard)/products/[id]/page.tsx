"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChefHat,
  CircleAlert,
  Package,
  Pencil,
  Plus,
  Tag,
} from "lucide-react";
import {
  use,
  useEffect,
  useState,
} from "react";

import { getProduct } from "@/lib/api/products";
import { getRecipes } from "@/lib/api/recipes";

import type { Product } from "@/types/products";
import type { Recipe } from "@/types/recipes";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat(
    "fa-IR",
  ).format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
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

export default function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = use(params);

  const productId = Number(id);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [recipes, setRecipes] =
    useState<Recipe[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [recipesLoading, setRecipesLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [recipesError, setRecipesError] =
    useState<string | null>(null);

  useEffect(() => {
    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      setError(
        "شناسه محصول معتبر نیست.",
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getProduct(productId);

        if (cancelled) {
          return;
        }

        setProduct(response);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Product detail error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "خطایی در دریافت اطلاعات محصول رخ داد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return;
    }

    let cancelled = false;

    async function loadRecipes() {
      try {
        setRecipesLoading(true);
        setRecipesError(null);

        /*
         * Backend فعلاً filter بر اساس product_id ندارد.
         * بنابراین Recipeها را بر اساس نام محصول search می‌کنیم
         * و در فرانت با product id محدود می‌کنیم.
         */
        const productResponse =
          await getProduct(productId);

        const response =
          await getRecipes({
            page: 1,
            pageSize: 100,
            search:
              productResponse.name,
            ordering: "-created_at",
          });

        if (cancelled) {
          return;
        }

        setRecipes(
          response.data.results.filter(
            (recipe) =>
              recipe.product ===
              productId,
          ),
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Product recipes error:",
          error,
        );

        setRecipesError(
          error instanceof Error
            ? error.message
            : "دریافت دستور تهیه‌های محصول انجام نشد.",
        );
      } finally {
        if (!cancelled) {
          setRecipesLoading(false);
        }
      }
    }

    loadRecipes();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />

        <div className="h-14 w-64 animate-pulse rounded bg-muted" />

        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>

        <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <CircleAlert className="mx-auto size-6 text-destructive" />

          <p className="mt-3 text-sm font-medium text-destructive">
            خطا در دریافت اطلاعات محصول
          </p>

          <p className="mt-2 text-sm leading-6 text-destructive/80">
            {error ??
              "محصول پیدا نشد."}
          </p>

          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <ArrowRight className="size-4" />
            بازگشت به محصولات
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
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowRight className="size-4" />
            محصولات
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
              <Package className="size-5 text-muted-foreground" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {product.name}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                محصول شماره #
                {formatNumber(
                  product.id,
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/products/${product.id}/edit`}
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
              product.is_active
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {product.is_active
              ? "فعال"
              : "غیرفعال"}
          </div>
        </div>
      </section>

      {/* Product Information */}
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-muted-foreground" />

            <h2 className="text-sm font-semibold">
              اطلاعات محصول
            </h2>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">
              نام محصول
            </p>

            <p className="mt-1.5 text-sm font-medium">
              {product.name}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              قیمت فروش
            </p>

            <p className="mt-1.5 text-sm font-semibold">
              {formatMoney(
                Number(
                  product.selling_price,
                ),
              )}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                تاریخ ایجاد
              </p>
            </div>

            <p className="mt-1.5 text-sm font-medium">
              {formatDate(
                product.created_at,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              آخرین بروزرسانی
            </p>

            <p className="mt-1.5 text-sm font-medium">
              {formatDate(
                product.updated_at,
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Recipes */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ChefHat className="size-4 text-muted-foreground" />

              <h2 className="text-sm font-semibold">
                دستور تهیه
              </h2>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              نسخه‌های دستور تهیه این محصول
            </p>
          </div>

          <Link
            href={`/recipes/new?product=${product.id}`}
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
            <Plus className="size-3.5" />
            ایجاد دستور تهیه
          </Link>
        </div>

        {recipesLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({
              length: 2,
            }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : recipesError ? (
          <div className="p-5">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {recipesError}
            </div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <ChefHat className="size-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-sm font-medium">
              هنوز دستور تهیه‌ای ثبت نشده
            </p>

            <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
              برای این محصول یک Recipe ایجاد کنید تا مواد اولیه مورد نیاز آن مشخص شود.
            </p>

            <Link
              href={`/recipes/new?product=${product.id}`}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="size-3.5" />
              ایجاد دستور تهیه
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/70">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/20"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                      v
                      {formatNumber(
                        recipe.version,
                      )}
                    </span>

                    {recipe.is_active && (
                      <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-medium text-success">
                        فعال
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    شروع اعتبار:{" "}
                    {formatDate(
                      recipe.valid_from,
                    )}
                  </p>
                </div>

                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}