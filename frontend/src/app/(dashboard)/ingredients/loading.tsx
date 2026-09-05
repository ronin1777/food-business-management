export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-8 w-36 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>

        <div className="h-10 w-36 animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-muted" />
        </div>

        <div className="divide-y divide-border/70">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-5 py-4"
            >
              <div className="size-9 animate-pulse rounded-lg bg-muted" />

              <div className="min-w-0 flex-1">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-20 animate-pulse rounded bg-muted" />
              </div>

              <div className="hidden h-4 w-20 animate-pulse rounded bg-muted md:block" />
              <div className="hidden h-4 w-28 animate-pulse rounded bg-muted lg:block" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}