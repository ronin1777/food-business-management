import { SuppliersDetailContent } from "@/components/suppliers/SuppliersDetailContent";
import { notFound } from "next/navigation";


type SupplierDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SupplierDetailPage({
  params,
}: SupplierDetailPageProps) {
  const { id } = await params;

  const supplierId = Number(id);

  if (
    !Number.isInteger(supplierId) ||
    supplierId <= 0
  ) {
    notFound();
  }

  return (
    <SuppliersDetailContent
      supplierId={supplierId}
    />
  );
}