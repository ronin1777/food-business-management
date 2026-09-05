import { SupplierTransactionsContent } from "@/components/suppliers/SupplierTransactionsContent";
import { notFound } from "next/navigation";


type SupplierTransactionsPageProps = {
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

export default async function SupplierTransactionsPage({
  params,
  searchParams,
}: SupplierTransactionsPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const supplierId = Number(id);

  if (
    !Number.isInteger(supplierId) ||
    supplierId <= 0
  ) {
    notFound();
  }

  return (
    <SupplierTransactionsContent
      supplierId={supplierId}
      page={query.page}
      search={query.search}
      direction={query.direction}
      ordering={query.ordering}
    />
  );
}