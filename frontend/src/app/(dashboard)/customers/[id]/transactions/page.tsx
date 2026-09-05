import { CustomerTransactionsContent } from "@/components/customers/CustomerTransactionsContent";
import { notFound } from "next/navigation";



type CustomerTransactionsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    direction?: string;
    ordering?: string;
  }>;
};

export default async function CustomerTransactionsPage({
  params,
  searchParams,
}: CustomerTransactionsPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const customerId = Number(id);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    notFound();
  }

  return (
    <CustomerTransactionsContent
      customerId={customerId}
      page={query.page}
      search={query.search}
      direction={query.direction}
      ordering={query.ordering}
    />
  );
}