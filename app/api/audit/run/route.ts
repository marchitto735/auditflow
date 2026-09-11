import { NextResponse } from "next/server";
import { readServerEnv } from "@/lib/server-env-local";
import {
  n8nStartedWithoutReport,
  reportFromN8nWebhook,
} from "@/lib/sop-report";

export const runtime = "nodejs";
export const maxDuration = 120;

const AUDIT_CLAUSE_ID = "27";
const SOP_WEBHOOK_FALLBACK = "http://localhost:5678/webhook/auditflow/upload";
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const WEBHOOK_TIMEOUT_MS = 120_000;

function env(name: string) {
  return readServerEnv(name) || process.env[name]?.trim() || "";
}

function errorText(error: unknown) {
  if (error instanceof Error) {
    const cause =
      error.cause instanceof Error ? error.cause.message : undefined;
    return cause ? `${error.message}: ${cause}` : error.message;
  }
  return String(error);
}

export async function POST(request: Request) {
  const webhookUrl =
    env("NEXT_PUBLIC_N8N_SOP_INGESTION_URL") || SOP_WEBHOOK_FALLBACK;
  const startedAt = new Date().toISOString();

  try {
    const incoming = await request.formData();
    const file = incoming.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "A PDF file is required." },
        { status: 400 },
      );
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json(
        { error: "Only PDF files can be uploaded." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "PDF must be 20 MB or smaller." },
        { status: 400 },
      );
    }

    const outbound = new FormData();
    outbound.append("file", file, file.name);
    outbound.append("clause_id", AUDIT_CLAUSE_ID);
    outbound.append("timestamp", startedAt);
    const documentType = incoming.get("document_type");
    if (typeof documentType === "string" && documentType.trim()) {
      outbound.append("document_type", documentType.trim());
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      body: outbound,
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });

    const webhookText = await webhookResponse.text();
    let webhookBody: unknown = webhookText;
    try {
      webhookBody = webhookText ? JSON.parse(webhookText) : null;
    } catch {
      // Keep raw text when the webhook does not return JSON.
    }

    console.log("[Run Audit] SOP n8n webhook", {
      url: webhookUrl,
      status: webhookResponse.status,
      fileName: file.name,
      fileSize: file.size,
      body: webhookBody,
    });

    if (!webhookResponse.ok) {
      return NextResponse.json(
        {
          error: `SOP webhook failed (${webhookResponse.status})`,
          details: webhookBody,
        },
        { status: 502 },
      );
    }

    const report = reportFromN8nWebhook(webhookBody);
    if (!report) {
      const error = n8nStartedWithoutReport(webhookBody)
        ? "n8n replied before the audit finished. In the SOP Webhook node, set Respond to “When Last Node Finishes”, and return score, status, summary, gaps, and recommendation."
        : "SOP webhook did not return a report. The last n8n node should output score, status, summary, gaps, and recommendation.";
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
    console.warn("[Run Audit] SOP request failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
