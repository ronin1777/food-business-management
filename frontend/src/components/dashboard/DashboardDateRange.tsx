"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { DateRangePreset } from "./dashboard-utils";

type DashboardDateRangeProps = {
  value: DateRangePreset;
};

const presets: {
  value: DateRangePreset;
  label: string;
}[] = [
  {
    value: "last_7_days",
    label: "۷ روز اخیر",
  },
  {
    value: "last_30_days",
    label: "۳۰ روز اخیر",
  },
  {
    value: "this_month",
    label: "این ماه",
  },
  {
    value: "last_month",
    label: "ماه قبل",
  },
];

function getPresetLabel(
  preset: DateRangePreset,
) {
  return (
    presets.find(
      (item) => item.value === preset,
    )?.label ?? "۳۰ روز اخیر"
  );
}

export function DashboardDateRange({
  value,
}: DashboardDateRangeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  function handleChange(
    preset: DateRangePreset,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    params.set("range", preset);

    router.push(
      `${pathname}?${params.toString()}`,
    );

    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="
          inline-flex h-10
          items-center gap-2
          rounded-lg
          border border-border
          bg-card
          px-3
          text-sm
          font-medium
          text-foreground
          shadow-sm
          transition-colors
          hover:bg-accent
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
          focus-visible:ring-offset-2
        "
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <CalendarDays className="size-4 text-muted-foreground" />

        <span>
          {getPresetLabel(value)}
        </span>

        <ChevronDown
          className={[
            "size-4 text-muted-foreground transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div
          className="
            absolute right-0 z-50 mt-2
            w-48
            overflow-hidden
            rounded-xl
            border border-border
            bg-popover
            p-1.5
            shadow-xl
          "
          role="menu"
        >
          {presets.map((preset) => {
            const isActive =
              preset.value === value;

            return (
              <button
                key={preset.value}
                type="button"
                onClick={() =>
                  handleChange(
                    preset.value,
                  )
                }
                className={[
                  "flex w-full items-center justify-between",
                  "rounded-lg px-3 py-2.5",
                  "text-sm transition-colors",
                  isActive
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                ].join(" ")}
                role="menuitem"
              >
                <span>
                  {preset.label}
                </span>

                {isActive && (
                  <Check className="size-4" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}