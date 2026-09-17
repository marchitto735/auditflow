import Dashboard from "@/components/dashboard/dashboard";
import Footer from "@/components/footer/footer";
import { storedReportToActivityRow } from "@/lib/audit-report-rows";
import { listStoredAuditReports } from "@/lib/services/list-audit-reports";

export default async function Home() {
  const reports = await listStoredAuditReports(15);
  const activityRows = reports.map(storedReportToActivityRow);

  return (
    <>
      <main className="min-h-screen min-w-0 pb-0 md:pb-4">
        <Dashboard activityRows={activityRows} />
      </main>
      <Footer />
    </>
  );
}
