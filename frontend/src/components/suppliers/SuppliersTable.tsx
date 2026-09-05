import Link from "next/link";
import {
  ArrowLeft,
  Truck,
} from "lucide-react";

import type {
  Supplier,
} from "@/types/suppliers";

type SuppliersTableProps = {
  suppliers: Supplier[];
  totalCount: number;
  currentPage: number;
  pageCount: number;
  search: string;
  ordering: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat(
    "fa-IR",
  ).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(new Date(value));
}

function createPageUrl(
  page: number,
  search: string,
  ordering: string,
) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set(
      "page",
      String(page),
    );
  }

  if (search) {
    params.set(
      "search",
      search,
    );
  }

  if (ordering !== "name") {
    params.set(
      "ordering",
      ordering,
    );
  }

  const query =
    params.toString();

  return `/suppliers${
    query ? `?${query}` : ""
  }`;
}

export function SuppliersTable({
  suppliers,
  totalCount,
  currentPage,
  pageCount,
  search,
  ordering,
}: SuppliersTableProps) {
  const hasPrevious =
    currentPage > 1;

  const hasNext =
    currentPage < pageCount;

  return (
    <>
      {/* Content */}
      {suppliers.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Truck className="size-5 text-muted-foreground" />
          </div>

          <p className="mt-4 text-sm font-medium">
            تأمین‌کننده‌ای پیدا نشد
          </p>

          <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
            عبارت جستجو را تغییر دهید یا اولین تأمین‌کننده را ثبت کنید.
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    تأمین‌کننده
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                    شماره تماس
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
                {suppliers.map(
                  (supplier) => (
                    <tr
                      key={supplier.id}
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
                            <Truck className="size-4 text-muted-foreground" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {supplier.name}
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              #
                              {formatNumber(
                                supplier.id,
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-muted-foreground">
                          {supplier.phone ||
                            "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {supplier.is_active ? (
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
                          {formatDate(
                            supplier.created_at,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-left">
                        <Link
                          href={`/suppliers/${supplier.id}`}
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

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              مجموع{" "}
              <span className="font-medium text-foreground">
                {formatNumber(
                  totalCount,
                )}
              </span>{" "}
              تأمین‌کننده
            </p>

            <div className="flex items-center gap-2">
              <Link
                href={
                  hasPrevious
                    ? createPageUrl(
                        currentPage - 1,
                        search,
                        ordering,
                      )
                    : "#"
                }
                aria-disabled={
                  !hasPrevious
                }
                className={`
                  rounded-lg
                  border border-border
                  px-3 py-2
                  text-xs font-medium
                  transition-colors
                  ${
                    hasPrevious
                      ? "hover:bg-accent"
                      : "pointer-events-none opacity-40"
                  }
                `}
              >
                قبلی
              </Link>

              <span className="min-w-20 text-center text-xs text-muted-foreground">
                صفحه{" "}
                <span className="font-medium text-foreground">
                  {formatNumber(
                    currentPage,
                  )}
                </span>{" "}
                از{" "}
                <span className="font-medium text-foreground">
                  {formatNumber(
                    pageCount,
                  )}
                </span>
              </span>

              <Link
                href={
                  hasNext
                    ? createPageUrl(
                        currentPage + 1,
                        search,
                        ordering,
                      )
                    : "#"
                }
                aria-disabled={!hasNext}
                className={`
                  rounded-lg
                  border border-border
                  px-3 py-2
                  text-xs font-medium
                  transition-colors
                  ${
                    hasNext
                      ? "hover:bg-accent"
                      : "pointer-events-none opacity-40"
                  }
                `}
              >
                بعدی
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}