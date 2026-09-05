
import {
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

import type { Order } from "@/types/orders";

import { OrdersStatusBadge } from "./OrdersStatusBadge";

type OrdersTableProps = {
  orders: Order[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

export function OrdersTable({
  orders,
}: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-5 text-muted-foreground" />
        </div>

        <p className="mt-4 text-sm font-medium">
          سفارشی پیدا نشد
        </p>

        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          با تغییر فیلترها یا ثبت سفارش جدید، اطلاعات اینجا نمایش داده می‌شود.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
              سفارش
            </th>

            <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
              مشتری
            </th>

            <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
              وضعیت
            </th>

            <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
              پرداخت
            </th>

            <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
              تاریخ
            </th>

            <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
              عملیات
            </th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="
                border-b border-border/70
                transition-colors
                last:border-b-0
                hover:bg-muted/20
              "
            >
              <td className="px-5 py-4">
                <span className="text-sm font-semibold">
                  #{order.id}
                </span>
              </td>

              <td className="px-5 py-4">
                <div>
                  <p className="text-sm font-medium">
                    {order.customer_name ||
                      "مشتری ثبت نشده"}
                  </p>

                  {order.customer && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      مشتری #{order.customer}
                    </p>
                  )}
                </div>
              </td>

              <td className="px-5 py-4">
                <OrdersStatusBadge
                  type="order"
                  value={order.status}
                />
              </td>

              <td className="px-5 py-4">
                <OrdersStatusBadge
                  type="payment"
                  value={
                    order.payment_status
                  }
                />
              </td>

              <td className="px-5 py-4">
                <span className="text-xs text-muted-foreground">
                  {formatDate(
                    order.ordered_at,
                  )}
                </span>
              </td>

              <td className="px-5 py-4 text-left">
                <Link
                  href={`/orders/${order.id}`}
                  className="
                    inline-flex items-center gap-1.5
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
          ))}
        </tbody>
      </table>
    </div>
  );
}