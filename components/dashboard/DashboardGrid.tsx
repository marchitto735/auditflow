"use client";

import { KpiCardItems } from "@/components/dashboard/kpi-cards";
import { DashboardCommandHeader } from "@/components/dashboard/dashboard-command-header";
import { SystemTelemetrySection } from "@/components/dashboard/SystemTelemetrySection";
import { FindingsSummaryPanel } from "@/components/dashboard/status-detail-panels";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  DASHBOARD_SECTION_GAP_CLASS,
  DASHBOARD_TRIPLE_CARD_GRID_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

/**
 * Telemetry command center — primary KPIs, findings, feeds,
 * and compliance trend.
 */
export default function DashboardGrid() {
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "flex w-full min-w-0 flex-col",
          DASHBOARD_SECTION_GAP_CLASS,
        )}
      >
        <DashboardCommandHeader />

        {/* Core macro KPIs */}
        <div className={cn("w-full min-w-0", DASHBOARD_TRIPLE_CARD_GRID_CLASS)}>
          <KpiCardItems />
        </div>

        {/* Full-width — Priority Findings table */}
        <FindingsSummaryPanel className="w-full min-w-0" />

        {/* Desktop 50/50 — trend left, feed stacked over pipeline on the right */}
        <SystemTelemetrySection />
      </div>
    </TooltipProvider>
  );
}
