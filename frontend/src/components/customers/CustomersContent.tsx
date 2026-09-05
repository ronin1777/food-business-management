import Link from "next/link";
import {
  ArrowDownAZ,
  ArrowLeft,
  ArrowUpAZ,
  Plus,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";

import { getCustomersServer } from "@/lib/api/customers-server";
import type { Customer } from "@/types/customers";

const PAGE_SIZE = 20;

type CustomersContentProps = {
  page?: string;
  search?: string;
  ordering?: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function parsePage(value?: string) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function getOrdering(value?: string) {
  return value === "-name" ? "-name" : "name";
}

function createUrl({
  page,
  search,
  ordering,
}: {
  page: number;
  search?: string;
  ordering: string;
}) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (search) {
    params.set("search", search);
  }

  if (ordering !== "name") {
    params.set("ordering", ordering);
  }

  const query = params.toString();

  return `/customers${query ? `?${query}` : ""}`;
}

export async function CustomersContent({
  page: pageParam,
  search: searchParam,
  ordering: orderingParam,
}: CustomersContentProps) {
  const page = parsePage(pageParam);
  const search = searchParam?.trim() || "";
  const ordering = getOrdering(orderingParam);

  const response = await getCustomersServer({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    ordering,
  });

  const customers = response.data.results;
  const totalCount = response.data.count;

  const pageCount = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE),
  );

  const hasPrevious = page > 1;
  const hasNext = Boolean(response.data.next);

  const nextUrl = createUrl({
    page: page + 1,
    search,
    ordering,
  });

  const previousUrl = createUrl({
    page: page - 1,
    search,
    ordering,
  });

  const toggleOrderingUrl = createUrl({
    page: 1,
    search,
    ordering: ordering === "name" ? "-name" : "name",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            مدیریت مشتریان
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            مشتری‌ها
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            مشاهده و مدیریت مشتری‌های کسب‌وکار
          </p>
        </div>

        <Link
          href="/customers/new"
          className="
            inline-flex h-10
            items-center justify-center gap-2
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
          مشتری جدید
        </Link>
      </section>

      {/* Main Card */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center">
          <form
            action="/customers"
            method="GET"
            className="min-w-0 flex-1"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                name="search"
                defaultValue={search}
                placeholder="جستجوی نام، تلفن یا یادداشت..."
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

              <input
                type="hidden"
                name="ordering"
                value={ordering}
              />
            </div>
          </form>

          <Link
            href={toggleOrderingUrl}
            className="
              inline-flex h-10
              items-center justify-center gap-2
              rounded-lg
              border border-input
              bg-background
              px-3
              text-sm font-medium
              transition-colors
              hover:bg-accent
            "
          >
            {ordering === "name" ? (
              <ArrowDownAZ className="size-4" />
            ) : (
              <ArrowUpAZ className="size-4" />
            )}

            <span>نام</span>
          </Link>

          <Link
            href={createUrl({
              page,
              search,
              ordering,
            })}
            className="
              inline-flex h-10
              items-center justify-center
              rounded-lg
              border border-input
              bg-background
              px-3
              text-sm
              transition-colors
              hover:bg-accent
            "
            aria-label="بروزرسانی"
          >
            <RefreshCw className="size-4" />
          </Link>
        </div>

        {/* Content */}
        {customers.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <UserRound className="size-5 text-muted-foreground" />
            </div>

            <p className="mt-4 text-sm font-medium">
              مشتری‌ای پیدا نشد
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              عبارت جستجو را تغییر دهید یا اولین مشتری کسب‌وکار را ثبت کنید.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      مشتری
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      تلفن
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      وضعیت
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      تاریخ ایجاد
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      عملیات
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map(
                    (customer: Customer) => (
                      <tr
                        key={customer.id}
                        className="
                          border-b border-border/70
                          transition-colors
                          last:border-b-0
                          hover:bg-muted/20
                        "
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <UserRound className="size-4 text-muted-foreground" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {customer.name}
                              </p>

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                #{formatNumber(customer.id)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-muted-foreground">
                            {customer.phone || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {customer.is_active ? (
                            <span className="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                              فعال
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                              غیرفعال
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(customer.created_at)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-left">
                          <Link
                            href={`/customers/${customer.id}`}
                            className="
                              inline-flex
                              items-center gap-1.5
                              rounded-md
                              px-2.5 py-1.5
                              text-xs font-medium
                              text-muted-foreground
                              transition-colors
                              hover:bg-accent
                              hover:text-foreground
                            "
                          >
                            مشاهده

                            <ArrowLeft className="size-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                مجموع{" "}
                <span className="font-medium text-foreground">
                  {formatNumber(totalCount)}
                </span>{" "}
                مشتری
              </p>

              <div className="flex items-center gap-2">
                {hasPrevious ? (
                  <Link
                    href={previousUrl}
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
                    href={nextUrl}
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
          </>
        )}
      </section>
    </div>
  );
}