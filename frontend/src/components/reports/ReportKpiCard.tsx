import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";

type ReportKpiCardProps = {
  title: string;
  value: string;
  change?: string | null;
  direction?: "up" | "down" | "unchanged";
  tone?: "positive" | "negative" | "neutral";
};

export default function ReportKpiCard({
  title,
  value,
  change,
  direction = "unchanged",
  tone = "neutral",
}: ReportKpiCardProps) {
  const Icon =
    direction === "up"
      ? ArrowUpRight
      : direction === "down"
        ? ArrowDownRight
        : Minus;

  const toneClass =
    tone === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "negative"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  return (
    <div
      className="
        rounded-xl
        border
        border-border
        bg-card
        p-5
        shadow-sm
        transition-shadow
        hover:shadow-md
      "
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">
          {title}
        </p>

        <div
          className={[
            "flex size-8 items-center justify-center rounded-lg",
            "bg-muted",
            toneClass,
          ].join(" ")}
        >
          <Icon className="size-4" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-semibold tracking-tight">
          {value}
        </p>

        {change !== undefined && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className={["font-medium", toneClass].join(" ")}>
              {change ?? "—"}
            </span>

            <span className="text-muted-foreground">
              نسبت به دوره قبل
            </span>
          </div>
        )}
      </div>
    </div>
  );
}