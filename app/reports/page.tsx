import Footer from "@/components/footer/footer";
import SectionHeader from "@/components/section-header/section-header";
import {
  ActivityTable,
  type ActivityRow,
} from "@/components/activity-table/activity-table";
import { Card, CardContent } from "@/components/ui/card";
import { storedReportToActivityRow } from "@/lib/audit-report-rows";
import { PAGE_GUTTER_CLASS, PAGE_INNER_CLASS } from "@/lib/page-layout";
import { listStoredAuditReports } from "@/lib/services/list-audit-reports";
import { cn } from "@/lib/utils";

export default async function ReportsPage() {
  const reports = await listStoredAuditReports(50);
  const rows: ActivityRow[] = reports.map(storedReportToActivityRow);

  return (
    <>
      <main className="min-h-screen min-w-0 pb-0 md:pb-4">
        <section className={cn(PAGE_GUTTER_CLASS, "pt-6 pb-6 md:pb-9")}>
          <div className={cn(PAGE_INNER_CLASS, "flex flex-col")}>
            <SectionHeader
              title="Reports"
              description="Completed SOP, BPR, and FIR audit reports from the native audit pipeline."
            />
            <Card className="overflow-hidden rounded-2xl border-0 bg-[oklch(100%_0_0)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <CardContent className="p-0">
                {rows.length === 0 ? (
                  <p className="text-body1 m-0 px-6 py-10 text-muted-foreground">
                    No stored reports yet. Run an SOP, BPR, or FIR audit to
                    populate this list.
                  </p>
                ) : (
                  <ActivityTable rows={rows} expandable />
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
