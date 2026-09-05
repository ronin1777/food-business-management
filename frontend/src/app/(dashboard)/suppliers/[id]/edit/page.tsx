import { notFound } from "next/navigation";

import SupplierForm from "@/components/suppliers/SupplierForm";
import {
  getSupplierServer,
} from "@/lib/api/suppliers-server";
import {
  ServerApiError,
} from "@/lib/api/server";

import {
  updateSupplierAction,
} from "./actions";

type EditSupplierPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSupplierPage({
  params,
}: EditSupplierPageProps) {
  const { id } = await params;

  const supplierId = Number(id);

  if (
    !Number.isInteger(supplierId) ||
    supplierId <= 0
  ) {
    notFound();
  }

  let supplier;

  try {
    const response =
      await getSupplierServer(
        supplierId,
      );

    supplier = response.data;
  } catch (error) {
    if (
      error instanceof ServerApiError &&
      error.status === 404
    ) {
      notFound();
    }

    throw error;
  }

  const action =
    updateSupplierAction.bind(
      null,
      supplierId,
    );

  return (
    <SupplierForm
      mode="edit"
      initialValues={supplier}
      action={action}
    />
  );
}