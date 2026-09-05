"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { serverApi } from "@/lib/api/server";

import type {
  Ingredient,
  IngredientResponse,
} from "@/types/ingredients";

export async function updateIngredientAction(
  ingredientId: number,
  formData: FormData,
) {
  const name = String(
    formData.get("name") ?? "",
  ).trim();

  const unitType = String(
    formData.get("unit_type") ?? "",
  ).trim();

  const isActive =
    formData.get("is_active") === "on";

  if (!Number.isInteger(ingredientId) || ingredientId <= 0) {
    throw new Error(
      "شناسه ماده اولیه معتبر نیست.",
    );
  }

  if (!name) {
    throw new Error(
      "نام ماده اولیه الزامی است.",
    );
  }

  if (name.length > 150) {
    throw new Error(
      "نام ماده اولیه نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.",
    );
  }

  if (!unitType) {
    throw new Error(
      "نوع واحد را انتخاب کنید.",
    );
  }

  const response = await serverApi<
    Ingredient | IngredientResponse
  >(`/api/ingredients/${ingredientId}/`, {
    method: "PATCH",
    body: JSON.stringify({
      name,
      unit_type: unitType,
      is_active: isActive,
    }),
  });

  const updatedIngredient =
    "data" in response
      ? response.data
      : response;

  revalidatePath("/ingredients");
  revalidatePath(`/ingredients/${ingredientId}`);
  revalidatePath(`/ingredients/${ingredientId}/edit`);

  redirect(
    `/ingredients/${updatedIngredient.id}`,
  );
}