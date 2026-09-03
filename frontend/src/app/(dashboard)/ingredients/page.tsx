"use client";

import Link from "next/link";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowLeft,
  Beaker,
  Plus,
  Search,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import {
  getIngredients,
} from "@/lib/api/ingredients";

import type {
  Ingredient,
} from "@/types/ingredients";

const PAGE_SIZE = 20;

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
      month: "short",
      day: "numeric",
    },
  ).format(new Date(value));
}

export default function IngredientsPage() {
  const [ingredients, setIngredients] =
    useState<Ingredient[]>([]);

  const [search, setSearch] =
    useState("");

  const [ordering, setOrdering] =
    useState("name");

  const [page, setPage] =
    useState(1);

  const [totalCount, setTotalCount] =
    useState(0);

  const [next, setNext] =
    useState<string | null>(null);

  const [previous, setPrevious] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadIngredients() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getIngredients({
            page,
            pageSize: PAGE_SIZE,
            search:
              search.trim() || undefined,
            ordering,
          });
          console.log("INGREDIENTS LIST RESPONSE:", response);

        if (cancelled) {
          return;
        }

        setIngredients(
          response.data.results,
        );

        setTotalCount(
          response.data.count,
        );

        setNext(response.data.next);
        setPrevious(
          response.data.previous,
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Ingredients error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "خطایی در دریافت مواد اولیه رخ داد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timeout =
      window.setTimeout(
        loadIngredients,
        search ? 300 : 0,
      );

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    page,
    search,
    ordering,
  ]);

  const pageCount = Math.max(
    1,
    Math.ceil(
      totalCount / PAGE_SIZE,
    ),
  );

  const hasNext = Boolean(next);
  const hasPrevious =
    Boolean(previous);

  function toggleOrdering() {
    setOrdering((current) =>
      current === "name"
        ? "-name"
        : "name",
    );

    setPage(1);
  }

  function goToPrevious() {
    if (!hasPrevious) {
      return;
    }

    setPage((current) =>
      Math.max(1, current - 1),
    );
  }

  function goToNext() {
    if (!hasNext) {
      return;
    }

    setPage((current) => current + 1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            مدیریت مواد اولیه
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            مواد اولیه
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            مشاهده و مدیریت مواد اولیه و موجودی آن‌ها
          </p>
        </div>

        <Link
          href="/ingredients/new"
          className="
            inline-flex h-10
            items-center justify-center
            gap-2
            rounded-lg
            bg-primary
            px-3.5
            text-sm font-medium
            text-primary-foreground
            shadow-sm
            transition-opacity
            hover:opacity-90
          "
        >
          <Plus className="size-4" />
          ماده اولیه جدید
        </Link>
      </section>

      {/* Main Card */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value,
                );
                setPage(1);
              }}
              placeholder="جستجوی نام ماده اولیه..."
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

          <button
            type="button"
            onClick={toggleOrdering}
            className="
              inline-flex h-10
              items-center justify-center
              gap-2
              rounded-lg
              border border-input
              bg-background
              px-3
              text-sm font-medium
              transition-colors
              hover:bg-accent
            "
          >
            {ordering === "name" ? (
              <ArrowDownAZ className="size-4" />
            ) : (
              <ArrowUpAZ className="size-4" />
            )}

            <span>نام</span>
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="divide-y divide-border/70">
            {Array.from({
              length: 7,
            }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="size-10 shrink-0 animate-pulse rounded-lg bg-muted" />

                <div className="min-w-0 flex-1">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />

                  <div className="mt-2 h-3 w-20 animate-pulse rounded bg-muted" />
                </div>

                <div className="hidden h-4 w-20 animate-pulse rounded bg-muted md:block" />

                <div className="hidden h-4 w-28 animate-pulse rounded bg-muted lg:block" />

                <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] items-center justify-center px-6">
            <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
              <p className="text-sm font-medium text-destructive">
                خطا در دریافت مواد اولیه
              </p>

              <p className="mt-2 text-sm leading-6 text-destructive/80">
                {error}
              </p>
            </div>
          </div>
        ) : ingredients.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Beaker className="size-5 text-muted-foreground" />
            </div>

            <p className="mt-4 text-sm font-medium">
              ماده اولیه‌ای پیدا نشد
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              عبارت جستجو را تغییر دهید یا اولین ماده اولیه را ثبت کنید.
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      ماده اولیه
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      واحد پایه
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      موجودی
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      میانگین هزینه واحد
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      وضعیت
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      عملیات
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {ingredients.map(
                    (ingredient) => (
                      <tr
                        key={
                          ingredient.id
                        }
                        className="
                          border-b border-border/70
                          last:border-b-0
                          transition-colors
                          hover:bg-muted/20
                        "
                      >
                        {/* Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <Beaker className="size-4 text-muted-foreground" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {
                                  ingredient.name
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                #
                                {formatNumber(
                                  ingredient.id,
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Unit */}
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium">
                            {
                              ingredient.base_unit
                            }
                          </span>
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-4">
                          <div>
                            <span className="text-sm font-medium">
                              {formatNumber(
                                Number(
                                  ingredient.current_stock,
                                ),
                              )}
                            </span>

                            <span className="mr-1 text-xs text-muted-foreground">
                              {
                                ingredient.base_unit
                              }
                            </span>
                          </div>
                        </td>

                        {/* Average Cost */}
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium">
                            {formatMoney(
                              Number(
                                ingredient.average_unit_cost,
                              ),
                            )}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {ingredient.is_active ? (
                            <span className="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                              فعال
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                              غیرفعال
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-left">
                          <Link
                            href={`/ingredients/${ingredient.id}`}
                            className="
                              inline-flex
                              items-center gap-1.5
                              rounded-md
                              px-2.5 py-1.5
                              text-xs font-medium
                              text-muted-foreground
                              transition-colors
                              hover:bg-accent
                              hover:text-foreground
                            "
                          >
                            مشاهده
                            <ArrowLeft className="size-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                مجموع{" "}
                <span className="font-medium text-foreground">
                  {formatNumber(
                    totalCount,
                  )}
                </span>{" "}
                ماده اولیه
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!hasPrevious}
                  onClick={
                    goToPrevious
                  }
                  className="
                    rounded-lg
                    border border-border
                    px-3 py-2
                    text-xs font-medium
                    transition-colors
                    hover:bg-accent
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  قبلی
                </button>

                <span className="min-w-20 text-center text-xs text-muted-foreground">
                  صفحه{" "}
                  <span className="font-medium text-foreground">
                    {formatNumber(
                      page,
                    )}
                  </span>{" "}
                  از{" "}
                  <span className="font-medium text-foreground">
                    {formatNumber(
                      pageCount,
                    )}
                  </span>
                </span>

                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={goToNext}
                  className="
                    rounded-lg
                    border border-border
                    px-3 py-2
                    text-xs font-medium
                    transition-colors
                    hover:bg-accent
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  بعدی
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}