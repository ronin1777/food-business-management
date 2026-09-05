import {
  ArrowDownAZ,
  ArrowUpAZ,
  Search,
} from "lucide-react";

type SuppliersToolbarProps = {
  search: string;
  ordering: string;
};

export function SuppliersToolbar({
  search,
  ordering,
}: SuppliersToolbarProps) {
  const nextOrdering =
    ordering === "name"
      ? "-name"
      : "name";

  return (
    <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
      <form
        action="/suppliers"
        className="relative min-w-0 flex-1"
      >
        <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <input
          name="search"
          defaultValue={search}
          placeholder="جستجوی نام یا شماره تماس..."
          className="
            h-10 w-full
            rounded-lg
            border border-input
            bg-background
            pr-9 pl-3
            text-sm
            outline-none
            placeholder:text-muted-foreground
            focus:border-ring
            focus:ring-2
            focus:ring-ring/20
          "
        />

        <input
          type="hidden"
          name="ordering"
          value={ordering}
        />
      </form>

      <form action="/suppliers">
        <input
          type="hidden"
          name="search"
          value={search}
        />

        <input
          type="hidden"
          name="ordering"
          value={nextOrdering}
        />

        <button
          type="submit"
          className="
            inline-flex h-10
            items-center justify-center
            gap-2
            rounded-lg
            border border-input
            bg-background
            px-3
            text-sm font-medium
            transition-colors
            hover:bg-accent
          "
        >
          {ordering === "name" ? (
            <ArrowDownAZ className="size-4" />
          ) : (
            <ArrowUpAZ className="size-4" />
          )}

          <span>نام</span>
        </button>
      </form>
    </div>
  );
}