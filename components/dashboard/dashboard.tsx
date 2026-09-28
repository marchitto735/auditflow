"use client";

import DashboardGrid from "@/components/dashboard/DashboardGrid";
import { useConfigureAudit } from "@/components/configure-audit-modal/configure-audit-context";
import SectionHeader from "@/components/section-header/section-header";
import { Button } from "@/components/ui/button";
import {
  PAGE_CONTENT_TOP_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_HEADER_PRIMARY_BUTTON_CLASS,
  PAGE_INNER_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { openConfigureAudit } = useConfigureAudit();

  return (
    <section
      className={cn(
        PAGE_GUTTER_CLASS,
        PAGE_CONTENT_TOP_CLASS,
        "flex min-h-0 w-full flex-1 flex-col",
      )}
    >
      <div className={cn(PAGE_INNER_CLASS, "flex w-full min-w-0 flex-col")}>
        <SectionHeader
          className="mb-8"
          title="Dashboard"
          description="Live compliance telemetry, pipeline status, and operational oversight."
          actions={
            <Button
              type="button"
              variant="black"
              className={PAGE_HEADER_PRIMARY_BUTTON_CLASS}
              onClick={() => openConfigureAudit(null)}
            >
              New audit
            </Button>
          }
        />
        <DashboardGrid />
      </div>
    </section>
  );
}
