"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import ProductForm, {
  ProductFormValues,
} from "@/components/products/ProductForm";

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

      const product =
        await createProduct({
          name: values.name,
          selling_price: Number(
            values.selling_price,
          ),
          is_active:
            values.is_active,
        });

      router.push(
        `/products/${product.id}`,
      );
    } catch (error) {
      console.error(
        "Create product error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
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