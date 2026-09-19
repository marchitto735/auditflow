"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
import { INTERACTIVE_CARD_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const AUDIT_THRESHOLD = 20;
const AVG_SCORE = 88;

const CARD_CLASS = cn(
  INTERACTIVE_CARD_CLASS,
  "group flex h-full flex-col justify-between text-inherit no-underline",
);

const CTA_CLASS =
  "inline-flex items-center gap-0.5 text-sm font-medium text-black transition-colors";

function KpiCard({
  href,
  cta,
  children,
}: {
  href: string;
  cta: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={CARD_CLASS}>
      <Card className="h-full border-0 bg-transparent shadow-none">
        <CardContent className="flex h-full flex-col p-4">
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          <div className="mt-auto flex w-full justify-end pt-4">
            <span className={CTA_CLASS}>
              <span className="group-hover:underline">{cta}</span>
              <ChevronRight className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
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
].map((entry) => ({
  ...entry,
  color: severityFill(entry.name),
}));

const FINDINGS_TOTAL = FINDINGS_BY_SEVERITY.reduce(
  (sum, item) => sum + item.value,
  0,
);

function TotalAuditsChart() {
  return (
    <div className="h-[72px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={AUDIT_VOLUME}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          barCategoryGap={CHART_GEOMETRY.barCategoryGap}
        >
          <Bar
            dataKey="audits"
            radius={CHART_GEOMETRY.barRadius}
            maxBarSize={CHART_GEOMETRY.barMaxSize}
            background={{ fill: CHART.track }}
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
  const outer = 56;
  const inner = outer - CHART_GEOMETRY.stroke;

  return (
    <div className="relative mx-auto h-[120px] w-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={FINDINGS_BY_SEVERITY}
            dataKey="value"
            nameKey="name"
            innerRadius={inner}
            outerRadius={outer}
            stroke="none"
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
          >
            {FINDINGS_BY_SEVERITY.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <p className="text-h4 pointer-events-none absolute inset-0 m-0 flex items-center justify-center font-semibold text-foreground">
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
  const outer = 60;
  const inner = outer - CHART_GEOMETRY.stroke;

  return (
    <div className="relative mx-auto h-[100px] w-[168px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            startAngle={180}
            endAngle={0}
            innerRadius={inner}
            outerRadius={outer}
            stroke="none"
            paddingAngle={0}
            cy="78%"
          >
            <Cell fill={fill} />
            <Cell fill={CHART.track} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <p className="text-h4 pointer-events-none absolute inset-x-0 top-[52%] m-0 -translate-y-1/2 text-center font-semibold text-foreground">
        {AVG_SCORE}%
      </p>
    </div>
  );
}

export default function KpiCards() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
      <KpiCard href="/dashboard/audits" cta="View Audit Log">
        <p className="text-sm font-medium m-0 text-black">Total Audits</p>
        <p className="text-h4 m-0 mt-2 font-semibold leading-none text-foreground">
          142
        </p>
        <div className="mt-4 flex flex-1 items-center">
          <TotalAuditsChart />
        </div>
        <p className="text-body1 m-0 mt-3 text-black">
          +4% this week
        </p>
      </KpiCard>

      <KpiCard href="/dashboard/findings" cta="Inspect Findings">
        <p className="text-sm font-medium m-0 text-black">Open Findings</p>
        <div className="mt-3 flex flex-1 items-center justify-center">
          <OpenFindingsChart />
        </div>
        <p className="text-body1 m-0 mt-3 text-black">
          −2 this week
        </p>
      </KpiCard>

      <KpiCard href="/dashboard/score-analysis" cta="Score Breakdown">
        <p className="text-sm font-medium m-0 text-black">Avg Score</p>
        <div className="mt-3 flex flex-1 items-center justify-center">
          <AvgScoreGauge />
        </div>
        <p className="text-body1 m-0 mt-3 text-black">
          +1.2 pts this week
        </p>
      </KpiCard>
    </div>
  );
}
