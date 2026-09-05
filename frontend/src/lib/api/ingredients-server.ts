import "server-only";

import { serverApi } from "./server";

import type {
  Ingredient,
  IngredientListParams,
  IngredientsResponse,
} from "@/types/ingredients";

export async function getIngredientsServer(
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

  const query = searchParams.toString();

  return serverApi<IngredientsResponse>(
    `/api/ingredients/${
      query ? `?${query}` : ""
    }`,
  );
}

export async function getIngredientServer(
  ingredientId: number,
): Promise<Ingredient> {
  return serverApi<Ingredient>(
    `/api/ingredients/${ingredientId}/`,
  );
}