"use client";

import { CircleAlert } from "lucide-react";

type SuppliersErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function SuppliersError({
  error,
  reset,
}: SuppliersErrorProps) {
  console.error("Suppliers page error:", error);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive/10">
          <CircleAlert className="size-5 text-destructive" />
        </div>

        <h2 className="mt-4 text-sm font-semibold">
          خطا در دریافت تأمین‌کنندگان
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          در دریافت اطلاعات تأمین‌کنندگان مشکلی پیش آمد.
          لطفاً دوباره تلاش کنید.
        </p>

        <button
          type="button"
          onClick={reset}
          className="
            mt-5
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
      </div>
    </div>
  );
}