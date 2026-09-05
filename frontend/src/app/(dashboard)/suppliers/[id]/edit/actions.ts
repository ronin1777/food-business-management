"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { serverApi } from "@/lib/api/server";

type UpdateSupplierResponse = {
  success: boolean;
  data: {
    id: number;
  };
  message: string | null;
  errors: unknown;
};

export async function updateSupplierAction(
  supplierId: number,
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
    await serverApi<UpdateSupplierResponse>(
      `/api/suppliers/${supplierId}/`,
      {
        method: "PATCH",
        body: JSON.stringify({
          name,
          phone: phone || undefined,
          is_active: isActive,
        }),
      },
    );

  revalidatePath("/suppliers");
  revalidatePath(`/suppliers/${supplierId}`);

  redirect(
    `/suppliers/${response.data.id}`,
  );
}