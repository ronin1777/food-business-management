export default function SupplierTransactionsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 animate-pulse rounded-xl bg-muted" />

            <div>
              <div className="h-7 w-56 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>

          <div className="hidden h-9 w-20 animate-pulse rounded-lg bg-muted sm:block" />
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted lg:w-44" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted lg:w-24" />
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-muted" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {Array.from({ length: 6 }).map((_, index) => (
                  <th key={index} className="px-5 py-3">
                    <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: 7 }).map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-border/70"
                >
                  {Array.from({ length: 6 }).map((_, cellIndex) => (
                    <td key={cellIndex} className="px-5 py-5">
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />

          <div className="flex items-center gap-2">
            <div className="h-8 w-14 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-8 w-14 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </section>
    </div>
  );
}