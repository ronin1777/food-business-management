"use client";

import Link from "next/link";
import { CircleAlert } from "lucide-react";

type IngredientErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function IngredientError({
  error,
  reset,
}: IngredientErrorProps) {
  console.error(
    "Ingredient detail error:",
    error,
  );

  return (
    <div className="flex min-h-[400px] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive/10">
          <CircleAlert className="size-5 text-destructive" />
        </div>

        <h2 className="mt-4 text-sm font-semibold">
          خطا در دریافت ماده اولیه
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          دریافت اطلاعات ماده اولیه با مشکل مواجه شد.
        </p>

        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            تلاش مجدد
          </button>

          <Link
            href="/ingredients"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            مواد اولیه
          </Link>
        </div>
      </div>
    </div>
  );
}