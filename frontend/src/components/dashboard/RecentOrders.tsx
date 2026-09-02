"use client";

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  ShoppingBag,
  XCircle,
} from "lucide-react";

import type {
  DashboardRecentOrder,
} from "@/types/dashboard";

type RecentOrdersProps = {
  orders: DashboardRecentOrder[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(
    value,
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getOrderStatus(
  status: string,
  paymentStatus: string,
) {
  if (status === "cancelled") {
    return {
      label: "لغو شده",
      className:
        "bg-destructive/10 text-destructive",
      icon: XCircle,
    };
  }

  if (paymentStatus === "paid") {
    return {
      label: "پرداخت شده",
      className:
        "bg-success/10 text-success",
      icon: CheckCircle2,
    };
  }

  if (
    paymentStatus === "partially_paid"
  ) {
    return {
      label: "نیمه پرداخت",
      className:
        "bg-warning/10 text-warning",
      icon: Clock3,
    };
  }

  return {
    label: "پرداخت نشده",
    className:
      "bg-muted text-muted-foreground",
    icon: CreditCard,
  };
}

export function RecentOrders({
  orders,
}: RecentOrdersProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            سفارش‌های اخیر
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            آخرین سفارش‌های ثبت‌شده
          </p>
        </div>

        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <ShoppingBag className="size-4 text-muted-foreground" />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="size-5 text-muted-foreground" />
          </div>

          <p className="mt-3 text-sm font-medium">
            سفارشی ثبت نشده است
          </p>

          <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
            سفارش‌های جدید پس از ثبت در این بخش نمایش داده خواهند شد.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/70">
          {orders.map((order) => {
            const status =
              getOrderStatus(
                order.status,
                order.payment_status,
              );

            const StatusIcon =
              status.icon;

            return (
              <div
                key={order.id}
                className="
                  flex items-center gap-3
                  px-5 py-4
                  transition-colors
                  hover:bg-muted/30
                "
              >
                <div
                  className="
                    flex size-9 shrink-0
                    items-center justify-center
                    rounded-lg
                    bg-muted
                    text-xs font-semibold
                    text-muted-foreground
                  "
                >
                  #{formatNumber(order.id)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {order.customer_name}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(
                      order.ordered_at,
                    )}
                  </p>
                </div>

                <span
                  className="
                    hidden items-center gap-1.5
                    rounded-full
                    px-2.5 py-1
                    text-[11px] font-medium
                    sm:inline-flex
                  "
                >
                  <span
                    className={[
                      "inline-flex items-center gap-1.5",
                      "rounded-full px-2.5 py-1",
                      status.className,
                    ].join(" ")}
                  >
                    <StatusIcon className="size-3" />
                    {status.label}
                  </span>
                </span>

                <div className="shrink-0 text-left">
                  <span className="text-xs font-medium text-muted-foreground">
                    سفارش
                  </span>

                  <p className="mt-0.5 text-xs font-semibold">
                    #{formatNumber(order.id)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}