import CustomerForm from "@/components/customers/CustomerForm";

import { createCustomerAction } from "./actions";

export default function NewCustomerPage() {
  return (
    <CustomerForm
      mode="create"
      action={createCustomerAction}
    />
  );
}