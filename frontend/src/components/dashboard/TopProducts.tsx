

import { Package } from "lucide-react";

type Product = {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  sales: number;
};

type TopProductsProps = {
  products: Product[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

export function TopProducts({
  products,
}: TopProductsProps) {
  const topProducts = products.slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-base font-semibold">
          پرفروش‌ترین محصولات
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          محصولاتی که بیشترین فروش را در این دوره داشته‌اند
        </p>
      </div>

      <div className="p-4">
        {topProducts.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Package className="size-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-sm font-medium">
              محصولی برای نمایش وجود ندارد
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              با ثبت سفارش‌های جدید، محصولات پرفروش اینجا نمایش داده می‌شوند.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {topProducts.map((product, index) => (
              <div
                key={product.product_id}
                className="flex items-center gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {formatNumber(index + 1)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {product.product_name}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatNumber(
                      Number(product.quantity_sold),
                    )}{" "}
                    عدد فروش
                  </p>
                </div>

                <div className="shrink-0 text-left">
                  <p className="text-sm font-semibold">
                    {formatMoney(
                      Number(product.sales),
                    )}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    فروش
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}