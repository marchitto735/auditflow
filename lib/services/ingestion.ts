import "server-only";

import { randomUUID } from "node:crypto";
import { extractText } from "unpdf";
import { EMBEDDING_MODEL } from "@/lib/rag/model-constants";
import { openaiClient } from "@/lib/services/openai";
import { createSupabaseAdmin, readSupabaseServerConfig } from "@/lib/supabase/admin";
import { formatSupabaseReachError } from "@/lib/supabase/url";

const DEFAULT_CLAUSE_ID = 27;
const CHUNK_MODEL = "gpt-4o-mini";
const EMBEDDING_DIMENSIONS = 1536;

const SECTION_PARSER_SYSTEM = `You are an SOP document parser. Extract every distinct section from the SOP document text (e.g., Purpose, Scope, Reference Documents, Definitions, Responsibility, Equipment/Materials, Precautions, Procedure - General Requirements, Procedure - Correcting Errors, Retention, Revision History, Biannual Review, Document Header/Meta). Do not skip sections marked as 'NA' and do not combine sections. For each section, extract 3 to 7 key technical terms, equipment names, role titles, or GDP concepts present in that specific section text. Return ONLY a valid raw JSON array of objects without markdown formatting or backticks using this schema: [{"section_number": 1, "title": "Section Title", "content": "Full text of this section", "keywords": ["term1", "term2", "term3"]}]`;

export type IngestKind = "sop" | "bpr";

export type SopSection = {
  section_number: number;
  title: string;
  content: string;
  keywords: string[];
};

export type EmbeddedSopSection = SopSection & {
  document_id: string;
  clause_id: number | string;
  embedding: number[];
};

export type DocumentIngestionResult = {
  kind: IngestKind;
  document_id: string;
  clause_id: number | string;
  section_count: number;
  source_text: string;
  ingestion_ids: string[];
  sections: EmbeddedSopSection[];
};

export type SopIngestionResult = DocumentIngestionResult & {
  sop_id: string;
};

const KIND_TABLE: Record<
  IngestKind,
  { table: string; idField: "sop_id" | "bpr_id" }
> = {
  sop: { table: "sop_ingestions", idField: "sop_id" },
  bpr: { table: "bpr_ingestions", idField: "bpr_id" },
};

export function parseClauseId(raw: string | number | null | undefined) {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const text = String(raw ?? "").trim();
  if (!text) return DEFAULT_CLAUSE_ID;
  if (/^\d+$/.test(text)) return Number(text);
  return text;
}

export function sanitizeSopText(raw: string) {
  return String(raw)
    .replace(/"/g, "'")
    .replace(/\\/g, "/")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractPdfText(bytes: Uint8Array) {
  const { text } = await extractText(bytes, { mergePages: true });
  const combined = Array.isArray(text) ? text.join(" ") : String(text ?? "");
  const sanitized = sanitizeSopText(combined);
  if (!sanitized) {
    throw new Error("No text could be extracted from the PDF.");
  }
  return sanitized;
}

function parseSectionsPayload(rawContent: string): SopSection[] {
  const cleaned = rawContent
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const parsed: unknown = JSON.parse(cleaned);
  const sectionsArray = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as { sections?: unknown }).sections)
      ? (parsed as { sections: unknown[] }).sections
      : parsed && typeof parsed === "object"
        ? Object.values(parsed as Record<string, unknown>)[0]
        : [];

  if (!Array.isArray(sectionsArray) || sectionsArray.length === 0) {
    throw new Error("OpenAI did not return any SOP sections.");
  }

  return sectionsArray.map((section, index) => {
    const row = (section ?? {}) as Record<string, unknown>;
    const keywords = Array.isArray(row.keywords)
      ? row.keywords.map((keyword) => String(keyword))
      : [];
    return {
      section_number:
        typeof row.section_number === "number"
          ? row.section_number
          : index + 1,
      title: String(row.title ?? "Untitled"),
      content: String(row.content ?? ""),
      keywords,
    };
  });
}

export async function parseSopSections(text: string): Promise<SopSection[]> {
  const openai = openaiClient();
  const completion = await openai.chat.completions.create({
    model: CHUNK_MODEL,
    max_tokens: 4000,
    messages: [
      { role: "system", content: SECTION_PARSER_SYSTEM },
      { role: "user", content: text },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI chunk parser returned an empty response.");
  }

  try {
    return parseSectionsPayload(content);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse SOP sections: ${reason}`);
  }
}

export async function embedSopSections(
  sections: SopSection[],
): Promise<number[][]> {
  const openai = openaiClient();
  const inputs = sections.map(
    (section) => `${section.title}: ${section.content}`,
  );
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: inputs,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  const vectors = [...response.data]
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);

  if (vectors.length !== sections.length) {
    throw new Error("Embedding count did not match SOP section count.");
  }

  return vectors;
}

export async function saveDocumentIngestions(
  kind: IngestKind,
  rows: EmbeddedSopSection[],
) {
  const { table, idField } = KIND_TABLE[kind];
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(table)
    .insert(
      rows.map((row) => ({
        [idField]: row.document_id,
        section_number: row.section_number,
        title: row.title,
        content: row.content,
        clause_id: row.clause_id,
        keywords: row.keywords,
        embedding: row.embedding,
      })),
    )
    .select("id");

  if (error) {
    const { url } = readSupabaseServerConfig();
    throw new Error(
      formatSupabaseReachError(`Failed to save ${table}`, error.message, url),
    );
  }

  return (data ?? []).map((row) => String((row as { id: unknown }).id));
}

export async function ingestDocumentPdf(options: {
  kind: IngestKind;
  pdfBytes: Uint8Array;
  clauseId?: string | number | null;
}): Promise<DocumentIngestionResult> {
  const clause_id = parseClauseId(options.clauseId);
  const source_text = await extractPdfText(options.pdfBytes);
  const sections = await parseSopSections(source_text);
  const embeddings = await embedSopSections(sections);
  const document_id = randomUUID();

  const embedded: EmbeddedSopSection[] = sections.map((section, index) => ({
    ...section,
    document_id,
    clause_id,
    embedding: embeddings[index] ?? [],
  }));

  const ingestion_ids = await saveDocumentIngestions(options.kind, embedded);

  return {
    kind: options.kind,
    document_id,
    clause_id,
    section_count: embedded.length,
    source_text,
    ingestion_ids,
    sections: embedded,
  };
}

export async function ingestSopPdf(options: {
  pdfBytes: Uint8Array;
  clauseId?: string | number | null;
}): Promise<SopIngestionResult> {
  const result = await ingestDocumentPdf({ ...options, kind: "sop" });
  return { ...result, sop_id: result.document_id };
}

export async function ingestBprPdf(options: {
  pdfBytes: Uint8Array;
  clauseId?: string | number | null;
}): Promise<DocumentIngestionResult> {
  return ingestDocumentPdf({ ...options, kind: "bpr" });
}
