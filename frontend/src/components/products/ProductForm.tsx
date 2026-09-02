"use client";

import {
  ArrowRight,
  Check,
  Loader2,
  Package,
} from "lucide-react";
import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";

import type { Product } from "@/types/products";

export type ProductFormValues = {
  name: string;
  selling_price: string;
  is_active: boolean;
};

type ProductFormProps = {
  mode: "create" | "edit";
  initialValues?: Product | null;
  loading?: boolean;
  error?: string | null;
  onSubmit: (
    values: ProductFormValues,
  ) => Promise<void>;
};

export default function ProductForm({
  mode,
  initialValues,
  loading = false,
  error = null,
  onSubmit,
}: ProductFormProps) {
  const [name, setName] = useState(
    initialValues?.name ?? "",
  );

  const [sellingPrice, setSellingPrice] =
    useState(
      initialValues
        ? String(initialValues.selling_price)
        : "",
    );

  const [isActive, setIsActive] =
    useState(
      initialValues?.is_active ?? true,
    );

  const [
    validationError,
    setValidationError,
  ] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setValidationError(
        "نام محصول الزامی است.",
      );
      return;
    }

    if (trimmedName.length > 150) {
      setValidationError(
        "نام محصول نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.",
      );
      return;
    }

    const normalizedPrice =
      sellingPrice
        .trim()
        .replace(/,/g, "");

    if (!normalizedPrice) {
      setValidationError(
        "قیمت فروش الزامی است.",
      );
      return;
    }

    const numericPrice =
      Number(normalizedPrice);

    if (
      !Number.isFinite(
        numericPrice,
      )
    ) {
      setValidationError(
        "قیمت فروش معتبر نیست.",
      );
      return;
    }

    if (numericPrice < 0) {
      setValidationError(
        "قیمت فروش نمی‌تواند منفی باشد.",
      );
      return;
    }

    setValidationError(null);

    await onSubmit({
      name: trimmedName,
      selling_price:
        normalizedPrice,
      is_active: isActive,
    });
  }

  const title =
    mode === "create"
      ? "محصول جدید"
      : "ویرایش محصول";

  const description =
    mode === "create"
      ? "اطلاعات محصول جدید را وارد کنید."
      : "اطلاعات محصول را بروزرسانی کنید.";

  const submitLabel =
    mode === "create"
      ? "ثبت محصول"
      : "ذخیره تغییرات";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          محصولات
        </Link>

        <div className="mt-4 flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Package className="size-5 text-muted-foreground" />
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

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="space-y-6 p-5 sm:p-6">
          {/* Name */}
          <div>
            <label
              htmlFor="product-name"
              className="mb-2 block text-sm font-medium"
            >
              نام محصول
              <span className="mr-1 text-destructive">
                *
              </span>
            </label>

            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="مثلاً قهوه اسپرسو"
              disabled={loading}
              maxLength={150}
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
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />
          </div>

          {/* Selling Price */}
          <div>
            <label
              htmlFor="product-price"
              className="mb-2 block text-sm font-medium"
            >
              قیمت فروش
              <span className="mr-1 text-destructive">
                *
              </span>
            </label>

            <div className="relative">
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={sellingPrice}
                onChange={(event) =>
                  setSellingPrice(
                    event.target.value,
                  )
                }
                placeholder="مثلاً 180000"
                disabled={loading}
                dir="ltr"
                className="
                  h-11 w-full
                  rounded-lg
                  border border-input
                  bg-background
                  px-3
                  pl-16
                  text-left
                  text-sm
                  outline-none
                  placeholder:text-muted-foreground
                  focus:border-ring
                  focus:ring-2
                  focus:ring-ring/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                تومان
              </span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              قیمت با دقت اعشاری تا دو رقم به Backend ارسال می‌شود.
            </p>
          </div>

          {/* Active */}
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(
                    event.target.checked,
                  )
                }
                disabled={loading}
                className="mt-0.5 size-4 accent-[var(--success)]"
              />

              <div>
                <p className="text-sm font-medium">
                  محصول فعال باشد
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  محصولات غیرفعال در فرآیندهای جدید قابل استفاده نخواهند بود.
                </p>
              </div>
            </label>
          </div>

          {/* Errors */}
          {(validationError ||
            error) && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {validationError ??
                error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/products"
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
            disabled={loading}
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
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}

            {loading
              ? "در حال ذخیره..."
              : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}