"use client";

import {
  use,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import SupplierForm, {
  SupplierFormValues,
} from "@/components/suppliers/SupplierForm";

import {
  getSupplier,
  updateSupplier,
} from "@/lib/api/suppliers";

import type {
  SupplierDetail,
} from "@/types/suppliers";

type EditSupplierPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditSupplierPage({
  params,
}: EditSupplierPageProps) {
  const router = useRouter();

  const { id } = use(params);

  const supplierId = Number(id);

  const [supplier, setSupplier] =
    useState<SupplierDetail | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (
      !Number.isInteger(
        supplierId,
      ) ||
      supplierId <= 0
    ) {
      setError(
        "شناسه تأمین‌کننده معتبر نیست.",
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadSupplier() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getSupplier(
            supplierId,
          );

        if (cancelled) {
          return;
        }

        setSupplier(response);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Get supplier error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "دریافت اطلاعات تأمین‌کننده انجام نشد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSupplier();

    return () => {
      cancelled = true;
    };
  }, [supplierId]);

  async function handleSubmit(
    values: SupplierFormValues,
  ) {
    try {
      setSaving(true);
      setError(null);

      const updatedSupplier =
        await updateSupplier(
          supplierId,
          {
            name: values.name,
            phone: values.phone,
            is_active:
              values.is_active,
          },
        );

      router.push(
        `/suppliers/${updatedSupplier.id}`,
      );
    } catch (error) {
      console.error(
        "Update supplier error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "بروزرسانی تأمین‌کننده انجام نشد.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />

        <div className="h-14 w-64 animate-pulse rounded bg-muted" />

        <div className="h-[420px] animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
          {error ??
            "تأمین‌کننده پیدا نشد."}
        </div>
      </div>
    );
  }

  return (
    <SupplierForm
      mode="edit"
      initialValues={supplier}
      loading={saving}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}