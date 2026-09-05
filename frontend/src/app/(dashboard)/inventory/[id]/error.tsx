"use client";

export default function InventoryTransactionError({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="space-y-4 text-center">
        <p className="text-sm text-destructive">
          {error.message ||
            "خطا در دریافت اطلاعات تراکنش."}
        </p>

        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}