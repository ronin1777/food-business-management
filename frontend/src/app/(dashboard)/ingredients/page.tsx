import { IngredientsContent } from "@/components/ingredients/IngredientsContent";

type IngredientsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    ordering?: string;
  }>;
};

export default async function IngredientsPage({
  searchParams,
}: IngredientsPageProps) {
  const params = await searchParams;

  return (
    <IngredientsContent
      page={params.page}
      search={params.search}
      ordering={params.ordering}
    />
  );
}