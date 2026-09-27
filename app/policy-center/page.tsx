import SectionHeader from "@/components/section-header/section-header";
import PoliciesTableCard from "@/components/policies/policies-table-card";
import {
  PAGE_CONTENT_TOP_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_INNER_CLASS,
} from "@/lib/page-layout";
import { DEMO_MASTER_POLICIES } from "@/lib/policies";
import { cn } from "@/lib/utils";

export default function PolicyCenterPage() {
  return (
    <div className="min-h-0 min-w-0 w-full flex-1">
      <section className={cn(PAGE_GUTTER_CLASS, PAGE_CONTENT_TOP_CLASS)}>
        <div className={cn(PAGE_INNER_CLASS, "flex w-full flex-col")}>
          <SectionHeader
            title="Policies"
            description="Master SOP, BPR, and FIR library with parse status, chunk counts, and framework coverage."
          />
          <PoliciesTableCard policies={DEMO_MASTER_POLICIES} />
        </div>
      </section>
    </div>
  );
}
