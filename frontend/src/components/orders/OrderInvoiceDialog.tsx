"use client";

import { useEffect } from "react";
import {
  CheckCircle2,
  Printer,
  Receipt,
  X,
} from "lucide-react";

import { useOrganization } from "@/components/OrganizationProvider";
import type { OrderDetail } from "@/types/orders";

type OrderInvoiceDialogProps = {
  open: boolean;
  order: OrderDetail | null;
  onClose: () => void;
};

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

export default function OrderInvoiceDialog({
  open,
  order,
  onClose,
}: OrderInvoiceDialogProps) {
  const { organization } = useOrganization();
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [open, onClose]);

  if (!open || !order) {
    return null;
  }

  const totalAmount = Number(order.total_amount);
  const paidAmount = Number(order.paid_amount);
  const remainingAmount = Number(
    order.remaining_amount,
  );

  const hasRemaining = remainingAmount > 0;
  const isPaid =
    order.payment_status === "paid";

  function handlePrint() {
    window.print();
  }

  

  return (
    <div
      className="
        invoice-dialog-overlay
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60
        p-3
        backdrop-blur-[2px]
        sm:p-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[96vh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-2xl
          border border-border
          bg-background
          shadow-2xl
        "
      >
        {/* Dialog Header */}
        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b border-border
            bg-background
            px-4 py-3.5
            sm:px-5 sm:py-4
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex size-9 shrink-0
                items-center justify-center
                rounded-lg
                bg-primary/10
                text-primary
              "
            >
              <Receipt className="size-4" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">
                فاکتور فروش
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                پیش‌نمایش رسید قبل از چاپ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex size-9 shrink-0
              items-center justify-center
              rounded-lg
              text-muted-foreground
              transition-colors
              hover:bg-muted
              hover:text-foreground
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
            "
            aria-label="بستن"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Preview */}
        <div
          className="
            invoice-preview-area
            min-h-0
            flex-1
            overflow-y-auto
            bg-muted/40
            px-3 py-5
            sm:px-6 sm:py-8
          "
        >
          {/* Thermal Receipt */}
          <div
            id="order-invoice"
            dir="rtl"
            className="invoice-receipt"
          >
            {/* Header */}
            <header className="invoice-header">
  <div className="invoice-brand-mark">
    <Receipt className="invoice-brand-icon" />
  </div>

  <h1 className="invoice-business-name">
    <span>
      <p>فروشگاه</p>
      {organization?.name ?? "مدیریت کسب‌وکار"}
    </span>
    
  </h1>

  <h2 className="invoice-title">
    فاکتور فروش
  </h2>

  {/* <div className="invoice-order-number">
    شماره سفارش #
    {formatNumber(order.id)}
  </div> */}

  <div className="invoice-date">
    {formatDate(order.ordered_at)}
  </div>
</header>

            <div className="invoice-separator">
              <span />
            </div>

            {/* Customer */}
            {order.customer_name && (
              <section className="invoice-customer">
                <span>مشتری: </span>

                <strong>
                  {order.customer_name}
                </strong>
              </section>
            )}

            {order.customer_name && (
              <div className="invoice-separator">
                <span />
              </div>
            )}

            {/* Items */}
            <section className="invoice-items-section">
              <div className="invoice-items-header">
                <span>محصول</span>
                <span>مبلغ</span>
              </div>

              <div className="invoice-items">
                {order.items.map((item) => {
                  const quantity = Number(
                    item.quantity,
                  );

                  const unitPrice = Number(
                    item.unit_price,
                  );

                  const totalPrice = Number(
                    item.total_price,
                  );

                  return (
                    <div
                      key={item.id}
                      className="invoice-item"
                    >
                      <div className="invoice-item-info">
                        <div className="invoice-item-name">
                          {item.product_name}
                        </div>

                        <div className="invoice-item-meta">
                          {formatNumber(quantity)}
                          {" × "}
                          {formatMoney(unitPrice)}
                        </div>
                      </div>

                      <strong className="invoice-item-total">
                        {formatMoney(totalPrice)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="invoice-separator">
              <span />
            </div>

            {/* Financial Summary */}
            <section className="invoice-financial">
              <div className="invoice-financial-row">
                <span>جمع کل</span>

                <strong>
                  {formatMoney(totalAmount)}
                </strong>
              </div>

              <div className="invoice-financial-row">
                <span>پرداخت شده</span>

                <strong>
                  {formatMoney(paidAmount)}
                </strong>
              </div>

              {hasRemaining ? (
                <div className="invoice-remaining">
                  <div>
                    <span>
                      مبلغ قابل پرداخت
                    </span>

                    <small>
                      مانده حساب
                    </small>
                  </div>

                  <strong>
                    {formatMoney(
                      remainingAmount,
                    )}
                  </strong>
                </div>
              ) : (
                <div className="invoice-paid">
                  <CheckCircle2 />

                  <div>
                    <span>
                      تسویه کامل
                    </span>

                    <small>
                      مبلغ فاکتور به‌طور کامل پرداخت شده است
                    </small>
                  </div>
                </div>
              )}
            </section>

            {/* Footer */}
            <footer className="invoice-footer">
              <div className="invoice-footer-line" />

              <p className="invoice-thank-you">
                از خرید شما سپاسگزاریم
              </p>

              <div className="invoice-footer-symbol">
                ✦
              </div>
            </footer>
          </div>
        </div>

        {/* Actions */}
        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            gap-3
            border-t border-border
            bg-background
            px-4 py-3
            sm:px-5 sm:py-4
          "
        >
          <div className="hidden text-xs text-muted-foreground sm:block">
            عرض چاپ: ۸۰ میلی‌متر
          </div>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="
                inline-flex h-10
                items-center
                justify-center
                rounded-lg
                border border-border
                bg-background
                px-4
                text-sm font-medium
                transition-colors
                hover:bg-accent
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-ring
              "
            >
              بستن
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="
                inline-flex h-10
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-primary
                px-4
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
              <Printer className="size-4" />
              چاپ فاکتور
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}