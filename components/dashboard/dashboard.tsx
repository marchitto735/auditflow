import DashboardGrid from "@/components/dashboard/DashboardGrid";
import SectionHeader from "@/components/section-header/section-header";
import {
  PAGE_CONTENT_TOP_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_INNER_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function Dashboard() {
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
          title="Dashboard"
          description="Live compliance telemetry, pipeline status, and operational oversight."
        />
        <DashboardGrid />
      </div>
    </section>
  );
}
