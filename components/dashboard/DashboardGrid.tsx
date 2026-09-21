"use client";

import * as React from "react";
import KpiCards from "@/components/dashboard/kpi-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import AuditLauncher from "@/components/dashboard/audit-launcher";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { SystemTelemetrySection } from "@/components/dashboard/SystemTelemetrySection";
import type { ActivityRow } from "@/components/activity-table/activity-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DASHBOARD_GAP_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type DashboardGridProps = {
  activityRows?: ActivityRow[];
};

/**
 * Swiss bento geometry:
 * - Col 1 / Row 1: SOP audit card ≡ KPI row height
 * - Col 1 / Row 2: BPR + FIR stretch to Recent Activity bottom
 * - Flush bottom edges across both columns
 */
export default function DashboardGrid({
  activityRows = [],
}: DashboardGridProps) {
  const kpiSectionRef = React.useRef<HTMLDivElement>(null);
  const [kpiCardHeight, setKpiCardHeight] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const kpiRoot = kpiSectionRef.current;
    if (!kpiRoot) return;

    const measure = () => {
      const card = kpiRoot.querySelector<HTMLElement>("[data-kpi-card]");
      if (!card) return;
      const height = card.getBoundingClientRect().height;
      if (height > 0) {
        setKpiCardHeight((current) => (current === height ? current : height));
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(kpiRoot);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("flex flex-col", DASHBOARD_GAP_CLASS)}>
        <div
          className={cn(
            "grid grid-cols-1 items-stretch",
            "lg:grid-cols-[minmax(260px,380px)_minmax(0,1fr)]",
            DASHBOARD_GAP_CLASS,
          )}
        >
          {/* Left: Audit stack — stretches to match full right column height */}
          <DashboardSection
            title="Audit Launcher"
            description="Launch an SOP, BPR, or FIR audit, choose a regulatory clause, get your report."
            className="min-h-0 lg:h-full"
          >
            <AuditLauncher topCardHeight={kpiCardHeight} className="min-h-0" />
          </DashboardSection>

          {/* Right: KPI row + Recent Activity — defines the column height */}
          <div className={cn("flex min-h-0 min-w-0 flex-col", DASHBOARD_GAP_CLASS)}>
            <div ref={kpiSectionRef}>
              <DashboardSection
                title="Compliance Snapshot"
                description="Performance metrics across active audits, findings, and compliance scores."
              >
                <KpiCards />
              </DashboardSection>
            </div>

            <DashboardSection
              title="Recent Activity"
              description="Review recent SOP, BPR, and FIR audits, scores, and compliance status."
              className="min-h-0"
            >
              <RecentActivity rows={activityRows} />
            </DashboardSection>
          </div>
        </div>

        <SystemTelemetrySection />
      </div>
    </TooltipProvider>
  );
}
