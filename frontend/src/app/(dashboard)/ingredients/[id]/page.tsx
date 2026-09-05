import { IngredientDetailContent } from "@/components/ingredients/IngredientDetailContent";
import { notFound } from "next/navigation";



type IngredientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function IngredientDetailPage({
  params,
}: IngredientDetailPageProps) {
  const { id } = await params;

  const ingredientId = Number(id);

  if (!Number.isInteger(ingredientId) || ingredientId <= 0) {
    notFound();
  }

  return (
    <IngredientDetailContent
      ingredientId={ingredientId}
    />
  );
}