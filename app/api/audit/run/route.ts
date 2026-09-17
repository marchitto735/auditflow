import { NextResponse } from "next/server";
import {
  AUDIT_WORKFLOWS,
  isAuditWorkflowId,
  workflowFromDocumentType,
  type AuditWorkflowId,
} from "@/lib/audit-workflows";
import {
  assertAuditUpload,
  runNativeAudit,
} from "@/lib/services/run-native-audit";

export const runtime = "nodejs";
export const maxDuration = 120;

const AUDIT_CLAUSE_ID = "27";
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function errorText(error: unknown) {
  if (error instanceof Error) {
    const cause =
      error.cause instanceof Error ? error.cause.message : undefined;
    return cause ? `${error.message}: ${cause}` : error.message;
  }
  return String(error);
}

function resolveWorkflow(
  workflowRaw: FormDataEntryValue | null,
  documentTypeRaw: FormDataEntryValue | null,
): AuditWorkflowId {
  if (typeof workflowRaw === "string" && isAuditWorkflowId(workflowRaw.trim())) {
    return workflowRaw.trim() as AuditWorkflowId;
  }
  const fromDocument =
    typeof documentTypeRaw === "string"
      ? workflowFromDocumentType(documentTypeRaw)
      : null;
  return fromDocument ?? "sop";
}

export async function POST(request: Request) {
  const startedAt = new Date().toISOString();
  let workflowLabel = AUDIT_WORKFLOWS.sop.label;

  try {
    const incoming = await request.formData();
    const file = incoming.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "A file is required." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File must be 20 MB or smaller." },
        { status: 400 },
      );
    }

    const clauseIdRaw = incoming.get("clause_id");
    const clauseId =
      typeof clauseIdRaw === "string" && clauseIdRaw.trim()
        ? clauseIdRaw.trim()
        : AUDIT_CLAUSE_ID;
    const documentType = incoming.get("document_type");
    const workflow = resolveWorkflow(incoming.get("workflow"), documentType);
    workflowLabel = AUDIT_WORKFLOWS[workflow].label;

    try {
      assertAuditUpload(file, workflow);
    } catch (error) {
      return NextResponse.json({ error: errorText(error) }, { status: 400 });
    }

    const result = await runNativeAudit({
      workflow,
      file,
      clauseId,
    });

    return NextResponse.json({
      ok: true,
      startedAt,
      fileName: file.name,
      report: result.report,
      document_id: result.document_id,
      audit_run_id: result.audit_run_id,
    });
  } catch (error) {
    const message = errorText(error);
    console.warn(`[Run Audit] ${workflowLabel} request failed`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
