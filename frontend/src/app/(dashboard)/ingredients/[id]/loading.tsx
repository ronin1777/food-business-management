export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 animate-pulse rounded-lg bg-muted" />

          <div className="size-10 animate-pulse rounded-xl bg-muted" />

          <div>
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="h-20 animate-pulse rounded-xl bg-muted" />

      <div className="h-48 animate-pulse rounded-xl bg-muted" />

      <div className="h-44 animate-pulse rounded-xl bg-muted" />

      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}