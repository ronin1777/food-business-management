import Link from "next/link";
import {
  ArrowDownAZ,
  ArrowLeft,
  ArrowRight,
  ArrowUpAZ,
  ReceiptText,
  Search,
  UserRound,
} from "lucide-react";

import {
  getCustomerServer,
  getCustomerTransactionsServer,
} from "@/lib/api/customers-server";

const PAGE_SIZE = 20;

type CustomerTransactionsContentProps = {
  customerId: number;
  page?: string;
  search?: string;
  direction?: string;
  ordering?: string;
};

function parsePage(value?: string) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function getDirection(value?: string) {
  return value === "debit" || value === "credit"
    ? value
    : "";
}

function getOrdering(value?: string) {
  return value === "created_at"
    ? "created_at"
    : "-created_at";
}

function createUrl({
  customerId,
  page,
  search,
  direction,
  ordering,
}: {
  customerId: number;
  page: number;
  search?: string;
  direction: string;
  ordering: string;
}) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (search) {
    params.set("search", search);
  }

  if (direction) {
    params.set("direction", direction);
  }

  if (ordering !== "-created_at") {
    params.set("ordering", ordering);
  }

  const query = params.toString();

  return `/customers/${customerId}/transactions${
    query ? `?${query}` : ""
  }`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

function formatDateTime(value: string) {
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

export async function CustomerTransactionsContent({
  customerId,
  page: pageParam,
  search: searchParam,
  direction: directionParam,
  ordering: orderingParam,
}: CustomerTransactionsContentProps) {
  const page = parsePage(pageParam);
  const search = searchParam?.trim() ?? "";
  const direction = getDirection(directionParam);
  const ordering = getOrdering(orderingParam);

  const [customerResponse, transactionsResponse] =
    await Promise.all([
      getCustomerServer(customerId),

      getCustomerTransactionsServer({
        customer: customerId,
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        direction: direction || undefined,
        ordering,
      }),
    ]);

  const customer = customerResponse;
  const pagination = transactionsResponse.data;
  const transactions = pagination.results;

  const totalCount = pagination.count;
  const pageCount = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE),
  );

  const hasNext = Boolean(pagination.next);
  const hasPrevious = Boolean(
    pagination.previous,
  );

  const previousUrl = hasPrevious
    ? createUrl({
        customerId,
        page: page - 1,
        search,
        direction,
        ordering,
      })
    : "#";

  const nextUrl = hasNext
    ? createUrl({
        customerId,
        page: page + 1,
        search,
        direction,
        ordering,
      })
    : "#";

  const orderingUrl = createUrl({
    customerId,
    page: 1,
    search,
    direction,
    ordering:
      ordering === "-created_at"
        ? "created_at"
        : "-created_at",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <Link
          href={`/customers/${customer.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          {customer.name}
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
            <UserRound className="size-5 text-muted-foreground" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              گردش حساب
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {customer.name}
            </p>
          </div>
        </div>
      </section>

      {/* Main Card */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 xl:flex-row xl:items-center">
          <form
            action={`/customers/${customerId}/transactions`}
            className="relative min-w-0 flex-1"
          >
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              name="search"
              defaultValue={search}
              placeholder="جستجو در توضیحات..."
              className="
                h-10 w-full
                rounded-lg
                border border-input
                bg-background
                pr-9 pl-3
                text-sm
                outline-none
                placeholder:text-muted-foreground
                focus:border-ring
                focus:ring-2
                focus:ring-ring/20
              "
            />

            {direction && (
              <input
                type="hidden"
                name="direction"
                value={direction}
              />
            )}

            {ordering !== "-created_at" && (
              <input
                type="hidden"
                name="ordering"
                value={ordering}
              />
            )}
          </form>

          {/* Direction */}
          <div className="flex gap-2">
            <Link
              href={createUrl({
                customerId,
                page: 1,
                search,
                direction: "",
                ordering,
              })}
              className={`
                inline-flex h-10
                items-center justify-center
                rounded-lg
                border border-input
                px-3
                text-sm
                transition-colors
                ${
                  !direction
                    ? "bg-accent font-medium"
                    : "bg-background hover:bg-accent"
                }
              `}
            >
              همه
            </Link>

            <Link
              href={createUrl({
                customerId,
                page: 1,
                search,
                direction: "debit",
                ordering,
              })}
              className={`
                inline-flex h-10
                items-center justify-center
                rounded-lg
                border border-input
                px-3
                text-sm
                transition-colors
                ${
                  direction === "debit"
                    ? "bg-accent font-medium"
                    : "bg-background hover:bg-accent"
                }
              `}
            >
              بدهکار
            </Link>

            <Link
              href={createUrl({
                customerId,
                page: 1,
                search,
                direction: "credit",
                ordering,
              })}
              className={`
                inline-flex h-10
                items-center justify-center
                rounded-lg
                border border-input
                px-3
                text-sm
                transition-colors
                ${
                  direction === "credit"
                    ? "bg-accent font-medium"
                    : "bg-background hover:bg-accent"
                }
              `}
            >
              بستانکار
            </Link>
          </div>

          {/* Ordering */}
          <Link
            href={orderingUrl}
            className="
              inline-flex h-10
              items-center justify-center
              gap-2
              rounded-lg
              border border-input
              bg-background
              px-3
              text-sm font-medium
              transition-colors
              hover:bg-accent
            "
          >
            {ordering === "-created_at" ? (
              <ArrowDownAZ className="size-4" />
            ) : (
              <ArrowUpAZ className="size-4" />
            )}

            <span>
              {ordering === "-created_at"
                ? "جدیدترین"
                : "قدیمی‌ترین"}
            </span>
          </Link>
        </div>

        {/* Table */}
        {transactions.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <ReceiptText className="size-5 text-muted-foreground" />
            </div>

            <p className="mt-4 text-sm font-medium">
              تراکنشی پیدا نشد
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              برای این مشتری با فیلترهای فعلی
              تراکنشی وجود ندارد.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      نوع تراکنش
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      مبلغ
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      جهت
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      سفارش
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      توضیح
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      تاریخ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map(
                    (transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-border/70 last:border-b-0 transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium">
                            {
                              transaction.transaction_type_display
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
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium",
                              getDirectionClass(
                                transaction.direction,
                              ),
                            ].join(" ")}
                          >
                            {
                              transaction.direction_display
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {transaction.order ? (
                            <Link
                              href={`/orders/${transaction.order}`}
                              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                            >
                              #
                              {formatNumber(
                                transaction.order,
                              )}

                              <ArrowLeft className="size-3.5" />
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

                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDateTime(
                              transaction.created_at,
                            )}
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                مجموع{" "}
                <span className="font-medium text-foreground">
                  {formatNumber(totalCount)}
                </span>{" "}
                تراکنش
              </p>

              <div className="flex items-center gap-2">
                <Link
                  href={previousUrl}
                  aria-disabled={!hasPrevious}
                  tabIndex={
                    hasPrevious ? 0 : -1
                  }
                  className="
                    rounded-lg
                    border border-border
                    px-3 py-2
                    text-xs font-medium
                    transition-colors
                    hover:bg-accent
                    aria-disabled:pointer-events-none
                    aria-disabled:opacity-40
                  "
                >
                  قبلی
                </Link>

                <span className="min-w-24 text-center text-xs text-muted-foreground">
                  صفحه{" "}
                  <span className="font-medium text-foreground">
                    {formatNumber(page)}
                  </span>{" "}
                  از{" "}
                  <span className="font-medium text-foreground">
                    {formatNumber(pageCount)}
                  </span>
                </span>

                <Link
                  href={nextUrl}
                  aria-disabled={!hasNext}
                  tabIndex={hasNext ? 0 : -1}
                  className="
                    rounded-lg
                    border border-border
                    px-3 py-2
                    text-xs font-medium
                    transition-colors
                    hover:bg-accent
                    aria-disabled:pointer-events-none
                    aria-disabled:opacity-40
                  "
                >
                  بعدی
                </Link>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}