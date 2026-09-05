export default function CustomerEditLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />

        <div className="mt-4 flex items-start gap-3">
          <div className="size-11 shrink-0 animate-pulse rounded-xl bg-muted" />

          <div>
            <div className="h-7 w-40 animate-pulse rounded bg-muted" />

            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="space-y-6 p-5 sm:p-6">
          {Array.from({ length: 3 }).map(
            (_, index) => (
              <div key={index}>
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />

                <div className="mt-2 h-11 w-full animate-pulse rounded-lg bg-muted" />
              </div>
            ),
          )}

          <div className="rounded-lg border border-border p-4">
            <div className="flex gap-3">
              <div className="mt-0.5 size-4 animate-pulse rounded bg-muted" />

              <div className="flex-1">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />

                <div className="mt-2 h-3 w-72 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-muted/10 px-5 py-4">
          <div className="h-10 w-20 animate-pulse rounded-lg bg-muted" />

          <div className="h-10 w-28 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}