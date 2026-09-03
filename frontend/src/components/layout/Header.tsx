"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileSidebar } from "./Sidebar";
import { useOrganization } from "@/components/OrganizationProvider";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [userMenuOpen, setUserMenuOpen] =
    useState(false);

  const {
    organization,
    loading,
  } = useOrganization();

  return (
    <>
      <header
        className="
          sticky top-0 z-30
          flex h-16 shrink-0
          items-center justify-between
          border-b border-header-border
          bg-header
          px-3
          backdrop-blur-xl
          sm:px-4
          lg:px-6
        "
      >
        {/* Left */}
        <div className="flex min-w-0 items-center gap-2">
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            aria-label="باز کردن منو"
            className="
              inline-flex size-9
              shrink-0
              items-center justify-center
              rounded-md
              text-muted-foreground
              transition-colors
              hover:bg-accent
              hover:text-accent-foreground
              lg:hidden
            "
          >
            <Menu className="size-5" />
          </button>

          {/* Organization */}
          <div
            className="
              min-w-0
              max-w-[120px]
              xs:max-w-[150px]
              sm:max-w-[220px]
              lg:max-w-none
            "
          >
            <p className="truncate text-sm font-medium">
              {loading
                ? "در حال بارگذاری..."
                : organization?.name ??
                  "مدیریت کسب‌وکار"}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Notifications */}
          <button
            type="button"
            aria-label="اعلان‌ها"
            className="
              relative
              inline-flex size-9
              shrink-0
              items-center justify-center
              rounded-md
              text-muted-foreground
              transition-colors
              hover:bg-accent
              hover:text-accent-foreground
            "
          >
            <Bell className="size-4" />

            <span
              className="
                absolute right-2 top-2
                size-1.5 rounded-full
                bg-destructive
              "
            />
          </button>

          {/* Theme */}
          <ThemeToggle />

          {/* User Menu */}
          <div className="relative ml-1">
            <button
              type="button"
              onClick={() =>
                setUserMenuOpen(
                  (current) => !current,
                )
              }
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              className="
                flex min-w-0
                items-center gap-1.5
                rounded-md
                px-2 py-1.5
                text-sm font-medium
                transition-colors
                hover:bg-accent
                hover:text-accent-foreground
              "
            >
              <span
                className="
                  max-w-[100px]
                  truncate
                  sm:max-w-[140px]
                "
              >
                testuser
              </span>

              <ChevronDown
                className={[
                  "size-3.5 shrink-0",
                  "text-muted-foreground",
                  "transition-transform duration-200",
                  userMenuOpen
                    ? "rotate-180"
                    : "rotate-0",
                ].join(" ")}
              />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div
                role="menu"
                className="
                  absolute
                  left-0
                  top-[calc(100%+8px)]
                  z-50
                  w-52
                  overflow-hidden
                  rounded-xl
                  border border-border
                  bg-popover
                  p-1
                  text-popover-foreground
                  shadow-lg
                  shadow-black/5
                  dark:shadow-black/20
                "
              >
                {/* User Header */}
                <div
                  className="
                    px-3 py-2.5
                  "
                >
                  <p className="truncate text-sm font-medium">
                    testuser
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    حساب کاربری
                  </p>
                </div>

                <div className="my-1 border-t border-border" />

                {/* Profile */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() =>
                    setUserMenuOpen(false)
                  }
                  className="
                    flex w-full
                    items-center gap-2.5
                    rounded-lg
                    px-3 py-2
                    text-sm
                    text-muted-foreground
                    transition-colors
                    hover:bg-accent
                    hover:text-accent-foreground
                  "
                >
                  <User className="size-4 shrink-0" />

                  <span>پروفایل</span>
                </button>

                {/* Settings */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() =>
                    setUserMenuOpen(false)
                  }
                  className="
                    flex w-full
                    items-center gap-2.5
                    rounded-lg
                    px-3 py-2
                    text-sm
                    text-muted-foreground
                    transition-colors
                    hover:bg-accent
                    hover:text-accent-foreground
                  "
                >
                  <Settings className="size-4 shrink-0" />

                  <span>تنظیمات</span>
                </button>

                <div className="my-1 border-t border-border" />

                {/* Logout */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() =>
                    setUserMenuOpen(false)
                  }
                  className="
                    flex w-full
                    items-center gap-2.5
                    rounded-lg
                    px-3 py-2
                    text-sm
                    text-destructive
                    transition-colors
                    hover:bg-destructive/10
                  "
                >
                  <LogOut className="size-4 shrink-0" />

                  <span>خروج از حساب</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() =>
          setMobileMenuOpen(false)
        }
      />
    </>
  );
}