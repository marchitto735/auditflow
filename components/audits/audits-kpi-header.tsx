"use client";

import { MetricCard } from "@/components/dashboard/kpi-cards";
import { DASHBOARD_TRIPLE_CARD_GRID_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const AUDITS_KPI_CARDS = [
  {
    title: "Policy control",
    value: "42",
    description: "SOP docs in active workflows",
    code: "SOP",
    trend: [38, 40, 39, 41, 42],
    status: "Synced",
  },
  {
    title: "Production log",
    value: "128",
    description: "BPR batches ready for audit",
    code: "BPR",
    trend: [112, 118, 121, 125, 128],
    status: "Synced",
  },
  {
    title: "Site audit",
    value: "14",
    description: "FIR checklists in progress",
    code: "FIR",
    trend: [11, 12, 13, 13, 14],
    status: "Synced",
  },
] as const;

/** Audits KPI strip — same metric card as the dashboard. */
export default function AuditsKpiHeader({ className }: { className?: string }) {
  return (
    <div className={cn(DASHBOARD_TRIPLE_CARD_GRID_CLASS, className)}>
      {AUDITS_KPI_CARDS.map((card) => (
        <MetricCard
          key={card.title}
          title={card.title}
          value={card.value}
          description={card.description}
          trend={[...card.trend]}
          code={card.code}
          status={card.status}
        />
      ))}
    </div>
  );
}
