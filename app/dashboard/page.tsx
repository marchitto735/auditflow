import Dashboard from "@/components/dashboard/dashboard";
import { storedReportToActivityRow } from "@/lib/audit-report-rows";
import { listStoredAuditReports } from "@/lib/services/list-audit-reports";

export default async function DashboardPage() {
  const reports = await listStoredAuditReports(50);
  const activityRows = reports.map(storedReportToActivityRow);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col pb-0">
      <Dashboard activityRows={activityRows} />
    </div>
  );
}
