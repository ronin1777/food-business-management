import {
  ArrowRight,
  Check,
  Truck,
} from "lucide-react";
import Link from "next/link";

import type { SupplierDetail } from "@/types/suppliers";

type SupplierAction = (
  formData: FormData,
) => Promise<void>;

type SupplierFormProps = {
  mode: "create" | "edit";
  initialValues?: SupplierDetail | null;
  action: SupplierAction;
};

export default function SupplierForm({
  mode,
  initialValues,
  action,
}: SupplierFormProps) {
  const title =
    mode === "create"
      ? "تأمین‌کننده جدید"
      : "ویرایش تأمین‌کننده";

  const description =
    mode === "create"
      ? "اطلاعات تأمین‌کننده جدید را وارد کنید."
      : "اطلاعات تأمین‌کننده را بروزرسانی کنید.";

  const submitLabel =
    mode === "create"
      ? "ثبت تأمین‌کننده"
      : "ذخیره تغییرات";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/suppliers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          تأمین‌کنندگان
        </Link>

        <div className="mt-4 flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Truck className="size-5 text-muted-foreground" />
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
        action={action}
        className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="space-y-6 p-5 sm:p-6">
          {/* Name */}
          <div>
            <label
              htmlFor="supplier-name"
              className="mb-2 block text-sm font-medium"
            >
              نام تأمین‌کننده
              <span className="mr-1 text-destructive">
                *
              </span>
            </label>

            <input
              id="supplier-name"
              name="name"
              type="text"
              defaultValue={
                initialValues?.name ?? ""
              }
              maxLength={150}
              required
              placeholder="مثلاً شرکت پخش آریا"
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
              htmlFor="supplier-phone"
              className="mb-2 block text-sm font-medium"
            >
              شماره تماس
            </label>

            <input
              id="supplier-phone"
              name="phone"
              type="tel"
              defaultValue={
                initialValues?.phone ?? ""
              }
              maxLength={30}
              placeholder="مثلاً 09121234567"
              dir="ltr"
              className="
                h-11 w-full
                rounded-lg
                border border-input
                bg-background
                px-3
                text-sm
                text-left
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
                  تأمین‌کننده فعال باشد
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  تأمین‌کنندگان غیرفعال در خریدهای
                  جدید قابل انتخاب نخواهند بود.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/suppliers"
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