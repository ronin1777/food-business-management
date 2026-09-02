"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import IngredientForm, {
  IngredientUnitOption,
} from "@/components/ingredients/IngredientForm";

import {
  createIngredient,
} from "@/lib/api/ingredients";

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

export default function NewIngredientPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(values: {
    name: string;
    unit_type: string;
    is_active: boolean;
  }) {
    try {
      setLoading(true);
      setError(null);

      const ingredient =
        await createIngredient({
          name: values.name,
          unit_type: values.unit_type,
          is_active:
            values.is_active,
        });

      router.push(
        `/ingredients/${ingredient.id}`,
      );
    } catch (error) {
      console.error(
        "Create ingredient error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "ثبت ماده اولیه انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <IngredientForm
      mode="create"
      unitOptions={UNIT_OPTIONS}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}