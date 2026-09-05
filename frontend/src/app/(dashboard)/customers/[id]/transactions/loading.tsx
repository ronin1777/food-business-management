export default function CustomerTransactionsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />

        <div className="mt-4 flex items-center gap-3">
          <div className="size-11 animate-pulse rounded-xl bg-muted" />

          <div>
            <div className="h-7 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-28 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        </div>

        <div className="divide-y divide-border/70">
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="ml-auto h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}