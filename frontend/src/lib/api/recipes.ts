
import { apiClient } from "./client";

import type {
  RecipeDetail,
  RecipeDetailResponse,
  RecipeListParams,
  RecipesResponse,
} from "@/types/recipes";

export async function getRecipes(
  params: RecipeListParams = {},
): Promise<RecipesResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.ordering) {
    searchParams.set("ordering", params.ordering);
  }

  const query = searchParams.toString();

  return apiClient<RecipesResponse>(
    `/api/recipes/${query ? `?${query}` : ""}`,
  );
}

export async function getRecipe(
  recipeId: number,
): Promise<RecipeDetail> {
  return apiClient<RecipeDetail>(
    `/api/recipes/${recipeId}/`,
  );
}

export type CreateRecipeItemPayload = {
  ingredient: number;
  quantity: number;
  unit: string;
};

export type CreateRecipePayload = {
  product: number;
  valid_from: string;
  valid_to?: string | null;
  is_active?: boolean;
  items: CreateRecipeItemPayload[];
};

export async function createRecipe(
  payload: CreateRecipePayload,
): Promise<RecipeDetailResponse> {
  return apiClient<RecipeDetailResponse>(
    "/api/recipes/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

