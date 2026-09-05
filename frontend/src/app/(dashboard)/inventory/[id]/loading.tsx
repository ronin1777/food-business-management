export default function InventoryTransactionLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="size-9 animate-pulse rounded-lg bg-muted" />

        <div className="size-10 animate-pulse rounded-xl bg-muted" />

        <div className="space-y-2">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="h-48 animate-pulse rounded-xl border bg-muted/30" />

      <div className="h-48 animate-pulse rounded-xl border bg-muted/30" />

      <div className="h-40 animate-pulse rounded-xl border bg-muted/30" />

      <div className="h-32 animate-pulse rounded-xl border bg-muted/30" />
    </div>
  );
}