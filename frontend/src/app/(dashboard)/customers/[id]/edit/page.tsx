"use client";

import {
  use,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import CustomerForm, {
  CustomerFormValues,
} from "@/components/customers/CustomerForm";

import {
  getCustomer,
  updateCustomer,
} from "@/lib/api/customers";

import type {
  CustomerDetail,
} from "@/types/customers";

type EditCustomerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const router = useRouter();

  const { id } = use(params);

  const customerId = Number(id);

  const [customer, setCustomer] =
    useState<CustomerDetail | null>(
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
        customerId,
      ) ||
      customerId <= 0
    ) {
      setError(
        "شناسه مشتری معتبر نیست.",
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCustomer() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getCustomer(
            customerId,
          );

        if (cancelled) {
          return;
        }

        setCustomer(response);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Get customer error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "دریافت اطلاعات مشتری انجام نشد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCustomer();

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  async function handleSubmit(
    values: CustomerFormValues,
  ) {
    try {
      setSaving(true);
      setError(null);

      const updatedCustomer =
        await updateCustomer(
          customerId,
          {
            name: values.name,
            phone: values.phone,
            note: values.note,
            is_active:
              values.is_active,
          },
        );

      router.push(
        `/customers/${updatedCustomer.id}`,
      );
    } catch (error) {
      console.error(
        "Update customer error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "بروزرسانی مشتری انجام نشد.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />

        <div className="h-14 w-56 animate-pulse rounded bg-muted" />

        <div className="h-[520px] animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
          {error ??
            "مشتری پیدا نشد."}
        </div>
      </div>
    );
  }

  return (
    <CustomerForm
      mode="edit"
      initialValues={customer}
      loading={saving}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}