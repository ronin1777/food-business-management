import { apiClient } from "./client";

import type {
  Ingredient,
  IngredientListParams,
  IngredientsResponse,
} from "@/types/ingredients";

export async function getIngredients(
  params: IngredientListParams = {},
): Promise<IngredientsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params.pageSize) {
    searchParams.set(
      "page_size",
      String(params.pageSize),
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (params.ordering) {
    searchParams.set(
      "ordering",
      params.ordering,
    );
  }

  const query =
    searchParams.toString();

  return apiClient<IngredientsResponse>(
    `/api/ingredients/${query ? `?${query}` : ""}`,
  );
}

export async function getIngredient(
  ingredientId: number,
): Promise<Ingredient> {
  return apiClient<Ingredient>(
    `/api/ingredients/${ingredientId}/`,
  );
}

export type CreateIngredientPayload = {
  name: string;
  unit_type: string;
  is_active?: boolean;
};

export async function createIngredient(
  payload: CreateIngredientPayload,
): Promise<Ingredient> {
  return apiClient<Ingredient>(
    "/api/ingredients/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type UpdateIngredientPayload = {
  name?: string;
  unit_type?: string;
  is_active?: boolean;
};

export async function updateIngredient(
  ingredientId: number,
  payload: UpdateIngredientPayload,
): Promise<Ingredient> {
  return apiClient<Ingredient>(
    `/api/ingredients/${ingredientId}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}