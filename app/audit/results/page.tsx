import { Suspense } from "react";
import AuditResultsView from "@/components/audit-results/audit-results-view";
import { PAGE_CONTENT_TOP_CLASS, PAGE_GUTTER_CLASS, PAGE_INNER_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function AuditResultsPage() {
  return (
    <div className="min-h-0 min-w-0 w-full flex-1 pb-0 md:pb-4">
      <section className={cn(PAGE_GUTTER_CLASS, PAGE_CONTENT_TOP_CLASS)}>
        <div className={cn(PAGE_INNER_CLASS, "flex w-full flex-col")}>
          <Suspense
            fallback={
              <p className="text-body1 m-0 text-black" role="status">
                Loading audit report…
              </p>
            }
          >
            <AuditResultsView />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
