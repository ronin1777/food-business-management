"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import RecipeForm, {
  RecipeFormValues,
} from "@/components/recipes/RecipeForm";

import { getProducts } from "@/lib/api/products";
import { getIngredients } from "@/lib/api/ingredients";
import { createRecipe } from "@/lib/api/recipes";

import type { Product } from "@/types/products";
import type { Ingredient } from "@/types/ingredients";

export default function NewRecipePage() {
  const router = useRouter();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [ingredients, setIngredients] =
    useState<Ingredient[]>([]);

  const [
    loadingOptions,
    setLoadingOptions,
  ] = useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        setLoadingOptions(true);
        setError(null);

        const [
          productsResponse,
          ingredientsResponse,
        ] = await Promise.all([
          getProducts({
            page: 1,
            pageSize: 100,
            ordering: "name",
          }),
          getIngredients({
            page: 1,
            pageSize: 100,
            ordering: "name",
          }),
        ]);

        if (cancelled) {
          return;
        }

        setProducts(
          productsResponse.data.results,
        );

        setIngredients(
          ingredientsResponse.data.results,
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Recipe options error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "دریافت محصولات و مواد اولیه انجام نشد.",
        );
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(
    values: RecipeFormValues,
  ) {
    try {
      setLoading(true);
      setError(null);

      const recipe =
        await createRecipe({
          product: Number(
            values.product,
          ),
          valid_from:
            values.valid_from,
          valid_to:
            values.valid_to || null,
          is_active:
            values.is_active,
          items: values.items.map(
            (item) => ({
              ingredient: Number(
                item.ingredient,
              ),
              quantity: Number(
                item.quantity,
              ),
              unit: item.unit.trim(),
            }),
          ),
        });

      router.push(
        `/recipes/${recipe.id}`,
      );
    } catch (error) {
      console.error(
        "Create recipe error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "ثبت دستور تهیه انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <RecipeForm
      products={products}
      ingredients={ingredients}
      loadingOptions={
        loadingOptions
      }
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}