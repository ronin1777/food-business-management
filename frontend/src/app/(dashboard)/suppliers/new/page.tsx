import SupplierForm from "@/components/suppliers/SupplierForm";

import { createSupplierAction } from "./actions";

export default function NewSupplierPage() {
  return (
    <SupplierForm
      mode="create"
      action={createSupplierAction}
    />
  );
}