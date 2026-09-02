export function DashboardSkeleton() {
  return (
    <div
      className="animate-pulse space-y-6"
      aria-busy="true"
      aria-label="در حال بارگذاری داشبورد"
    >
      {/* Dashboard Header */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="h-4 w-28 rounded-md bg-muted" />

          <div className="h-8 w-36 rounded-md bg-muted sm:h-9 sm:w-40" />

          <div className="h-4 w-72 max-w-full rounded-md bg-muted" />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="h-10 w-36 rounded-lg bg-muted" />

          <div className="h-10 w-20 rounded-lg bg-muted" />
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="
                rounded-xl
                border border-border
                bg-card
                p-5
                shadow-sm
              "
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded-md bg-muted" />

                <div className="size-8 rounded-lg bg-muted" />
              </div>

              <div className="mt-5 h-7 w-32 rounded-md bg-muted" />

              <div className="mt-4 h-3.5 w-28 rounded-md bg-muted" />
            </div>
          ),
        )}
      </section>

      {/* Main Chart */}
      <section
        className="
          overflow-hidden
          rounded-xl
          border border-border
          bg-card
          shadow-sm
        "
      >
        <div className="border-b border-border px-5 py-4">
          <div className="h-5 w-28 rounded-md bg-muted" />

          <div className="mt-2 h-3.5 w-64 max-w-full rounded-md bg-muted" />
        </div>

        <div className="px-4 pb-5 pt-6 sm:px-5">
          <div className="relative h-[320px] overflow-hidden rounded-lg">
            {/* Horizontal graph lines */}
            <div className="absolute inset-x-0 top-8 border-t border-dashed border-border/70" />
            <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-border/70" />
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-border/70" />
            <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-border/70" />
            <div className="absolute inset-x-0 bottom-0 border-t border-border" />

            {/* Y-axis labels */}
            <div className="absolute left-0 top-4 h-full w-12">
              <div className="h-4 w-8 rounded bg-muted" />
              <div className="mt-12 h-4 w-8 rounded bg-muted" />
              <div className="mt-12 h-4 w-8 rounded bg-muted" />
              <div className="mt-12 h-4 w-8 rounded bg-muted" />
              <div className="mt-12 h-4 w-8 rounded bg-muted" />
            </div>

            {/* Fake chart */}
            <div className="absolute inset-x-12 bottom-8 top-4">
              <div
                className="
                  absolute
                  left-0
                  top-[44%]
                  h-3
                  w-3
                  rounded-full
                  bg-muted
                "
              />

              <div
                className="
                  absolute
                  left-[12%]
                  top-[25%]
                  h-3
                  w-3
                  rounded-full
                  bg-muted
                "
              />

              <div
                className="
                  absolute
                  left-[27%]
                  top-[38%]
                  h-3
                  w-3
                  rounded-full
                  bg-muted
                "
              />

              <div
                className="
                  absolute
                  left-[43%]
                  top-[12%]
                  h-3
                  w-3
                  rounded-full
                  bg-muted
                "
              />

              <div
                className="
                  absolute
                  left-[58%]
                  top-[28%]
                  h-3
                  w-3
                  rounded-full
                  bg-muted
                "
              />

              <div
                className="
                  absolute
                  left-[74%]
                  top-[17%]
                  h-3
                  w-3
                  rounded-full
                  bg-muted
                "
              />

              <div
                className="
                  absolute
                  right-0
                  top-[34%]
                  h-3
                  w-3
                  rounded-full
                  bg-muted
                "
              />

              {/* Gradient-like area */}
              <div
                className="
                  absolute inset-x-0 bottom-0 top-0
                  bg-gradient-to-t
                  from-muted/30
                  via-muted/10
                  to-transparent
                "
              />
            </div>

            {/* X-axis */}
            <div className="absolute inset-x-12 bottom-0 flex justify-between">
              {Array.from({ length: 7 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-3 w-8 rounded bg-muted"
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products + Inventory */}
      <section className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map(
          (_, cardIndex) => (
            <div
              key={cardIndex}
              className="
                overflow-hidden
                rounded-xl
                border border-border
                bg-card
                shadow-sm
              "
            >
              <div className="border-b border-border px-5 py-4">
                <div className="h-5 w-36 rounded-md bg-muted" />

                <div className="mt-2 h-3.5 w-56 max-w-full rounded-md bg-muted" />
              </div>

              <div className="space-y-1 p-5">
                {Array.from({ length: 4 }).map(
                  (_, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className="size-9 shrink-0 rounded-lg bg-muted" />

                      <div className="min-w-0 flex-1">
                        <div className="h-4 w-28 rounded-md bg-muted" />

                        <div className="mt-2 h-3 w-20 rounded-md bg-muted" />
                      </div>

                      <div className="h-4 w-20 rounded-md bg-muted" />
                    </div>
                  ),
                )}
              </div>
            </div>
          ),
        )}
      </section>

      {/* Financial Overview */}
      <section className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map(
          (_, cardIndex) => (
            <div
              key={cardIndex}
              className="
                overflow-hidden
                rounded-xl
                border border-border
                bg-card
                shadow-sm
              "
            >
              <div className="border-b border-border px-5 py-4">
                <div className="h-5 w-32 rounded-md bg-muted" />

                <div className="mt-2 h-3.5 w-52 rounded-md bg-muted" />
              </div>

              <div className="p-5">
                <div className="h-8 w-40 rounded-md bg-muted" />

                <div className="mt-6 space-y-3">
                  {Array.from({ length: 3 }).map(
                    (_, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="flex items-center justify-between"
                      >
                        <div className="h-4 w-24 rounded-md bg-muted" />

                        <div className="h-4 w-28 rounded-md bg-muted" />
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          ),
        )}
      </section>

      {/* Recent Orders + Insights */}
      <section className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map(
          (_, cardIndex) => (
            <div
              key={cardIndex}
              className="
                overflow-hidden
                rounded-xl
                border border-border
                bg-card
                shadow-sm
              "
            >
              <div className="border-b border-border px-5 py-4">
                <div className="h-5 w-32 rounded-md bg-muted" />

                <div className="mt-2 h-3.5 w-48 rounded-md bg-muted" />
              </div>

              <div className="divide-y divide-border/70">
                {Array.from({ length: 4 }).map(
                  (_, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex items-center gap-3 px-5 py-4"
                    >
                      <div className="size-9 shrink-0 rounded-lg bg-muted" />

                      <div className="min-w-0 flex-1">
                        <div className="h-4 w-28 rounded-md bg-muted" />

                        <div className="mt-2 h-3 w-20 rounded-md bg-muted" />
                      </div>

                      <div className="h-6 w-20 rounded-full bg-muted" />
                    </div>
                  ),
                )}
              </div>
            </div>
          ),
        )}
      </section>
    </div>
  );
}