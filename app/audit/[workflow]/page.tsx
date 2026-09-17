import { notFound } from "next/navigation";
import Footer from "@/components/footer/footer";
import ProjectCard from "@/components/project-card/project-card";
import { getAuditWorkflow } from "@/lib/audit-workflows";
import { PAGE_GUTTER_CLASS, PAGE_INNER_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type AuditPageProps = {
  params: Promise<{ workflow: string }>;
};

export default async function AuditPage({ params }: AuditPageProps) {
  const { workflow: workflowParam } = await params;
  const workflow = getAuditWorkflow(workflowParam);
  if (!workflow) notFound();

  return (
    <>
      <main className="min-h-screen min-w-0 pb-0 md:pb-4">
        <section className={cn(PAGE_GUTTER_CLASS, "pt-6")}>
          <div className={cn(PAGE_INNER_CLASS, "flex flex-col")}>
            <ProjectCard
              title="Clause Selection"
              description="Choose a regulatory clause to begin your compliance assessment."
              image="/images/glorifi-thumb.png"
              ctaLabel="Run Audit"
              runAudit
              auditWorkflow={workflow.id}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
