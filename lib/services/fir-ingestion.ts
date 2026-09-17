import "server-only";

import { randomUUID } from "node:crypto";
import { EMBEDDING_MODEL } from "@/lib/rag/model-constants";
import {
  extractPdfText,
  parseClauseId,
} from "@/lib/services/ingestion";
import { openaiClient } from "@/lib/services/openai";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const VISION_MODEL = "gpt-4o-mini";
const EMBEDDING_DIMENSIONS = 1536;

const FIR_VISION_PROMPT = `You are a regulatory compliance auditor evaluating physical evidence and handwritten documentation for Good Documentation Practices (GDP). Analyze the provided checklist image (fir_checklist) and equipment photo (equipment_photo). Extract all visual signatures, handwritten notes, pass/fail checkmarks, asset tag numbers, and any visible physical non-compliance issues into a structured JSON object. Return strictly valid JSON.`;

export type FirIngestionResult = {
  fir_id: number;
  clause_id: number | string;
  ingestion_id: string | null;
  source_text: string;
  title: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback: string) {
  if (value == null || value === "") return fallback;
  return String(value);
}

function parseVisionJson(raw: string) {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    const parsed: unknown = JSON.parse(cleaned);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function checklistFromParsed(parsed: Record<string, unknown>) {
  return isRecord(parsed.checklist) ? parsed.checklist : parsed;
}

async function embedText(text: string) {
  const openai = openaiClient();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000),
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return response.data[0]?.embedding ?? [];
}

async function extractVisionJson(bytes: Uint8Array, mimeType: string) {
  const openai = openaiClient();
  const dataUrl = `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
  const completion = await openai.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: FIR_VISION_PROMPT },
          {
            type: "image_url",
            image_url: { url: dataUrl, detail: "high" },
          },
        ],
      },
    ],
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("FIR vision model returned an empty response.");
  }
  return parseVisionJson(content);
}

export async function ingestFirDocument(options: {
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
  clauseId?: string | number | null;
}): Promise<FirIngestionResult> {
  const clause_id = parseClauseId(options.clauseId);
  const lowerName = options.fileName.toLowerCase();
  const isPdf =
    options.mimeType === "application/pdf" || lowerName.endsWith(".pdf");
  const isImage = options.mimeType.startsWith("image/") ||
    /\.(jpe?g|png|webp|gif)$/i.test(options.fileName);

  let parsed: Record<string, unknown> = {};
  let source_text = "";

  if (isImage && !isPdf) {
    parsed = await extractVisionJson(
      options.bytes,
      options.mimeType || "image/jpeg",
    );
    source_text = JSON.stringify(parsed);
  } else {
    source_text = await extractPdfText(options.bytes);
    parsed = { source_text };
  }

  const checklist = checklistFromParsed(parsed);
  const fir_id = Number.isFinite(Number(checklist.fir_id))
    ? Number(checklist.fir_id)
    : Date.now();
  const title = asString(
    checklist.document_ref ?? checklist.title,
    "FIR-DEFAULT",
  );
  const asset_tag_id = asString(checklist.asset_tag_id, "UNKNOWN");
  const inspector_name = asString(
    checklist.lead_inspector ?? checklist.inspector_name,
    "Unassigned",
  );
  const location_zone = asString(
    checklist.facility ?? checklist.location_zone,
    "General",
  );
  const inspection_date = asString(
    checklist.date ?? checklist.inspection_date,
    new Date().toISOString().slice(0, 10),
  );
  const operational_status = asString(
    checklist.operational_status ?? checklist.status,
    "PENDING",
  );
  const defects_found = checklist.audit_evaluation
    ? JSON.stringify(checklist.audit_evaluation)
    : checklist.defects_found
      ? String(checklist.defects_found)
      : null;

  const embeddingText = `${title}: ${source_text}`;
  const embedding = await embedText(embeddingText);

  const supabase = createSupabaseAdmin();
  const row = {
    fir_id,
    title,
    content: source_text,
    keywords: ["inspection", "audit"],
    asset_tag_id,
    location_zone,
    inspector_name,
    inspection_date,
    raw_extracted_json: parsed,
    defects_found,
    status: operational_status,
    clause_id,
    section_number: 1,
    embedding,
  };

  const { data, error } = await supabase
    .from("fir_ingestions")
    .insert(row)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to save fir_ingestions: ${error.message}`);
  }

  return {
    fir_id,
    clause_id,
    ingestion_id: data?.id ? String(data.id) : randomUUID(),
    source_text,
    title,
  };
}
