"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendSparkline } from "@/components/dashboard/audit-launcher";
import { workflowStatusSparkClass } from "@/lib/chart-tokens";
import {
  AUDIT_LAUNCHER_CARD_HEIGHT_CLASS,
  CARD_BODY_CLASS,
  CARD_CONTENT_CLASS,
  CARD_CORNER_LABEL_CLASS,
  CARD_EYEBROW_MUTED_CLASS,
  CARD_HEADER_STACK_CLASS,
  CARD_METRIC_CLASS,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_TRIPLE_CARD_GRID_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const METRIC_VALUE_CLASS = "font-sans tabular-nums";

const CARD_CLASS = cn(
  DASHBOARD_CARD_CLASS,
  AUDIT_LAUNCHER_CARD_HEIGHT_CLASS,
  "flex w-full min-w-0 flex-col overflow-hidden",
);

type KpiCardData = {
  id: string;
  eyebrow: string;
  code: string;
  metric: string;
  trend: number[];
  /** Drives sparkline color only. */
  status: string;
  helper: string;
};

const KPI_CARDS: readonly KpiCardData[] = [
  {
    id: "total-audits",
    eyebrow: "Total audits",
    code: "YTD",
    metric: "142",
    trend: [118, 124, 129, 134, 138, 140, 142],
    status: "Synced",
    helper: "Active records this year",
  },
  {
    id: "open-findings",
    eyebrow: "Open findings",
    code: "ALL",
    metric: "8",
    trend: [11, 10, 9, 10, 8, 9, 8],
    status: "Flagged",
    helper: "Awaiting review",
  },
  {
    id: "average-score",
    eyebrow: "Average score",
    code: "AVG",
    metric: "88%",
    trend: [84, 85, 86, 87, 86, 88, 88],
    status: "Verified",
    helper: "Vs 85% GMP benchmark",
  },
];

/**
 * Shared metric summary — title, value, helper, and a sparkline
 * with its scope acronym. Tuned for the 3-column KPI strip.
 */
export function MetricCard({
  title,
  value,
  description,
  trend,
  code,
  status = "Synced",
  className,
}: {
  title: string;
  value: string;
  description: string;
  trend: number[];
  /** Short uppercase code under the sparkline (YTD, SOP, AVG). */
  code: string;
  /** Colors the sparkline only. */
  status?: string;
  className?: string;
}) {
  const series = trend.length > 0 ? trend : [0];

  return (
    <div data-metric-card={title} className={cn(CARD_CLASS, className)}>
      <Card className="flex h-auto w-full min-h-0 min-w-0 flex-col border-0 bg-transparent shadow-none">
        <CardContent
          className={cn(
            CARD_CONTENT_CLASS,
            "flex h-auto w-full min-h-0 min-w-0 flex-col gap-2.5 overflow-hidden p-3.5 text-left sm:p-4",
          )}
        >
          <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2">
            <div className={cn(CARD_HEADER_STACK_CLASS, "min-w-0 gap-1.5")}>
              <p
                className={cn(
                  CARD_EYEBROW_MUTED_CLASS,
                  "min-w-0 max-w-full whitespace-normal break-words",
                )}
              >
                {title}
              </p>
              <h3
                className={cn(
                  CARD_METRIC_CLASS,
                  METRIC_VALUE_CLASS,
                  "m-0 max-w-full whitespace-normal break-words text-[22px] leading-tight text-neutral-900",
                )}
              >
                {value}
              </h3>
            </div>
            <div className="flex w-[3rem] max-w-full shrink-0 flex-col items-center justify-start gap-1 sm:w-[3.5rem]">
              <TrendSparkline
                values={series}
                label={`${title} trend`}
                className={cn(
                  "max-w-full",
                  workflowStatusSparkClass(status),
                )}
              />
              <p
                className={CARD_CORNER_LABEL_CLASS}
                aria-label={`${title} scope ${code}`}
              >
                {code}
              </p>
            </div>
          </div>

          <p
            className={cn(
              CARD_BODY_CLASS,
              "whitespace-normal break-words",
            )}
          >
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/** Single KPI telemetry card — used in the dashboard primary KPI row. */
export function KpiCard({ card }: { card: KpiCardData }) {
  return (
    <MetricCard
      title={card.eyebrow}
      value={card.metric}
      description={card.helper}
      trend={[...card.trend]}
      code={card.code}
      status={card.status}
    />
  );
}

/** Status KPI strip — title, metric, sparkline, and one helper line. */
export default function KpiCards({ className }: { className?: string }) {
  return (
    <div
      className={cn(DASHBOARD_TRIPLE_CARD_GRID_CLASS, "items-stretch", className)}
    >
      {KPI_CARDS.map((card) => (
        <KpiCard key={card.id} card={card} />
      ))}
    </div>
  );
}

/** KPI cards without a grid wrapper — compose into a parent telemetry grid. */
export function KpiCardItems() {
  return KPI_CARDS.map((card) => <KpiCard key={card.id} card={card} />);
}
