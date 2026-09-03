"use client";

import {
  BarChart3,
  Boxes,
  ShoppingCart,
  TrendingUp,
  Users,
  Truck,
} from "lucide-react";

export type ReportTab =
  | "sales"
  | "purchases"
  | "profitability"
  | "inventory"
  | "customers"
  | "suppliers";

type ReportTabItem = {
  id: ReportTab;
  label: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

const tabs: ReportTabItem[] = [
  {
    id: "sales",
    label: "فروش",
    icon: BarChart3,
  },
  {
    id: "purchases",
    label: "خرید",
    icon: ShoppingCart,
  },
  {
    id: "profitability",
    label: "سودآوری",
    icon: TrendingUp,
  },
  {
    id: "inventory",
    label: "موجودی",
    icon: Boxes,
  },
  {
    id: "customers",
    label: "مشتریان",
    icon: Users,
  },
  {
    id: "suppliers",
    label: "تأمین‌کنندگان",
    icon: Truck,
  },
];

type ReportsTabsProps = {
  value: ReportTab;
  onChange: (value: ReportTab) => void;
};

export default function ReportsTabs({
  value,
  onChange,
}: ReportsTabsProps) {
  return (
    <div className="border-b border-border">
      <div
        className="
          flex
          min-w-max
          gap-1
          overflow-x-auto
          scrollbar-none
        "
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = value === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={[
                "relative inline-flex h-11 items-center gap-2 px-4",
                "text-sm font-medium transition-colors",
                "outline-none",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-4" />

              <span>{tab.label}</span>

              {active && (
                <span
                  className="
                    absolute
                    inset-x-2
                    -bottom-px
                    h-0.5
                    rounded-full
                    bg-primary
                  "
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}