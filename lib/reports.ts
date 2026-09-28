import {
  activityStatusLabel,
  type ActivityRow,
} from "@/components/activity-table/activity-table";
import type { AuditWorkflowId } from "@/lib/audit-workflows";
import type { SopAuditReport } from "@/lib/sop-report";
import { toDocumentTitleCase } from "@/lib/status-label";

export type ReportStatusFilter = "all" | "Compliant" | "Partial" | "Failed";
export type ReportTypeFilter = "all" | "SOP" | "BPR" | "FIR";
export type ReportDateRangeFilter = "all" | "7d" | "30d" | "90d";

export type ReportRow = ActivityRow & {
  createdAt: string | null;
  scoreValue: number | null;
  findings: string[];
  summary: string | null;
  recommendation: string | null;
};

export type ReportFilters = {
  search: string;
  type: ReportTypeFilter;
  status: ReportStatusFilter;
  dateRange: ReportDateRangeFilter;
};

export type ReportsKpis = {
  totalCompleted: number;
  averageScore: number | null;
  compliantCount: number;
  partialCount: number;
  failedCount: number;
  lastAuditAt: string | null;
  lastAuditLabel: string;
};

type StoredReport = SopAuditReport & {
  id: string;
  workflow: AuditWorkflowId;
  document_id: string | null;
  file_name?: string | null;
};

export const REPORT_STATUS_FILTERS: ReportStatusFilter[] = [
  "all",
  "Compliant",
  "Partial",
  "Failed",
];

export const INITIAL_REPORT_FILTERS: ReportFilters = {
  search: "",
  type: "all",
  status: "all",
  dateRange: "all",
};

/** Stable human-readable document labels by workflow (sentence case + acronyms). */
const REPORT_DOCUMENT_CATALOG: Record<AuditWorkflowId, readonly string[]> = {
  sop: [
    "SOP-1001 Document control",
    "SOP-4410 Electronic signatures",
    "SOP-7720 Complaint handling",
    "SOP-991 Cleaning validation",
    "SOP-550 Deviation management",
  ],
  bpr: [
    "BPR-2204 Batch record",
    "BPR-881 Sterile fill lot 44A",
    "BPR-702 Oral solid dose lot 19C",
    "BPR-640 Aseptic media fill",
    "BPR-5509 Packaging clearance",
  ],
  fir: [
    "FIR-8840 Facility hygiene",
    "FIR-220 HVAC excursion wing B",
    "FIR-118 Label mix-risk near miss",
    "FIR-3301 Cleanroom access",
    "FIR-9912 Environmental monitoring",
  ],
};

function isUuidLike(value: string): boolean {
  const trimmed = value.trim();
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      trimmed,
    )
  ) {
    return true;
  }
  // Truncated UUID display forms (e.g. "2e34e2e7-d5e9…")
  if (/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(trimmed) && /[….]/.test(trimmed)) {
    return true;
  }
  // Compact hex-only ids without human tokens
  if (/^[0-9a-f]{16,}$/i.test(trimmed) && !/[A-Z]{2,}-\d/i.test(trimmed)) {
    return true;
  }
  return false;
}

function stableCatalogIndex(seed: string, size: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return size === 0 ? 0 : hash % size;
}

function humanizeUploadedFileName(fileName: string | null | undefined): string | null {
  const raw = fileName?.trim();
  if (!raw) return null;
  const base = raw.split(/[/\\]/).pop()?.trim() ?? raw;
  const withoutExt = base.replace(/\.[a-z0-9]{1,8}$/i, "");
  const spaced = withoutExt.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return spaced || null;
}

/**
 * Prefer uploaded file names; otherwise map UUID document ids to readable
 * catalog titles. Already-human ids/titles are sentence-cased in place.
 */
export function formatReportDocumentLabel(
  workflow: AuditWorkflowId,
  documentId: string | null | undefined,
  fileName?: string | null,
): string {
  const fromFile = humanizeUploadedFileName(fileName);
  if (fromFile) return toDocumentTitleCase(fromFile);

  const raw = (documentId ?? "").trim();
  if (!raw) {
    return toDocumentTitleCase(`${workflow.toUpperCase()} report`);
  }

  if (!isUuidLike(raw)) {
    return toDocumentTitleCase(raw);
  }

  const catalog = REPORT_DOCUMENT_CATALOG[workflow];
  const label = catalog[stableCatalogIndex(raw, catalog.length)] ?? catalog[0]!;
  return toDocumentTitleCase(label);
}

function bucketStatus(status: string | null | undefined): ReportStatusFilter | "other" {
  const raw = (status ?? "").toLowerCase();
  if (raw.includes("critical") || raw.includes("fail") || raw.includes("non-compliant") || raw.includes("non compliant")) {
    return "Failed";
  }
  const label = activityStatusLabel(status);
  if (label === "Compliant" || label === "Pass") return "Compliant";
  if (label === "Partial" || label === "Review") return "Partial";
  if (
    label === "Critical" ||
    label === "Fail" ||
    label === "Failed" ||
    label === "Non-compliant"
  ) {
    return "Failed";
  }
  return "other";
}

export function storedReportToReportRow(report: StoredReport): ReportRow {
  const findings = report.findings ?? [];
  const findingsDetail = findings.length
    ? findings.map((item, index) => `${index + 1}. ${item}`).join(" ")
    : "";

  return {
    id: report.id,
    document: formatReportDocumentLabel(
      report.workflow,
      report.document_id,
      report.file_name,
    ),
    type: report.workflow.toUpperCase(),
    date: report.created_at
      ? new Date(report.created_at).toLocaleString()
      : "—",
    createdAt: report.created_at,
    score: report.score != null ? String(report.score) : "—",
    scoreValue: report.score,
    status: report.status ?? "—",
    detail: [report.summary, findingsDetail, report.recommendation]
      .filter((part) => part && part !== "—")
      .join("\n\n"),
    findings,
    summary: report.summary,
    recommendation: report.recommendation,
  };
}

/** Demo reports for empty environments — mirrors other System section pages. */
export const DEMO_AUDIT_REPORTS: ReportRow[] = [
  {
    id: "rpt-sop-1042",
    document: "SOP-1042 Document control",
    type: "SOP",
    date: new Date("2026-09-24T14:22:00Z").toLocaleString(),
    createdAt: "2026-09-24T14:22:00.000Z",
    score: "94",
    scoreValue: 94,
    status: "Compliant",
    summary: "Document control SOP meets CFR clause coverage with minor editorial notes.",
    recommendation: "Publish redline for §4.2 version-control wording.",
    findings: [
      "Version history section complete",
      "Change-control signatures verified",
      "Training matrix linked to current revision",
    ],
    detail: "",
  },
  {
    id: "rpt-bpr-881",
    document: "BPR-881 Sterile fill lot 44A",
    type: "BPR",
    date: new Date("2026-09-23T09:05:00Z").toLocaleString(),
    createdAt: "2026-09-23T09:05:00.000Z",
    score: "78",
    scoreValue: 78,
    status: "Partially compliant",
    summary: "Fill batch record is mostly complete; two reconciliation gaps remain.",
    recommendation: "Close yield reconciliation and second-person check for line clearances.",
    findings: [
      "Missing second signature on line clearance",
      "Yield variance unexplained for vial count",
    ],
    detail: "",
  },
  {
    id: "rpt-fir-220",
    document: "FIR-220 HVAC excursion wing B",
    type: "FIR",
    date: new Date("2026-09-22T18:40:00Z").toLocaleString(),
    createdAt: "2026-09-22T18:40:00.000Z",
    score: "61",
    scoreValue: 61,
    status: "Non-compliant",
    summary: "Investigation lacks root-cause evidence for differential pressure trip.",
    recommendation: "Attach BMS trend export and CAPA owner before closeout.",
    findings: [
      "No BMS trend attached",
      "CAPA owner unassigned",
      "Impact assessment incomplete for adjacent suites",
    ],
    detail: "",
  },
  {
    id: "rpt-sop-991",
    document: "SOP-991 Cleaning validation",
    type: "SOP",
    date: new Date("2026-09-20T11:15:00Z").toLocaleString(),
    createdAt: "2026-09-20T11:15:00.000Z",
    score: "88",
    scoreValue: 88,
    status: "Compliant",
    summary: "Cleaning validation protocol aligns with gold-standard swab limits.",
    recommendation: "Schedule annual revalidation reminder in Q1.",
    findings: ["Residue limits documented", "Equipment train coverage complete"],
    detail: "",
  },
  {
    id: "rpt-bpr-702",
    document: "BPR-702 Oral solid dose lot 19C",
    type: "BPR",
    date: new Date("2026-09-18T16:02:00Z").toLocaleString(),
    createdAt: "2026-09-18T16:02:00.000Z",
    score: "72",
    scoreValue: 72,
    status: "Partially compliant",
    summary: "Compression records present; IPC sampling timestamps incomplete.",
    recommendation: "Backfill IPC timestamps and verify blend uniformity attachments.",
    findings: ["IPC sample times missing for stage 3", "Blend uniformity PDF not linked"],
    detail: "",
  },
  {
    id: "rpt-fir-118",
    document: "FIR-118 Label mix-risk near miss",
    type: "FIR",
    date: new Date("2026-09-15T08:30:00Z").toLocaleString(),
    createdAt: "2026-09-15T08:30:00.000Z",
    score: "55",
    scoreValue: 55,
    status: "Critical",
    summary: "Critical labeling near-miss; containment steps incomplete in report.",
    recommendation: "Escalate to QA director and lock packaging line until dual review.",
    findings: [
      "Containment checklist incomplete",
      "Affected lots not enumerated",
      "Customer notification decision pending",
    ],
    detail: "",
  },
  {
    id: "rpt-sop-550",
    document: "SOP-550 Deviation management",
    type: "SOP",
    date: new Date("2026-09-12T13:45:00Z").toLocaleString(),
    createdAt: "2026-09-12T13:45:00.000Z",
    score: "91",
    scoreValue: 91,
    status: "Compliant",
    summary: "Deviation workflow matches QMS escalation paths.",
    recommendation: "No blocking actions.",
    findings: ["Escalation matrix current", "SLA timers configured"],
    detail: "",
  },
  {
    id: "rpt-bpr-640",
    document: "BPR-640 Aseptic media fill",
    type: "BPR",
    date: new Date("2026-09-10T07:20:00Z").toLocaleString(),
    createdAt: "2026-09-10T07:20:00.000Z",
    score: "83",
    scoreValue: 83,
    status: "Partially compliant",
    summary: "Media fill run passed; environmental monitoring annotation lag noted.",
    recommendation: "Sync EM annotations before batch disposition.",
    findings: ["EM plate counts pending annotation"],
    detail: "",
  },
].map((row) => ({
  ...row,
  detail: [row.summary, row.findings.map((f, i) => `${i + 1}. ${f}`).join(" "), row.recommendation]
    .filter(Boolean)
    .join("\n\n"),
}));

export function computeReportsKpis(rows: ReportRow[]): ReportsKpis {
  const scored = rows.filter((row) => row.scoreValue != null);
  const averageScore =
    scored.length === 0
      ? null
      : Math.round(
          scored.reduce((sum, row) => sum + (row.scoreValue ?? 0), 0) /
            scored.length,
        );

  let compliantCount = 0;
  let partialCount = 0;
  let failedCount = 0;
  for (const row of rows) {
    const bucket = bucketStatus(row.status);
    if (bucket === "Compliant") compliantCount += 1;
    else if (bucket === "Partial") partialCount += 1;
    else if (bucket === "Failed") failedCount += 1;
  }

  const withDates = rows
    .filter((row) => row.createdAt)
    .sort(
      (a, b) =>
        Date.parse(b.createdAt ?? "") - Date.parse(a.createdAt ?? ""),
    );
  const last = withDates[0];

  return {
    totalCompleted: rows.length,
    averageScore,
    compliantCount,
    partialCount,
    failedCount,
    lastAuditAt: last?.createdAt ?? null,
    lastAuditLabel: last?.date ?? "—",
  };
}

function dateRangeStart(range: ReportDateRangeFilter): number | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);
  return start.getTime();
}

export function filterReportRows(
  rows: ReportRow[],
  filters: ReportFilters,
): ReportRow[] {
  const query = filters.search.trim().toLowerCase();
  const from = dateRangeStart(filters.dateRange);

  return rows.filter((row) => {
    if (query) {
      const haystack = `${row.document} ${row.type} ${row.id}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.type !== "all" && row.type !== filters.type) return false;

    if (filters.status !== "all") {
      if (bucketStatus(row.status) !== filters.status) return false;
    }

    if (from != null) {
      if (!row.createdAt) return false;
      const time = Date.parse(row.createdAt);
      if (Number.isNaN(time)) return false;
      if (time < from) return false;
    }

    return true;
  });
}
