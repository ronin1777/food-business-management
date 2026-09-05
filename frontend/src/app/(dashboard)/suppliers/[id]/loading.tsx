export default function SupplierDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <div className="h-5 w-28 animate-pulse rounded bg-muted" />

          <div className="flex items-center gap-3">
            <div className="size-11 animate-pulse rounded-xl bg-muted" />

            <div>
              <div className="h-7 w-48 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-muted" />
        </div>
      </section>

      {/* Supplier Information */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>

      {/* Account Summary */}
      <section>
        <div className="mb-3 h-4 w-32 animate-pulse rounded bg-muted" />

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      </section>

      {/* Transactions */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-48 animate-pulse rounded bg-muted" />
        </div>

        <div className="space-y-4 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded bg-muted"
            />
          ))}
        </div>
      </section>
    </div>
  );
}