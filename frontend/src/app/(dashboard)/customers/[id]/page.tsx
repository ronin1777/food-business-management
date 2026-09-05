import { CustomerDetailContent } from "@/components/customers/CustomerDetailContent";
import { notFound } from "next/navigation";



type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = await params;

  const customerId = Number(id);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    notFound();
  }

  return (
    <CustomerDetailContent
      customerId={customerId}
    />
  );
}