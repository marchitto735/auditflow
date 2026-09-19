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

const GREEN = "#16a34a";
const GRAY = "#e5e7eb";
const RED = "#dc2626";
const AMBER = "#f59e0b";
const NEUTRAL = "#9ca3af";
const AUDIT_THRESHOLD = 20;
const AVG_SCORE = 88;
const CARD_CLASS =
  "flex h-full flex-col justify-between rounded-2xl border-0 bg-[oklch(100%_0_0)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]";
const CTA_CLASS =
  "group inline-flex items-center gap-0.5 text-xs font-medium text-neutral-900 transition-colors hover:text-neutral-600";

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
    <Card className={CARD_CLASS}>
      <CardContent className="flex h-full flex-col p-4">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <div className="mt-auto flex w-full justify-end pt-4">
          <Link href={href} className={CTA_CLASS}>
            <span className="group-hover:underline">{cta}</span>
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </CardContent>
    </Card>
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
  { name: "Critical", value: 2, color: RED },
  { name: "High", value: 3, color: RED },
  { name: "Medium", value: 2, color: AMBER },
  { name: "Low", value: 1, color: NEUTRAL },
];

const FINDINGS_TOTAL = FINDINGS_BY_SEVERITY.reduce(
  (sum, item) => sum + item.value,
  0,
);

function scoreColor(score: number) {
  if (score < 70) return RED;
  if (score <= 85) return AMBER;
  return GREEN;
}

function TotalAuditsChart() {
  return (
    <div className="h-[72px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={AUDIT_VOLUME}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          barCategoryGap="18%"
        >
          <Bar dataKey="audits" radius={[3, 3, 0, 0]} maxBarSize={18}>
            {AUDIT_VOLUME.map((entry) => (
              <Cell
                key={entry.day}
                fill={entry.audits >= AUDIT_THRESHOLD ? GREEN : GRAY}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function OpenFindingsChart() {
  return (
    <div className="relative mx-auto h-[120px] w-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={FINDINGS_BY_SEVERITY}
            dataKey="value"
            nameKey="name"
            innerRadius={38}
            outerRadius={56}
            stroke="none"
            paddingAngle={1.5}
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
  const fill = scoreColor(AVG_SCORE);
  const data = [
    { name: "score", value: AVG_SCORE },
    { name: "rest", value: remainder },
  ];

  return (
    <div className="relative mx-auto h-[100px] w-[168px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            startAngle={180}
            endAngle={0}
            innerRadius={52}
            outerRadius={68}
            stroke="none"
            cy="78%"
          >
            <Cell fill={fill} />
            <Cell fill={GRAY} />
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
        <p className="text-body2 m-0 text-muted-foreground">Total Audits</p>
        <p className="text-h4 m-0 mt-2 font-semibold leading-none text-foreground">
          142
        </p>
        <div className="mt-4 flex flex-1 items-center">
          <TotalAuditsChart />
        </div>
        <p className="text-body2 m-0 mt-3 text-[oklch(38%_0.08_145)]">
          +4% this week
        </p>
      </KpiCard>

      <KpiCard href="/dashboard/findings" cta="Inspect Findings">
        <p className="text-body2 m-0 text-muted-foreground">Open Findings</p>
        <div className="mt-3 flex flex-1 items-center justify-center">
          <OpenFindingsChart />
        </div>
        <p className="text-body2 m-0 mt-3 text-[oklch(38%_0.08_145)]">
          −2 this week
        </p>
      </KpiCard>

      <KpiCard href="/dashboard/score-analysis" cta="Score Breakdown">
        <p className="text-body2 m-0 text-muted-foreground">Avg Score</p>
        <div className="mt-3 flex flex-1 items-center justify-center">
          <AvgScoreGauge />
        </div>
        <p className="text-body2 m-0 mt-3 text-[oklch(38%_0.08_145)]">
          +1.2 pts this week
        </p>
      </KpiCard>
    </div>
  );
}
