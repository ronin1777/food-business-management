import { notFound } from "next/navigation";

import CustomerForm from "@/components/customers/CustomerForm";
import { ServerApiError } from "@/lib/api/server";
import { getCustomerServer } from "@/lib/api/customers-server";
import { updateCustomerAction } from "@/app/(dashboard)/customers/[id]/edit/actions";



type EditCustomerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const { id } = await params;

  const customerId = Number(id);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    notFound();
  }

  let customer;

  try {
    const response = await getCustomerServer(customerId);

    customer = response;
  } catch (error) {
    if (
      error instanceof ServerApiError &&
      error.status === 404
    ) {
      notFound();
    }

    throw error;
  }

  const action = updateCustomerAction.bind(
    null,
    customerId,
  );

  return (
    <CustomerForm
      mode="edit"
      initialValues={customer}
      action={action}
    />
  );
}