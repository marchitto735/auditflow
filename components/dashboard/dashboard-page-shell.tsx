import type { ReactNode } from "react";
import Footer from "@/components/footer/footer";
import SectionHeader from "@/components/section-header/section-header";
import { PAGE_GUTTER_CLASS, PAGE_INNER_CLASS } from "@/lib/page-layout";
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
    <>
      <main className="min-h-screen min-w-0 pb-0 md:pb-4">
        <section className={cn(PAGE_GUTTER_CLASS, "pt-6 pb-10")}>
          <div className={cn(PAGE_INNER_CLASS, "flex flex-col")}>
            <SectionHeader title={title} description={description} />
            {children}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
