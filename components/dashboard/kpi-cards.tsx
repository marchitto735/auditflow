"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendSparkline } from "@/components/dashboard/audit-launcher";
import {
  workflowStatusDotClass,
  workflowStatusSparkClass,
} from "@/lib/chart-tokens";
import {
  AUDIT_LAUNCHER_CARD_HEIGHT_CLASS,
  CARD_CONTENT_CLASS,
  CARD_CORNER_LABEL_CLASS,
  CARD_EYEBROW_MUTED_CLASS,
  CARD_TITLE_CLASS,
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
  status: string;
  lastRun: string;
  volume: string;
  delta: string;
  hit: string;
  throughput: string;
};

const KPI_CARDS: readonly KpiCardData[] = [
  {
    id: "total-audits",
    eyebrow: "Total Audits",
    code: "YTD",
    metric: "142",
    trend: [16, 22, 19, 28, 24, 12, 21],
    status: "Synced",
    lastRun: "10m ago",
    volume: "142",
    delta: "+4%",
    hit: "118%",
    throughput: "4.8 audits/day",
  },
  {
    id: "open-findings",
    eyebrow: "Open Findings",
    code: "ALL",
    metric: "8",
    trend: [11, 10, 9, 10, 8, 9, 8],
    status: "Flagged",
    lastRun: "22m ago",
    volume: "8",
    delta: "-2",
    hit: "62%",
    throughput: "1.1 closed/day",
  },
  {
    id: "average-score",
    eyebrow: "Average Score",
    code: "AVG",
    metric: "88%",
    trend: [84, 85, 86, 87, 86, 88, 88],
    status: "Verified",
    lastRun: "1h ago",
    volume: "142",
    delta: "+1.2",
    hit: "85%",
    throughput: "~1.2s/doc",
  },
];

/** Single KPI telemetry card — used in the unified dashboard 6-card grid. */
export function KpiCard({ card }: { card: KpiCardData }) {
  return (
    <div data-kpi-card={card.id} className={CARD_CLASS}>
      <Card className="flex h-auto w-full min-h-0 min-w-0 flex-col border-0 bg-transparent shadow-none">
        <CardContent
          className={cn(
            CARD_CONTENT_CLASS,
            "flex h-auto w-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden px-4 pt-4 pb-[16px] text-left",
          )}
        >
          <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 sm:gap-x-3">
            <div className="flex min-w-0 flex-col gap-2 overflow-hidden">
              <p
                className={cn(
                  CARD_EYEBROW_MUTED_CLASS,
                  "min-w-0 max-w-full truncate",
                )}
              >
                {card.eyebrow}
              </p>
              <h3
                className={cn(
                  CARD_TITLE_CLASS,
                  METRIC_VALUE_CLASS,
                  "m-0 max-w-full break-words text-pretty text-black",
                )}
              >
                {card.metric}
              </h3>
            </div>
            <div className="flex w-[3.75rem] max-w-full shrink-0 flex-col items-center justify-start gap-1 sm:w-[4.75rem]">
              <TrendSparkline
                values={card.trend}
                label={`${card.eyebrow} trend`}
                className={cn(
                  "max-w-full",
                  workflowStatusSparkClass(card.status),
                )}
              />
              <p
                className={CARD_CORNER_LABEL_CLASS}
                aria-label={`${card.eyebrow} scope ${card.code}`}
              >
                {card.code}
              </p>
            </div>
          </div>

          <p
            className="text-body1 m-0 flex min-w-0 flex-wrap items-center justify-start gap-x-2 gap-y-1 font-sans leading-snug text-black"
            aria-label={`${card.eyebrow} status ${card.status}, last run ${card.lastRun}`}
          >
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full",
                workflowStatusDotClass(card.status),
              )}
              aria-hidden
            />
            <span className="shrink-0 font-medium">{card.status}</span>
            <span className="shrink-0 text-black" aria-hidden>
              •
            </span>
            <span className="min-w-0 break-words text-black">
              Last Run {card.lastRun}
            </span>
          </p>

          <div
            className="mt-auto flex min-w-0 flex-wrap items-end justify-between gap-x-3 gap-y-1"
            aria-label={`${card.eyebrow} operational metrics`}
          >
            <div className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-snug text-black">
              <span className="shrink-0 whitespace-nowrap">
                <span className="text-black">Vol</span>{" "}
                <span className="font-medium text-black">{card.volume}</span>
              </span>
              <span className="shrink-0 text-black" aria-hidden>
                ·
              </span>
              <span className="shrink-0 whitespace-nowrap">
                <span className="text-black">Δ</span>{" "}
                <span className="font-medium text-black">{card.delta}</span>
              </span>
              <span className="shrink-0 text-black" aria-hidden>
                ·
              </span>
              <span className="shrink-0 whitespace-nowrap">
                <span className="text-black">Hit</span>{" "}
                <span className="font-medium text-black">{card.hit}</span>
              </span>
            </div>
            <p
              className="m-0 max-w-full shrink-0 text-right text-xs font-medium tabular-nums tracking-wider break-words text-muted-foreground"
              aria-label={`${card.eyebrow} throughput ${card.throughput}`}
            >
              {card.throughput}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** Status KPI strip — same compact telemetry anatomy as audit launcher cards. */
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
