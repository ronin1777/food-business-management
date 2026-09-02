"use client";

import {
  Banknote,
  CreditCard,
  Loader2,
  Receipt,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  createCustomerPayment,
  type CustomerPaymentMethod,
} from "@/lib/api/payments";

type RecordPaymentDialogProps = {
  open: boolean;
  orderId: number;
  customerId: number | null;
  remainingAmount: number;
  onClose: () => void;
  onSuccess: () => void;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

function getDefaultPaidAt() {
  const now = new Date();

  const timezoneOffset =
    now.getTimezoneOffset() * 60000;

  return new Date(
    now.getTime() - timezoneOffset,
  )
    .toISOString()
    .slice(0, 16);
}

const paymentMethods: {
  value: CustomerPaymentMethod;
  label: string;
  icon: typeof Banknote;
}[] = [
  {
    value: "cash",
    label: "نقدی",
    icon: Banknote,
  },
  {
    value: "card",
    label: "کارت",
    icon: CreditCard,
  },
  {
    value: "transfer",
    label: "انتقال بانکی",
    icon: Receipt,
  },
];

export function RecordPaymentDialog({
  open,
  orderId,
  customerId,
  remainingAmount,
  onClose,
  onSuccess,
}: RecordPaymentDialogProps) {
  const [amount, setAmount] =
    useState("");

  const [method, setMethod] =
    useState<CustomerPaymentMethod>("card");

  const [paidAt, setPaidAt] =
    useState(getDefaultPaidAt);

  const [note, setNote] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setAmount(
      remainingAmount > 0
        ? String(remainingAmount)
        : "",
    );

    setMethod("card");
    setPaidAt(getDefaultPaidAt());
    setNote("");
    setError(null);
  }, [open, remainingAmount]);

  useEffect(() => {
    if (!open || loading) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, loading, onClose]);

  if (!open) {
    return null;
  }

  const numericAmount = Number(
    amount,
  );

  const isValidAmount =
    Number.isFinite(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= remainingAmount;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (!customerId) {
      setError(
        "برای ثبت پرداخت، سفارش باید مشتری داشته باشد.",
      );
      return;
    }

    if (!isValidAmount) {
      setError(
        `مبلغ پرداخت باید بیشتر از صفر و حداکثر ${formatMoney(
          remainingAmount,
        )} باشد.`,
      );
      return;
    }

    try {
      setLoading(true);

      await createCustomerPayment({
        customer: customerId,
        order: orderId,
        amount: numericAmount,
        method,
        paid_at: new Date(
          paidAt,
        ).toISOString(),
        note: note.trim(),
      });

      onSuccess();
    } catch (error) {
      console.error(
        "Create payment error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "ثبت پرداخت با خطا مواجه شد.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        p-4
      "
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="بستن پنجره"
        onClick={() => {
          if (!loading) {
            onClose();
          }
        }}
        className="
          fixed inset-0
          bg-black/50
          backdrop-blur-sm
        "
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-payment-title"
        className="
          relative z-10
          w-full max-w-md
          overflow-hidden
          rounded-2xl
          border border-border
          bg-card
          shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-border p-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10">
            <Receipt className="size-5 text-success" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="record-payment-title"
              className="text-base font-semibold"
            >
              ثبت پرداخت
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              پرداخت سفارش #{formatNumber(orderId)}
              {" "}
              را ثبت کنید.
            </p>
          </div>

          <button
            type="button"
            aria-label="بستن"
            disabled={loading}
            onClick={onClose}
            className="
              inline-flex size-8
              items-center justify-center
              rounded-lg
              text-muted-foreground
              transition-colors
              hover:bg-accent
              hover:text-foreground
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-5">
            {/* Remaining */}
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">
                  مانده قابل پرداخت
                </span>

                <span className="text-sm font-semibold">
                  {formatMoney(
                    remainingAmount,
                  )}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="payment-amount"
                className="text-sm font-medium"
              >
                مبلغ پرداخت
              </label>

              <div className="relative">
                <input
                  id="payment-amount"
                  type="number"
                  min="0.01"
                  max={remainingAmount}
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                  className="
                    mt-2 h-11 w-full
                    rounded-lg
                    border border-input
                    bg-background
                    px-3
                    text-sm
                    outline-none
                    focus:border-ring
                    focus:ring-2
                    focus:ring-ring/20
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                  placeholder="مبلغ را وارد کنید"
                />
              </div>

              <button
                type="button"
                disabled={
                  loading ||
                  remainingAmount <= 0
                }
                onClick={() =>
                  setAmount(
                    String(
                      remainingAmount,
                    ),
                  )
                }
                className="
                  mt-2 text-xs
                  font-medium
                  text-primary
                  transition-opacity
                  hover:opacity-80
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                پرداخت کامل مانده
              </button>
            </div>

            {/* Payment Method */}
            <div>
              <p className="text-sm font-medium">
                روش پرداخت
              </p>

              <div className="mt-2 grid grid-cols-3 gap-2">
                {paymentMethods.map(
                  (paymentMethod) => {
                    const Icon =
                      paymentMethod.icon;

                    const selected =
                      method ===
                      paymentMethod.value;

                    return (
                      <button
                        key={
                          paymentMethod.value
                        }
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          setMethod(
                            paymentMethod.value,
                          )
                        }
                        className={[
                          "flex flex-col items-center",
                          "justify-center gap-2",
                          "rounded-lg border",
                          "px-2 py-3",
                          "text-xs font-medium",
                          "transition-colors",
                          selected
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                        ].join(" ")}
                      >
                        <Icon className="size-4" />

                        <span>
                          {
                            paymentMethod.label
                          }
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Paid At */}
            <div>
              <label
                htmlFor="payment-paid-at"
                className="text-sm font-medium"
              >
                تاریخ پرداخت
              </label>

              <input
                id="payment-paid-at"
                type="datetime-local"
                value={paidAt}
                onChange={(event) =>
                  setPaidAt(
                    event.target.value,
                  )
                }
                disabled={loading}
                className="
                  mt-2 h-11 w-full
                  rounded-lg
                  border border-input
                  bg-background
                  px-3
                  text-sm
                  outline-none
                  focus:border-ring
                  focus:ring-2
                  focus:ring-ring/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>

            {/* Note */}
            <div>
              <label
                htmlFor="payment-note"
                className="text-sm font-medium"
              >
                یادداشت
                <span className="mr-1 text-xs font-normal text-muted-foreground">
                  (اختیاری)
                </span>
              </label>

              <textarea
                id="payment-note"
                rows={3}
                maxLength={500}
                value={note}
                onChange={(event) =>
                  setNote(
                    event.target.value,
                  )
                }
                disabled={loading}
                placeholder="مثلاً پرداخت کارتخوان..."
                className="
                  mt-2 w-full
                  resize-none
                  rounded-lg
                  border border-input
                  bg-background
                  px-3 py-2.5
                  text-sm
                  leading-6
                  outline-none
                  placeholder:text-muted-foreground
                  focus:border-ring
                  focus:ring-2
                  focus:ring-ring/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <p className="mt-1 text-left text-[11px] text-muted-foreground">
                {note.length}/500
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
                <p className="text-xs leading-5 text-destructive">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/20 p-5 sm:flex-row sm:justify-start">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="
                inline-flex h-10
                items-center justify-center
                rounded-lg
                border border-border
                bg-card
                px-4
                text-sm font-medium
                transition-colors
                hover:bg-accent
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                !customerId ||
                remainingAmount <= 0
              }
              className="
                inline-flex h-10
                items-center justify-center gap-2
                rounded-lg
                bg-primary
                px-4
                text-sm font-medium
                text-primary-foreground
                shadow-sm
                transition-opacity
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  در حال ثبت...
                </>
              ) : (
                <>
                  <Receipt className="size-4" />
                  ثبت پرداخت
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}