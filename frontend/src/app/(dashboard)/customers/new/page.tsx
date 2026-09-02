"use client";

import {
  useRouter,
} from "next/navigation";
import {
  useState,
} from "react";

import CustomerForm, {
  CustomerFormValues,
} from "@/components/customers/CustomerForm";

import {
  createCustomer,
} from "@/lib/api/customers";

export default function NewCustomerPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    values: CustomerFormValues,
  ) {
    try {
      setLoading(true);
      setError(null);

      const customer =
        await createCustomer({
          name: values.name,
          phone: values.phone,
          note: values.note,
          is_active:
            values.is_active,
        });

      router.push(
        `/customers/${customer.id}`,
      );
    } catch (error) {
      console.error(
        "Create customer error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "ثبت مشتری انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <CustomerForm
      mode="create"
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}