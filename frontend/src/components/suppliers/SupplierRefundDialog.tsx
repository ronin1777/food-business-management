"use client";

import {
  CircleAlert,
  Loader2,
  X,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";

import {
  createSupplierRefund,
} from "@/lib/api/suppliers";

type SupplierRefundDialogProps = {
  open: boolean;
  supplierId: number;
  purchaseId: number;
  onClose: () => void;
  onSuccess?: () => void;
};

function formatMoney(
  value: number,
) {
  return `${new Intl.NumberFormat(
    "fa-IR",
  ).format(value)} تومان`;
}

export default function SupplierRefundDialog({
  open,
  supplierId,
  purchaseId,
  onClose,
  onSuccess,
}: SupplierRefundDialogProps) {
  const [amount, setAmount] =
    useState("");

  const [note, setNote] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  if (!open) {
    return null;
  }

  const numericAmount =
    Number(amount) || 0;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !amount ||
      numericAmount <= 0
    ) {
      setError(
        "مبلغ بازپرداخت باید بیشتر از صفر باشد.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await createSupplierRefund({
        supplier: supplierId,
        purchase: purchaseId,
        amount: numericAmount,
        note: note.trim(),
      });

      setAmount("");
      setNote("");

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(
        "Supplier refund error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "ثبت بازپرداخت ناموفق بود.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="بستن"
        onClick={onClose}
        disabled={submitting}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">
              ثبت بازپرداخت
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              بازپرداخت مربوط به خرید #
              {purchaseId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >
          <div>
            <label
              htmlFor="refund-amount"
              className="mb-2 block text-xs font-medium"
            >
              مبلغ بازپرداخت
            </label>

            <input
              id="refund-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => {
                setAmount(
                  event.target.value,
                );
                setError(null);
              }}
              placeholder="مثلاً 500000"
              disabled={submitting}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
            />

            {numericAmount > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {formatMoney(
                  numericAmount,
                )}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="refund-note"
              className="mb-2 block text-xs font-medium"
            >
              توضیح
            </label>

            <textarea
              id="refund-note"
              rows={3}
              value={note}
              onChange={(event) =>
                setNote(
                  event.target.value,
                )
              }
              disabled={submitting}
              placeholder="علت بازپرداخت..."
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <div className="flex items-start gap-2">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />

                <p className="text-xs leading-5 text-destructive">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-10 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                numericAmount <= 0
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && (
                <Loader2 className="size-4 animate-spin" />
              )}

              {submitting
                ? "در حال ثبت..."
                : "ثبت بازپرداخت"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}