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

function isLocalN8nUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

const LOCAL_N8N_DOWN_ERROR =
  "n8n is not running on localhost:5678. Start n8n, publish auditflow_sop_ingestion, and set Respond to When Last Node Finishes.";

const LOCAL_N8N_ON_VERCEL_ERROR =
  "This deployed site cannot reach n8n on your computer (localhost:5678). Use npm run dev with n8n running locally.";

function sopWebhookUrl() {
  return (
    env("NEXT_PUBLIC_N8N_SOP_INGESTION_URL") ||
    env("N8N_WORKFLOW_ONE_URL") ||
    SOP_WEBHOOK_FALLBACK
  );
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
  const webhookUrl = sopWebhookUrl();
  const startedAt = new Date().toISOString();

  if (isLocalN8nUrl(webhookUrl) && process.env.VERCEL) {
    return NextResponse.json(
      { error: LOCAL_N8N_ON_VERCEL_ERROR },
      { status: 503 },
    );
  }

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
    const clauseIdRaw = incoming.get("clause_id");
    const clauseId =
      typeof clauseIdRaw === "string" && clauseIdRaw.trim()
        ? clauseIdRaw.trim()
        : AUDIT_CLAUSE_ID;
    outbound.append("clause_id", clauseId);
    outbound.append("timestamp", startedAt);
    const documentType = incoming.get("document_type");
    if (typeof documentType === "string" && documentType.trim()) {
      outbound.append("document_type", documentType.trim());
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

    console.log("[Run Audit] SOP n8n webhook", {
      url: webhookUrl,
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
            ? `SOP webhook failed (${webhookResponse.status}): ${detail}`
            : `SOP webhook failed (${webhookResponse.status})`,
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
    const friendly =
      isLocalN8nUrl(webhookUrl) && /fetch failed|ECONNREFUSED|5678/i.test(message)
        ? LOCAL_N8N_DOWN_ERROR
        : message;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
