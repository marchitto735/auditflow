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
