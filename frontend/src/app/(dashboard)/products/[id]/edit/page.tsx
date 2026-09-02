"use client";

import {
  use,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import ProductForm, {
  ProductFormValues,
} from "@/components/products/ProductForm";

import {
  getProduct,
  updateProduct,
} from "@/lib/api/products";

import type { Product } from "@/types/products";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditProductPage({
  params,
}: EditProductPageProps) {
  const router = useRouter();

  const { id } = use(params);

  const productId = Number(id);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      setError(
        "شناسه محصول معتبر نیست.",
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getProduct(productId);

        if (cancelled) {
          return;
        }

        setProduct(response);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Get product error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "دریافت اطلاعات محصول انجام نشد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function handleSubmit(
    values: ProductFormValues,
  ) {
    try {
      setSaving(true);
      setError(null);

      const updatedProduct =
        await updateProduct(
          productId,
          {
            name: values.name,
            selling_price: Number(
              values.selling_price,
            ),
            is_active:
              values.is_active,
          },
        );

      router.push(
        `/products/${updatedProduct.id}`,
      );
    } catch (error) {
      console.error(
        "Update product error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "بروزرسانی محصول انجام نشد.",
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

        <div className="h-[460px] animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
          {error ??
            "محصول پیدا نشد."}
        </div>
      </div>
    );
  }

  return (
    <ProductForm
      mode="edit"
      initialValues={product}
      loading={saving}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}