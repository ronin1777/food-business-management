import {
  CheckCircle2,
  Clock3,
  CreditCard,
  XCircle,
} from "lucide-react";

import type {
  OrderPaymentStatus,
  OrderStatus,
} from "@/types/orders";

type OrdersStatusBadgeProps = {
  type: "order" | "payment";
  value: OrderStatus | OrderPaymentStatus;
};

export function OrdersStatusBadge({
  type,
  value,
}: OrdersStatusBadgeProps) {
  if (
    type === "order" &&
    value === "completed"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
        <CheckCircle2 className="size-3" />
        ثبت شده
      </span>
    );
  }

  if (
    type === "order" &&
    value === "cancelled"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive">
        <XCircle className="size-3" />
        لغو شده
      </span>
    );
  }

  if (
    type === "payment" &&
    value === "paid"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
        <CheckCircle2 className="size-3" />
        پرداخت شده
      </span>
    );
  }

  if (
    type === "payment" &&
    value === "partially_paid"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning">
        <Clock3 className="size-3" />
        نیمه پرداخت
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      <CreditCard className="size-3" />
      پرداخت نشده
    </span>
  );
}