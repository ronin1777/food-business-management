"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
} from "lucide-react";

import Link from "next/link";

import { getOrders } from "@/lib/api/orders";

import type {
  Order,
  OrderFilters,
} from "@/types/orders";

import { OrdersFilters } from "@/components/orders/OrdersFilters";
import { OrdersTable } from "@/components/orders/OrdersTable";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(
    [],
  );

  const [filters, setFilters] =
    useState<OrderFilters>({
      page: 1,
      pageSize: 20,
      ordering: "-ordered_at",
    });

  const [totalCount, setTotalCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [next, setNext] =
    useState<string | null>(null);

  const [previous, setPrevious] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getOrders(filters);

        if (cancelled) {
          return;
        }

        setOrders(
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
          "Orders error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "خطایی در دریافت سفارش‌ها رخ داد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const currentPage =
    filters.page ?? 1;

  const hasNext = Boolean(next);
  const hasPrevious =
    Boolean(previous);

  const pageCount = useMemo(() => {
    return Math.max(
      1,
      Math.ceil(
        totalCount /
          (filters.pageSize ?? 20),
      ),
    );
  }, [
    totalCount,
    filters.pageSize,
  ]);

  function handleFiltersChange(
    nextFilters: OrderFilters,
  ) {
    setFilters(nextFilters);
  }

  function goToPrevious() {
    if (!hasPrevious) {
      return;
    }

    setFilters((current) => ({
      ...current,
      page: Math.max(
        1,
        (current.page ?? 1) - 1,
      ),
    }));
  }

  function goToNext() {
    if (!hasNext) {
      return;
    }

    setFilters((current) => ({
      ...current,
      page: (current.page ?? 1) + 1,
    }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            فروش
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            سفارش‌ها
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            مدیریت و مشاهده سفارش‌های کسب‌وکار
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setFilters((current) => ({
                ...current,
                page: current.page ?? 1,
              }))
            }
            className="
              inline-flex h-10
              items-center gap-2
              rounded-lg
              border border-border
              bg-card
              px-3
              text-sm
              font-medium
              shadow-sm
              transition-colors
              hover:bg-accent
            "
          >
            <RefreshCw className="size-4" />

            <span className="hidden sm:inline">
              بروزرسانی
            </span>
          </button>

          <Link
            href="/orders/new"
            className="
              inline-flex h-10
              items-center gap-2
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

            <span>
              سفارش جدید
            </span>
          </Link>
        </div>
      </section>

      {/* Main Card */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Filters */}
        <OrdersFilters
          filters={filters}
          onChange={handleFiltersChange}
        />

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="size-4 animate-spin" />

              <span>
                در حال دریافت سفارش‌ها...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[400px] items-center justify-center px-6">
            <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
              <p className="text-sm font-medium text-destructive">
                خطا در دریافت سفارش‌ها
              </p>

              <p className="mt-2 text-sm leading-6 text-destructive/80">
                {error}
              </p>
            </div>
          </div>
        ) : (
          <>
            <OrdersTable
              orders={orders}
            />

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                مجموع{" "}
                <span className="font-medium text-foreground">
                  {new Intl.NumberFormat(
                    "fa-IR",
                  ).format(totalCount)}
                </span>{" "}
                سفارش
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!hasPrevious}
                  onClick={goToPrevious}
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
                    {new Intl.NumberFormat(
                      "fa-IR",
                    ).format(currentPage)}
                  </span>{" "}
                  از{" "}
                  <span className="font-medium text-foreground">
                    {new Intl.NumberFormat(
                      "fa-IR",
                    ).format(pageCount)}
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