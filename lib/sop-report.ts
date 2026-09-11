export type SopAuditReport = {
  clause_id: string;
  score: number | null;
  status: string | null;
  summary: string | null;
  recommendation: string | null;
  findings: string[];
  created_at: string | null;
};

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return [value.trim()];
    }
  }
  return [];
}

function uniqueLines(lines: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    if (seen.has(line)) continue;
    seen.add(line);
    out.push(line);
  }
  return out;
}

export function toPublicSopReport(row: {
  clause_id?: string | number | null;
  score?: number | string | null;
  status?: string | null;
  summary?: string | null;
  recommendation?: string | null;
  gaps?: unknown;
  discrepancies?: unknown;
  findings?: unknown;
  created_at?: string | null;
}): SopAuditReport {
  const scoreNumber =
    typeof row.score === "number"
      ? row.score
      : typeof row.score === "string" && row.score.trim()
        ? Number(row.score)
        : null;

  const findings = uniqueLines([
    ...parseStringList(row.findings),
    ...parseStringList(row.gaps),
    ...parseStringList(row.discrepancies),
  ]);

  return {
    clause_id: String(row.clause_id ?? "27"),
    score: Number.isFinite(scoreNumber) ? scoreNumber : null,
    status: row.status ?? null,
    summary: row.summary ?? null,
    recommendation: row.recommendation ?? null,
    findings,
    created_at: row.created_at ?? null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function looksLikeReport(value: Record<string, unknown>) {
  return (
    "score" in value ||
    "status" in value ||
    "summary" in value ||
    "recommendation" in value ||
    "gaps" in value ||
    "findings" in value
  );
}

export function reportFromN8nWebhook(body: unknown): SopAuditReport | null {
  if (body == null) return null;

  if (Array.isArray(body) && body[0] && isRecord(body[0])) {
    return looksLikeReport(body[0])
      ? toPublicSopReport(body[0] as Parameters<typeof toPublicSopReport>[0])
      : reportFromN8nWebhook(body[0]);
  }

  if (!isRecord(body)) return null;

  const message = typeof body.message === "string" ? body.message : "";
  if (/workflow was started/i.test(message) && !looksLikeReport(body)) {
    return null;
  }

  if (looksLikeReport(body)) {
    return toPublicSopReport(body as Parameters<typeof toPublicSopReport>[0]);
  }

  for (const key of ["report", "data", "json", "body"] as const) {
    if (key in body) {
      const nested = reportFromN8nWebhook(body[key]);
      if (nested) return nested;
    }
  }

  return null;
}

export function n8nStartedWithoutReport(body: unknown) {
  if (!isRecord(body)) return false;
  const message = typeof body.message === "string" ? body.message : "";
  return /workflow was started/i.test(message);
}

export function formatSopReportDownload(
  report: SopAuditReport,
  fileName: string,
) {
  const findings =
    report.findings.length > 0
      ? report.findings.map((item, i) => `${i + 1}. ${item}`).join("\n")
      : "None recorded.";

  return [
    "AuditFlow SOP Report",
    "",
    `File: ${fileName}`,
    `Clause: ${report.clause_id}`,
    `Score: ${report.score ?? "—"}`,
    `Status: ${report.status ?? "—"}`,
    report.created_at ? `Created: ${report.created_at}` : "",
    "",
    "Summary",
    report.summary ?? "—",
    "",
    "Findings",
    findings,
    "",
    "Recommendation",
    report.recommendation ?? "—",
    "",
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");
}
