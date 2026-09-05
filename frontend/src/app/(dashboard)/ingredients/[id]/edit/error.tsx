"use client";

type EditIngredientErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function EditIngredientError({
  error,
  reset,
}: EditIngredientErrorProps) {
  return (
    <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center">
      <div className="space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-5 text-center">
        <p className="text-sm text-destructive">
          {error.message ||
            "ویرایش ماده اولیه انجام نشد."}
        </p>

        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}