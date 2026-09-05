"use client";

import Link from "next/link";
import { CircleAlert } from "lucide-react";

type CustomersErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function CustomersError({
  error,
  reset,
}: CustomersErrorProps) {
  console.error("Customers page error:", error);

  return (
    <div className="flex min-h-[400px] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <CircleAlert className="size-6 text-destructive" />
        </div>

        <h2 className="mt-4 text-base font-semibold">
          خطا در دریافت مشتری‌ها
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {error.message ||
            "در دریافت اطلاعات مشتری‌ها مشکلی رخ داد."}
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
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
            href="/dashboard"
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
            بازگشت
          </Link>
        </div>
      </div>
    </div>
  );
}