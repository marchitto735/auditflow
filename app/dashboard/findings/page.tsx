import DashboardPageShell from "@/components/dashboard/dashboard-page-shell";
import FindingsView from "@/components/dashboard/findings-view";

export default function FindingsPage() {
  return (
    <DashboardPageShell
      title="Open Findings"
      description="Triage findings by severity, track remediation status, and log a CAPA with an assigned owner."
    >
      <FindingsView />
    </DashboardPageShell>
  );
}
