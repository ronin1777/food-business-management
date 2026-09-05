"use client";

import Link from "next/link";
import { CircleAlert, ArrowRight } from "lucide-react";

type SupplierDetailErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function SupplierDetailError({
  error,
  reset,
}: SupplierDetailErrorProps) {
  console.error(
    "Supplier detail error:",
    error,
  );

  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive/10">
          <CircleAlert className="size-5 text-destructive" />
        </div>

        <h2 className="mt-4 text-sm font-semibold">
          خطا در دریافت اطلاعات تأمین‌کننده
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          در دریافت اطلاعات تأمین‌کننده مشکلی
          پیش آمد. لطفاً دوباره تلاش کنید.
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
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
            href="/suppliers"
            className="
              inline-flex h-10
              items-center justify-center
              gap-2
              rounded-lg
              border border-border
              bg-background
              px-4
              text-sm font-medium
              transition-colors
              hover:bg-accent
            "
          >
            <ArrowRight className="size-4" />
            تأمین‌کنندگان
          </Link>
        </div>
      </div>
    </div>
  );
}