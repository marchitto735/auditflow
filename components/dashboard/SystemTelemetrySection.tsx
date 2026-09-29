"use client";

import { AgentFeedCard } from "@/components/dashboard/agent-feed-card";
import { CompliancePipelineCard } from "@/components/dashboard/compliance-pipeline-card";
import { ComplianceTrendPanel } from "@/components/dashboard/status-detail-panels";
import { DASHBOARD_GAP_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

/**
 * Desktop: Compliance trend 50% on the left, Activity feed stacked
 * above Compliance pipeline at 50% on the right.
 * The feed card is a fixed 176px and scrolls internally.
 * Narrow viewports stack all three in that order.
 */
export function SystemTelemetrySection({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "grid min-w-0 grid-cols-1 items-stretch",
        DASHBOARD_GAP_CLASS,
        "lg:grid-cols-2",
        className,
      )}
    >
      <ComplianceTrendPanel className="h-full w-full min-w-0" />
      <div className={cn("flex min-w-0 flex-col", DASHBOARD_GAP_CLASS)}>
        <div className="flex h-[176px] min-h-0 min-w-0 flex-col overflow-hidden">
          <AgentFeedCard className="h-full min-h-0" />
        </div>
        <CompliancePipelineCard />
      </div>
    </section>
  );
}
