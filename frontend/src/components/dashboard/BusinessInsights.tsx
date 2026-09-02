"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
} from "lucide-react";

import type { DashboardInsight } from "@/types/dashboard";

type BusinessInsightsProps = {
  insights: DashboardInsight[];
};

type InsightAppearance = {
  icon: typeof Info;
  iconClassName: string;
  dotClassName: string;
};

function getInsightAppearance(
  severity: DashboardInsight["severity"],
): InsightAppearance {
  switch (severity) {
    case "positive":
      return {
        icon: CheckCircle2,
        iconClassName: "text-success",
        dotClassName: "bg-success",
      };

    case "critical":
      return {
        icon: AlertCircle,
        iconClassName: "text-destructive",
        dotClassName: "bg-destructive",
      };

    case "warning":
      return {
        icon: AlertTriangle,
        iconClassName: "text-warning",
        dotClassName: "bg-warning",
      };

    default:
      return {
        icon: Info,
        iconClassName: "text-blue-500",
        dotClassName: "bg-blue-500",
      };
  }
}

export function BusinessInsights({
  insights,
}: BusinessInsightsProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <Lightbulb className="size-4 text-muted-foreground" />
        </div>

        <div>
          <h2 className="text-base font-semibold tracking-tight">
            بینش‌های کسب‌وکار
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            نکات و هشدارهای مهم بر اساس عملکرد کسب‌وکار
          </p>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-5 text-success" />
          </div>

          <p className="mt-3 text-sm font-medium">
            وضعیت خوب است
          </p>

          <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
            در حال حاضر مورد مهمی برای توجه یا اقدام وجود ندارد.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/70">
          {insights.map((insight, index) => {
            const appearance =
              getInsightAppearance(
                insight.severity,
              );

            const Icon =
              appearance.icon;

            return (
              <div
                key={`${insight.type}-${index}`}
                className="flex gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="relative flex shrink-0 justify-center pt-0.5">
                  <Icon
                    className={[
                      "size-4",
                      appearance.iconClassName,
                    ].join(" ")}
                  />

                  {index <
                    insights.length - 1 && (
                    <span className="absolute top-6 h-full w-px bg-border" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium">
                      {insight.title}
                    </h3>

                    <span
                      className={[
                        "size-1.5 rounded-full",
                        appearance.dotClassName,
                      ].join(" ")}
                    />
                  </div>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {insight.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}