import type { AuditWorkflowId } from "@/lib/audit-workflows";
import { workflowFromDocumentType } from "@/lib/audit-workflows";
import type { SopAuditReport } from "@/lib/sop-report";

export const AUDIT_RUN_PATH = "/api/audit/run";
export const AUDIT_REPORTS_PATH = "/api/audit/reports";
const AUDIT_TIMEOUT_MS = 120_000;

const PDF_ACCEPT = "application/pdf,.pdf";
const FIR_ACCEPT =
  "application/pdf,.pdf,image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export function acceptForWorkflow(workflow: AuditWorkflowId) {
  return workflow === "fir" ? FIR_ACCEPT : PDF_ACCEPT;
}

export function acceptForDocumentType(
  documentType: string | null | undefined,
  fallback: AuditWorkflowId,
) {
  return acceptForWorkflow(workflowFromDocumentType(documentType) ?? fallback);
}

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

function isImageFile(file: File) {
  return (
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|webp|gif)$/i.test(file.name)
  );
}

export function validateAuditFile(file: File, workflow: AuditWorkflowId) {
  if (workflow === "fir") {
    if (isPdfFile(file) || isImageFile(file)) return null;
    return "FIR audits accept a PDF or an image (JPEG, PNG, or WebP).";
  }
  if (isPdfFile(file)) return null;
  return `${workflow.toUpperCase()} audits require a PDF.`;
}

export class AuditRunError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "AuditRunError";
    this.status = status;
  }
}

export type AuditRunResponse = {
  ok?: boolean;
  error?: string;
  fileName?: string;
  document_id?: string;
  audit_run_id?: string | null;
  report?: SopAuditReport;
};

export async function postAuditRun(options: {
  file: File;
  clauseId: string;
  workflow: AuditWorkflowId;
  documentType?: string | null;
  signal?: AbortSignal;
}): Promise<Required<Pick<AuditRunResponse, "report">> & AuditRunResponse> {
  const validationError = validateAuditFile(options.file, options.workflow);
  if (validationError) {
    throw new AuditRunError(validationError, 400);
  }

  const body = new FormData();
  body.append("file", options.file);
  body.append("clause_id", options.clauseId);
  body.append("workflow", options.workflow);
  if (options.documentType) {
    body.append("document_type", options.documentType);
  }

  const response = await fetch(AUDIT_RUN_PATH, {
    method: "POST",
    body,
    signal: options.signal ?? AbortSignal.timeout(AUDIT_TIMEOUT_MS),
  });

  const raw = await response.text();
  let payload: AuditRunResponse = {};
  if (raw) {
    try {
      payload = JSON.parse(raw) as AuditRunResponse;
    } catch {
      payload = { error: raw.slice(0, 300) };
    }
  }

  if (!response.ok || !payload.report) {
    const message =
      (typeof payload.error === "string" && payload.error.trim()) ||
      `Audit failed (${response.status} ${response.statusText})`.trim();
    throw new AuditRunError(message, response.status);
  }

  return { ...payload, report: payload.report };
}
