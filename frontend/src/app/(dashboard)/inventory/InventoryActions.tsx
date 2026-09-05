"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";

import InventoryAdjustmentDialog from "@/components/inventory/InventoryAdjustmentDialog";
import InventoryWasteDialog from "@/components/inventory/InventoryWasteDialog";

import type { Ingredient } from "@/types/ingredients";

type Props = {
  ingredients: Ingredient[];
  totalCount: number;
};

export default function InventoryActions({
  ingredients,
  totalCount,
}: Props) {
  const router = useRouter();

  const [adjustmentOpen, setAdjustmentOpen] =
    useState(false);

  const [wasteOpen, setWasteOpen] =
    useState(false);

  function handleSuccess() {
    setAdjustmentOpen(false);
    setWasteOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() =>
            setAdjustmentOpen(true)
          }
          className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-3 text-sm font-medium hover:bg-muted"
        >
          اصلاح موجودی
        </button>

        <button
          type="button"
          onClick={() =>
            setWasteOpen(true)
          }
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          ثبت دورریز
        </button>

        <div className="mr-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="size-4" />

          <span>
            {Number(totalCount).toLocaleString(
              "fa-IR",
            )}{" "}
            تراکنش
          </span>
        </div>
      </div>

      <InventoryAdjustmentDialog
        open={adjustmentOpen}
        ingredients={ingredients}
        onClose={() =>
          setAdjustmentOpen(false)
        }
        onSuccess={handleSuccess}
      />

      <InventoryWasteDialog
        open={wasteOpen}
        ingredients={ingredients}
        onClose={() =>
          setWasteOpen(false)
        }
        onSuccess={handleSuccess}
      />
    </>
  );
}