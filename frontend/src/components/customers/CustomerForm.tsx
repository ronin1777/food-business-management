"use client";

import {
  ArrowRight,
  Check,
  Loader2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";

import type {
  CustomerDetail,
} from "@/types/customers";

export type CustomerFormValues = {
  name: string;
  phone: string;
  note: string;
  is_active: boolean;
};

type CustomerFormProps = {
  mode: "create" | "edit";
  initialValues?: CustomerDetail | null;
  loading?: boolean;
  error?: string | null;
  onSubmit: (
    values: CustomerFormValues,
  ) => Promise<void>;
};

export default function CustomerForm({
  mode,
  initialValues,
  loading = false,
  error = null,
  onSubmit,
}: CustomerFormProps) {
  const [name, setName] = useState(
    initialValues?.name ?? "",
  );

  const [phone, setPhone] = useState(
    initialValues?.phone ?? "",
  );

  const [note, setNote] = useState(
    initialValues?.note ?? "",
  );

  const [isActive, setIsActive] =
    useState(
      initialValues?.is_active ?? true,
    );

  const [validationError, setValidationError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName =
      name.trim();

    if (!trimmedName) {
      setValidationError(
        "نام مشتری الزامی است.",
      );
      return;
    }

    if (trimmedName.length > 150) {
      setValidationError(
        "نام مشتری نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.",
      );
      return;
    }

    setValidationError(null);

    await onSubmit({
      name: trimmedName,
      phone: phone.trim(),
      note: note.trim(),
      is_active: isActive,
    });
  }

  const pageTitle =
    mode === "create"
      ? "مشتری جدید"
      : "ویرایش مشتری";

  const pageDescription =
    mode === "create"
      ? "اطلاعات مشتری جدید را وارد کنید."
      : "اطلاعات مشتری را بروزرسانی کنید.";

  const submitLabel =
    mode === "create"
      ? "ثبت مشتری"
      : "ذخیره تغییرات";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          مشتری‌ها
        </Link>

        <div className="mt-4 flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <UserRound className="size-5 text-muted-foreground" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {pageTitle}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {pageDescription}
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
              htmlFor="customer-name"
              className="mb-2 block text-sm font-medium"
            >
              نام مشتری
              <span className="mr-1 text-destructive">
                *
              </span>
            </label>

            <input
              id="customer-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="مثلاً علی رضایی"
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

          {/* Phone */}
          <div>
            <label
              htmlFor="customer-phone"
              className="mb-2 block text-sm font-medium"
            >
              شماره تماس
            </label>

            <input
              id="customer-phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value,
                )
              }
              placeholder="مثلاً 09121234567"
              disabled={loading}
              maxLength={30}
              dir="ltr"
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

          {/* Note */}
          <div>
            <label
              htmlFor="customer-note"
              className="mb-2 block text-sm font-medium"
            >
              یادداشت
            </label>

            <textarea
              id="customer-note"
              value={note}
              onChange={(event) =>
                setNote(
                  event.target.value,
                )
              }
              placeholder="یادداشت یا توضیحات مربوط به مشتری..."
              disabled={loading}
              rows={5}
              className="
                w-full
                resize-y
                rounded-lg
                border border-input
                bg-background
                px-3 py-2.5
                text-sm
                leading-6
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
                  مشتری فعال باشد
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  مشتری‌های غیرفعال در فرآیند ثبت
                  سفارش قابل انتخاب نخواهند بود.
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
            href="/customers"
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