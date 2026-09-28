import FrameworksWorkspace from "@/components/frameworks/frameworks-workspace";
import {
  PAGE_CONTENT_TOP_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_INNER_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function RegulationsPage() {
  return (
    <div className="min-h-0 min-w-0 w-full flex-1">
      <section className={cn(PAGE_GUTTER_CLASS, PAGE_CONTENT_TOP_CLASS)}>
        <div className={cn(PAGE_INNER_CLASS, "flex w-full flex-col")}>
          <FrameworksWorkspace />
        </div>
      </section>
    </div>
  );
}
