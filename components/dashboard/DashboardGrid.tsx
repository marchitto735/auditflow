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

const DESKTOP_MQ = "(min-width: 1024px)";

/**
 * Desktop: two equal-height columns (`items-stretch`).
 * - SOP / BPR / FIR and the KPI row all share `h-[212px]`
 * - Recent Activity card is a fixed `h-[416px]` (5-row viewport)
 *
 * Only one layout tree mounts (mobile OR desktop) so Radix useIds stay stable.
 */
export default function DashboardGrid({
  activityRows = [],
}: DashboardGridProps) {
  /** SSR + first client paint use desktop; sync after mount. */
  const [isDesktop, setIsDesktop] = React.useState(true);

  React.useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("flex min-h-0 flex-1 flex-col", DASHBOARD_GAP_CLASS)}>
        {!isDesktop ? (
          <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", DASHBOARD_GAP_CLASS)}>
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
        ) : (
          <div
            className={cn(
              "grid min-h-0 flex-1 items-stretch overflow-hidden",
              "grid-cols-[minmax(260px,380px)_minmax(0,1fr)]",
              DASHBOARD_GAP_CLASS,
            )}
          >
            {/* Left column — three equal audit tiles + section header on SOP */}
            <div className={cn("flex flex-col", DASHBOARD_GAP_CLASS)}>
              <div className="flex flex-col gap-2">
                <DashboardSectionHeader
                  title="Audit Launcher"
                  description="Launch an SOP, BPR, or FIR audit, choose a regulatory clause, get your report."
                />
                <AuditLauncherCard id="sop" />
              </div>
              <AuditLauncherCard id="bpr" />
              <AuditLauncherCard id="fir" />
            </div>

            {/* Right column — stretches to left; Recent fills bottom band */}
            <div className={cn("flex min-h-0 flex-col", DASHBOARD_GAP_CLASS)}>
              <div className="flex flex-col gap-2">
                <DashboardSectionHeader
                  title="Compliance Snapshot"
                  description="Performance metrics across active audits, findings, and compliance scores."
                />
                <KpiCards />
              </div>

              <div className="-mt-[8px] flex shrink-0 flex-col gap-2">
                <DashboardSectionHeader
                  title="Recent Activity"
                  description="Review recent SOP, BPR, and FIR audits, scores, and compliance status."
                />
                <RecentActivity rows={activityRows} />
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
