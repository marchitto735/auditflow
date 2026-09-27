import SectionHeader from "@/components/section-header/section-header";
import ReportsTableCard from "@/components/reports/reports-table-card";
import { type ActivityRow } from "@/components/activity-table/activity-table";
import { storedReportToActivityRow } from "@/lib/audit-report-rows";
import {
  PAGE_CONTENT_TOP_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_INNER_CLASS,
} from "@/lib/page-layout";
import { listStoredAuditReports } from "@/lib/services/list-audit-reports";
import { cn } from "@/lib/utils";

export default async function ReportsPage() {
  const reports = await listStoredAuditReports(50);
  const rows: ActivityRow[] = reports.map(storedReportToActivityRow);

  return (
    <div className="min-h-0 min-w-0 w-full flex-1 pb-0 md:pb-4">
      <section className={cn(PAGE_GUTTER_CLASS, PAGE_CONTENT_TOP_CLASS, "pb-4")}>
        <div className={cn(PAGE_INNER_CLASS, "flex w-full flex-col")}>
          <SectionHeader
            title="Reports"
            description="Completed SOP, BPR, and FIR audit reports from the native audit pipeline."
          />
          <ReportsTableCard rows={rows} />
        </div>
      </section>
    </div>
  );
}
