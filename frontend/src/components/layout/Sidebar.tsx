"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Truck,
} from "lucide-react";

type NavigationItem = {
  label: string;
  href?: string;
  icon: typeof LayoutDashboard;
  children?: {
    label: string;
    href: string;
  }[];
};

const navigation: NavigationItem[] = [
  {
    label: "داشبورد",
    href: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "فروش",
    icon: ShoppingCart,
    children: [
      {
        label: "سفارش‌ها",
        href: "/orders",
      },
      {
        label: "مشتریان",
        href: "/customers",
      },
    ],
  },

  {
    label: "خرید",
    icon: Truck,
    children: [
      {
        label: "خریدها",
        href: "/purchases",
      },
      {
        label: "تأمین‌کنندگان",
        href: "/suppliers",
      },
    ],
  },

  {
    label: "تولید",
    icon: Package,
    children: [
      {
        label: "محصولات",
        href: "/products",
      },
      {
        label: "دستور تهیه‌ها",
        href: "/recipes",
      },
      {
        label: "مواد اولیه",
        href: "/ingredients",
      },
    ],
  },

  {
    label: "انبار",
    href: "/inventory",
    icon: Boxes,
  },

  {
    label: "گزارش‌ها",
    href: "/reports",
    icon: BarChart3,
  },
];

type SidebarContentProps = {
  onNavigate?: () => void;
};

function SidebarContent({
  onNavigate,
}: SidebarContentProps) {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] =
    useState<string[]>([]);

  useEffect(() => {
    const activeGroups =
      navigation
        .filter((item) =>
          item.children?.some(
            (child) =>
              pathname === child.href ||
              pathname.startsWith(
                `${child.href}/`,
              ),
          ),
        )
        .map((item) => item.label);

    if (activeGroups.length === 0) {
      return;
    }

    setOpenGroups((current) => {
      const merged = new Set([
        ...current,
        ...activeGroups,
      ]);

      return Array.from(merged);
    });
  }, [pathname]);

  function toggleGroup(
    label: string,
  ) {
    setOpenGroups((current) =>
      current.includes(label)
        ? current.filter(
            (item) => item !== label,
          )
        : [...current, label],
    );
  }

  return (
    <div
      className="
        flex h-full w-full flex-col
        bg-sidebar text-sidebar-foreground
        shadow-[8px_0_30px_rgba(0,0,0,0.04)]
        dark:shadow-[10px_0_35px_rgba(0,0,0,0.28)]
      "
    >
      {/* Brand */}
      <div className="flex h-20 shrink-0 items-center px-5">
        <div className="flex items-center gap-3">
          <div
            className="
              flex size-9 items-center
              justify-center rounded-lg
              bg-primary
              text-sm font-bold
              text-primary-foreground
              shadow-sm
            "
          >
            ک
          </div>

          <div>
            <p className="text-sm font-semibold">
              مدیریت کسب‌وکار
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              پنل مدیریت
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            /*
             * Group
             */
            if (item.children) {
              const isGroupActive =
                item.children.some(
                  (child) =>
                    pathname === child.href ||
                    pathname.startsWith(
                      `${child.href}/`,
                    ),
                );

              const isOpen =
                openGroups.includes(
                  item.label,
                );

              return (
                <div
                  key={item.label}
                  className="pt-2"
                >
                  {/* Group Header */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleGroup(
                        item.label,
                      )
                    }
                    aria-expanded={isOpen}
                    className={[
                      "flex w-full items-center justify-between",
                      "rounded-lg px-3 py-2.5",
                      "text-xs font-medium",
                      "transition-all duration-200",
                      "hover:bg-accent/70",
                      "active:scale-[0.99]",
                      isGroupActive ||
                      isOpen
                        ? "text-foreground"
                        : "text-muted-foreground",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-4 shrink-0" />

                      <span>
                        {item.label}
                      </span>
                    </div>

                    <ChevronDown
                      className={[
                        "size-3.5 shrink-0",
                        "transition-transform duration-200",
                        isOpen
                          ? "rotate-180"
                          : "rotate-0",
                      ].join(" ")}
                    />
                  </button>

                  {/* Children */}
                  <div
                    className={[
                      "grid transition-[grid-template-rows,opacity]",
                      "duration-200 ease-in-out",
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    ].join(" ")}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="mr-7 mt-1 space-y-0.5 border-r border-sidebar-border/80 pr-2">
                        {item.children.map(
                          (child) => {
                            const isActive =
                              pathname ===
                                child.href ||
                              pathname.startsWith(
                                `${child.href}/`,
                              );

                            return (
                              <Link
                                key={
                                  child.href
                                }
                                href={
                                  child.href
                                }
                                onClick={
                                  onNavigate
                                }
                                className={[
                                  "block rounded-md px-3 py-2",
                                  "text-sm transition-all duration-150",
                                  isActive
                                    ? "bg-accent font-medium text-accent-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
                                ].join(" ")}
                              >
                                {
                                  child.label
                                }
                              </Link>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            /*
             * Single Navigation Item
             */
            const isActive =
              pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`,
              );

            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={onNavigate}
                className={[
                  "flex items-center gap-3 rounded-lg",
                  "px-3 py-2.5",
                  "text-sm transition-all duration-150",
                  isActive
                    ? "bg-accent font-medium text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="size-4 shrink-0" />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Settings */}
      <div className="shrink-0 px-3 pb-4">
        <div className="border-t border-sidebar-border/70 pt-3">
          <Link
            href="/settings"
            onClick={onNavigate}
            className={[
              "flex items-center gap-3 rounded-lg",
              "px-3 py-2.5",
              "text-sm transition-all duration-150",
              pathname === "/settings" ||
              pathname.startsWith(
                "/settings/",
              )
                ? "bg-accent font-medium text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
            ].join(" ")}
          >
            <Settings className="size-4 shrink-0" />

            <span>تنظیمات</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside
      className="
        sticky top-0 hidden
        h-screen w-64 shrink-0
        overflow-hidden
        border-l border-sidebar-border/80
        bg-sidebar
        lg:flex
        lg:p-2
      "
    >
      <div
        className="
          flex h-full w-full
          overflow-hidden
          rounded-2xl
          border border-sidebar-border/80
          bg-sidebar
          shadow-[0_8px_30px_rgba(0,0,0,0.06)]
          dark:shadow-[0_10px_35px_rgba(0,0,0,0.32)]
        "
      >
        <SidebarContent />
      </div>
    </aside>
  );
}

type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileSidebar({
  open,
  onClose,
}: MobileSidebarProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="lg:hidden">
      {/* Overlay */}
      <button
        type="button"
        aria-label="بستن منو"
        onClick={onClose}
        className="
          fixed inset-0 z-40
          bg-black/40
          backdrop-blur-[2px]
        "
      />

      {/* Drawer */}
      <aside
        className="
          fixed inset-y-0 right-0 z-50
          w-[280px] max-w-[85vw]
          p-2
        "
      >
        <div
          className="
            flex h-full w-full
            overflow-hidden
            rounded-2xl
            border border-sidebar-border/80
            bg-sidebar
            shadow-2xl
          "
        >
          <SidebarContent
            onNavigate={onClose}
          />
        </div>
      </aside>
    </div>
  );
}