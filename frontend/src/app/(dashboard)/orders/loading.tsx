export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          <div className="h-7 w-28 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>

        <div className="flex gap-2">
          <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="h-20 animate-pulse border-b bg-muted/30" />
        <div className="h-[500px] animate-pulse bg-muted/10" />
      </div>
    </div>
  );
}