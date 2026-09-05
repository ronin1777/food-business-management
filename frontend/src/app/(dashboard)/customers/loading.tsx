export default function CustomersLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />

          <div className="mt-2 h-9 w-32 animate-pulse rounded bg-muted" />

          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>

        <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
      </section>

      {/* Main Card */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center">
          <div className="h-10 min-w-0 flex-1 animate-pulse rounded-lg bg-muted" />

          <div className="h-10 w-20 animate-pulse rounded-lg bg-muted" />

          <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
        </div>

        {/* Table */}
        <div className="divide-y divide-border/70">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-5 py-4"
            >
              <div className="size-10 shrink-0 animate-pulse rounded-lg bg-muted" />

              <div className="min-w-0 flex-1">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />

                <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
              </div>

              <div className="hidden h-4 w-24 animate-pulse rounded bg-muted sm:block" />

              <div className="hidden h-6 w-16 animate-pulse rounded-full bg-muted sm:block" />

              <div className="hidden h-4 w-24 animate-pulse rounded bg-muted md:block" />

              <div className="h-7 w-16 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />

          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        </div>
      </section>
    </div>
  );
}