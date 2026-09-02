"use client";

import Link from "next/link";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowLeft,
  Plus,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import { getCustomers } from "@/lib/api/customers";

import type {
  Customer,
} from "@/types/customers";

const PAGE_SIZE = 20;

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(
    value,
  );
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

export default function CustomersPage() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

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

    async function loadCustomers() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getCustomers({
            page,
            pageSize: PAGE_SIZE,
            search: search.trim() || undefined,
            ordering,
          });

        if (cancelled) {
          return;
        }

        setCustomers(
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
          "Customers error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "خطایی در دریافت مشتری‌ها رخ داد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timeout =
      window.setTimeout(
        loadCustomers,
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
            مدیریت مشتریان
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            مشتری‌ها
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            مشاهده و مدیریت مشتری‌های کسب‌وکار
          </p>
        </div>

        <Link
          href="/customers/new"
          className="
            inline-flex h-10
            items-center justify-center gap-2
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
          مشتری جدید
        </Link>
      </section>

      {/* Main Card */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center">
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
              placeholder="جستجوی نام، تلفن یا یادداشت..."
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
              items-center justify-center gap-2
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

          <button
            type="button"
            onClick={() => {
              setPage(1);
              setSearch(search);
            }}
            className="
              inline-flex h-10
              items-center justify-center
              rounded-lg
              border border-input
              bg-background
              px-3
              text-sm
              transition-colors
              hover:bg-accent
            "
            aria-label="بروزرسانی"
          >
            <RefreshCw
              className={[
                "size-4",
                loading
                  ? "animate-spin"
                  : "",
              ].join(" ")}
            />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="divide-y divide-border/70">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="size-10 shrink-0 animate-pulse rounded-lg bg-muted" />

                <div className="min-w-0 flex-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />

                  <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
                </div>

                <div className="hidden h-6 w-16 animate-pulse rounded-full bg-muted sm:block" />

                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] items-center justify-center px-6">
            <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
              <p className="text-sm font-medium text-destructive">
                خطا در دریافت مشتری‌ها
              </p>

              <p className="mt-2 text-sm leading-6 text-destructive/80">
                {error}
              </p>
            </div>
          </div>
        ) : customers.length ===
          0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <UserRound className="size-5 text-muted-foreground" />
            </div>

            <p className="mt-4 text-sm font-medium">
              مشتری‌ای پیدا نشد
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              عبارت جستجو را تغییر دهید یا اولین مشتری کسب‌وکار را ثبت کنید.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      مشتری
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      تلفن
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      وضعیت
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      تاریخ ایجاد
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      عملیات
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map(
                    (customer) => (
                      <tr
                        key={customer.id}
                        className="
                          border-b border-border/70
                          transition-colors
                          last:border-b-0
                          hover:bg-muted/20
                        "
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <UserRound className="size-4 text-muted-foreground" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {
                                  customer.name
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                #
                                {formatNumber(
                                  customer.id,
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-muted-foreground">
                            {customer.phone ||
                              "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {customer.is_active ? (
                            <span className="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                              فعال
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                              غیرفعال
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(
                              customer.created_at,
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-left">
                          <Link
                            href={`/customers/${customer.id}`}
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

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                مجموع{" "}
                <span className="font-medium text-foreground">
                  {formatNumber(
                    totalCount,
                  )}
                </span>{" "}
                مشتری
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