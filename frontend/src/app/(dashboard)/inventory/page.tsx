import Link from "next/link";

import { getIngredientsServer } from "@/lib/api/ingredients-server";
import { getInventoryTransactionsServer } from "@/lib/api/inventory-server";


import InventoryActions from "./InventoryActions";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import InventorySortButton from "@/components/inventory/InventorySortButton";


type InventoryPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    ingredient?: string;
    transaction_type?: string;
    created_at_after?: string;
    created_at_before?: string;
    ordering?: string;
  }>;
};

function formatNumber(
  value: number,
  maximumFractionDigits = 3,
) {
  return Number(value).toLocaleString("fa-IR", {
    maximumFractionDigits,
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fa-IR");
}

const TRANSACTION_TYPES = [
  {
    value: "purchase",
    label: "خرید",
  },
  {
    value: "order_usage",
    label: "مصرف سفارش",
  },
  {
    value: "waste",
    label: "دورریز",
  },
  {
    value: "adjustment",
    label: "اصلاح موجودی",
  },
  {
    value: "reversal",
    label: "معکوس",
  },
] as const;

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const params = await searchParams;

  const page = Math.max(
    1,
    Number(params.page) || 1,
  );

  const parsedIngredientId = params.ingredient
    ? Number(params.ingredient)
    : undefined;

  const ingredientId =
    parsedIngredientId &&
    Number.isInteger(parsedIngredientId) &&
    parsedIngredientId > 0
      ? parsedIngredientId
      : undefined;

  const transactionType =
    params.transaction_type as
      | "purchase"
      | "order_usage"
      | "waste"
      | "adjustment"
      | "reversal"
      | undefined;

  const ordering =
    params.ordering || "-created_at";

  const [
    ingredientsResponse,
    transactionsResponse,
  ] = await Promise.all([
    getIngredientsServer({
      page: 1,
      pageSize: 100,
      ordering: "name",
    }),

    getInventoryTransactionsServer({
      page,
      pageSize: 20,
      ingredient: ingredientId,
      transaction_type: transactionType,
      search:
        params.search?.trim() || undefined,
      created_at_after:
        params.created_at_after || undefined,
      created_at_before:
        params.created_at_before || undefined,
      ordering,
    }),
  ]);

  const ingredients =
    ingredientsResponse.data.results;

  const transactionData =
    transactionsResponse.data;

  const transactions =
    transactionData.results;

  const totalCount =
    transactionData.count;

  const hasPrevious =
    Boolean(transactionData.previous);

  const hasNext =
    Boolean(transactionData.next);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            گردش موجودی
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            مشاهده و بررسی تمام تراکنش‌های انبار
          </p>
        </div>

        <InventoryActions
          ingredients={ingredients}
          totalCount={totalCount}
        />
      </div>

      {/* Filters */}
      <InventoryFilters
        ingredients={ingredients}
        transactionTypes={TRANSACTION_TYPES}
      />

      {/* Transactions */}
      <div className="rounded-xl border bg-background">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-semibold">
              تراکنش‌های انبار
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {totalCount > 0
                ? `${formatNumber(
                    totalCount,
                    0,
                  )} تراکنش ثبت شده است`
                : "تراکنشی برای نمایش وجود ندارد"}
            </p>
          </div>

          <InventorySortButton
            ordering={ordering}
          />
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium">
              تراکنشی پیدا نشد
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              با تغییر فیلترها دوباره جستجو کنید.
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
                    ماده اولیه
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

                  <th className="px-5 py-3" />
                </tr>
              </thead>

              <tbody>
                {transactions.map(
                  (transaction) => {
                    const isIncrease =
                      transaction.quantity > 0;

                    return (
                      <tr
                        key={transaction.id}
                        className="border-b transition-colors last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <span className="font-medium">
                            {
                              transaction.transaction_type_display
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            href={`/ingredients/${transaction.ingredient}`}
                            className="font-medium transition-colors hover:underline"
                          >
                            {
                              transaction.ingredient_name
                            }
                          </Link>
                        </td>

                        <td
                          className={`whitespace-nowrap px-5 py-4 font-medium ${
                            isIncrease
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {isIncrease
                            ? "+"
                            : ""}

                          {formatNumber(
                            transaction.quantity,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                          {formatNumber(
                            transaction.unit_cost,
                            6,
                          )}

                          <span className="mr-1 text-xs">
                            تومان
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-medium">
                          {formatNumber(
                            transaction.total_cost,
                            2,
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

                        <td className="px-5 py-4">
                          <Link
                            href={`/inventory/${transaction.id}`}
                            className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
                          >
                            جزئیات
                          </Link>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}

        {(hasPrevious || hasNext) && (
          <div className="flex items-center justify-between border-t px-5 py-4">
            <p className="text-xs text-muted-foreground">
              صفحه {formatNumber(page, 0)}
            </p>

            <div className="flex items-center gap-2">
              {hasPrevious && (
                <Link
                  href={buildPageUrl(
                    params,
                    page - 1,
                  )}
                  className="rounded-lg border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
                >
                  قبلی
                </Link>
              )}

              {hasNext && (
                <Link
                  href={buildPageUrl(
                    params,
                    page + 1,
                  )}
                  className="rounded-lg border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
                >
                  بعدی
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildPageUrl(
  params: Record<
    string,
    string | undefined
  >,
  page: number,
) {
  const searchParams =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value &&
        key !== "page"
      ) {
        searchParams.set(key, value);
      }
    },
  );

  searchParams.set(
    "page",
    String(page),
  );

  const query =
    searchParams.toString();

  return `/inventory${
    query ? `?${query}` : ""
  }`;
}