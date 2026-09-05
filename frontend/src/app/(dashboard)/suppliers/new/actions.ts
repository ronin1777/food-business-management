"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { serverApi } from "@/lib/api/server";

type CreateSupplierResponse = {
  success: boolean;
  data: {
    id: number;
  };
  message: string | null;
  errors: unknown;
};

export async function createSupplierAction(
  formData: FormData,
) {
  const name = String(
    formData.get("name") ?? "",
  ).trim();

  const phone = String(
    formData.get("phone") ?? "",
  ).trim();

  const isActive =
    formData.get("is_active") === "on";

  if (!name) {
    throw new Error(
      "نام تأمین‌کننده الزامی است.",
    );
  }

  if (name.length > 150) {
    throw new Error(
      "نام تأمین‌کننده نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.",
    );
  }

  const response =
    await serverApi<CreateSupplierResponse>(
      "/api/suppliers/",
      {
        method: "POST",
        body: JSON.stringify({
          name,
          phone: phone || undefined,
          is_active: isActive,
        }),
      },
    );

  revalidatePath("/suppliers");

  redirect(
    `/suppliers/${response.data.id}`,
  );
}