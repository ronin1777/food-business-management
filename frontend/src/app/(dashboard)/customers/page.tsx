import { CustomersContent } from "@/components/customers/CustomersContent";


type CustomersPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    ordering?: string;
  }>;
};

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;

  return (
    <CustomersContent
      page={params.page}
      search={params.search}
      ordering={params.ordering}
    />
  );
}