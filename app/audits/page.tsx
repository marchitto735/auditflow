"use client";

import ActiveExecutionQueue from "@/components/audits/active-execution-queue";
import AuditsKpiHeader from "@/components/audits/audits-kpi-header";
import { useConfigureAudit } from "@/components/configure-audit-modal/configure-audit-context";
import SectionHeader from "@/components/section-header/section-header";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  DASHBOARD_SECTION_GAP_CLASS,
  PAGE_CONTENT_TOP_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_HEADER_PRIMARY_BUTTON_CLASS,
  PAGE_INNER_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function AuditsPage() {
  const { openConfigureAudit } = useConfigureAudit();

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
            description="Run document audits and track active executions across SOP, BPR, and FIR."
            actions={
              <Button
                type="button"
                variant="black"
                className={PAGE_HEADER_PRIMARY_BUTTON_CLASS}
                onClick={() => openConfigureAudit(null)}
              >
                New audit
              </Button>
            }
          />
          <TooltipProvider delayDuration={200}>
            <div
              className={cn(
                "flex w-full min-w-0 flex-col",
                DASHBOARD_SECTION_GAP_CLASS,
              )}
            >
              <AuditsKpiHeader />
              <ActiveExecutionQueue />
            </div>
          </TooltipProvider>
        </div>
      </section>
    </div>
  );
}
