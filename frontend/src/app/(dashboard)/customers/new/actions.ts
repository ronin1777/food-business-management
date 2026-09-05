"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { serverApi } from "@/lib/api/server";
import type { CustomerDetail } from "@/types/customers";

export async function createCustomerAction(
  formData: FormData,
) {
  const name = String(
    formData.get("name") ?? "",
  ).trim();

  const phone = String(
    formData.get("phone") ?? "",
  ).trim();

  const note = String(
    formData.get("note") ?? "",
  ).trim();

  const isActive =
    formData.get("is_active") === "on";

  if (!name) {
    throw new Error(
      "نام مشتری الزامی است.",
    );
  }

  if (name.length > 150) {
    throw new Error(
      "نام مشتری نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.",
    );
  }

  const response =
    await serverApi<CustomerDetail>(
      "/api/customers/",
      {
        method: "POST",
        body: JSON.stringify({
          name,
          phone: phone || undefined,
          note: note || undefined,
          is_active: isActive,
        }),
      },
    );

  revalidatePath("/customers");

  redirect(
    `/customers/${response.id}`,
  );
}