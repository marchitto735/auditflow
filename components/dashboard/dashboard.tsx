import KpiCards from "@/components/dashboard/kpi-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import AuditLauncher from "@/components/dashboard/audit-launcher";
import { AgentFeedCard } from "@/components/dashboard/agent-feed-card";
import { CompliancePipelineCard } from "@/components/dashboard/compliance-pipeline-card";
import { DashboardBento } from "@/components/dashboard/dashboard-bento";
import type { ActivityRow } from "@/components/activity-table/activity-table";
import {
  PAGE_CONTENT_TOP_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_INNER_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function Dashboard({
  activityRows = [],
}: {
  activityRows?: ActivityRow[];
}) {
  return (
    <section className={cn(PAGE_GUTTER_CLASS, PAGE_CONTENT_TOP_CLASS, "pb-6")}>
      <div className={PAGE_INNER_CLASS}>
        <DashboardBento
          left={
            <>
              <div className="shrink-0">
                <AuditLauncher />
              </div>
              <AgentFeedCard className="min-h-0 flex-1" />
            </>
          }
          right={
            <>
              <KpiCards />
              <RecentActivity rows={activityRows} />
              <CompliancePipelineCard />
            </>
          }
        />
      </div>
    </section>
  );
}
