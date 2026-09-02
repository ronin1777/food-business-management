"use client";

import {
  use,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import IngredientForm, {
  IngredientUnitOption,
} from "@/components/ingredients/IngredientForm";

import {
  getIngredient,
  updateIngredient,
} from "@/lib/api/ingredients";

import type {
  Ingredient,
} from "@/types/ingredients";

const UNIT_OPTIONS: IngredientUnitOption[] = [
  {
    value: "weight",
    label: "وزنی",
  },
  {
    value: "volume",
    label: "حجمی",
  },
  {
    value: "count",
    label: "عددی",
  },
];

type EditIngredientPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditIngredientPage({
  params,
}: EditIngredientPageProps) {
  const router = useRouter();

  const { id } = use(params);

  const ingredientId = Number(id);

  const [ingredient, setIngredient] =
    useState<Ingredient | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (
      !Number.isInteger(
        ingredientId,
      ) ||
      ingredientId <= 0
    ) {
      setError(
        "شناسه ماده اولیه معتبر نیست.",
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadIngredient() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getIngredient(
            ingredientId,
          );

        if (cancelled) {
          return;
        }

        setIngredient(response);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Get ingredient error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "دریافت اطلاعات ماده اولیه انجام نشد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadIngredient();

    return () => {
      cancelled = true;
    };
  }, [ingredientId]);

  async function handleSubmit(values: {
    name: string;
    unit_type: string;
    is_active: boolean;
  }) {
    try {
      setSaving(true);
      setError(null);

      const updatedIngredient =
        await updateIngredient(
          ingredientId,
          {
            name: values.name,
            unit_type:
              values.unit_type,
            is_active:
              values.is_active,
          },
        );

      router.push(
        `/ingredients/${updatedIngredient.id}`,
      );
    } catch (error) {
      console.error(
        "Update ingredient error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "بروزرسانی ماده اولیه انجام نشد.",
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

  if (!ingredient) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
          {error ??
            "ماده اولیه پیدا نشد."}
        </div>
      </div>
    );
  }

  return (
    <IngredientForm
      mode="edit"
      initialValues={ingredient}
      unitOptions={UNIT_OPTIONS}
      loading={saving}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}