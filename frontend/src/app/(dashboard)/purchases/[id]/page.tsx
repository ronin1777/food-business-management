
"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  FileText,
  Package,
  ReceiptText,
  Truck,
  WalletCards,
} from "lucide-react";
import { use, useEffect, useState } from "react";

import { getPurchase } from "@/lib/api/purchases";
import type { PurchaseDetail } from "@/types/purchases";
import SupplierRefundDialog from "@/components/suppliers/SupplierRefundDialog";

type PurchaseDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 6,
  }).format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function PurchaseDetailPage({
  params,
}: PurchaseDetailPageProps) {
  const { id } = use(params);

  const purchaseId = Number(id);

  const [purchase, setPurchase] =
    useState<PurchaseDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [refundOpen, setRefundOpen] =
    useState(false);

  async function loadPurchase() {
    try {
      setLoading(true);
      setError(null);

      const response = await getPurchase(purchaseId);

      console.log("========== PURCHASE DEBUG ==========");

      console.log("Full purchase response:", response);

      console.log("created_at:", response.created_at);
      console.log("purchased_at:", response.purchased_at);
      console.log("updated_at:", response.updated_at);

      const createdDate = new Date(response.created_at);
      const purchasedDate = new Date(response.purchased_at);
      const updatedDate = new Date(response.updated_at);

      console.log("createdDate:", createdDate);
      console.log("purchasedDate:", purchasedDate);
      console.log("updatedDate:", updatedDate);

      console.log(
        "createdDate valid:",
        !Number.isNaN(createdDate.getTime()),
      );

      console.log(
        "purchasedDate valid:",
        !Number.isNaN(purchasedDate.getTime()),
      );

      console.log(
        "updatedDate valid:",
        !Number.isNaN(updatedDate.getTime()),
      );

      console.log(
        "createdTimestamp:",
        createdDate.getTime(),
      );

      console.log(
        "purchasedTimestamp:",
        purchasedDate.getTime(),
      );

      console.log(
        "updatedTimestamp:",
        updatedDate.getTime(),
      );

      console.log("====================================");

      setPurchase(response.data);
    } catch (error) {
      console.error(
        "Purchase detail error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "خطایی در دریافت اطلاعات خرید رخ داد.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      !Number.isInteger(purchaseId) ||
      purchaseId <= 0
    ) {
      setError("شناسه خرید معتبر نیست.");
      setLoading(false);
      return;
    }

    loadPurchase();
  }, [purchaseId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />

        <div className="h-12 w-64 animate-pulse rounded bg-muted" />

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl border border-border bg-card"
              />
            ),
          )}
        </div>

        <div className="h-80 animate-pulse rounded-xl border border-border bg-card" />

        <div className="h-56 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <CircleAlert className="mx-auto size-6 text-destructive" />

          <p className="mt-3 text-sm font-medium text-destructive">
            خطا در دریافت اطلاعات خرید
          </p>

          <p className="mt-2 text-sm leading-6 text-destructive/80">
            {error ?? "خرید پیدا نشد."}
          </p>

          <Link
            href="/purchases"
            className="
              mt-5 inline-flex items-center gap-2
              rounded-lg border border-border
              bg-background px-3 py-2
              text-sm font-medium
              transition-colors
              hover:bg-accent
            "
          >
            <ArrowRight className="size-4" />
            بازگشت به خریدها
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
          href="/purchases"
          className="
            inline-flex items-center gap-1.5
            text-sm text-muted-foreground
            transition-colors hover:text-foreground
          "
        >
          <ArrowRight className="size-4" />
          خریدها
        </Link>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <ReceiptText className="size-5 text-muted-foreground" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                خرید #{formatNumber(purchase.id)}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                ثبت شده در{" "}
                {formatDateTime(purchase.created_at)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {purchase.supplier && (
              <button
                type="button"
                onClick={() =>
                  setRefundOpen(true)
                }
                className="
                  inline-flex h-10 items-center
                  justify-center gap-2
                  rounded-lg
                  border border-destructive/20
                  bg-destructive/5
                  px-4 text-sm font-medium
                  text-destructive
                  transition-colors
                  hover:bg-destructive/10
                "
              >
                ثبت بازپرداخت
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Purchase Info */}
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />

            <h2 className="text-sm font-semibold">
              اطلاعات خرید
            </h2>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">
              تأمین‌کننده
            </p>

            {purchase.supplier ? (
              <Link
                href={`/suppliers/${purchase.supplier}`}
                className="
                  mt-1.5 inline-flex items-center gap-2
                  text-sm font-medium
                  underline-offset-4
                  hover:underline
                "
              >
                <Truck className="size-3.5 text-muted-foreground" />

                {purchase.supplier_name ??
                  "تأمین‌کننده"}
              </Link>
            ) : (
              <p className="mt-1.5 text-sm font-medium">
                بدون تأمین‌کننده
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                تاریخ خرید
              </p>
            </div>

            <p className="mt-1.5 text-sm font-medium">
              {formatDateTime(
                purchase.purchased_at,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              آخرین بروزرسانی
            </p>

            <p className="mt-1.5 text-sm font-medium">
              {formatDateTime(
                purchase.updated_at,
              )}
            </p>
          </div>
        </div>

        {purchase.note && (
          <div className="border-t border-border px-5 py-4">
            <p className="text-xs text-muted-foreground">
              یادداشت
            </p>

            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6">
              {purchase.note}
            </p>
          </div>
        )}
      </section>

      {/* Items */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-muted-foreground" />

            <div>
              <h2 className="text-sm font-semibold">
                اقلام خرید
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                مواد اولیه ثبت‌شده در این خرید
              </p>
            </div>
          </div>

          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {formatNumber(
              purchase.items.length,
            )}{" "}
            قلم
          </span>
        </div>

        {purchase.items.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center px-6 text-sm text-muted-foreground">
            قلمی برای این خرید ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    ماده اولیه
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    مقدار
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    مقدار پایه
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    قیمت واحد
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    تخفیف
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    مبلغ کل
                  </th>
                </tr>
              </thead>

              <tbody>
                {purchase.items.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="
                        border-b border-border/70
                        last:border-b-0
                        transition-colors
                        hover:bg-muted/20
                      "
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/ingredients/${item.ingredient}`}
                          className="group"
                        >
                          <p className="text-sm font-medium group-hover:underline">
                            {item.ingredient_name}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            ماده #
                            {formatNumber(
                              item.ingredient,
                            )}
                          </p>
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium">
                          {formatNumber(
                            Number(
                              item.quantity,
                            ),
                          )}
                        </span>

                        <span className="mr-1 text-xs text-muted-foreground">
                          {item.unit}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm">
                          {formatNumber(
                            Number(
                              item.base_quantity,
                            ),
                          )}
                        </span>

                        <span className="mr-1 text-xs text-muted-foreground">
                          واحد پایه
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium">
                          {formatMoney(
                            Number(
                              item.unit_price,
                            ),
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {Number(
                          item.discount,
                        ) > 0 ? (
                          <span className="text-sm text-warning">
                            {formatMoney(
                              Number(
                                item.discount,
                              ),
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold">
                          {formatMoney(
                            Number(
                              item.total_price,
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

      {/* Additional Costs */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <WalletCards className="size-4 text-muted-foreground" />

            <div>
              <h2 className="text-sm font-semibold">
                هزینه‌های جانبی
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                هزینه‌های اضافه‌شده به این خرید
              </p>
            </div>
          </div>
        </div>

        {purchase.additional_costs.length ===
        0 ? (
          <div className="px-5 py-6 text-sm text-muted-foreground">
            هزینه جانبی ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    نوع هزینه
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    مبلغ
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    توضیح
                  </th>
                </tr>
              </thead>

              <tbody>
                {purchase.additional_costs.map(
                  (cost) => (
                    <tr
                      key={cost.id}
                      className="border-b border-border/70 last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium">
                          {
                            cost.cost_type_display
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold">
                          {formatMoney(
                            Number(
                              cost.amount,
                            ),
                          )}
                        </span>
                      </td>

                      <td className="max-w-[350px] px-5 py-4">
                        <span className="block truncate text-sm text-muted-foreground">
                          {cost.note || "—"}
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

      {/* Financial Summary */}
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-4 text-muted-foreground" />

            <h2 className="text-sm font-semibold">
              خلاصه مالی
            </h2>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              مجموع اقلام
            </span>

            <span className="text-sm font-medium">
              {formatMoney(
                Number(
                  purchase.items_total,
                ),
              )}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              هزینه‌های جانبی
            </span>

            <span className="text-sm font-medium">
              {formatMoney(
                Number(
                  purchase.additional_costs_total,
                ),
              )}
            </span>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold">
                مبلغ نهایی خرید
              </span>

              <span className="text-xl font-semibold">
                {formatMoney(
                  Number(
                    purchase.grand_total,
                  ),
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Refund Dialog */}
      {purchase.supplier && (
        <SupplierRefundDialog
          open={refundOpen}
          supplierId={purchase.supplier}
          purchaseId={purchase.id}
          onClose={() =>
            setRefundOpen(false)
          }
          onSuccess={() => {
            loadPurchase();
          }}
        />
      )}
    </div>
  );
}
