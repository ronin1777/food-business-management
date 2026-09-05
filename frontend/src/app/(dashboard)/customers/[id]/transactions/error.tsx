"use client";

import Link from "next/link";
import { CircleAlert } from "lucide-react";

type CustomerTransactionsErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function CustomerTransactionsError({
  error,
  reset,
}: CustomerTransactionsErrorProps) {
  console.error(
    "Customer transactions error:",
    error,
  );

  return (
    <div className="flex min-h-[500px] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <CircleAlert className="mx-auto size-6 text-destructive" />

        <p className="mt-3 text-sm font-medium text-destructive">
          خطا در دریافت گردش حساب
        </p>

        <p className="mt-2 text-sm leading-6 text-destructive/80">
          {error.message ||
            "در دریافت گردش حساب مشکلی رخ داد."}
        </p>

        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="
              inline-flex h-10
              items-center justify-center
              rounded-lg
              bg-primary
              px-4
              text-sm font-medium
              text-primary-foreground
              transition-opacity
              hover:opacity-90
            "
          >
            تلاش مجدد
          </button>

          <Link
            href={`/customers`}
            className="
              inline-flex h-10
              items-center justify-center
              rounded-lg
              border border-border
              bg-background
              px-4
              text-sm font-medium
              transition-colors
              hover:bg-accent
            "
          >
            بازگشت به مشتری‌ها
          </Link>
        </div>
      </div>
    </div>
  );
}