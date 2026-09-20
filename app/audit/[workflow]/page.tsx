import { notFound } from "next/navigation";
import { OpenConfigureAuditRedirect } from "@/components/audit/open-configure-audit-redirect";
import { getAuditWorkflow } from "@/lib/audit-workflows";

type AuditPageProps = {
  params: Promise<{ workflow: string }>;
};

/** Legacy/deep links to /audit/sop|bpr|fir open the configure modal on the dashboard. */
export default async function AuditPage({ params }: AuditPageProps) {
  const { workflow: workflowParam } = await params;
  const workflow = getAuditWorkflow(workflowParam);
  if (!workflow) notFound();

  return <OpenConfigureAuditRedirect workflowId={workflow.id} />;
}
