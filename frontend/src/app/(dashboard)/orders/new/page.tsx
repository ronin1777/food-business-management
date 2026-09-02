"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { OrderCreateForm } from "@/components/orders/OrderCreateForm";

export default function NewOrderPage() {
  const router = useRouter();

  function handleSuccess(orderId: number) {
    router.push(`/orders/${orderId}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <Link
          href="/orders"
          className="
            inline-flex items-center gap-1.5
            text-sm text-muted-foreground
            transition-colors
            hover:text-foreground
          "
        >
          <ArrowRight className="size-4" />
          سفارش‌ها
        </Link>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          سفارش جدید
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          یک سفارش جدید برای کسب‌وکار ثبت کنید.
        </p>
      </section>

      <OrderCreateForm
        onSuccess={handleSuccess}
      />
    </div>
  );
}