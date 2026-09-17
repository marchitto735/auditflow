import Footer from "@/components/footer/footer";
import SectionHeader from "@/components/section-header/section-header";
import { PAGE_GUTTER_CLASS, PAGE_INNER_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function HelpPage() {
  return (
    <>
      <main className="min-h-screen min-w-0 pb-0 md:pb-4">
        <section className={cn(PAGE_GUTTER_CLASS, "pt-6 pb-6 md:pb-9")}>
          <div className={cn(PAGE_INNER_CLASS, "flex flex-col")}>
            <SectionHeader
              title="Help"
              description="On SOP, BPR, or FIR audit, choose a clause, upload a PDF (or an image for FIR), then click Run Audit. Reports are saved and listed under Reports."
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
