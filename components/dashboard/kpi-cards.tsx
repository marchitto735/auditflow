"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  CHART,
  CHART_GEOMETRY,
  scoreSeriesColor,
  severityFill,
} from "@/lib/chart-tokens";
import {
  CARD_CONTENT_CLASS,
  CARD_EYEBROW_CLASS,
  CARD_HEADER_STACK_CLASS,
  CARD_METRIC_CLASS,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_TRACK_CARD_HEIGHT_CLASS,
  DASHBOARD_TRIPLE_CARD_GRID_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const AUDIT_THRESHOLD = 20;
const AVG_SCORE = 88;

const METRIC_VALUE_CLASS = "font-sans tabular-nums";

const CARD_CLASS = cn(
  DASHBOARD_CARD_CLASS,
  DASHBOARD_TRACK_CARD_HEIGHT_CLASS,
  "flex w-full min-w-0 shrink-0 flex-col",
);

function KpiCard({
  eyebrow,
  metric,
  chart,
  helper,
}: {
  eyebrow: string;
  metric?: ReactNode;
  chart: ReactNode;
  helper: string;
}) {
  return (
    <div data-kpi-card className={CARD_CLASS}>
      <Card className="flex h-full min-h-0 w-full flex-col border-0 bg-transparent shadow-none">
        <CardContent
          className={cn(
            CARD_CONTENT_CLASS,
            "relative flex h-full w-full min-h-0 flex-col justify-between gap-3 overflow-visible p-4 text-left",
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 z-0 flex -translate-y-[14px] items-center justify-center"
            aria-hidden
          >
            {chart}
          </div>

          <div className={cn(CARD_HEADER_STACK_CLASS, "relative z-10 shrink-0")}>
            <p className={CARD_EYEBROW_CLASS}>{eyebrow}</p>
            {metric}
          </div>

          <div className="relative z-10 mt-auto flex shrink-0 flex-col gap-2">
            <p className="text-body1 m-0 w-full self-start text-left font-sans leading-snug text-black">
              {helper}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const AUDIT_VOLUME = [
  { day: "Mon", audits: 16 },
  { day: "Tue", audits: 22 },
  { day: "Wed", audits: 19 },
  { day: "Thu", audits: 28 },
  { day: "Fri", audits: 24 },
  { day: "Sat", audits: 12 },
  { day: "Sun", audits: 21 },
];

const FINDINGS_BY_SEVERITY = [
  { name: "Critical" as const, value: 2 },
  { name: "High" as const, value: 3 },
  { name: "Medium" as const, value: 2 },
  { name: "Low" as const, value: 1 },
];

const FINDINGS_TOTAL = FINDINGS_BY_SEVERITY.reduce(
  (sum, entry) => sum + entry.value,
  0,
);

function TotalAuditsChart() {
  /** Toggle gray background track columns without removing the wiring. */
  const showTrack = false;

  return (
    <div
      className="pointer-events-none mx-auto h-[72px] w-[10.5rem] max-w-full shrink-0 overflow-hidden outline-none [&_*]:outline-none"
      aria-hidden
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={AUDIT_VOLUME}
          margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
          barCategoryGap="16%"
          style={{ outline: "none" }}
        >
          <Bar
            dataKey="audits"
            radius={CHART_GEOMETRY.barRadius}
            maxBarSize={CHART_GEOMETRY.barMaxSize}
            {...(showTrack
              ? { background: { fill: CHART.track } }
              : { background: { fill: "transparent" } })}
            isAnimationActive={false}
          >
            {AUDIT_VOLUME.map((entry) => (
              <Cell
                key={entry.day}
                fill={
                  entry.audits >= AUDIT_THRESHOLD
                    ? CHART.structural
                    : CHART.structuralMuted
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function OpenFindingsChart() {
  const data = FINDINGS_BY_SEVERITY.map((entry) => ({
    ...entry,
    color: severityFill(entry.name),
  }));
  const outer = 52;
  const inner = outer - CHART_GEOMETRY.stroke;

  return (
    <div
      className="pointer-events-none relative mx-auto size-[112px] max-w-full shrink-0 overflow-hidden outline-none [&_*]:outline-none"
      aria-hidden
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart style={{ outline: "none" }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={inner}
            outerRadius={outer}
            stroke="none"
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <p
        className={cn(
          CARD_METRIC_CLASS,
          METRIC_VALUE_CLASS,
          "pointer-events-none absolute inset-0 m-0 flex items-center justify-center leading-none text-foreground",
        )}
      >
        {FINDINGS_TOTAL}
      </p>
    </div>
  );
}

function AvgScoreGauge() {
  const remainder = 100 - AVG_SCORE;
  const fill = scoreSeriesColor(AVG_SCORE);
  const data = [
    { name: "score", value: AVG_SCORE },
    { name: "rest", value: remainder },
  ];
  const stroke = CHART_GEOMETRY.stroke;
  const outer = 58;
  const inner = outer - stroke;

  return (
    <div
      className="pointer-events-none relative mx-auto h-[96px] w-[168px] max-w-full shrink-0 overflow-hidden outline-none [&_*]:outline-none"
      aria-hidden
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart style={{ outline: "none" }}>
          <Pie
            data={data}
            dataKey="value"
            startAngle={180}
            endAngle={0}
            innerRadius={inner}
            outerRadius={outer}
            stroke="none"
            paddingAngle={0}
            cx="50%"
            cy="94%"
            isAnimationActive={false}
          >
            <Cell fill={fill} />
            <Cell fill={CHART.track} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <p
        className={cn(
          CARD_METRIC_CLASS,
          METRIC_VALUE_CLASS,
          "pointer-events-none absolute inset-x-0 bottom-[16%] m-0 text-center leading-none text-foreground",
        )}
      >
        {AVG_SCORE}%
      </p>
    </div>
  );
}

/** Static Status KPI strip — charts + values only, no navigation CTAs. */
export default function KpiCards({ className }: { className?: string }) {
  return (
    <div
      className={cn(DASHBOARD_TRIPLE_CARD_GRID_CLASS, "items-stretch", className)}
    >
      <KpiCard
        eyebrow="Total Audits"
        metric={
          <p
            className={cn(
              CARD_METRIC_CLASS,
              METRIC_VALUE_CLASS,
              "m-0 self-start pt-1 leading-none text-foreground",
            )}
          >
            142
          </p>
        }
        chart={<TotalAuditsChart />}
        helper="+4% this week"
      />

      <KpiCard
        eyebrow="Open Findings"
        chart={<OpenFindingsChart />}
        helper="−2 this week"
      />

      <KpiCard
        eyebrow="Average Score"
        chart={<AvgScoreGauge />}
        helper="+1.2 pts this week"
      />
    </div>
  );
}
