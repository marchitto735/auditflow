import { NextResponse } from "next/server";
import {
  AUDIT_WORKFLOWS,
  isAuditWorkflowId,
  workflowFromDocumentType,
  type AuditWorkflowId,
} from "@/lib/audit-workflows";
import { readServerEnv } from "@/lib/server-env-local";
import {
  n8nStartedWithoutReport,
  reportFromN8nWebhook,
} from "@/lib/sop-report";
import {
  assertAuditUpload,
  runNativeAudit,
} from "@/lib/services/run-native-audit";

export const runtime = "nodejs";
export const maxDuration = 120;

const AUDIT_CLAUSE_ID = "27";
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const WEBHOOK_TIMEOUT_MS = 120_000;

function env(name: string) {
  return readServerEnv(name) || process.env[name]?.trim() || "";
}

function useN8n() {
  const flag = env("AUDIT_USE_N8N").toLowerCase();
  return flag === "1" || flag === "true";
}

function errorText(error: unknown) {
  if (error instanceof Error) {
    const cause =
      error.cause instanceof Error ? error.cause.message : undefined;
    return cause ? `${error.message}: ${cause}` : error.message;
  }
  return String(error);
}

function isLocalN8nUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

const LOCAL_N8N_DOWN_ERROR =
  "n8n is not running on localhost:5678. Start n8n, publish the SOP/BPR/FIR webhooks, and set Respond to When Last Node Finishes.";

const LOCAL_N8N_ON_VERCEL_ERROR =
  "This deployed site cannot reach n8n on your computer (localhost:5678). Use npm run dev with n8n running locally.";

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

function webhookUrlFor(workflow: AuditWorkflowId) {
  const meta = AUDIT_WORKFLOWS[workflow];
  const fromEnv = env(meta.webhookEnv);
  if (fromEnv) return fromEnv;
  if (workflow === "sop") {
    return env("N8N_WORKFLOW_ONE_URL") || meta.webhookFallback;
  }
  return meta.webhookFallback;
}

function webhookFetchHeaders(url: string): HeadersInit | undefined {
  try {
    if (new URL(url).hostname.endsWith(".loca.lt")) {
      return { "bypass-tunnel-reminder": "1" };
    }
  } catch {
    // Ignore invalid URLs; fetch will fail later.
  }
  return undefined;
}

export async function POST(request: Request) {
  const startedAt = new Date().toISOString();
  let webhookUrl = AUDIT_WORKFLOWS.sop.webhookFallback;
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

    if (!useN8n()) {
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
    }

    const outbound = new FormData();
    outbound.append("file", file, file.name);
    outbound.append("clause_id", clauseId);
    outbound.append("timestamp", startedAt);
    if (typeof documentType === "string" && documentType.trim()) {
      outbound.append("document_type", documentType.trim());
    }
    outbound.append("workflow", workflow);
    webhookUrl = webhookUrlFor(workflow);

    if (isLocalN8nUrl(webhookUrl) && process.env.VERCEL) {
      return NextResponse.json(
        { error: LOCAL_N8N_ON_VERCEL_ERROR },
        { status: 503 },
      );
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      body: outbound,
      headers: webhookFetchHeaders(webhookUrl),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });

    const webhookText = await webhookResponse.text();
    let webhookBody: unknown = webhookText;
    try {
      webhookBody = webhookText ? JSON.parse(webhookText) : null;
    } catch {
      // Keep raw text when the webhook does not return JSON.
    }

    console.log(`[Run Audit] ${workflowLabel} n8n webhook`, {
      url: webhookUrl,
      workflow,
      status: webhookResponse.status,
      fileName: file.name,
      fileSize: file.size,
      body: webhookBody,
    });

    if (!webhookResponse.ok) {
      const detail =
        typeof webhookBody === "string"
          ? webhookBody.slice(0, 280)
          : webhookBody &&
              typeof webhookBody === "object" &&
              "message" in webhookBody
            ? String((webhookBody as { message: unknown }).message)
            : "";
      return NextResponse.json(
        {
          error: detail
            ? `${workflowLabel} webhook failed (${webhookResponse.status}): ${detail}`
            : `${workflowLabel} webhook failed (${webhookResponse.status})`,
          details: webhookBody,
        },
        { status: 502 },
      );
    }

    const report = reportFromN8nWebhook(webhookBody);
    if (!report) {
      const error = n8nStartedWithoutReport(webhookBody)
        ? `n8n replied before the audit finished. In the ${workflowLabel} Webhook node, set Respond to “When Last Node Finishes”, and return score, status, summary, gaps, and recommendation.`
        : `${workflowLabel} webhook did not return a report. The last n8n node should output score, status, summary, gaps, and recommendation.`;
      return NextResponse.json(
        { error, details: webhookBody },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      startedAt,
      fileName: file.name,
      report,
      webhook: webhookBody,
    });
  } catch (error) {
    const message = errorText(error);
    console.warn(`[Run Audit] ${workflowLabel} request failed`, message);
    const friendly =
      isLocalN8nUrl(webhookUrl) && /fetch failed|ECONNREFUSED|5678/i.test(message)
        ? LOCAL_N8N_DOWN_ERROR
        : message;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
