"use client";

export default function OrdersError({
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
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <p className="text-sm font-medium text-destructive">
            خطا در دریافت سفارش‌ها
          </p>

          <p className="mt-2 text-sm leading-6 text-destructive/80">
            {error.message ||
              "خطایی در دریافت اطلاعات سفارش‌ها رخ داد."}
          </p>
        </div>

        <button
          type="button"
          onClick={reset}
          className="
            rounded-lg
            bg-primary
            px-4 py-2
            text-sm
            text-primary-foreground
            transition-opacity
            hover:opacity-90
          "
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}