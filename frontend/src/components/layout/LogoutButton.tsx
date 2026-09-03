"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

import { logout } from "@/lib/api/auth";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await logout();

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);

      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleLogout}
      disabled={loading}
      className="
        flex w-full
        items-center gap-2.5
        rounded-lg
        px-3 py-2
        text-sm
        text-destructive
        transition-colors
        hover:bg-destructive/10
        disabled:pointer-events-none
        disabled:opacity-60
      "
    >
      <LogOut className="size-4 shrink-0" />

      <span>
        {loading
          ? "در حال خروج..."
          : "خروج از حساب"}
      </span>
    </button>
  );
}