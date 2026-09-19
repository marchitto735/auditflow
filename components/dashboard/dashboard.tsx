import KpiCards from "@/components/dashboard/kpi-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import AuditLauncher from "@/components/dashboard/audit-launcher";
import SectionHeader from "@/components/section-header/section-header";
import type { ActivityRow } from "@/components/activity-table/activity-table";
import { PAGE_GUTTER_CLASS, PAGE_INNER_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function Dashboard({
  activityRows = [],
}: {
  activityRows?: ActivityRow[];
}) {
  return (
    <section className={cn(PAGE_GUTTER_CLASS, "pt-4 pb-4")}>
      <div className={cn(PAGE_INNER_CLASS, "flex flex-col gap-4")}>
        <div>
          <SectionHeader
            title="Compliance Snapshot"
            description="Performance metrics across active audits, findings, and compliance scores."
          />
          <KpiCards />
        </div>

        <div>
          <SectionHeader
            title="Audit Launcher"
            description="Launch an SOP, BPR, or FIR audit, choose a regulatory clause, get your report."
          />
          <AuditLauncher />
        </div>

        <div>
          <SectionHeader
            title="Recent Activity"
            description="Review recent SOP, BPR, and FIR audits, scores, and compliance status."
          />
          <RecentActivity rows={activityRows} />
        </div>
      </div>
    </section>
  );
}
