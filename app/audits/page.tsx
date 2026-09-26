"use client";

import ActiveExecutionQueue from "@/components/audits/active-execution-queue";
import AuditLauncher from "@/components/dashboard/audit-launcher";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import DashboardPageShell from "@/components/dashboard/dashboard-page-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DASHBOARD_SECTION_GAP_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function AuditsPage() {
  return (
    <DashboardPageShell
      title="Audits"
      description="Run an SOP, BPR, or FIR audit, choose a regulatory clause, and get your report."
    >
      <TooltipProvider delayDuration={200}>
        <div
          className={cn(
            "flex w-full min-w-0 flex-col pb-16 md:pb-20",
            DASHBOARD_SECTION_GAP_CLASS,
          )}
        >
          <AuditLauncher variant="featured" />
          <DashboardSection
            title="Active Execution Queue"
            description="Queued documents waiting for immediate compliance parsing and validation."
          >
            <ActiveExecutionQueue />
          </DashboardSection>
        </div>
      </TooltipProvider>
    </DashboardPageShell>
  );
}
