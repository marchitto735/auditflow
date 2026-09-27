import SectionHeader from "@/components/section-header/section-header";
import HelpWorkspace from "@/components/help/help-workspace";
import {
  PAGE_CONTENT_TOP_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_INNER_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function HelpPage() {
  return (
    <div className="min-h-0 min-w-0 w-full flex-1">
      <section className={cn(PAGE_GUTTER_CLASS, PAGE_CONTENT_TOP_CLASS)}>
        <div className={cn(PAGE_INNER_CLASS, "flex w-full flex-col")}>
          <SectionHeader
            title="Support"
            description="Submit support tickets and track open cases across the audit pipeline."
          />
          <HelpWorkspace />
        </div>
      </section>
    </div>
  );
}
