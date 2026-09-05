import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  ReceiptText,
  Search,
  X,
} from "lucide-react";

import {
  getSupplierServer,
  getSupplierTransactionsServer,
} from "@/lib/api/suppliers-server";

type SupplierTransactionsContentProps = {
  supplierId: number;
  page?: string;
  search?: string;
  direction?: string;
  ordering?: string;
};

const PAGE_SIZE = 20;

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getDirectionClass(direction: string) {
  if (direction === "debit") {
    return "bg-destructive/10 text-destructive";
  }

  if (direction === "credit") {
    return "bg-success/10 text-success";
  }

  return "bg-muted text-muted-foreground";
}

function createUrl(
  supplierId: number,
  params: {
    page?: number;
    search?: string;
    direction?: string;
    ordering?: string;
  },
) {
  const searchParams = new URLSearchParams();

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.direction) {
    searchParams.set("direction", params.direction);
  }

  if (params.ordering && params.ordering !== "-created_at") {
    searchParams.set("ordering", params.ordering);
  }

  const query = searchParams.toString();

  return `/suppliers/${supplierId}/transactions${
    query ? `?${query}` : ""
  }`;
}

export async function SupplierTransactionsContent({
  supplierId,
  page,
  search,
  direction,
  ordering,
}: SupplierTransactionsContentProps) {
  const currentPage = Math.max(
    1,
    Number(page) || 1,
  );

  const currentSearch =
    search?.trim() || "";

  const currentDirection =
    direction === "debit" ||
    direction === "credit"
      ? direction
      : "";

  const currentOrdering =
    ordering === "created_at"
      ? "created_at"
      : "-created_at";

  const [
    supplierResponse,
    transactionsResponse,
  ] = await Promise.all([
    getSupplierServer(supplierId),
    getSupplierTransactionsServer({
      supplier: supplierId,
      page: currentPage,
      pageSize: PAGE_SIZE,
      search: currentSearch || undefined,
      direction:
        currentDirection || undefined,
      ordering: currentOrdering,
    }),
  ]);

  const supplier =
    supplierResponse.data;

  const transactions =
    transactionsResponse.data.results;

  const count =
    transactionsResponse.data.count;

  const totalPages = Math.max(
    1,
    Math.ceil(count / PAGE_SIZE),
  );

  const firstItem =
    count === 0
      ? 0
      : (currentPage - 1) *
          PAGE_SIZE +
        1;

  const lastItem = Math.min(
    currentPage * PAGE_SIZE,
    count,
  );

  const nextOrdering =
    currentOrdering === "created_at"
      ? "-created_at"
      : "created_at";

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <Link
          href={`/suppliers/${supplierId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          {supplier.name}
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
                <ReceiptText className="size-5 text-muted-foreground" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  تراکنش‌های تأمین‌کننده
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  {supplier.name}
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/suppliers/${supplierId}`}
            className="hidden rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent sm:inline-flex"
          >
            بازگشت
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <form
            action={`/suppliers/${supplierId}/transactions`}
            className="relative flex-1"
          >
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              name="search"
              defaultValue={currentSearch}
              placeholder="جستجو در توضیحات..."
              className="h-10 w-full rounded-lg border border-input bg-background pr-9 pl-9 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            />

            {currentSearch && (
              <Link
                href={createUrl(supplierId, {
                  direction: currentDirection,
                  ordering: currentOrdering,
                })}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Link>
            )}

            <input
              type="hidden"
              name="direction"
              value={currentDirection}
            />

            <input
              type="hidden"
              name="ordering"
              value={currentOrdering}
            />
          </form>

          <form
            action={`/suppliers/${supplierId}/transactions`}
          >
            <input
              type="hidden"
              name="search"
              value={currentSearch}
            />

            <input
              type="hidden"
              name="ordering"
              value={currentOrdering}
            />

            <select
              name="direction"
              defaultValue={currentDirection}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 lg:w-44"
            >
              <option value="">
                همه تراکنش‌ها
              </option>

              <option value="debit">
                بدهکار
              </option>

              <option value="credit">
                بستانکار
              </option>
            </select>

            <button
              type="submit"
              className="sr-only"
            >
              اعمال فیلتر
            </button>
          </form>

          <form
            action={`/suppliers/${supplierId}/transactions`}
          >
            <input
              type="hidden"
              name="search"
              value={currentSearch}
            />

            <input
              type="hidden"
              name="direction"
              value={currentDirection}
            />

            <input
              type="hidden"
              name="ordering"
              value={currentOrdering}
            />

            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Search className="size-4" />
              جستجو
            </button>
          </form>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">
              تراکنش‌ها
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {count > 0
                ? `${formatNumber(count)} تراکنش`
                : "تراکنشی ثبت نشده است"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  نوع
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  جهت
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  مبلغ
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  خرید
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  توضیح
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  <Link
                    href={createUrl(
                      supplierId,
                      {
                        page: currentPage,
                        search: currentSearch,
                        direction:
                          currentDirection,
                        ordering:
                          nextOrdering,
                      },
                    )}
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    تاریخ

                    {currentOrdering ===
                    "created_at" ? (
                      <ArrowUp className="size-3.5" />
                    ) : (
                      <ArrowDown className="size-3.5" />
                    )}
                  </Link>
                </th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center"
                  >
                    <ReceiptText className="mx-auto size-7 text-muted-foreground" />

                    <p className="mt-3 text-sm font-medium">
                      تراکنشی پیدا نشد
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      با فیلتر دیگری دوباره
                      جستجو کنید.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map(
                  (transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-border/70 last:border-b-0 hover:bg-muted/20"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium">
                          {
                            transaction.transaction_type_display
                          }
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          تراکنش #
                          {formatNumber(
                            transaction.id,
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getDirectionClass(
                            transaction.direction,
                          )}`}
                        >
                          {
                            transaction.direction_display
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold">
                          {formatMoney(
                            Number(
                              transaction.amount,
                            ),
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {transaction.purchase ? (
                          <Link
                            href={`/purchases/${transaction.purchase}`}
                            className="text-sm font-medium underline-offset-4 hover:underline"
                          >
                            خرید #
                            {formatNumber(
                              transaction.purchase,
                            )}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>

                      <td className="max-w-[280px] px-5 py-4">
                        <span className="block truncate text-sm text-muted-foreground">
                          {transaction.note ||
                            "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="text-sm">
                          {formatDate(
                            transaction.created_at,
                          )}
                        </span>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {count > 0 && (
          <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              نمایش{" "}
              {formatNumber(firstItem)} تا{" "}
              {formatNumber(lastItem)} از{" "}
              {formatNumber(count)}
            </p>

            <div className="flex items-center gap-2">
              <Link
                href={createUrl(
                  supplierId,
                  {
                    page: currentPage - 1,
                    search: currentSearch,
                    direction:
                      currentDirection,
                    ordering:
                      currentOrdering,
                  },
                )}
                aria-disabled={
                  currentPage <= 1
                }
                className={`rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-accent ${
                  currentPage <= 1
                    ? "pointer-events-none opacity-40"
                    : ""
                }`}
              >
                قبلی
              </Link>

              <span className="min-w-20 text-center text-xs text-muted-foreground">
                صفحه{" "}
                {formatNumber(
                  currentPage,
                )}{" "}
                از{" "}
                {formatNumber(totalPages)}
              </span>

              <Link
                href={createUrl(
                  supplierId,
                  {
                    page: currentPage + 1,
                    search: currentSearch,
                    direction:
                      currentDirection,
                    ordering:
                      currentOrdering,
                  },
                )}
                aria-disabled={
                  currentPage >= totalPages
                }
                className={`rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-accent ${
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-40"
                    : ""
                }`}
              >
                بعدی
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}