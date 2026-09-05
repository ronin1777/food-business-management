"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { serverApi } from "@/lib/api/server";
import type { IngredientResponse } from "@/types/ingredients";

export async function createIngredientAction(
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

  const response =
    await serverApi<IngredientResponse>(
      "/api/ingredients/",
      {
        method: "POST",
        body: JSON.stringify({
          name,
          unit_type: unitType,
          is_active: isActive,
        }),
      },
    );

  revalidatePath("/ingredients");

  redirect(
    `/ingredients/${response.data.id}`,
  );
}