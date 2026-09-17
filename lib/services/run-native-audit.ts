import "server-only";

import { runThreeWayAudit } from "@/lib/services/audit";
import { ingestFirDocument } from "@/lib/services/fir-ingestion";
import { ingestBprPdf, ingestSopPdf } from "@/lib/services/ingestion";
import type { AuditWorkflowId } from "@/lib/audit-workflows";
import type { SopAuditReport } from "@/lib/sop-report";

export type NativeAuditResult = {
  report: SopAuditReport;
  document_id: string;
  ingestion_ids: string[];
  audit_run_id: string | null;
  report_row_id: string | null;
};

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

export function assertAuditUpload(file: File, workflow: AuditWorkflowId) {
  if (workflow === "fir") {
    if (!isPdfFile(file) && !isImageFile(file)) {
      throw new Error("FIR audits accept PDF or image files.");
    }
    return;
  }
  if (!isPdfFile(file)) {
    throw new Error("Only PDF files can be uploaded.");
  }
}

export async function runNativeAudit(options: {
  workflow: AuditWorkflowId;
  file: File;
  clauseId: string | number | null;
}): Promise<NativeAuditResult> {
  const bytes = new Uint8Array(await options.file.arrayBuffer());

  if (options.workflow === "fir") {
    const ingested = await ingestFirDocument({
      bytes,
      fileName: options.file.name,
      mimeType: options.file.type,
      clauseId: options.clauseId,
    });
    const audited = await runThreeWayAudit({
      workflow: "fir",
      clauseId: ingested.clause_id,
      incomingText: ingested.source_text,
      documentId: String(ingested.fir_id),
      ingestionId: ingested.ingestion_id,
      fileName: options.file.name,
    });
    return {
      report: audited.report,
      document_id: String(ingested.fir_id),
      ingestion_ids: ingested.ingestion_id ? [ingested.ingestion_id] : [],
      audit_run_id: audited.audit_run_id,
      report_row_id: audited.report_row_id,
    };
  }

  const ingested =
    options.workflow === "bpr"
      ? await ingestBprPdf({ pdfBytes: bytes, clauseId: options.clauseId })
      : await ingestSopPdf({ pdfBytes: bytes, clauseId: options.clauseId });

  const audited = await runThreeWayAudit({
    workflow: options.workflow,
    clauseId: ingested.clause_id,
    incomingText: ingested.source_text,
    documentId: ingested.document_id,
    ingestionId: ingested.ingestion_ids[0] ?? null,
    fileName: options.file.name,
  });

  return {
    report: audited.report,
    document_id: ingested.document_id,
    ingestion_ids: ingested.ingestion_ids,
    audit_run_id: audited.audit_run_id,
    report_row_id: audited.report_row_id,
  };
}
