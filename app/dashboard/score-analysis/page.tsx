import DashboardPageShell from "@/components/dashboard/dashboard-page-shell";
import ScoreAnalysisView from "@/components/dashboard/score-analysis-view";

export default function ScoreAnalysisPage() {
  return (
    <DashboardPageShell
      title="Score Breakdown"
      description="See category scores, the 30/90/365-day trend, and performance against the 85% GMP threshold."
    >
      <ScoreAnalysisView />
    </DashboardPageShell>
  );
}
