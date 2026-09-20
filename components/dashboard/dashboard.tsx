"use client";

import { useState } from "react";
import KpiCards from "@/components/dashboard/kpi-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import AuditLauncher from "@/components/dashboard/audit-launcher";
import { AgentFeedCard } from "@/components/dashboard/agent-feed-card";
import { CompliancePipelineCard } from "@/components/dashboard/compliance-pipeline-card";
import { DashboardBento } from "@/components/dashboard/dashboard-bento";
import {
  DashboardToolbar,
  type DashboardToolbarValues,
} from "@/components/dashboard/dashboard-toolbar";
import type { ActivityRow } from "@/components/activity-table/activity-table";
import {
  DASHBOARD_GAP_CLASS,
  PAGE_CONTENT_TOP_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_INNER_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const INITIAL_FILTERS: DashboardToolbarValues = {
  search: "",
  type: "all",
  status: "all",
  dateRange: "all",
};

export default function Dashboard({
  activityRows = [],
}: {
  activityRows?: ActivityRow[];
}) {
  const [filters, setFilters] = useState<DashboardToolbarValues>(INITIAL_FILTERS);

  return (
    <section className={cn(PAGE_GUTTER_CLASS, PAGE_CONTENT_TOP_CLASS, "pb-6")}>
      <div className={cn(PAGE_INNER_CLASS, "flex flex-col", DASHBOARD_GAP_CLASS)}>
        <DashboardToolbar value={filters} onChange={setFilters} />

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
              <RecentActivity rows={activityRows} filters={filters} />
              <CompliancePipelineCard />
            </>
          }
        />
      </div>
    </section>
  );
}
