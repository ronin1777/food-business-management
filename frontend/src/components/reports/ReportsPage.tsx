"use client";

import { useState } from "react";

import CustomerReport from "./customers/CustomerReport";
import InventoryReport from "./inventory/InventoryReport";
import PurchaseReport from "./purchases/PurchaseReport";
import ProfitabilityReport from "./profitability/ProfitabilityReport";
import SupplierReport from "./suppliers/SupplierReport";
import ReportsHeader from "./ReportsHeader";
import ReportsTabs, {
  type ReportTab,
} from "./ReportsTabs";
import SalesReport from "./sales/SalesReport";

export default function ReportsPage() {
  const [activeTab, setActiveTab] =
    useState<ReportTab>("sales");

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        <ReportsHeader />

        <ReportsTabs
          value={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "sales" && <SalesReport />}

        {activeTab === "purchases" && (
          <PurchaseReport />
        )}

        {activeTab === "profitability" && (
          <ProfitabilityReport />
        )}

        {activeTab === "inventory" && (
          <InventoryReport />
        )}

        {activeTab === "customers" && (
          <CustomerReport />
        )}

        {activeTab === "suppliers" && (
          <SupplierReport />
        )}

        {activeTab !== "sales" &&
          activeTab !== "purchases" &&
          activeTab !== "profitability" &&
          activeTab !== "inventory" &&
          activeTab !== "customers" &&
          activeTab !== "suppliers" && (
            <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-border bg-card">
              <div className="text-center">
                <p className="text-sm font-medium">
                  این گزارش در مرحله بعد پیاده‌سازی می‌شود.
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  ساختار مشترک Reports آماده است.
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}