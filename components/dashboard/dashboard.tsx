import Link from "next/link";
import KpiCards from "@/components/dashboard/kpi-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import SectionHeader from "@/components/section-header/section-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ActivityRow } from "@/components/activity-table/activity-table";
import { AUDIT_WORKFLOWS } from "@/lib/audit-workflows";
import { PAGE_GUTTER_CLASS, PAGE_INNER_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function Dashboard({
  activityRows = [],
}: {
  activityRows?: ActivityRow[];
}) {
  return (
    <section className={cn(PAGE_GUTTER_CLASS, "pt-6 pb-10")}>
      <div className={cn(PAGE_INNER_CLASS, "flex flex-col gap-8")}>
        <div>
          <SectionHeader
            title="Compliance Snapshot"
            description="Real-time performance metrics across active audits, open regulatory findings, and overall compliance scores."
          />
          <KpiCards />
        </div>

        <div>
          <SectionHeader
            title="Audit Launcher"
            description="Launch an SOP, BPR, or FIR audit, choose a regulatory clause, get your report."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {(
              ["sop", "bpr", "fir"] as const
            ).map((id) => {
              const workflow = AUDIT_WORKFLOWS[id];
              return (
                <Card
                  key={id}
                  className="rounded-2xl border-0 bg-[oklch(100%_0_0)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                >
                  <CardContent className="flex h-full flex-col items-center p-6 text-center">
                    <h3 className="text-h4 m-0 font-semibold leading-tight text-foreground">
                      {workflow.title}
                    </h3>
                    <p className="text-body1 m-0 mt-3 text-foreground">
                      {workflow.description}
                    </p>
                    <p className="text-body2 m-0 mt-4 flex flex-wrap items-center justify-center gap-x-2 text-foreground">
                      <span>Status:</span>
                      <span
                        className={cn(
                          "size-2.5 shrink-0 rounded-full",
                          workflow.status === "Active" && "bg-[#22C55E]",
                          workflow.status === "Ready" && "bg-[#F5C400]",
                          workflow.status === "Draft" && "bg-[oklch(70%_0_0)]",
                        )}
                        aria-hidden
                      />
                      <span>{workflow.status}</span>
                      <span aria-hidden>•</span>
                      <span>Last run: {workflow.lastRun}</span>
                    </p>
                    <Link
                      href={workflow.href}
                      className={cn(
                        buttonVariants({ variant: "black" }),
                        "mt-6 w-full rounded-full",
                      )}
                    >
                      {workflow.cta}
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <SectionHeader
            title="Recent Activity"
            description="Review recent SOP, BPR, and FIR audits, scores, and compliance status."
          />
          <RecentActivity rows={activityRows} />
        </div>
      </div>
    </section>
  );
}
