import { createIngredientAction } from "@/app/(dashboard)/ingredients/new/actions";
import IngredientForm, {
  IngredientUnitOption,
} from "@/components/ingredients/IngredientForm";


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

export default function NewIngredientPage() {
  return (
    <IngredientForm
      mode="create"
      unitOptions={UNIT_OPTIONS}
      action={createIngredientAction}
    />
  );
}