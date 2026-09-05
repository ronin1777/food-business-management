import Link from "next/link";
import {
  ArrowRight,
  Check,
  UserRound,
} from "lucide-react";

import type {
  CustomerDetail,
} from "@/types/customers";

type CustomerAction = (
  formData: FormData,
) => Promise<void>;

type CustomerFormProps = {
  mode: "create" | "edit";
  initialValues?: CustomerDetail | null;
  action: CustomerAction;
};

export default function CustomerForm({
  mode,
  initialValues,
  action,
}: CustomerFormProps) {
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
        action={action}
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
              name="name"
              type="text"
              defaultValue={
                initialValues?.name ?? ""
              }
              placeholder="مثلاً علی رضایی"
              maxLength={150}
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
              name="phone"
              type="tel"
              defaultValue={
                initialValues?.phone ?? ""
              }
              placeholder="مثلاً 09121234567"
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
              name="note"
              defaultValue={
                initialValues?.note ?? ""
              }
              placeholder="یادداشت یا توضیحات مربوط به مشتری..."
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
              "
            />
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
                  مشتری فعال باشد
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  مشتری‌های غیرفعال در فرآیند ثبت
                  سفارش قابل انتخاب نخواهند بود.
                </p>
              </div>
            </label>
          </div>
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