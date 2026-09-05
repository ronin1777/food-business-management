import Link from "next/link";
import { Plus } from "lucide-react";

import { getSuppliersServer } from "@/lib/api/suppliers-server";
import { SuppliersToolbar } from "@/components/suppliers/SuppliersToolbar";
import { SuppliersTable } from "@/components/suppliers/SuppliersTable";



const PAGE_SIZE = 20;

type SuppliersContentProps = {
  page?: string;
  search?: string;
  ordering?: string;
};

export async function SuppliersContent({
  page,
  search,
  ordering,
}: SuppliersContentProps) {
  const currentPage = Math.max(
    1,
    Number(page) || 1,
  );

  const currentSearch =
    search?.trim() || "";

  const currentOrdering =
    ordering === "-name"
      ? "-name"
      : "name";

  const response =
    await getSuppliersServer({
      page: currentPage,
      pageSize: PAGE_SIZE,
      search:
        currentSearch || undefined,
      ordering: currentOrdering,
    });

  const suppliers =
    response.data.results;

  const totalCount =
    response.data.count;

  const pageCount = Math.max(
    1,
    Math.ceil(
      totalCount / PAGE_SIZE,
    ),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            مدیریت تأمین‌کنندگان
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            تأمین‌کنندگان
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            مشاهده و مدیریت تأمین‌کنندگان کسب‌وکار
          </p>
        </div>

        <Link
          href="/suppliers/new"
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
          تأمین‌کننده جدید
        </Link>
      </section>

      {/* Main Card */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <SuppliersToolbar
          search={currentSearch}
          ordering={currentOrdering}
        />

        <SuppliersTable
          suppliers={suppliers}
          totalCount={totalCount}
          currentPage={currentPage}
          pageCount={pageCount}
          search={currentSearch}
          ordering={currentOrdering}
        />
      </section>
    </div>
  );
}