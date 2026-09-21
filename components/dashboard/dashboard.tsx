import DashboardGrid from "@/components/dashboard/DashboardGrid";
import type { ActivityRow } from "@/components/activity-table/activity-table";
import {
  PAGE_CONTENT_TOP_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_INNER_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function Dashboard({
  activityRows = [],
}: {
  activityRows?: ActivityRow[];
}) {
  return (
    <section
      className={cn(
        PAGE_GUTTER_CLASS,
        PAGE_CONTENT_TOP_CLASS,
        "flex min-h-0 flex-1 flex-col overflow-hidden pb-4",
      )}
    >
      <div className={cn(PAGE_INNER_CLASS, "flex min-h-0 flex-1 flex-col")}>
        <DashboardGrid activityRows={activityRows} />
      </div>
    </section>
  );
}
