export const AUDIT_WORKFLOW_IDS = ["sop", "bpr", "fir"] as const;

export type AuditWorkflowId = (typeof AUDIT_WORKFLOW_IDS)[number];

export const DOCUMENT_TYPES = [
  "SOP",
  "BPR",
  "FIR",
  "Policy",
  "Work Instruction",
  "Form",
  "Training Record",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export type AuditWorkflow = {
  id: AuditWorkflowId;
  label: "SOP" | "BPR" | "FIR";
  title: string;
  description: string;
  href: string;
  status: string;
  lastRun: string;
  cta: string;
  webhookEnv: string;
  webhookFallback: string;
};

export const AUDIT_WORKFLOWS: Record<AuditWorkflowId, AuditWorkflow> = {
  sop: {
    id: "sop",
    label: "SOP",
    title: "SOP Audit",
    description: "Standard Operating Procedures",
    href: "/audit/sop",
    status: "Active",
    lastRun: "10m ago",
    cta: "Launch SOP Audit",
    webhookEnv: "NEXT_PUBLIC_N8N_SOP_INGESTION_URL",
    webhookFallback: "http://localhost:5678/webhook/auditflow/upload",
  },
  bpr: {
    id: "bpr",
    label: "BPR",
    title: "BPR Audit",
    description: "Batch Production Records",
    href: "/audit/bpr",
    status: "Ready",
    lastRun: "2h ago",
    cta: "Launch BPR Audit",
    webhookEnv: "NEXT_PUBLIC_N8N_BPR_INGESTION_URL",
    webhookFallback:
      "http://localhost:5678/webhook/76dabb5f-1c5c-4dcc-9537-86327a05ad9f",
  },
  fir: {
    id: "fir",
    label: "FIR",
    title: "FIR Audit",
    description: "Facility Inspection Report",
    href: "/audit/fir",
    status: "Draft",
    lastRun: "—",
    cta: "Launch FIR Audit",
    webhookEnv: "NEXT_PUBLIC_N8N_FIR_INGESTION_URL",
    webhookFallback:
      "http://localhost:5678/webhook/eda02a12-3985-4259-9339-48a5f4731a9e",
  },
};

export function isAuditWorkflowId(value: string): value is AuditWorkflowId {
  return AUDIT_WORKFLOW_IDS.includes(value as AuditWorkflowId);
}

export function getAuditWorkflow(id: string) {
  if (!isAuditWorkflowId(id)) return undefined;
  return AUDIT_WORKFLOWS[id];
}

export function workflowFromDocumentType(
  documentType: string | null | undefined,
): AuditWorkflowId | null {
  const normalized = (documentType ?? "").trim().toUpperCase();
  if (normalized === "SOP") return "sop";
  if (normalized === "BPR") return "bpr";
  if (normalized === "FIR") return "fir";
  return null;
}

export function documentTypesForWorkflow(workflowId: AuditWorkflowId) {
  const primary = AUDIT_WORKFLOWS[workflowId].label;
  return [
    primary,
    ...DOCUMENT_TYPES.filter((label) => label !== primary),
  ] as const;
}
