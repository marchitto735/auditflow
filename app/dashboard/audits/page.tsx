import DashboardPageShell from "@/components/dashboard/dashboard-page-shell";
import AuditLogView from "@/components/dashboard/audit-log-view";
import { storedReportToAuditLogRow } from "@/lib/audit-report-rows";
import { listStoredAuditReports } from "@/lib/services/list-audit-reports";

export default async function AuditsPage() {
  const reports = await listStoredAuditReports(100);
  const rows = reports.map(storedReportToAuditLogRow);

  return (
    <DashboardPageShell
      title="Audit Log"
      description="Filter completed SOP, BPR, and FIR audits, review pass and fail rates, and export the log."
    >
      <AuditLogView rows={rows} />
    </DashboardPageShell>
  );
}
