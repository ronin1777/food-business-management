"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  CreditCard,
  FileText,
  Pencil,
  Phone,
  ReceiptText,
  UserRound,
} from "lucide-react";
import {
  use,
  useEffect,
  useState,
} from "react";

import {
  getCustomer,
  getCustomerAccount,
  getCustomerTransactions,
} from "@/lib/api/customers";

import type {
  CustomerAccount,
  CustomerDetail,
  CustomerTransaction,
} from "@/types/customers";

type CustomerDetailPageProps = {
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

function formatDateTime(value: string) {
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

export default function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = use(params);

  const customerId = Number(id);

  const isValidCustomerId =
    Number.isInteger(customerId) &&
    customerId > 0;

  const [customer, setCustomer] =
    useState<CustomerDetail | null>(
      null,
    );

  const [account, setAccount] =
    useState<CustomerAccount | null>(
      null,
    );

  const [
    transactions,
    setTransactions,
  ] = useState<CustomerTransaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!isValidCustomerId) {
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [
          customerResponse,
          accountResponse,
          transactionsResponse,
        ] = await Promise.all([
          getCustomer(customerId),
          getCustomerAccount(
            customerId,
          ),
          getCustomerTransactions({
            customer: customerId,
            page: 1,
            pageSize: 10,
            ordering: "-created_at",
          }),
        ]);

        if (cancelled) {
          return;
        }

        setCustomer(customerResponse);

        setAccount(
          accountResponse.data,
        );

        setTransactions(
          transactionsResponse.data
            .results,
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Customer detail error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "خطایی در دریافت اطلاعات مشتری رخ داد.",
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
  }, [
    customerId,
    isValidCustomerId,
  ]);

  if (!isValidCustomerId) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <CircleAlert className="mx-auto size-6 text-destructive" />

          <p className="mt-3 text-sm font-medium text-destructive">
            خطا در دریافت اطلاعات مشتری
          </p>

          <p className="mt-2 text-sm leading-6 text-destructive/80">
            شناسه مشتری معتبر نیست.
          </p>

          <Link
            href="/customers"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <ArrowRight className="size-4" />
            بازگشت به مشتری‌ها
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />

        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>

        <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <CircleAlert className="mx-auto size-6 text-destructive" />

          <p className="mt-3 text-sm font-medium text-destructive">
            خطا در دریافت اطلاعات مشتری
          </p>

          <p className="mt-2 text-sm leading-6 text-destructive/80">
            {error ??
              "مشتری پیدا نشد."}
          </p>

          <Link
            href="/customers"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <ArrowRight className="size-4" />
            بازگشت به مشتری‌ها
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
            href="/customers"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowRight className="size-4" />
            مشتری‌ها
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
              <UserRound className="size-5 text-muted-foreground" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {customer.name}
              </h1>

              <p className="mt-0.5 text-sm text-muted-foreground">
                مشتری شماره #
                {formatNumber(
                  customer.id,
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/customers/${customer.id}/edit`}
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
              "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium",
              customer.is_active
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {customer.is_active
              ? "فعال"
              : "غیرفعال"}
          </div>
        </div>
      </section>

      {/* Customer Information */}
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />

            <h2 className="text-sm font-semibold">
              اطلاعات مشتری
            </h2>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">
              نام مشتری
            </p>

            <p className="mt-1.5 text-sm font-medium">
              {customer.name}
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
              {customer.phone ||
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
                customer.created_at,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              آخرین بروزرسانی
            </p>

            <p className="mt-1.5 text-sm font-medium">
              {formatDate(
                customer.updated_at,
              )}
            </p>
          </div>
        </div>

        {customer.note && (
          <div className="border-t border-border px-5 py-4">
            <p className="text-xs text-muted-foreground">
              یادداشت
            </p>

            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6">
              {customer.note}
            </p>
          </div>
        )}
      </section>

      {/* Account Summary */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" />

          <h2 className="text-sm font-semibold">
            حساب مشتری
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
                "mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium",
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

      {/* Transactions */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-4 text-muted-foreground" />

            <div>
              <h2 className="text-sm font-semibold">
                گردش حساب
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                آخرین تراکنش‌های مشتری
              </p>
            </div>
          </div>

          <Link
            href={`/customers/${customer.id}/transactions`}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
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

            <p className="mt-1 text-xs text-muted-foreground">
              گردش حساب این مشتری بعد از ثبت سفارش یا پرداخت در اینجا نمایش داده می‌شود.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
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
                      key={
                        transaction.id
                      }
                      className="border-b border-border/70 last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium">
                          {
                            transaction.transaction_type_display
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium">
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
                          {transaction.direction_display ||
                            getDirectionLabel(
                              transaction.direction,
                            )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {transaction.order ? (
                          <Link
                            href={`/orders/${transaction.order}`}
                            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                          >
                            #
                            {formatNumber(
                              transaction.order,
                            )}
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