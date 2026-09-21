"use client";

import KpiCards from "@/components/dashboard/kpi-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import AuditLauncher from "@/components/dashboard/audit-launcher";
import { AgentFeedCard } from "@/components/dashboard/agent-feed-card";
import { CompliancePipelineCard } from "@/components/dashboard/compliance-pipeline-card";
import { DashboardBento } from "@/components/dashboard/dashboard-bento";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import type { ActivityRow } from "@/components/activity-table/activity-table";
import { TooltipProvider } from "@/components/ui/tooltip";

type DashboardGridProps = {
  activityRows?: ActivityRow[];
};

/**
 * Asymmetric Swiss bento with section-level info tooltips (not per-card).
 */
export default function DashboardGrid({
  activityRows = [],
}: DashboardGridProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <DashboardBento
        left={
          <>
            <DashboardSection
              title="Audit Launcher"
              description="Launch an SOP, BPR, or FIR audit, choose a regulatory clause, get your report."
              className="shrink-0"
            >
              <AuditLauncher />
            </DashboardSection>

            <DashboardSection
              title="System Telemetry"
              description="Real-time AI agent execution pulse, background cache status, and queue telemetry."
              className="min-h-0 flex-1"
            >
              <AgentFeedCard className="min-h-0 flex-1" />
            </DashboardSection>
          </>
        }
        right={
          <>
            <DashboardSection
              title="Compliance Snapshot"
              description="Performance metrics across active audits, findings, and compliance scores."
            >
              <KpiCards />
            </DashboardSection>

            <DashboardSection
              title="Recent Activity"
              description="Review recent SOP, BPR, and FIR audits, scores, and compliance status."
            >
              <RecentActivity rows={activityRows} />
            </DashboardSection>

            <DashboardSection
              title="Active Compliance Pipeline"
              description="End-to-end processing pipeline tracking document ingest, validation, scoring, and export gates."
            >
              <CompliancePipelineCard />
            </DashboardSection>
          </>
        }
      />
    </TooltipProvider>
  );
}
