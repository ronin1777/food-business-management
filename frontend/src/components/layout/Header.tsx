"use client";

import { useState } from "react";
import { Bell, Menu } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileSidebar } from "./Sidebar";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  return (
    <>
      <header
        className="
          sticky top-0 z-30
          flex h-16 shrink-0
          items-center justify-between
          border-b border-header-border
          bg-header
          px-4
          backdrop-blur-xl
          lg:px-6
        "
      >
        {/* Left */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            aria-label="باز کردن منو"
            className="
              inline-flex size-9
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

          <div className="hidden lg:block">
            <p className="text-sm font-medium">
              مدیریت کسب‌وکار
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <button
            type="button"
            aria-label="اعلان‌ها"
            className="
              relative
              inline-flex size-9
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

          {/* User */}
          <button
            type="button"
            className="
              ml-1
              flex items-center gap-2
              rounded-md
              px-2 py-1.5
              transition-colors
              hover:bg-accent
            "
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                testuser
              </p>

              <p className="text-xs text-muted-foreground">
                مدیر
              </p>
            </div>

            <div
              className="
                flex size-8
                items-center justify-center
                rounded-full
                bg-muted
                text-sm font-medium
                text-muted-foreground
              "
            >
              ت
            </div>
          </button>
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