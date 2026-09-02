"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import SupplierForm, {
  SupplierFormValues,
} from "@/components/suppliers/SupplierForm";

import {
  createSupplier,
} from "@/lib/api/suppliers";

export default function NewSupplierPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    values: SupplierFormValues,
  ) {
    try {
      setLoading(true);
      setError(null);

      const supplier =
        await createSupplier({
          name: values.name,
          phone: values.phone,
          is_active:
            values.is_active,
        });

      router.push(
        `/suppliers/${supplier.id}`,
      );
    } catch (error) {
      console.error(
        "Create supplier error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "ثبت تأمین‌کننده انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SupplierForm
      mode="create"
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}