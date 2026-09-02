"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleAlert,
  CreditCard,
  FileText,
  Pencil,
  Phone,
  ReceiptText,
  Truck,
} from "lucide-react";
import {
  use,
  useEffect,
  useState,
} from "react";

import {
  getSupplier,
  getSupplierAccount,
  getSupplierTransactions,
} from "@/lib/api/suppliers";

import type {
  SupplierAccount,
  SupplierDetail,
  SupplierTransaction,
} from "@/types/suppliers";

type SupplierDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat(
    "fa-IR",
  ).format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(new Date(value));
}

function formatDateTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

function getDirectionClass(
  direction: string | null,
) {
  if (direction === "debit") {
    return "bg-destructive/10 text-destructive";
  }

  if (direction === "credit") {
    return "bg-success/10 text-success";
  }

  return "bg-muted text-muted-foreground";
}

function getDirectionLabel(
  direction: string | null,
) {
  if (direction === "debit") {
    return "بدهکار";
  }

  if (direction === "credit") {
    return "بستانکار";
  }

  return "تسویه";
}

export default function SupplierDetailPage({
  params,
}: SupplierDetailPageProps) {
  const { id } = use(params);

  const supplierId = Number(id);

  const [supplier, setSupplier] =
    useState<SupplierDetail | null>(null);

  const [account, setAccount] =
    useState<SupplierAccount | null>(null);

  const [transactions, setTransactions] =
    useState<SupplierTransaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (
      !Number.isInteger(supplierId) ||
      supplierId <= 0
    ) {
      setError(
        "شناسه تأمین‌کننده معتبر نیست.",
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [
          supplierResponse,
          accountResponse,
          transactionsResponse,
        ] = await Promise.all([
          getSupplier(supplierId),
          getSupplierAccount(supplierId),
          getSupplierTransactions({
            supplier: supplierId,
            page: 1,
            pageSize: 10,
            ordering: "-created_at",
          }),
        ]);

        if (cancelled) {
          return;
        }

        setSupplier(
          supplierResponse.data,
        );

        setAccount(
          accountResponse.data,
        );

        setTransactions(
          transactionsResponse.data.results,
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Supplier detail error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "خطایی در دریافت اطلاعات تأمین‌کننده رخ داد.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [supplierId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />

        <div className="h-14 w-64 animate-pulse rounded bg-muted" />

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>

        <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />

        <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <CircleAlert className="mx-auto size-6 text-destructive" />

          <p className="mt-3 text-sm font-medium text-destructive">
            خطا در دریافت اطلاعات تأمین‌کننده
          </p>

          <p className="mt-2 text-sm leading-6 text-destructive/80">
            {error ??
              "تأمین‌کننده پیدا نشد."}
          </p>

          <Link
            href="/suppliers"
            className="
              mt-5
              inline-flex items-center gap-2
              rounded-lg
              border border-border
              bg-background
              px-3 py-2
              text-sm font-medium
              transition-colors
              hover:bg-accent
            "
          >
            <ArrowRight className="size-4" />
            بازگشت به تأمین‌کنندگان
          </Link>
        </div>
      </div>
    );
  }

  const balance =
    Number(account?.balance ?? 0);

  const direction =
    account?.direction ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/suppliers"
            className="
              inline-flex items-center gap-1.5
              text-sm text-muted-foreground
              transition-colors
              hover:text-foreground
            "
          >
            <ArrowRight className="size-4" />
            تأمین‌کنندگان
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Truck className="size-5 text-muted-foreground" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {supplier.name}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                تأمین‌کننده شماره #
                {formatNumber(
                  supplier.id,
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/suppliers/${supplier.id}/edit`}
            className="
              inline-flex h-9
              items-center justify-center
              gap-2
              rounded-lg
              border border-border
              bg-background
              px-3
              text-xs font-medium
              transition-colors
              hover:bg-accent
            "
          >
            <Pencil className="size-3.5" />
            ویرایش
          </Link>

          <div
            className={[
              "inline-flex items-center rounded-full px-3 py-1.5",
              "text-xs font-medium",
              supplier.is_active
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {supplier.is_active
              ? "فعال"
              : "غیرفعال"}
          </div>
        </div>
      </section>

      {/* Supplier Information */}
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />

            <h2 className="text-sm font-semibold">
              اطلاعات تأمین‌کننده
            </h2>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">
              نام
            </p>

            <p className="mt-1.5 text-sm font-medium">
              {supplier.name}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <Phone className="size-3.5 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                شماره تماس
              </p>
            </div>

            <p className="mt-1.5 text-sm font-medium">
              {supplier.phone ||
                "ثبت نشده"}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                تاریخ ثبت
              </p>
            </div>

            <p className="mt-1.5 text-sm font-medium">
              {formatDate(
                supplier.created_at,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              آخرین بروزرسانی
            </p>

            <p className="mt-1.5 text-sm font-medium">
              {formatDate(
                supplier.updated_at,
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Account Summary */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" />

          <h2 className="text-sm font-semibold">
            حساب تأمین‌کننده
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Debit */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">
              بدهکار
            </p>

            <p className="mt-2 text-xl font-semibold">
              {formatMoney(
                Number(
                  account?.debit ?? 0,
                ),
              )}
            </p>
          </div>

          {/* Credit */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">
              بستانکار
            </p>

            <p className="mt-2 text-xl font-semibold">
              {formatMoney(
                Number(
                  account?.credit ?? 0,
                ),
              )}
            </p>
          </div>

          {/* Balance */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">
              مانده حساب
            </p>

            <p className="mt-2 text-xl font-semibold">
              {formatMoney(
                Math.abs(balance),
              )}
            </p>

            <span
              className={[
                "mt-2 inline-flex rounded-full",
                "px-2.5 py-1",
                "text-[11px] font-medium",
                getDirectionClass(
                  direction,
                ),
              ].join(" ")}
            >
              {getDirectionLabel(
                direction,
              )}
            </span>
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-4 text-muted-foreground" />

            <div>
              <h2 className="text-sm font-semibold">
                گردش حساب
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                آخرین تراکنش‌های تأمین‌کننده
              </p>
            </div>
          </div>

          <Link
            href={`/suppliers/${supplier.id}/transactions`}
            className="
              text-xs font-medium
              text-muted-foreground
              transition-colors
              hover:text-foreground
            "
          >
            مشاهده همه
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <ReceiptText className="size-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-sm font-medium">
              هنوز تراکنشی ثبت نشده است
            </p>

            <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
              تراکنش‌های خرید، پرداخت و برگشت وجه این تأمین‌کننده در این بخش نمایش داده می‌شوند.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
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
                    خرید
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
                      key={
                        transaction.id
                      }
                      className="
                        border-b border-border/70
                        last:border-b-0
                        transition-colors
                        hover:bg-muted/20
                      "
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
                            "inline-flex rounded-full",
                            "px-2.5 py-1",
                            "text-[11px] font-medium",
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
                        {transaction.purchase ? (
                          <Link
                            href={`/purchases/${transaction.purchase}`}
                            className="
                              inline-flex
                              items-center gap-1
                              text-sm font-medium
                              text-muted-foreground
                              underline-offset-4
                              hover:text-foreground
                              hover:underline
                            "
                          >
                            #
                            {formatNumber(
                              transaction.purchase,
                            )}

                            <ArrowLeft className="size-3.5" />
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>

                      <td className="max-w-[220px] px-5 py-4">
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
        )}
      </section>
    </div>
  );
}