"use client";

import {
  AlertTriangle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type CancelOrderDialogProps = {
  open: boolean;
  orderId: number;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (note: string) => void;
};

export function CancelOrderDialog({
  open,
  orderId,
  loading = false,
  error = null,
  onClose,
  onConfirm,
}: CancelOrderDialogProps) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setNote("");
    }
  }, [open]);

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

  function handleConfirm() {
    onConfirm(note.trim());
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
        aria-labelledby="cancel-order-title"
        className="
          relative z-10
          w-full max-w-md
          rounded-2xl
          border border-border
          bg-card
          p-5
          shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="
              flex size-10 shrink-0
              items-center justify-center
              rounded-full
              bg-destructive/10
            "
          >
            <AlertTriangle className="size-5 text-destructive" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="cancel-order-title"
              className="text-base font-semibold text-foreground"
            >
              لغو سفارش
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              آیا مطمئن هستید که می‌خواهید سفارش{" "}
              <span className="font-medium text-foreground">
                #{orderId}
              </span>{" "}
              را لغو کنید؟
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

        {/* Note */}
        <div className="mt-5">
          <label
            htmlFor="cancel-order-note"
            className="text-sm font-medium text-foreground"
          >
            دلیل لغو
            <span className="mr-1 text-xs font-normal text-muted-foreground">
              (اختیاری)
            </span>
          </label>

          <textarea
            id="cancel-order-note"
            value={note}
            onChange={(event) =>
              setNote(event.target.value)
            }
            disabled={loading}
            rows={4}
            maxLength={500}
            placeholder="مثلاً درخواست مشتری..."
            className="
              mt-2 w-full
              resize-none
              rounded-lg
              border border-input
              bg-background
              px-3 py-2.5
              text-sm
              text-foreground
              outline-none
              placeholder:text-muted-foreground
              focus:border-ring
              focus:ring-2
              focus:ring-ring/20
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />

          <div className="mt-1.5 text-left text-[11px] text-muted-foreground">
            {note.length}/500
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
            <p className="text-xs leading-5 text-destructive">
              {error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-start">
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="
              inline-flex h-10
              items-center justify-center
              rounded-lg
              bg-destructive
              px-4
              text-sm font-medium
              text-white
              transition-opacity
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? "در حال لغو..."
              : "لغو سفارش"}
          </button>

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
              text-foreground
              transition-colors
              hover:bg-accent
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}