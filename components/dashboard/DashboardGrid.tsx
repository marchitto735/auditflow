"use client";

import KpiCards from "@/components/dashboard/kpi-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import AuditLauncher from "@/components/dashboard/audit-launcher";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { SystemTelemetrySection } from "@/components/dashboard/SystemTelemetrySection";
import type { ActivityRow } from "@/components/activity-table/activity-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DASHBOARD_SECTION_GAP_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type DashboardGridProps = {
  activityRows?: ActivityRow[];
};

/**
 * Full-width stacked Swiss bento:
 * Quick Launch (compact SOP/BPR/FIR) → Status → History → Telemetry.
 * Full Audits workspace remains at `/audits`.
 */
export default function DashboardGrid({
  activityRows = [],
}: DashboardGridProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "flex w-full min-w-0 flex-col",
          DASHBOARD_SECTION_GAP_CLASS,
        )}
      >
        <DashboardSection
          title="Audits"
          description="Start an SOP, BPR, or FIR audit without leaving the dashboard."
        >
          <AuditLauncher variant="compact" />
        </DashboardSection>
        <DashboardSection
          title="Status"
          description="Performance metrics across active audits, findings, and compliance scores."
        >
          <KpiCards />
        </DashboardSection>
        <DashboardSection
          title="History"
          description="Review recent SOP, BPR, and FIR audits, scores, and compliance status."
        >
          <RecentActivity rows={activityRows} />
        </DashboardSection>
        <SystemTelemetrySection className="pb-16 md:pb-20" />
      </div>
    </TooltipProvider>
  );
}
