import type { ReactNode } from "react";
import SectionHeader from "@/components/section-header/section-header";
import { PAGE_CONTENT_TOP_CLASS, PAGE_GUTTER_CLASS, PAGE_INNER_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function DashboardPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-0 min-w-0 w-full flex-1 pb-0 md:pb-4">
      <section className={cn(PAGE_GUTTER_CLASS, PAGE_CONTENT_TOP_CLASS, "pb-4")}>
        <div className={cn(PAGE_INNER_CLASS, "flex w-full flex-col")}>
          <SectionHeader title={title} description={description} />
          {children}
        </div>
      </section>
    </div>
  );
}
