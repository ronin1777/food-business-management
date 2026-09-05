export default function InventoryLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>

        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="h-40 animate-pulse rounded-xl border bg-card" />

      <div className="h-[500px] animate-pulse rounded-xl border bg-card" />
    </div>
  );
}