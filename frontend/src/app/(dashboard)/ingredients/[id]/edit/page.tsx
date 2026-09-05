import { notFound } from "next/navigation";

import IngredientForm, {
  IngredientUnitOption,
} from "@/components/ingredients/IngredientForm";

import { getIngredientServer } from "@/lib/api/ingredients-server";
import { updateIngredientAction } from "@/app/(dashboard)/ingredients/[id]/edit/actions";



const UNIT_OPTIONS: IngredientUnitOption[] = [
  {
    value: "weight",
    label: "وزنی",
  },
  {
    value: "volume",
    label: "حجمی",
  },
  {
    value: "count",
    label: "عددی",
  },
];

type EditIngredientPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditIngredientPage({
  params,
}: EditIngredientPageProps) {
  const { id } = await params;

  const ingredientId = Number(id);

  if (
    !Number.isInteger(ingredientId) ||
    ingredientId <= 0
  ) {
    notFound();
  }

  const ingredient =
    await getIngredientServer(ingredientId);

  return (
    <IngredientForm
      mode="edit"
      initialValues={ingredient}
      unitOptions={UNIT_OPTIONS}
      action={updateIngredientAction.bind(
        null,
        ingredientId,
      )}
    />
  );
}