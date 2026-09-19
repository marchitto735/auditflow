import Dashboard from "@/components/dashboard/dashboard";
import { storedReportToActivityRow } from "@/lib/audit-report-rows";
import { listStoredAuditReports } from "@/lib/services/list-audit-reports";

export default async function Home() {
  const reports = await listStoredAuditReports(15);
  const activityRows = reports.map(storedReportToActivityRow);

  return (
    <div className="min-h-0 min-w-0 w-full flex-1 pb-0 md:pb-4">
      <Dashboard activityRows={activityRows} />
    </div>
  );
}
