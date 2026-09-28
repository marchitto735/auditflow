import DashboardPageShell from "@/components/dashboard/dashboard-page-shell";
import ScoreAnalysisView from "@/components/dashboard/score-analysis-view";

export default function AnalyticsPage() {
  return (
    <DashboardPageShell
      title="Analytics"
      description="Deep-dive scoring, department distribution, variance signals, and exportable compliance packets."
    >
      <ScoreAnalysisView />
    </DashboardPageShell>
  );
}
