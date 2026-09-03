"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import ProductForm, {
  ProductFormValues,
} from "@/components/products/ProductForm";

import { ApiError } from "@/lib/api/client";
import { createProduct } from "@/lib/api/products";

export default function NewProductPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    values: ProductFormValues,
  ) {
    try {
      setLoading(true);
      setError(null);

      const response =
        await createProduct({
          name: values.name,
          selling_price: Number(
            values.selling_price,
          ),
          is_active:
            values.is_active,
        });

      console.log(
        "CREATE PRODUCT RESPONSE:",
        response,
      );

      router.push(
        `/products/${response.data.id}`,
      );
    } catch (err) {
      console.error(
        "Create product error:",
        err,
      );

      if (err instanceof ApiError) {
        const errors = err.errors;

        if (
          errors &&
          typeof errors === "object"
        ) {
          const fieldErrors =
            errors as Record<
              string,
              unknown
            >;

          const messages =
            Object.values(
              fieldErrors,
            ).flatMap((value) =>
              Array.isArray(value)
                ? value.filter(
                    (
                      item,
                    ): item is string =>
                      typeof item ===
                      "string",
                  )
                : typeof value ===
                    "string"
                  ? [value]
                  : [],
            );

          if (messages.length > 0) {
            setError(messages[0]);
            return;
          }
        }

        setError(err.message);
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "ثبت محصول انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProductForm
      mode="create"
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}