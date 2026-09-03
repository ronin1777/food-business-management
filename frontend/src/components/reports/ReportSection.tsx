import type { ReactNode } from "react";

type ReportSectionProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function ReportSection({
  title,
  description,
  action,
  children,
  className = "",
}: ReportSectionProps) {
  return (
    <section
      className={[
        "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}