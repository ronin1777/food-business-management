import Link from "next/link";

import {
  ArrowRight,
  Beaker,
  Check,
  ChevronDown,
} from "lucide-react";

import type { Ingredient } from "@/types/ingredients";

export type IngredientUnitOption = {
  value: string;
  label: string;
};

type IngredientAction = (
  formData: FormData,
) => Promise<void>;

type IngredientFormProps = {
  mode: "create" | "edit";
  initialValues?: Ingredient | null;
  unitOptions: IngredientUnitOption[];
  action: IngredientAction;
};

export default function IngredientForm({
  mode,
  initialValues,
  unitOptions,
  action,
}: IngredientFormProps) {
  const title =
    mode === "create"
      ? "ماده اولیه جدید"
      : "ویرایش ماده اولیه";

  const description =
    mode === "create"
      ? "اطلاعات ماده اولیه جدید را وارد کنید."
      : "اطلاعات ماده اولیه را بروزرسانی کنید.";

  const submitLabel =
    mode === "create"
      ? "ثبت ماده اولیه"
      : "ذخیره تغییرات";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Link
          href="/ingredients"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          مواد اولیه
        </Link>

        <div className="mt-4 flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Beaker className="size-5 text-muted-foreground" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {title}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>

      <form
        action={action}
        className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="space-y-6 p-5 sm:p-6">
          {/* Name */}
          <div>
            <label
              htmlFor="ingredient-name"
              className="mb-2 block text-sm font-medium"
            >
              نام ماده اولیه
              <span className="mr-1 text-destructive">
                *
              </span>
            </label>

            <input
              id="ingredient-name"
              name="name"
              type="text"
              defaultValue={
                initialValues?.name ?? ""
              }
              maxLength={150}
              placeholder="مثلاً دانه قهوه عربیکا"
              required
              className="
                h-11 w-full
                rounded-lg
                border border-input
                bg-background
                px-3
                text-sm
                outline-none
                placeholder:text-muted-foreground
                focus:border-ring
                focus:ring-2
                focus:ring-ring/20
              "
            />
          </div>

          {/* Unit Type */}
          <div>
            <label
              htmlFor="ingredient-unit-type"
              className="mb-2 block text-sm font-medium"
            >
              نوع واحد
              <span className="mr-1 text-destructive">
                *
              </span>
            </label>

            <div className="relative">
              <select
                id="ingredient-unit-type"
                name="unit_type"
                defaultValue={
                  initialValues?.unit_type ?? ""
                }
                required
                className="
                  h-11 w-full
                  appearance-none
                  rounded-lg
                  border border-input
                  bg-background
                  px-3 pr-9
                  text-sm
                  outline-none
                  focus:border-ring
                  focus:ring-2
                  focus:ring-ring/20
                "
              >
                <option value="">
                  انتخاب نوع واحد
                </option>

                {unitOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Active */}
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={
                  initialValues?.is_active ?? true
                }
                className="mt-0.5 size-4 accent-[var(--success)]"
              />

              <div>
                <p className="text-sm font-medium">
                  ماده اولیه فعال باشد
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  مواد اولیه غیرفعال در فرآیندهای جدید قابل انتخاب نخواهند بود.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/ingredients"
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
            انصراف
          </Link>

          <button
            type="submit"
            className="
              inline-flex h-10
              items-center justify-center
              gap-2
              rounded-lg
              bg-primary
              px-4
              text-sm font-medium
              text-primary-foreground
              shadow-sm
              transition-opacity
              hover:opacity-90
            "
          >
            <Check className="size-4" />
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}