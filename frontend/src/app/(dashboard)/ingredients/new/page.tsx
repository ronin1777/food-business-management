"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import IngredientForm, {
  IngredientUnitOption,
} from "@/components/ingredients/IngredientForm";

import { ApiError } from "@/lib/api/client";
import { createIngredient } from "@/lib/api/ingredients";

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: {
    name: string;
    unit_type: string;
    is_active: boolean;
  }) {
    try {
  setLoading(true);
  setError(null);

  const response = await createIngredient({
    name: values.name,
    unit_type: values.unit_type,
    is_active: values.is_active,
  });

  console.log(
    "CREATE INGREDIENT RESPONSE:",
    response,
  );

  router.push(`/ingredients/${response.data.id}`);
} catch (err) {
  console.error(
    "Create ingredient error:",
    err,
  );

  if (err instanceof ApiError) {
    const errors = err.errors;

    if (
      errors &&
      typeof errors === "object"
    ) {
      const fieldErrors = errors as Record<
        string,
        unknown
      >;

      const messages = Object.values(
        fieldErrors,
      ).flatMap((value) =>
        Array.isArray(value)
          ? value.filter(
              (item): item is string =>
                typeof item === "string",
            )
          : typeof value === "string"
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