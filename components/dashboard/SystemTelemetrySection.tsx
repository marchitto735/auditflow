"use client";

import { CompliancePipelineCard } from "@/components/dashboard/compliance-pipeline-card";
import {
  ComplianceTrendPanel,
  FindingsSummaryPanel,
} from "@/components/dashboard/status-detail-panels";
import { DASHBOARD_GAP_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

/**
 * Priority findings span the row. Compliance trend and the pipeline
 * sit 50/50 beneath it. Narrow viewports stack findings, trend, then pipeline.
 */
export function SystemTelemetrySection({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "flex w-full min-w-0 flex-col",
        DASHBOARD_GAP_CLASS,
        className,
      )}
    >
      <FindingsSummaryPanel className="h-auto w-full min-w-0" />
      <div
        className={cn(
          "grid w-full min-w-0 grid-cols-1 items-stretch",
          DASHBOARD_GAP_CLASS,
          "lg:grid-cols-2",
        )}
      >
        <ComplianceTrendPanel className="h-full w-full min-w-0" />
        <CompliancePipelineCard className="h-auto w-full min-w-0" />
      </div>
    </section>
  );
}
