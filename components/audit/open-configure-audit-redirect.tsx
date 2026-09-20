"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useConfigureAudit } from "@/components/configure-audit-modal/configure-audit-context";
import type { AuditWorkflowId } from "@/lib/audit-workflows";

type OpenConfigureAuditRedirectProps = {
  workflowId: AuditWorkflowId;
};

/** Deep-link entry: open the shared modal, then return to the dashboard. */
export function OpenConfigureAuditRedirect({
  workflowId,
}: OpenConfigureAuditRedirectProps) {
  const router = useRouter();
  const { openConfigureAudit } = useConfigureAudit();

  React.useEffect(() => {
    openConfigureAudit(workflowId);
    router.replace("/");
  }, [openConfigureAudit, router, workflowId]);

  return null;
}
