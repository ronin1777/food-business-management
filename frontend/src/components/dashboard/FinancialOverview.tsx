"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Landmark,
} from "lucide-react";

type BalanceItem = {
  customer_id?: number;
  customer_name?: string;
  supplier_id?: number;
  supplier_name?: string;
  balance?: number;
};

type FinancialOverviewProps = {
  receivables: {
    current: number;
  };
  payables: {
    current: number;
  };
  customers: BalanceItem[];
  suppliers: BalanceItem[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

export function FinancialOverview({
  receivables,
  payables,
  customers,
  suppliers,
}: FinancialOverviewProps) {
  const topCustomers = customers
    .filter(
      (item) =>
        Number(item.balance ?? 0) > 0,
    )
    .slice(0, 4);

  const topSuppliers = suppliers
    .filter(
      (item) =>
        Number(item.balance ?? 0) > 0,
    )
    .slice(0, 4);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Receivables */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              مطالبات مشتریان
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              مبالغ قابل وصول از مشتریان
            </p>
          </div>

          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <CreditCard className="size-4 text-muted-foreground" />
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                مانده قابل وصول
              </p>

              <p className="mt-1.5 text-2xl font-semibold tracking-tight">
                {formatMoney(
                  Number(
                    receivables.current,
                  ),
                )}
              </p>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
              <ArrowUpRight className="size-3.5" />
              <span>مطالبات</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">
                مشتریان
              </p>

              <span className="text-xs text-muted-foreground">
                بیشترین مانده
              </span>
            </div>

            {topCustomers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  طلبی از مشتریان وجود ندارد.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {topCustomers.map(
                  (customer) => (
                    <div
                      key={
                        customer.customer_id
                      }
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <p className="min-w-0 truncate text-sm font-medium">
                        {
                          customer.customer_name
                        }
                      </p>

                      <p className="shrink-0 text-sm font-semibold">
                        {formatMoney(
                          Number(
                            customer.balance ??
                              0,
                          ),
                        )}
                      </p>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Payables */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              بدهی تأمین‌کنندگان
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              مبالغ قابل پرداخت به تأمین‌کنندگان
            </p>
          </div>

          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Landmark className="size-4 text-muted-foreground" />
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                مانده قابل پرداخت
              </p>

              <p className="mt-1.5 text-2xl font-semibold tracking-tight">
                {formatMoney(
                  Number(
                    payables.current,
                  ),
                )}
              </p>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
              <ArrowDownLeft className="size-3.5" />
              <span>بدهی</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">
                تأمین‌کنندگان
              </p>

              <span className="text-xs text-muted-foreground">
                بیشترین مانده
              </span>
            </div>

            {topSuppliers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  بدهی به تأمین‌کنندگان وجود ندارد.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {topSuppliers.map(
                  (supplier) => (
                    <div
                      key={
                        supplier.supplier_id
                      }
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <p className="min-w-0 truncate text-sm font-medium">
                        {
                          supplier.supplier_name
                        }
                      </p>

                      <p className="shrink-0 text-sm font-semibold">
                        {formatMoney(
                          Number(
                            supplier.balance ??
                              0,
                          ),
                        )}
                      </p>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}