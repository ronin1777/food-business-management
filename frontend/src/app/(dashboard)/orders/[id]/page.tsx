"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Package,
  Receipt,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  cancelOrder,
  getOrder,
} from "@/lib/api/orders";

import { CancelOrderDialog } from "@/components/orders/CancelOrderDialog";

import { RecordPaymentDialog } from "@/components/orders/RecordPaymentDialog";

import type {
  OrderDetail,
  OrderPaymentStatus,
  OrderStatus,
} from "@/types/orders";
import OrderInvoiceDialog from "@/components/orders/OrderInvoiceDialog";

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 2,
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getOrderStatus(status: OrderStatus) {
  if (status === "cancelled") {
    return {
      label: "لغو شده",
      className: "bg-destructive/10 text-destructive",
      icon: XCircle,
    };
  }

  return {
    label: "ثبت شده",
    className: "bg-success/10 text-success",
    icon: CheckCircle2,
  };
}

function getPaymentStatus(status: OrderPaymentStatus) {
  switch (status) {
    case "paid":
      return {
        label: "پرداخت شده",
        className: "bg-success/10 text-success",
        icon: CheckCircle2,
      };

    case "partially_paid":
      return {
        label: "نیمه پرداخت",
        className: "bg-warning/10 text-warning",
        icon: Clock3,
      };

    default:
      return {
        label: "پرداخت نشده",
        className: "bg-muted text-muted-foreground",
        icon: CreditCard,
      };
  }
}

type StatusBadgeProps = {
  className: string;
  icon: typeof CheckCircle2;
  label: string;
};

function StatusBadge({
  className,
  icon: Icon,
  label,
}: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-full px-2.5 py-1",
        "text-xs font-medium",
        className,
      ].join(" ")}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{
    id: string;
  }>();

  const orderId = Number(params.id);

  const [order, setOrder] =
    useState<OrderDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [cancelDialogOpen, setCancelDialogOpen] =
    useState(false);

  const [cancelLoading, setCancelLoading] =
    useState(false);

  const [cancelError, setCancelError] =
    useState<string | null>(null);

  const [paymentDialogOpen, setPaymentDialogOpen] =
    useState(false);

  const [invoiceDialogOpen, setInvoiceDialogOpen] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      if (
        !Number.isInteger(orderId) ||
        orderId <= 0
      ) {
        setError("شناسه سفارش نامعتبر است.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response =
          await getOrder(orderId);

        if (cancelled) {
          return;
        }

        setOrder(response);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Order detail error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "خطایی در دریافت سفارش رخ داد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function handleCancelOrder(
    note: string,
  ) {
    if (!order) {
      return;
    }

    try {
      setCancelLoading(true);
      setCancelError(null);

      const response =
        await cancelOrder(
          order.id,
          note,
        );

      setOrder((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          status: response.status,
        };
      });

      setCancelDialogOpen(false);
    } catch (error) {
      console.error(
        "Cancel order error:",
        error,
      );

      setCancelError(
        error instanceof Error
          ? error.message
          : "لغو سفارش با خطا مواجه شد.",
      );
    } finally {
      setCancelLoading(false);
    }
  }

  function openCancelDialog() {
    setCancelError(null);
    setCancelDialogOpen(true);
  }

  function closeCancelDialog() {
    if (cancelLoading) {
      return;
    }

    setCancelDialogOpen(false);
    setCancelError(null);
  }

  function openPaymentDialog() {
    setPaymentDialogOpen(true);
  }

  function closePaymentDialog() {
    setPaymentDialogOpen(false);
  }

  function openInvoiceDialog() {
    setInvoiceDialogOpen(true);
  }

  function closeInvoiceDialog() {
    setInvoiceDialogOpen(false);
  }

  async function handlePaymentSuccess() {
    setPaymentDialogOpen(false);

    try {
      setLoading(true);
      setError(null);

      const updatedOrder =
        await getOrder(orderId);

      setOrder(updatedOrder);
    } catch (error) {
      console.error(
        "Order refresh after payment error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "پرداخت ثبت شد، اما بروزرسانی اطلاعات سفارش انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading && !order) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-[500px] animate-pulse rounded-xl border border-border bg-card" />

          <div className="h-[300px] animate-pulse rounded-xl border border-border bg-card" />
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium text-destructive">
            خطا در دریافت سفارش
          </p>

          <p className="mt-2 text-sm leading-6 text-destructive/80">
            {error}
          </p>

          <Link
            href="/orders"
            className="
              mt-4 inline-flex
              items-center gap-2
              rounded-lg
              border border-border
              bg-card
              px-3.5 py-2
              text-sm font-medium
              transition-colors
              hover:bg-accent
            "
          >
            <ArrowRight className="size-4" />
            بازگشت به سفارش‌ها
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const orderStatus =
    getOrderStatus(order.status);

  const paymentStatus =
    getPaymentStatus(
      order.payment_status,
    );

  const canRecordPayment =
    Boolean(order.customer) &&
    order.payment_status !== "paid" &&
    Number(order.remaining_amount) > 0;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/orders"
              className="
                inline-flex items-center gap-1.5
                text-sm text-muted-foreground
                transition-colors
                hover:text-foreground
              "
            >
              <ArrowRight className="size-4" />
              سفارش‌ها
            </Link>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                سفارش #{formatNumber(order.id)}
              </h1>

              <StatusBadge
                className={
                  orderStatus.className
                }
                icon={orderStatus.icon}
                label={orderStatus.label}
              />
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              جزئیات کامل سفارش و مصرف مواد اولیه
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Invoice */}
            <button
              type="button"
              onClick={openInvoiceDialog}
              className="
                inline-flex h-10
                items-center
                justify-center gap-2
                rounded-lg
                border border-border
                bg-card
                px-3.5
                text-sm font-medium
                shadow-sm
                transition-colors
                hover:bg-accent
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-ring
                focus-visible:ring-offset-2
              "
            >
              <FileText className="size-4" />
              فاکتور
            </button>

            {/* Payment */}
            {canRecordPayment && (
              <button
                type="button"
                onClick={openPaymentDialog}
                className="
                  inline-flex h-10
                  items-center
                  justify-center gap-2
                  rounded-lg
                  bg-primary
                  px-3.5
                  text-sm font-medium
                  text-primary-foreground
                  shadow-sm
                  transition-opacity
                  hover:opacity-90
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-ring
                  focus-visible:ring-offset-2
                "
              >
                <Receipt className="size-4" />
                ثبت پرداخت
              </button>
            )}

            {/* Cancel */}
            {order.status === "completed" && (
              <button
                type="button"
                onClick={openCancelDialog}
                className="
                  inline-flex h-10
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-destructive/20
                  bg-destructive/5
                  px-3.5
                  text-sm font-medium
                  text-destructive
                  transition-colors
                  hover:bg-destructive/10
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-destructive/30
                "
              >
                لغو سفارش
              </button>
            )}
          </div>
        </section>

        {/* Refresh Error */}
        {error && (
          <div className="rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
            <p className="text-sm text-warning">
              اطلاعات سفارش با موفقیت حفظ شده، اما بروزرسانی آن با مشکل مواجه شد.
            </p>
          </div>
        )}

        {/* Main */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Order Items */}
          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Package className="size-4 text-muted-foreground" />
              </div>

              <div>
                <h2 className="text-base font-semibold">
                  اقلام سفارش
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  محصولات و هزینه مواد اولیه
                </p>
              </div>
            </div>

            {order.items.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  این سفارش آیتمی ندارد.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Package className="size-4 text-muted-foreground" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {item.product_name}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            نسخه Recipe:{" "}
                            {item.recipe_version ?? "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-6">
                        <div className="text-left">
                          <p className="text-xs text-muted-foreground">
                            تعداد
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {formatNumber(
                              Number(item.quantity),
                            )}
                          </p>
                        </div>

                        <div className="text-left">
                          <p className="text-xs text-muted-foreground">
                            مبلغ
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {formatMoney(
                              Number(item.total_price),
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Item Metrics */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">
                          قیمت واحد
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatMoney(
                            Number(item.unit_price),
                          )}
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">
                          هزینه مواد
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatMoney(
                            Number(item.material_cost),
                          )}
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">
                          تعداد مواد
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatNumber(
                            item.ingredient_usages.length,
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Ingredient Usages */}
                    {item.ingredient_usages.length > 0 && (
                      <div className="mt-5 border-t border-border/70 pt-4">
                        <p className="mb-3 text-xs font-medium text-muted-foreground">
                          مصرف مواد اولیه
                        </p>

                        <div className="space-y-2">
                          {item.ingredient_usages.map(
                            (usage) => (
                              <div
                                key={usage.id}
                                className="
                                  flex items-center
                                  justify-between
                                  gap-4
                                  rounded-lg
                                  px-3 py-2.5
                                  transition-colors
                                  hover:bg-muted/30
                                "
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm">
                                    {usage.ingredient_name}
                                  </p>

                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    مصرف:{" "}
                                    {formatNumber(
                                      Number(
                                        usage.quantity,
                                      ),
                                    )}
                                  </p>
                                </div>

                                <p className="shrink-0 text-xs font-medium">
                                  {formatMoney(
                                    Number(
                                      usage.total_cost,
                                    ),
                                  )}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">
                وضعیت سفارش
              </h2>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">
                    وضعیت
                  </span>

                  <StatusBadge
                    className={
                      orderStatus.className
                    }
                    icon={orderStatus.icon}
                    label={orderStatus.label}
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">
                    پرداخت
                  </span>

                  <StatusBadge
                    className={
                      paymentStatus.className
                    }
                    icon={paymentStatus.icon}
                    label={paymentStatus.label}
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">
                    تاریخ سفارش
                  </span>

                  <span className="text-xs font-medium">
                    {formatDate(
                      order.ordered_at,
                    )}
                  </span>
                </div>
              </div>
            </section>

            {/* Customer */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">
                مشتری
              </h2>

              <div className="mt-4">
                <p className="text-sm font-medium">
                  {order.customer_name ??
                    "مشتری ثبت نشده"}
                </p>

                {order.customer && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    شناسه مشتری:{" "}
                    {formatNumber(
                      order.customer,
                    )}
                  </p>
                )}
              </div>
            </section>

            {/* Payment Summary */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-muted-foreground" />

                <h2 className="text-sm font-semibold">
                  وضعیت مالی
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">
                    مبلغ سفارش
                  </span>

                  <span className="text-xs font-medium">
                    {formatMoney(
                      Number(
                        order.total_amount,
                      ),
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">
                    پرداخت شده
                  </span>

                  <span className="text-xs font-medium text-success">
                    {formatMoney(
                      Number(
                        order.paid_amount,
                      ),
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-3">
                  <span className="text-xs font-medium">
                    مانده
                  </span>

                  <span
                    className={[
                      "text-sm font-semibold",
                      Number(
                        order.remaining_amount,
                      ) > 0
                        ? "text-warning"
                        : "text-success",
                    ].join(" ")}
                  >
                    {formatMoney(
                      Number(
                        order.remaining_amount,
                      ),
                    )}
                  </span>
                </div>
              </div>

              {canRecordPayment && (
                <button
                  type="button"
                  onClick={openPaymentDialog}
                  className="
                    mt-4 inline-flex w-full
                    h-10
                    items-center
                    justify-center gap-2
                    rounded-lg
                    border border-border
                    bg-background
                    px-3
                    text-sm font-medium
                    transition-colors
                    hover:bg-accent
                  "
                >
                  <Receipt className="size-4" />
                  ثبت پرداخت
                </button>
              )}
            </section>

            {/* Note */}
            {order.note && (
              <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />

                  <h2 className="text-sm font-semibold">
                    یادداشت
                  </h2>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {order.note}
                </p>
              </section>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold">
              خلاصه مالی
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              مبلغ فروش، پرداخت‌ها، هزینه مواد و سود ناخالص
            </p>
          </div>

          <div className="grid gap-px bg-border sm:grid-cols-4">
            <div className="bg-card p-5">
              <p className="text-xs text-muted-foreground">
                مبلغ کل
              </p>

              <p className="mt-2 text-xl font-semibold tracking-tight">
                {formatMoney(
                  Number(
                    order.total_amount,
                  ),
                )}
              </p>
            </div>

            <div className="bg-card p-5">
              <p className="text-xs text-muted-foreground">
                پرداخت شده
              </p>

              <p className="mt-2 text-xl font-semibold tracking-tight text-success">
                {formatMoney(
                  Number(
                    order.paid_amount,
                  ),
                )}
              </p>
            </div>

            <div className="bg-card p-5">
              <p className="text-xs text-muted-foreground">
                مانده
              </p>

              <p className="mt-2 text-xl font-semibold tracking-tight text-warning">
                {formatMoney(
                  Number(
                    order.remaining_amount,
                  ),
                )}
              </p>
            </div>

            <div className="bg-card p-5">
              <p className="text-xs text-muted-foreground">
                سود ناخالص
              </p>

              <p className="mt-2 text-xl font-semibold tracking-tight text-success">
                {formatMoney(
                  Number(
                    order.gross_profit,
                  ),
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Metadata */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <CalendarDays className="size-4 text-muted-foreground" />

            <div>
              <p className="text-xs text-muted-foreground">
                ایجاد شده
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatDate(
                  order.created_at,
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <CalendarDays className="size-4 text-muted-foreground" />

            <div>
              <p className="text-xs text-muted-foreground">
                آخرین بروزرسانی
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatDate(
                  order.updated_at,
                )}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Invoice Dialog */}
      <OrderInvoiceDialog
        open={invoiceDialogOpen}
        order={order}
        onClose={closeInvoiceDialog}
      />

      {/* Cancel Dialog */}
      <CancelOrderDialog
        open={cancelDialogOpen}
        orderId={order.id}
        loading={cancelLoading}
        error={cancelError}
        onClose={closeCancelDialog}
        onConfirm={handleCancelOrder}
      />

      {/* Payment Dialog */}
      <RecordPaymentDialog
        open={paymentDialogOpen}
        orderId={order.id}
        customerId={order.customer}
        remainingAmount={Number(
          order.remaining_amount,
        )}
        onClose={closePaymentDialog}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}