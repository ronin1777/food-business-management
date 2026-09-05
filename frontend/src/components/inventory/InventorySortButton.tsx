"use client";

import { ArrowUpDown } from "lucide-react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type Props = {
  ordering: string;
};

export default function InventorySortButton({
  ordering,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggle() {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    params.set(
      "ordering",
      ordering === "-created_at"
        ? "created_at"
        : "-created_at",
    );

    params.delete("page");

    const query =
      params.toString();

    router.push(
      `${pathname}${query ? `?${query}` : ""}`,
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex size-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted"
      title={
        ordering === "-created_at"
          ? "قدیمی‌ترین"
          : "جدیدترین"
      }
      aria-label={
        ordering === "-created_at"
          ? "مرتب‌سازی از قدیمی‌ترین"
          : "مرتب‌سازی از جدیدترین"
      }
    >
      <ArrowUpDown className="size-4" />
    </button>
  );
}