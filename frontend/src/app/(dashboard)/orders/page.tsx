import Link from "next/link";
import {
  Plus,
  RefreshCw,
} from "lucide-react";

import { getOrdersServer } from "@/lib/api/orders-server";

import { OrdersFilters } from "@/components/orders/OrdersFilters";
import { OrdersTable } from "@/components/orders/OrdersTable";

type OrdersPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    customer?: string;
    status?: string;
    paymentStatus?: string;
    orderedAtAfter?: string;
    orderedAtBefore?: string;
    ordering?: string;
  }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(
    value,
  );
}

function buildPageUrl(
  params: OrdersPageProps["searchParams"] extends Promise<
    infer T
  >
    ? T
    : never,
  page: number,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (value && key !== "page") {
        searchParams.set(key, value);
      }
    },
  );

  searchParams.set("page", String(page));

  const query = searchParams.toString();

  return `/orders${query ? `?${query}` : ""}`;
}

export default async function OrdersPage({
  searchParams,
}: OrdersPageProps) {
  const params = await searchParams;

  const page = Math.max(
    1,
    Number(params.page) || 1,
  );

  const customerId = params.customer
    ? Number(params.customer)
    : undefined;

  const customer =
    customerId &&
    Number.isInteger(customerId) &&
    customerId > 0
      ? customerId
      : undefined;

  const status =
    params.status === "completed" ||
    params.status === "cancelled"
      ? params.status
      : undefined;

  const paymentStatus =
    params.paymentStatus === "paid" ||
    params.paymentStatus ===
      "partially_paid" ||
    params.paymentStatus === "unpaid"
      ? params.paymentStatus
      : undefined;

  const ordering =
    params.ordering || "-ordered_at";

  const response = await getOrdersServer({
    page,
    pageSize: 20,
    search: params.search?.trim() || undefined,
    customer,
    status,
    paymentStatus,
    orderedAtAfter:
      params.orderedAtAfter || undefined,
    orderedAtBefore:
      params.orderedAtBefore || undefined,
    ordering,
  });

  const data = response.data;

  const orders = data.results;
  const totalCount = data.count;

  const hasPrevious = Boolean(
    data.previous,
  );

  const hasNext = Boolean(data.next);

  const pageCount = Math.max(
    1,
    Math.ceil(totalCount / 20),
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            فروش
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            سفارش‌ها
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            مدیریت و مشاهده سفارش‌های کسب‌وکار
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/orders"
            className="
              inline-flex h-10
              items-center gap-2
              rounded-lg
              border border-border
              bg-card
              px-3
              text-sm
              font-medium
              shadow-sm
              transition-colors
              hover:bg-accent
            "
          >
            <RefreshCw className="size-4" />

            <span className="hidden sm:inline">
              بروزرسانی
            </span>
          </Link>

          <Link
            href="/orders/new"
            className="
              inline-flex h-10
              items-center gap-2
              rounded-lg
              bg-primary
              px-3.5
              text-sm font-medium
              text-primary-foreground
              shadow-sm
              transition-opacity
              hover:opacity-90
            "
          >
            <Plus className="size-4" />

            <span>سفارش جدید</span>
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <OrdersFilters />

        {orders.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-medium">
              سفارشی پیدا نشد
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              با تغییر فیلترها یا ثبت سفارش جدید،
              اطلاعات اینجا نمایش داده می‌شود.
            </p>
          </div>
        ) : (
          <OrdersTable orders={orders} />
        )}

        <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            مجموع{" "}
            <span className="font-medium text-foreground">
              {formatNumber(totalCount)}
            </span>{" "}
            سفارش
          </p>

          <div className="flex items-center gap-2">
            {hasPrevious ? (
              <Link
                href={buildPageUrl(
                  params,
                  page - 1,
                )}
                className="
                  rounded-lg
                  border border-border
                  px-3 py-2
                  text-xs font-medium
                  transition-colors
                  hover:bg-accent
                "
              >
                قبلی
              </Link>
            ) : (
              <span
                className="
                  cursor-not-allowed
                  rounded-lg
                  border border-border
                  px-3 py-2
                  text-xs font-medium
                  opacity-40
                "
              >
                قبلی
              </span>
            )}

            <span className="min-w-20 text-center text-xs text-muted-foreground">
              صفحه{" "}
              <span className="font-medium text-foreground">
                {formatNumber(page)}
              </span>{" "}
              از{" "}
              <span className="font-medium text-foreground">
                {formatNumber(pageCount)}
              </span>
            </span>

            {hasNext ? (
              <Link
                href={buildPageUrl(
                  params,
                  page + 1,
                )}
                className="
                  rounded-lg
                  border border-border
                  px-3 py-2
                  text-xs font-medium
                  transition-colors
                  hover:bg-accent
                "
              >
                بعدی
              </Link>
            ) : (
              <span
                className="
                  cursor-not-allowed
                  rounded-lg
                  border border-border
                  px-3 py-2
                  text-xs font-medium
                  opacity-40
                "
              >
                بعدی
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}