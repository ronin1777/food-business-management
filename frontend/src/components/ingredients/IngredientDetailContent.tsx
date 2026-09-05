import Link from "next/link";

import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Beaker,
  Edit,
  Package,
} from "lucide-react";

import { ServerApiError } from "@/lib/api/server";
import { getIngredientServer } from "@/lib/api/ingredients-server";
import { getInventoryTransactionsServer } from "@/lib/api/inventory-server";

const UNIT_TYPE_LABELS: Record<string, string> = {
  weight: "وزنی",
  volume: "حجمی",
  count: "عددی",
};

type IngredientDetailContentProps = {
  ingredientId: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR").format(
    new Date(value),
  );
}

export async function IngredientDetailContent({
  ingredientId,
}: IngredientDetailContentProps) {
  const [
    ingredientResponse,
    transactionsResponse,
  ] = await Promise.all([
    getIngredientServer(ingredientId),
    getInventoryTransactionsServer({
      ingredient: ingredientId,
      page: 1,
      pageSize: 10,
      ordering: "-created_at",
    }),
  ]);

  const ingredient = ingredientResponse;
  const transactions =
    transactionsResponse.data.results;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/ingredients"
            className="flex size-9 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <Beaker className="size-5 text-muted-foreground" />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {ingredient.name}
            </h1>

            <p className="mt-1 text-xs text-muted-foreground">
              شناسه: {formatNumber(ingredient.id)}
            </p>
          </div>
        </div>

        <Link
          href={`/ingredients/${ingredient.id}/edit`}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Edit className="size-4" />
          ویرایش
        </Link>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between rounded-xl border bg-background px-5 py-4">
        <div>
          <p className="text-sm font-medium">
            وضعیت ماده اولیه
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            وضعیت فعال یا غیرفعال بودن ماده اولیه
          </p>
        </div>

        <span
          className={
            ingredient.is_active
              ? "rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success"
              : "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
          }
        >
          {ingredient.is_active
            ? "فعال"
            : "غیرفعال"}
        </span>
      </div>

      {/* Basic Information */}
      <div className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">
            اطلاعات پایه
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            مشخصات اصلی ماده اولیه
          </p>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">
              نام ماده اولیه
            </p>

            <p className="mt-2 text-sm font-medium">
              {ingredient.name}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              نوع واحد
            </p>

            <p className="mt-2 text-sm font-medium">
              {UNIT_TYPE_LABELS[
                ingredient.unit_type
              ] ?? ingredient.unit_type}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              واحد پایه
            </p>

            <p className="mt-2 text-sm font-medium">
              {ingredient.base_unit}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              تاریخ ایجاد
            </p>

            <p className="mt-2 text-sm font-medium">
              {formatDate(
                ingredient.created_at,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              آخرین بروزرسانی
            </p>

            <p className="mt-2 text-sm font-medium">
              {formatDate(
                ingredient.updated_at,
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">
            خلاصه موجودی
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            وضعیت فعلی موجودی و ارزش آن
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">
              موجودی فعلی
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">
                {formatNumber(
                  Number(
                    ingredient.current_stock,
                  ),
                )}
              </span>

              <span className="text-sm text-muted-foreground">
                {ingredient.base_unit}
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">
              ارزش موجودی
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">
                {formatNumber(
                  Number(
                    ingredient.current_inventory_value,
                  ),
                )}
              </span>

              <span className="text-sm text-muted-foreground">
                تومان
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">
              بهای میانگین هر واحد
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">
                {Number(
                  ingredient.average_unit_cost,
                ).toLocaleString("fa-IR", {
                  maximumFractionDigits: 6,
                })}
              </span>

              <span className="text-sm text-muted-foreground">
                تومان
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Transactions */}
      <div className="rounded-xl border bg-background">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-semibold">
              گردش موجودی
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              آخرین تغییرات موجودی این ماده اولیه
            </p>
          </div>

          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Package className="size-4 text-muted-foreground" />
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="mx-auto size-8 text-muted-foreground/50" />

            <p className="mt-3 text-sm font-medium">
              گردش موجودی ثبت نشده است
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              هنوز هیچ تراکنشی برای این ماده اولیه ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20 text-right text-muted-foreground">
                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    نوع عملیات
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    مقدار
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    بهای واحد
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    ارزش
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 font-medium">
                    تاریخ
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions.map(
                  (transaction) => {
                    const isIncrease =
                      Number(
                        transaction.quantity,
                      ) > 0;

                    return (
                      <tr
                        key={transaction.id}
                        className="border-b last:border-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={
                                isIncrease
                                  ? "flex size-8 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success"
                                  : "flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive"
                              }
                            >
                              {isIncrease ? (
                                <ArrowDownLeft className="size-4" />
                              ) : (
                                <ArrowUpRight className="size-4" />
                              )}
                            </div>

                            <span className="whitespace-nowrap font-medium">
                              {
                                transaction.transaction_type_display
                              }
                            </span>
                          </div>
                        </td>

                        <td
                          className={
                            isIncrease
                              ? "whitespace-nowrap px-5 py-4 font-medium text-success"
                              : "whitespace-nowrap px-5 py-4 font-medium text-destructive"
                          }
                        >
                          {isIncrease
                            ? "+"
                            : ""}

                          {Number(
                            transaction.quantity,
                          ).toLocaleString(
                            "fa-IR",
                          )}

                          <span className="mr-1 text-xs font-normal">
                            {
                              ingredient.base_unit
                            }
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                          {Number(
                            transaction.unit_cost,
                          ).toLocaleString(
                            "fa-IR",
                            {
                              maximumFractionDigits: 6,
                            },
                          )}

                          <span className="mr-1 text-xs">
                            تومان
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-medium">
                          {Number(
                            transaction.total_cost,
                          ).toLocaleString(
                            "fa-IR",
                            {
                              maximumFractionDigits: 2,
                            },
                          )}

                          <span className="mr-1 text-xs font-normal text-muted-foreground">
                            تومان
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                          {formatDate(
                            transaction.created_at,
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}