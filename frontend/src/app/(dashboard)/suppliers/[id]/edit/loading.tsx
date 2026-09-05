export default function EditSupplierLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />

        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Form */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="space-y-6 p-5 sm:p-6">
          {/* Name */}
          <div>
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-muted" />
          </div>

          {/* Phone */}
          <div>
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-muted" />
          </div>

          {/* Active */}
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 size-4 animate-pulse rounded bg-muted" />

              <div className="flex-1">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-72 max-w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted sm:w-24" />

          <div className="h-10 w-full animate-pulse rounded-lg bg-muted sm:w-32" />
        </div>
      </div>
    </div>
  );
}