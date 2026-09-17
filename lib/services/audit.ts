import "server-only";

import { openaiClient } from "@/lib/services/openai";
import { toPublicSopReport, type SopAuditReport } from "@/lib/sop-report";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { AuditWorkflowId } from "@/lib/audit-workflows";

const AUDIT_MODEL = "gpt-4o";

export const AUDITOR_SYSTEM = `You are a senior GMP compliance auditor. You will be provided with: 1) A Regulatory Clause Rule, 2) A Golden Standard Benchmark SOP, and 3) An Incoming Facility SOP under audit. Compare the incoming SOP against both the clause rule and the golden standard. Identify gaps, compliance score (0-100), status ('Compliant', 'Partially Compliant', 'Non-Compliant'), summary, and actionable recommendations. Output strictly valid JSON with keys: 'score' (number), 'status' (string), 'gaps' (array of strings), 'summary' (string providing a 2-3 sentence executive overview of the audit results), and 'recommendation' (string providing clear corrective action steps).`;

export type ThreeWayAuditInput = {
  workflow: AuditWorkflowId;
  clauseId: string | number;
  incomingText: string;
  documentId: string;
  ingestionId?: string | null;
  fileName?: string | null;
};

export type ThreeWayAuditResult = {
  report: SopAuditReport;
  audit_run_id: string | null;
  report_row_id: string | null;
};

type ClauseRow = {
  id?: number | string;
  clause_id?: number | string;
  clause_number?: string | null;
  clause_text?: string | null;
  standard?: string | null;
  category?: string | null;
};

type MasterRow = {
  section_number?: number | null;
  title?: string | null;
  content?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatClause(row: ClauseRow | null, clauseId: string | number) {
  if (!row) {
    return `Clause ID ${clauseId} (no matching row in clauses).`;
  }
  const number = row.clause_number ?? row.id ?? clauseId;
  const standard = row.standard ? ` [${row.standard}]` : "";
  const category = row.category ? ` (${row.category})` : "";
  const text = row.clause_text ?? "";
  return `Clause ${number}${standard}${category}\n${text}`.trim();
}

function formatGoldenMaster(sections: MasterRow[]) {
  if (sections.length === 0) {
    return "(No golden-standard SOP master sections found for this clause.)";
  }
  return sections
    .slice()
    .sort(
      (a, b) => Number(a.section_number ?? 0) - Number(b.section_number ?? 0),
    )
    .map(
      (section) =>
        `Section ${section.section_number ?? ""}: ${section.title ?? "Untitled"}\n${section.content ?? ""}`,
    )
    .join("\n\n");
}

async function loadClauseRule(clauseId: string | number) {
  const supabase = createSupabaseAdmin();
  const byId = await supabase
    .from("clauses")
    .select("id,clause_number,clause_text,standard,category")
    .eq("id", clauseId)
    .maybeSingle();

  if (!byId.error && byId.data) {
    return byId.data as ClauseRow;
  }

  const byClauseId = await supabase
    .from("clauses")
    .select("id,clause_id,clause_number,clause_text,standard,category")
    .eq("clause_id", clauseId)
    .maybeSingle();

  if (byClauseId.error || !byClauseId.data) {
    return null;
  }
  return byClauseId.data as ClauseRow;
}

async function loadGoldenMaster(clauseId: string | number) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("sop_masters")
    .select("section_number,title,content")
    .eq("clause_id", clauseId);

  if (error) {
    throw new Error(`Failed to load sop_masters: ${error.message}`);
  }
  return (data ?? []) as MasterRow[];
}

function parseAuditJson(raw: string) {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const parsed: unknown = JSON.parse(cleaned);
  if (!isRecord(parsed)) {
    throw new Error("Auditor did not return a JSON object.");
  }
  const gaps = Array.isArray(parsed.gaps)
    ? parsed.gaps.map((item) => String(item))
    : [];
  const scoreRaw = parsed.score;
  const score =
    typeof scoreRaw === "number"
      ? scoreRaw
      : typeof scoreRaw === "string"
        ? Number(scoreRaw)
        : 70;
  return {
    score: Number.isFinite(score) ? score : 70,
    status: String(parsed.status ?? "Partially Compliant"),
    gaps,
    summary: String(parsed.summary ?? "Audit completed with findings."),
    recommendation: String(
      parsed.recommendation ?? parsed.recommendations ?? "",
    ),
  };
}

async function insertBestEffort(
  table: string,
  row: Record<string, unknown>,
): Promise<string | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from(table).insert(row).select("id").maybeSingle();
  if (error) {
    console.warn(`[Audit] ${table} insert skipped: ${error.message}`);
    return null;
  }
  const id = (data as { id?: unknown } | null)?.id;
  return id == null ? null : String(id);
}

function reportsTable(workflow: AuditWorkflowId) {
  if (workflow === "bpr") return "bpr_reports";
  if (workflow === "fir") return "fir_reports";
  return "sop_reports";
}

function documentIdField(workflow: AuditWorkflowId) {
  if (workflow === "bpr") return "bpr_id";
  if (workflow === "fir") return "fir_id";
  return "sop_id";
}

export async function runThreeWayAudit(
  input: ThreeWayAuditInput,
): Promise<ThreeWayAuditResult> {
  const clause = await loadClauseRule(input.clauseId);
  const masters = await loadGoldenMaster(input.clauseId);
  const userContent = [
    "=== 1. REGULATORY CLAUSE ===",
    formatClause(clause, input.clauseId),
    "",
    "=== 2. GOLDEN STANDARD BENCHMARK SOP ===",
    formatGoldenMaster(masters),
    "",
    "=== 3. INCOMING FACILITY SOP ===",
    input.incomingText,
  ].join("\n");

  const openai = openaiClient();
  const completion = await openai.chat.completions.create({
    model: AUDIT_MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: AUDITOR_SYSTEM },
      { role: "user", content: userContent },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Auditor returned an empty response.");
  }

  const parsed = parseAuditJson(content);
  const documentIdValue =
    input.workflow === "fir" && /^\d+$/.test(String(input.documentId))
      ? Number(input.documentId)
      : input.documentId;
  const reportPayload = {
    clause_id: input.clauseId,
    score: parsed.score,
    status: parsed.status,
    gaps: parsed.gaps,
    discrepancies: parsed.gaps,
    summary: parsed.summary,
    recommendation: parsed.recommendation || null,
    [documentIdField(input.workflow)]: documentIdValue,
    ingestion_id: input.ingestionId ?? null,
  };

  const audit_run_id = await insertBestEffort("audit_runs", {
    clause_id: input.clauseId,
    workflow: input.workflow,
    document_id: input.documentId,
    file_name: input.fileName ?? null,
    status: parsed.status,
    score: parsed.score,
    summary: parsed.summary,
  });

  const reportRow = {
    ...reportPayload,
    ...(audit_run_id ? { audit_run_id } : {}),
  };

  const report_row_id =
    (await insertBestEffort(reportsTable(input.workflow), reportRow)) ??
    (await insertBestEffort("audit_reports", reportRow));

  return {
    report: toPublicSopReport({
      ...parsed,
      clause_id: input.clauseId,
      created_at: new Date().toISOString(),
    }),
    audit_run_id,
    report_row_id,
  };
}
