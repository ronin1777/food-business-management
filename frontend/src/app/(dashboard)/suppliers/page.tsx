import { SuppliersContent } from "@/components/suppliers/SuppliersContent";


type SuppliersPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    ordering?: string;
  }>;
};

export default async function SuppliersPage({
  searchParams,
}: SuppliersPageProps) {
  const params = await searchParams;

  return (
    <SuppliersContent
      page={params.page}
      search={params.search}
      ordering={params.ordering}
    />
  );
}