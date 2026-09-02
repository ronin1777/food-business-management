"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type DateRangePreset =
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "last_month";

export type DateRange = {
  dateFrom: string;
  dateTo: string;
};

type DashboardDateRangeProps = {
  value: DateRangePreset;
  onChange: (
    preset: DateRangePreset,
  ) => void;
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

export function getDateRangeFromPreset(
  preset: DateRangePreset,
): DateRange {
  const today = new Date();

  const dateTo = new Date(today);
  dateTo.setHours(0, 0, 0, 0);

  const dateFrom = new Date(today);
  dateFrom.setHours(0, 0, 0, 0);

  switch (preset) {
    case "last_7_days":
      dateFrom.setDate(
        dateFrom.getDate() - 6,
      );
      break;

    case "last_30_days":
      dateFrom.setDate(
        dateFrom.getDate() - 29,
      );
      break;

    case "this_month":
      dateFrom.setDate(1);
      break;

    case "last_month":
      dateFrom.setMonth(
        dateFrom.getMonth() - 1,
        1,
      );

      dateTo.setDate(0);
      break;
  }

  return {
    dateFrom: formatDateForApi(dateFrom),
    dateTo: formatDateForApi(dateTo),
  };
}

function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function DashboardDateRange({
  value,
  onChange,
}: DashboardDateRangeProps) {
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
        "
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <CalendarDays className="size-4 text-muted-foreground" />

        <span>{getPresetLabel(value)}</span>

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
                onClick={() => {
                  onChange(preset.value);
                  setOpen(false);
                }}
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
                <span>{preset.label}</span>

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