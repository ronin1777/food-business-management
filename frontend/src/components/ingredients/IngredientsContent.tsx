import Link from "next/link";

import {
  ArrowDownAZ,
  ArrowLeft,
  ArrowUpAZ,
  Beaker,
  Plus,
  Search,
} from "lucide-react";

import { getIngredientsServer } from "@/lib/api/ingredients-server";

const PAGE_SIZE = 20;

type IngredientsContentProps = {
  page?: string;
  search?: string;
  ordering?: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
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

  return `/ingredients${query ? `?${query}` : ""}`;
}

export function IngredientsContent({
  page: pageParam,
  search,
  ordering: orderingParam,
}: IngredientsContentProps) {
  const page = parsePage(pageParam);
  const ordering = getOrdering(orderingParam);
  const normalizedSearch = search?.trim() || undefined;

  return (
    <IngredientsData
      page={page}
      search={normalizedSearch}
      ordering={ordering}
    />
  );
}

async function IngredientsData({
  page,
  search,
  ordering,
}: {
  page: number;
  search?: string;
  ordering: string;
}) {
  const response = await getIngredientsServer({
    page,
    pageSize: PAGE_SIZE,
    search,
    ordering,
  });

  const pagination = response.data;
  const ingredients = pagination.results;

  const totalCount = pagination.count;

  const pageCount = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE),
  );

  const hasNext = Boolean(pagination.next);
  const hasPrevious = Boolean(pagination.previous);

  const previousUrl = createUrl({
    page: Math.max(1, page - 1),
    search,
    ordering,
  });

  const nextUrl = createUrl({
    page: page + 1,
    search,
    ordering,
  });

  const ascendingUrl = createUrl({
    page: 1,
    search,
    ordering: "name",
  });

  const descendingUrl = createUrl({
    page: 1,
    search,
    ordering: "-name",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            مدیریت مواد اولیه
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            مواد اولیه
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            مشاهده و مدیریت مواد اولیه و موجودی آن‌ها
          </p>
        </div>

        <Link
          href="/ingredients/new"
          className="
            inline-flex h-10
            items-center justify-center
            gap-2
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
          ماده اولیه جدید
        </Link>
      </section>

      {/* Main Card */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
          <form
            method="get"
            className="relative min-w-0 flex-1"
          >
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              name="search"
              defaultValue={search ?? ""}
              placeholder="جستجوی نام ماده اولیه..."
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

            {ordering !== "name" && (
              <input
                type="hidden"
                name="ordering"
                value={ordering}
              />
            )}
          </form>

          <div className="flex items-center gap-2">
            <Link
              href={
                ordering === "name"
                  ? descendingUrl
                  : ascendingUrl
              }
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
              {ordering === "name" ? (
                <ArrowDownAZ className="size-4" />
              ) : (
                <ArrowUpAZ className="size-4" />
              )}

              <span>نام</span>
            </Link>
          </div>
        </div>

        {ingredients.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Beaker className="size-5 text-muted-foreground" />
            </div>

            <p className="mt-4 text-sm font-medium">
              ماده اولیه‌ای پیدا نشد
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              عبارت جستجو را تغییر دهید یا اولین ماده اولیه را ثبت کنید.
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      ماده اولیه
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      واحد پایه
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      موجودی
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      میانگین هزینه واحد
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      وضعیت
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      عملیات
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {ingredients.map((ingredient) => (
                    <tr
                      key={ingredient.id}
                      className="
                        border-b border-border/70
                        last:border-b-0
                        transition-colors
                        hover:bg-muted/20
                      "
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Beaker className="size-4 text-muted-foreground" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {ingredient.name}
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              #{formatNumber(ingredient.id)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium">
                          {ingredient.base_unit}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <span className="text-sm font-medium">
                            {formatNumber(
                              Number(ingredient.current_stock),
                            )}
                          </span>

                          <span className="mr-1 text-xs text-muted-foreground">
                            {ingredient.base_unit}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium">
                          {formatMoney(
                            Number(
                              ingredient.average_unit_cost,
                            ),
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {ingredient.is_active ? (
                          <span className="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                            فعال
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            غیرفعال
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-left">
                        <Link
                          href={`/ingredients/${ingredient.id}`}
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
                  ))}
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
                ماده اولیه
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