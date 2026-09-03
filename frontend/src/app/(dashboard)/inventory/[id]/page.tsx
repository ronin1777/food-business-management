"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  FileText,
  Package,
  User,
} from "lucide-react";

import { getInventoryTransaction } from "@/lib/api/inventory";

import type {
  InventoryTransactionDetail,
  InventoryTransactionType,
} from "@/types/inventory";

type InventoryTransactionDetailPageProps = {
  params: Promise<{ id: string }>;
};

const TRANSACTION_TYPE_LABELS: Record<
  InventoryTransactionType,
  string
> = {
  purchase: "خرید",
  order_usage: "مصرف سفارش",
  waste: "دورریز",
  adjustment: "اصلاح موجودی",
  reversal: "معکوس",
};

function formatNumber(
  value: number,
  maximumFractionDigits = 3,
) {
  return Number(value).toLocaleString("fa-IR", {
    maximumFractionDigits,
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function InventoryTransactionDetailPage({
  params,
}: InventoryTransactionDetailPageProps) {
  const { id } = use(params);

  const transactionId = Number(id);

  const [transaction, setTransaction] =
    useState<InventoryTransactionDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(transactionId)) {
      setError("شناسه تراکنش نامعتبر است.");
      setLoading(false);
      return;
    }

    async function loadTransaction() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getInventoryTransaction(
            transactionId,
          );

        setTransaction(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "خطا در دریافت اطلاعات تراکنش.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransaction();
  }, [transactionId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          در حال دریافت اطلاعات تراکنش...
        </p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive">
            {error ?? "تراکنش پیدا نشد."}
          </p>

          <Link
            href="/inventory"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            بازگشت به گردش موجودی
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  const isIncrease = transaction.quantity > 0;

  const transactionType =
    TRANSACTION_TYPE_LABELS[
      transaction.transaction_type
    ] ?? transaction.transaction_type_display;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/inventory"
          className="flex size-9 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
          <Package className="size-5 text-muted-foreground" />
        </div>

        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            جزئیات تراکنش
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            شناسه تراکنش: {transaction.id}
          </p>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-xl ${
                isIncrease
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-red-500/10 text-red-600"
              }`}
            >
              {isIncrease ? (
                <ArrowDownLeft className="size-5" />
              ) : (
                <ArrowUpRight className="size-5" />
              )}
            </div>

            <div>
              <h2 className="font-semibold">
                {transactionType}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {isIncrease
                  ? "افزایش موجودی"
                  : "کاهش موجودی"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Ingredient */}
          <div>
            <p className="text-xs text-muted-foreground">
              ماده اولیه
            </p>

            <Link
              href={`/ingredients/${transaction.ingredient}`}
              className="mt-2 inline-block text-sm font-medium hover:underline"
            >
              {transaction.ingredient_name}
            </Link>
          </div>

          {/* Quantity */}
          <div>
            <p className="text-xs text-muted-foreground">
              مقدار
            </p>

            <p
              className={`mt-2 text-lg font-semibold ${
                isIncrease
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {isIncrease ? "+" : ""}
              {formatNumber(transaction.quantity)}
            </p>
          </div>

          {/* Unit Cost */}
          <div>
            <p className="text-xs text-muted-foreground">
              بهای واحد
            </p>

            <p className="mt-2 text-sm font-medium">
              {formatNumber(
                transaction.unit_cost,
                6,
              )}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                تومان
              </span>
            </p>
          </div>

          {/* Total Cost */}
          <div>
            <p className="text-xs text-muted-foreground">
              ارزش تراکنش
            </p>

            <p className="mt-2 text-sm font-semibold">
              {formatNumber(
                transaction.total_cost,
                2,
              )}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                تومان
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Information */}
      <div className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">
            اطلاعات تراکنش
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            جزئیات ثبت و منبع تراکنش
          </p>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Type */}
          <div>
            <p className="text-xs text-muted-foreground">
              نوع عملیات
            </p>

            <p className="mt-2 text-sm font-medium">
              {transactionType}
            </p>
          </div>

          {/* Date */}
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                تاریخ ثبت
              </p>
            </div>

            <p className="mt-2 text-sm font-medium">
              {formatDateTime(
                transaction.created_at,
              )}
            </p>
          </div>

          {/* Created By */}
          <div>
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                ثبت‌کننده
              </p>
            </div>

            <p className="mt-2 text-sm font-medium">
              {transaction.created_by
                ? `کاربر #${transaction.created_by}`
                : "سیستم"}
            </p>
          </div>
        </div>
      </div>

      {/* Source */}
      <div className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">
            منبع تراکنش
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            ارتباط این تراکنش با سایر بخش‌های سیستم
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {/* Purchase */}
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">
              آیتم خرید
            </p>

            {transaction.purchase_item ? (
              <p className="mt-2 text-sm font-medium">
                خرید #{transaction.purchase_item}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                مرتبط نیست
              </p>
            )}
          </div>

          {/* Order */}
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">
              مصرف سفارش
            </p>

            {transaction.order_item_ingredient ? (
              <p className="mt-2 text-sm font-medium">
                آیتم سفارش #
                {transaction.order_item_ingredient}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                مرتبط نیست
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />

            <h2 className="font-semibold">
              توضیحات
            </h2>
          </div>
        </div>

        <div className="p-5">
          {transaction.note ? (
            <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
              {transaction.note}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              توضیحی برای این تراکنش ثبت نشده است.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}