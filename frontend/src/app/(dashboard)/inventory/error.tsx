"use client";

export default function InventoryError({
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
            "خطا در دریافت گردش موجودی."}
        </p>

        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}