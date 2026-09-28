import "server-only";

import { randomUUID } from "node:crypto";
import { extractText } from "unpdf";
import { parseDocumentChunks } from "@/lib/document-chunks";
import { EMBEDDING_MODEL } from "@/lib/rag/model-constants";
import { openaiClient } from "@/lib/services/openai";
import { createSupabaseAdmin, readSupabaseServerConfig } from "@/lib/supabase/admin";
import { formatSupabaseReachError } from "@/lib/supabase/url";

const DEFAULT_CLAUSE_ID = 27;
const EMBEDDING_DIMENSIONS = 1536;

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "are",
  "was",
  "were",
  "not",
  "may",
  "when",
  "into",
  "each",
  "then",
]);

function keywordsFrom(text: string) {
  const words = text.match(/[A-Za-z][A-Za-z0-9/-]{2,}/g) ?? [];
  const keywords: string[] = [];
  for (const word of words) {
    const key = word.toLowerCase();
    if (STOP_WORDS.has(key) || keywords.some((item) => item.toLowerCase() === key)) {
      continue;
    }
    keywords.push(word);
    if (keywords.length === 7) break;
  }
  return keywords;
}

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

/** Keep every line. Do not collapse whitespace or drop blank lines. */
export function preserveDocumentText(raw: string) {
  return String(raw).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function sanitizeSopText(raw: string) {
  return preserveDocumentText(raw);
}

export async function extractPdfText(bytes: Uint8Array) {
  const { text } = await extractText(bytes, { mergePages: false });
  const pages = Array.isArray(text)
    ? text.map((page) => String(page ?? ""))
    : [String(text ?? "")];
  const preserved = preserveDocumentText(pages.join("\n"));
  if (!preserved.trim()) {
    throw new Error("No text could be extracted from the PDF.");
  }
  return preserved;
}

/**
 * Deterministic section split. Every non-blank source line is one section,
 * in order. Empty line breaks are omitted. The model parser is not used here
 * because it can drop or merge content.
 */
export async function parseSopSections(text: string): Promise<SopSection[]> {
  const { chunks } = parseDocumentChunks(text);
  if (chunks.length === 0) {
    throw new Error("No SOP sections could be parsed from the document.");
  }

  return chunks.map((chunk, index) => ({
    section_number: index + 1,
    title: chunk.title,
    content: chunk.lines.map((line) => line.text).join("\n"),
    keywords: keywordsFrom(chunk.text),
  }));
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
