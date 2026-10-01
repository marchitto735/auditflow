"use client";

import { KpiCardItems } from "@/components/dashboard/kpi-cards";
import { AgentFeedCard } from "@/components/dashboard/agent-feed-card";
import {
  DashboardCommandHeader,
  SHOW_DASHBOARD_TIME_RANGE_FILTER,
} from "@/components/dashboard/dashboard-command-header";
import { SystemTelemetrySection } from "@/components/dashboard/SystemTelemetrySection";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  DASHBOARD_SECTION_GAP_CLASS,
  DASHBOARD_QUAD_CARD_GRID_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

/**
 * Telemetry command center — KPI strip, full-width priority findings,
 * 50/50 trend and pipeline, then a full-width activity log.
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
        {SHOW_DASHBOARD_TIME_RANGE_FILTER ? <DashboardCommandHeader /> : null}

        <div className={cn("w-full min-w-0", DASHBOARD_QUAD_CARD_GRID_CLASS)}>
          <KpiCardItems />
        </div>

        <SystemTelemetrySection />

        <AgentFeedCard />
      </div>
    </TooltipProvider>
  );
}
