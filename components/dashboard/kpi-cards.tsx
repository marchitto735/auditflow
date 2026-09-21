"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  CARD_CONTENT_CLASS,
  CARD_CTA_ARROW_CLASS,
  CARD_CTA_CLASS,
  CARD_EYEBROW_CLASS,
  CARD_FOOTER_CLASS,
  CARD_TITLE_CLASS,
  DASHBOARD_GAP_CLASS,
  INTERACTIVE_CARD_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const AUDIT_THRESHOLD = 20;
const AVG_SCORE = 88;
const AUDITS_HREF = "/dashboard/audits";

const CARD_CLASS = cn(
  INTERACTIVE_CARD_CLASS,
  "group flex h-full cursor-pointer flex-col text-inherit no-underline",
);

function KpiCard({
  href,
  cta,
  eyebrow,
  children,
}: {
  href: string;
  cta: string;
  eyebrow: string;
  children: ReactNode;
}) {
  const router = useRouter();

  function handleActivate() {
    router.push(href);
  }

  return (
    <div
      role="link"
      tabIndex={0}
      data-kpi-card
      className={CARD_CLASS}
      onClick={handleActivate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleActivate();
        }
      }}
      onMouseEnter={() => router.prefetch(href)}
      onFocus={() => router.prefetch(href)}
      aria-label={cta}
    >
      <Card className="flex h-full min-h-0 w-full flex-col border-0 bg-transparent shadow-none">
        <CardContent
          className={cn(
            CARD_CONTENT_CLASS,
            "h-full min-h-0 w-full flex-col gap-1.5 text-left",
          )}
        >
          <p className={CARD_EYEBROW_CLASS}>{eyebrow}</p>
          <div className="flex min-w-0 flex-col gap-1.5">{children}</div>
          <div className={cn(CARD_FOOTER_CLASS, "mt-auto")}>
            <span className={CARD_CTA_CLASS}>
              <span>{cta}</span>
              <ChevronRight className={CARD_CTA_ARROW_CLASS} aria-hidden />
            </span>
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
    <div
      className="pointer-events-none h-12 w-full outline-none [&_*]:outline-none"
      aria-hidden
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={AUDIT_VOLUME}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          barCategoryGap={CHART_GEOMETRY.barCategoryGap}
          style={{ outline: "none" }}
        >
          <Bar
            dataKey="audits"
            radius={CHART_GEOMETRY.barRadius}
            maxBarSize={CHART_GEOMETRY.barMaxSize}
            background={{ fill: CHART.track }}
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
  const outer = 40;
  const inner = outer - CHART_GEOMETRY.stroke;

  return (
    <div
      className="pointer-events-none relative mx-auto size-[84px] outline-none [&_*]:outline-none"
      aria-hidden
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart style={{ outline: "none" }}>
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
            isAnimationActive={false}
          >
            {FINDINGS_BY_SEVERITY.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <p
        className={cn(
          CARD_TITLE_CLASS,
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
  const outer = 52;
  const inner = outer - CHART_GEOMETRY.stroke;

  return (
    <div
      className="pointer-events-none relative mx-auto h-[84px] w-[148px] outline-none [&_*]:outline-none"
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
          CARD_TITLE_CLASS,
          "pointer-events-none absolute inset-x-0 bottom-[18%] m-0 text-center leading-none text-foreground",
        )}
      >
        {AVG_SCORE}%
      </p>
    </div>
  );
}

export default function KpiCards() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(AUDITS_HREF);
  }, [router]);

  return (
    <div
      className={cn(
        "grid grid-cols-1 items-stretch md:grid-cols-3",
        DASHBOARD_GAP_CLASS,
      )}
    >
      <KpiCard
        href={AUDITS_HREF}
        cta="View Audit Log"
        eyebrow="Total Audits"
      >
        <p className={cn(CARD_TITLE_CLASS, "m-0 text-foreground")}>142</p>
        <div className="flex shrink-0 flex-col">
          <TotalAuditsChart />
        </div>
        <p className="text-body1 m-0 shrink-0 text-black">+4% this week</p>
      </KpiCard>

      <KpiCard
        href="/dashboard/findings"
        cta="Inspect Findings"
        eyebrow="Open Findings"
      >
        <div className="flex shrink-0 flex-col items-center">
          <OpenFindingsChart />
        </div>
        <p className="text-body1 m-0 shrink-0 text-black">−2 this week</p>
      </KpiCard>

      <KpiCard
        href="/dashboard/score-analysis"
        cta="Score Breakdown"
        eyebrow="Average Score"
      >
        <div className="flex shrink-0 flex-col items-center">
          <AvgScoreGauge />
        </div>
        <p className="text-body1 m-0 shrink-0 text-black">+1.2 pts this week</p>
      </KpiCard>
    </div>
  );
}
