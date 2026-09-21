"use client";

import * as React from "react";
import KpiCards from "@/components/dashboard/kpi-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import AuditLauncher, {
  AuditLauncherCard,
} from "@/components/dashboard/audit-launcher";
import {
  DashboardSection,
  DashboardSectionHeader,
} from "@/components/dashboard/dashboard-section";
import type { ActivityRow } from "@/components/activity-table/activity-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DASHBOARD_GAP_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type DashboardGridProps = {
  activityRows?: ActivityRow[];
};

/**
 * Desktop tracks:
 * - BPR / FIR / Recent Activity keep their natural synced band (unchanged)
 * - SOP + KPI row lock to the measured BPR card height
 */
export default function DashboardGrid({
  activityRows = [],
}: DashboardGridProps) {
  const bprRef = React.useRef<HTMLDivElement>(null);
  const [bprHeight, setBprHeight] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const el = bprRef.current;
    if (!el) return;

    const measure = () => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setBprHeight((current) => (current === null ? current : null));
        return;
      }
      const card = el.querySelector<HTMLElement>(
        '[data-audit-launcher-card="bpr"]',
      );
      if (!card) return;
      const next = Math.round(card.getBoundingClientRect().height);
      if (next > 0) {
        setBprHeight((current) => (current === next ? current : next));
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("flex flex-col", DASHBOARD_GAP_CLASS)}>
        <div className={cn("flex flex-col lg:hidden", DASHBOARD_GAP_CLASS)}>
          <DashboardSection
            title="Audit Launcher"
            description="Launch an SOP, BPR, or FIR audit, choose a regulatory clause, get your report."
          >
            <AuditLauncher />
          </DashboardSection>
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
        </div>

        <div
          className={cn(
            "hidden lg:grid lg:items-stretch",
            "lg:grid-cols-[minmax(260px,380px)_minmax(0,1fr)]",
            "lg:grid-rows-[auto_auto]",
            DASHBOARD_GAP_CLASS,
          )}
        >
          <div className="col-start-1 row-start-1 flex flex-col gap-3 self-start">
            <DashboardSectionHeader
              title="Audit Launcher"
              description="Launch an SOP, BPR, or FIR audit, choose a regulatory clause, get your report."
            />
            <AuditLauncherCard id="sop" height={bprHeight} />
          </div>
          <div className="col-start-2 row-start-1 flex flex-col gap-3 self-start">
            <DashboardSectionHeader
              title="Compliance Snapshot"
              description="Performance metrics across active audits, findings, and compliance scores."
            />
            <KpiCards height={bprHeight} />
          </div>

          <div
            ref={bprRef}
            className={cn(
              "col-start-1 row-start-2 grid min-h-0 grid-rows-2 self-stretch",
              DASHBOARD_GAP_CLASS,
            )}
          >
            <AuditLauncherCard id="bpr" fill className="min-h-0" />
            <AuditLauncherCard id="fir" fill className="min-h-0" />
          </div>

          <DashboardSection
            title="Recent Activity"
            description="Review recent SOP, BPR, and FIR audits, scores, and compliance status."
            className="col-start-2 row-start-2 min-h-0 self-stretch"
          >
            <RecentActivity rows={activityRows} />
          </DashboardSection>
        </div>
      </div>
    </TooltipProvider>
  );
}
