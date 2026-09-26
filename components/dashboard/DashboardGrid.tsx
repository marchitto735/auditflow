"use client";

import KpiCards from "@/components/dashboard/kpi-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import AuditLauncher from "@/components/dashboard/audit-launcher";
import { DashboardCommandHeader } from "@/components/dashboard/dashboard-command-header";
import { SystemTelemetrySection } from "@/components/dashboard/SystemTelemetrySection";
import {
  CategoryBreakdownPanel,
  ComplianceTrendPanel,
  FindingsSummaryPanel,
} from "@/components/dashboard/status-detail-panels";
import type { ActivityRow } from "@/components/activity-table/activity-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DASHBOARD_SECTION_GAP_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type DashboardGridProps = {
  activityRows?: ActivityRow[];
};

/**
 * Telemetry command center — static modules + nested deep-data panels.
 * Interactive audit launch remains on `/audits`.
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
        <DashboardCommandHeader />

        <AuditLauncher variant="compact" />

        <div className="flex min-w-0 flex-col gap-6">
          <KpiCards />
          <FindingsSummaryPanel className="w-full min-w-0" />
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
            <CategoryBreakdownPanel />
            <ComplianceTrendPanel />
          </div>
        </div>

        <RecentActivity rows={activityRows} />

        <SystemTelemetrySection className="pb-16 md:pb-20" />
      </div>
    </TooltipProvider>
  );
}
