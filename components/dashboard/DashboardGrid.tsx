"use client";

import RecentActivity from "@/components/dashboard/recent-activity";
import { AuditLauncherCard } from "@/components/dashboard/audit-launcher";
import { KpiCardItems } from "@/components/dashboard/kpi-cards";
import { DashboardCommandHeader } from "@/components/dashboard/dashboard-command-header";
import { SystemTelemetrySection } from "@/components/dashboard/SystemTelemetrySection";
import {
  CategoryBreakdownPanel,
  ComplianceTrendPanel,
  FindingsSummaryPanel,
} from "@/components/dashboard/status-detail-panels";
import type { ActivityRow } from "@/components/activity-table/activity-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  DASHBOARD_SECTION_GAP_CLASS,
  DASHBOARD_TRIPLE_CARD_GRID_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type DashboardGridProps = {
  activityRows?: ActivityRow[];
};

/**
 * Telemetry command center — two-tier KPI header, full-width tables,
 * and 50/50 modular pairs for feeds + analytics.
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

        {/* Tier 1 — macro operational KPIs */}
        <div className={cn("w-full min-w-0", DASHBOARD_TRIPLE_CARD_GRID_CLASS)}>
          <KpiCardItems />
        </div>

        {/* Tier 2 — core framework modules */}
        <div className={cn("w-full min-w-0", DASHBOARD_TRIPLE_CARD_GRID_CLASS)}>
          <AuditLauncherCard id="sop" />
          <AuditLauncherCard id="bpr" />
          <AuditLauncherCard id="fir" />
        </div>

        {/* Full-width — Priority Findings table */}
        <FindingsSummaryPanel className="w-full min-w-0" />

        {/* 50/50 — Activity Feed matches Compliance Pipeline height */}
        <SystemTelemetrySection />

        {/* 50/50 — deep analytics */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <CategoryBreakdownPanel />
          <ComplianceTrendPanel />
        </div>

        {/* Full-width — Audit History table */}
        <div className="w-full min-w-0">
          <RecentActivity rows={activityRows} />
        </div>
      </div>
    </TooltipProvider>
  );
}
