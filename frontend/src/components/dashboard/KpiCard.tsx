import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string;
  change?: string;
  changeType: "positive" | "negative" | "neutral";
};

export function KpiCard({
  title,
  value,
  change,
  changeType,
}: KpiCardProps) {
  const changeStyles = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  const ChangeIcon =
    changeType === "positive"
      ? ArrowUpRight
      : changeType === "negative"
        ? ArrowDownRight
        : Minus;

  return (
    <section
      className="
        rounded-xl
        border border-card-border
        bg-card
        p-5
        shadow-sm
        transition-shadow
        hover:shadow-md
      "
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {title}
        </p>

        <div
          className="
            flex size-8 items-center
            justify-center rounded-lg
            bg-muted
          "
        >
          <div className="size-2 rounded-full bg-primary/60" />
        </div>
      </div>

      <div className="mt-4">
        <p
          className="
            text-2xl
            font-semibold
            leading-none
            tracking-tight
            text-card-foreground
          "
        >
          {value}
        </p>
      </div>

      {change && (
        <div
          className={[
            "mt-4 flex items-center gap-1.5",
            "text-xs font-medium",
            changeStyles[changeType],
          ].join(" ")}
        >
          <ChangeIcon className="size-3.5" />

          <span>{change}</span>
        </div>
      )}
    </section>
  );
}