"use client";

import ActiveExecutionQueue from "@/components/audits/active-execution-queue";
import AuditsKpiHeader from "@/components/audits/audits-kpi-header";
import AuditLauncher from "@/components/dashboard/audit-launcher";
import SectionHeader from "@/components/section-header/section-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  DASHBOARD_SECTION_GAP_CLASS,
  PAGE_CONTENT_TOP_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_INNER_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function AuditsPage() {
  return (
    <div className="flex min-h-min min-w-0 w-full flex-1 flex-col">
      <section
        className={cn(
          PAGE_GUTTER_CLASS,
          PAGE_CONTENT_TOP_CLASS,
          "flex w-full min-h-min min-w-0 flex-col",
        )}
      >
        <div className={cn(PAGE_INNER_CLASS, "flex w-full min-w-0 flex-col")}>
          <SectionHeader
            title="Audits"
            description="Launch document audits and track active executions across SOP, BPR, and FIR."
          />
          <TooltipProvider delayDuration={200}>
            <div
              className={cn(
                "flex w-full min-w-0 flex-col",
                DASHBOARD_SECTION_GAP_CLASS,
              )}
            >
              <AuditsKpiHeader />
              <AuditLauncher variant="featured" />
              <ActiveExecutionQueue />
            </div>
          </TooltipProvider>
        </div>
      </section>
    </div>
  );
}
