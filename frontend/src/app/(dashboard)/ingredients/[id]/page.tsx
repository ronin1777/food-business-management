"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Beaker,
  Edit,
  Package,
} from "lucide-react";

import { getIngredient } from "@/lib/api/ingredients";
import { getInventoryTransactions } from "@/lib/api/inventory";

import type { Ingredient } from "@/types/ingredients";
import type { InventoryTransaction } from "@/types/inventory";

type IngredientDetailPageProps = {
  params: Promise<{ id: string }>;
};

const UNIT_TYPE_LABELS: Record<string, string> = {
  weight: "وزنی",
  volume: "حجمی",
  count: "عددی",
};


export default function IngredientDetailPage({
  params,
}: IngredientDetailPageProps) {
  const { id } = use(params);

  const ingredientId = Number(id);

  const [ingredient, setIngredient] =
    useState<Ingredient | null>(null);

  const [transactions, setTransactions] =
    useState<InventoryTransaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] =
    useState(true);

  const [error, setError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(ingredientId)) {
      setError("شناسه ماده اولیه نامعتبر است.");
      setLoading(false);
      return;
    }

    async function loadIngredient() {
  try {
    setLoading(true);
    setError(null);

    const ingredientData =
      await getIngredient(ingredientId);

    console.log(
      "INGREDIENT DETAIL DATA:",
      ingredientData,
    );

    setIngredient(ingredientData);
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "خطا در دریافت اطلاعات ماده اولیه.",
    );
  } finally {
    setLoading(false);
  }
}

    loadIngredient();
  }, [ingredientId]);

  useEffect(() => {
    if (!Number.isInteger(ingredientId)) {
      return;
    }

    async function loadTransactions() {
      try {
        setTransactionsLoading(true);
        setTransactionsError(null);

        const response =
          await getInventoryTransactions({
            ingredient: ingredientId,
            page: 1,
            pageSize: 10,
            ordering: "-created_at",
          });

        setTransactions(response.data.results);
      } catch (error) {
        setTransactionsError(
          error instanceof Error
            ? error.message
            : "خطا در دریافت گردش موجودی.",
        );
      } finally {
        setTransactionsLoading(false);
      }
    }

    loadTransactions();
  }, [ingredientId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          در حال دریافت اطلاعات...
        </p>
      </div>
    );
  }

  if (error || !ingredient) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive">
            {error ?? "ماده اولیه پیدا نشد."}
          </p>

          <Link
            href="/ingredients"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            بازگشت به مواد اولیه
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  const unitTypeLabel =
    UNIT_TYPE_LABELS[ingredient.unit_type] ??
    ingredient.unit_type;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/ingredients"
            className="flex size-9 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <Beaker className="size-5 text-muted-foreground" />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {ingredient.name}
            </h1>

            <p className="mt-1 text-xs text-muted-foreground">
              شناسه: {ingredient.id}
            </p>
          </div>
        </div>

        <Link
          href={`/ingredients/${ingredient.id}/edit`}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Edit className="size-4" />
          ویرایش
        </Link>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between rounded-xl border bg-background px-5 py-4">
        <div>
          <p className="text-sm font-medium">
            وضعیت ماده اولیه
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            وضعیت فعال یا غیرفعال بودن ماده اولیه
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            ingredient.is_active
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {ingredient.is_active ? "فعال" : "غیرفعال"}
        </span>
      </div>

      {/* Basic Information */}
      <div className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">
            اطلاعات پایه
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            مشخصات اصلی ماده اولیه
          </p>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">
              نام ماده اولیه
            </p>

            <p className="mt-2 text-sm font-medium">
              {ingredient.name}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              نوع واحد
            </p>

            <p className="mt-2 text-sm font-medium">
              {unitTypeLabel}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              واحد پایه
            </p>

            <p className="mt-2 text-sm font-medium">
              {ingredient.base_unit}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              تاریخ ایجاد
            </p>

            <p className="mt-2 text-sm font-medium">
              {new Date(
                ingredient.created_at,
              ).toLocaleDateString("fa-IR")}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              آخرین بروزرسانی
            </p>

            <p className="mt-2 text-sm font-medium">
              {new Date(
                ingredient.updated_at,
              ).toLocaleDateString("fa-IR")}
            </p>
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">
            خلاصه موجودی
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            وضعیت فعلی موجودی و ارزش آن
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Current Stock */}
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">
              موجودی فعلی
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">
                {Number(
                  ingredient.current_stock,
                ).toLocaleString("fa-IR")}
              </span>

              <span className="text-sm text-muted-foreground">
                {ingredient.base_unit}
              </span>
            </div>
          </div>

          {/* Inventory Value */}
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">
              ارزش موجودی
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">
                {Number(
                  ingredient.current_inventory_value,
                ).toLocaleString("fa-IR")}
              </span>

              <span className="text-sm text-muted-foreground">
                تومان
              </span>
            </div>
          </div>

          {/* Average Unit Cost */}
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">
              بهای میانگین هر واحد
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">
                {Number(
                  ingredient.average_unit_cost,
                ).toLocaleString("fa-IR", {
                  maximumFractionDigits: 6,
                })}
              </span>

              <span className="text-sm text-muted-foreground">
                تومان
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Transactions */}
      <div className="rounded-xl border bg-background">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-semibold">
              گردش موجودی
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              آخرین تغییرات موجودی این ماده اولیه
            </p>
          </div>

          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Package className="size-4 text-muted-foreground" />
          </div>
        </div>

        {transactionsLoading ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              در حال دریافت گردش موجودی...
            </p>
          </div>
        ) : transactionsError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-destructive">
              {transactionsError}
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="mx-auto size-8 text-muted-foreground/50" />

            <p className="mt-3 text-sm font-medium">
              گردش موجودی ثبت نشده است
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              هنوز هیچ تراکنشی برای این ماده اولیه ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20 text-right text-muted-foreground">
                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    نوع عملیات
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    مقدار
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    بهای واحد
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    ارزش
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    تاریخ
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions.map(
                  (transaction) => {
                    const isIncrease =
                      transaction.quantity > 0;

                    return (
                      <tr
                        key={transaction.id}
                        className="border-b last:border-0"
                      >
                        {/* Transaction Type */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                                isIncrease
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-red-500/10 text-red-600"
                              }`}
                            >
                              {isIncrease ? (
                                <ArrowDownLeft className="size-4" />
                              ) : (
                                <ArrowUpRight className="size-4" />
                              )}
                            </div>

                            <span className="whitespace-nowrap font-medium">
                              {
                                transaction.transaction_type_display
                              }
                            </span>
                          </div>
                        </td>

                        {/* Quantity */}
                        <td
                          className={`whitespace-nowrap px-5 py-4 font-medium ${
                            isIncrease
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {isIncrease ? "+" : ""}

                          {Number(
                            transaction.quantity,
                          ).toLocaleString("fa-IR")}

                          <span className="mr-1 text-xs font-normal">
                            {ingredient.base_unit}
                          </span>
                        </td>

                        {/* Unit Cost */}
                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                          {Number(
                            transaction.unit_cost,
                          ).toLocaleString(
                            "fa-IR",
                            {
                              maximumFractionDigits: 6,
                            },
                          )}

                          <span className="mr-1 text-xs">
                            تومان
                          </span>
                        </td>

                        {/* Total Cost */}
                        <td className="whitespace-nowrap px-5 py-4 font-medium">
                          {Number(
                            transaction.total_cost,
                          ).toLocaleString(
                            "fa-IR",
                            {
                              maximumFractionDigits: 2,
                            },
                          )}

                          <span className="mr-1 text-xs font-normal text-muted-foreground">
                            تومان
                          </span>
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                          {new Date(
                            transaction.created_at,
                          ).toLocaleDateString(
                            "fa-IR",
                          )}
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
    </div>
  );
}