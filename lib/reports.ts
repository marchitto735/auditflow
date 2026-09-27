import {
  activityStatusLabel,
  type ActivityRow,
} from "@/components/activity-table/activity-table";
import type { AuditWorkflowId } from "@/lib/audit-workflows";
import type { SopAuditReport } from "@/lib/sop-report";

export type ReportStatusFilter = "all" | "Compliant" | "Partial" | "Failed";

export type ReportRow = ActivityRow & {
  createdAt: string | null;
  scoreValue: number | null;
  findings: string[];
  summary: string | null;
  recommendation: string | null;
};

export type ReportFilters = {
  search: string;
  status: ReportStatusFilter;
  from: Date | null;
  to: Date | null;
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
};

export const REPORT_STATUS_FILTERS: ReportStatusFilter[] = [
  "all",
  "Compliant",
  "Partial",
  "Failed",
];

export const INITIAL_REPORT_FILTERS: ReportFilters = {
  search: "",
  status: "all",
  from: null,
  to: null,
};

function bucketStatus(status: string | null | undefined): ReportStatusFilter | "other" {
  const raw = (status ?? "").toLowerCase();
  if (raw.includes("critical") || raw.includes("fail") || raw.includes("non-compliant") || raw.includes("non compliant")) {
    return "Failed";
  }
  const label = activityStatusLabel(status);
  if (label === "Compliant" || label === "Pass") return "Compliant";
  if (label === "Partial" || label === "Review") return "Partial";
  if (label === "Critical" || label === "Fail") return "Failed";
  return "other";
}

export function storedReportToReportRow(report: StoredReport): ReportRow {
  const findings = report.findings ?? [];
  const findingsDetail = findings.length
    ? findings.map((item, index) => `${index + 1}. ${item}`).join(" ")
    : "";

  return {
    id: report.id,
    document:
      report.document_id || `${report.workflow.toUpperCase()} report`,
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
    document: "SOP-1042 · Document Control",
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
    document: "BPR-881 · Sterile Fill Lot 44A",
    type: "BPR",
    date: new Date("2026-09-23T09:05:00Z").toLocaleString(),
    createdAt: "2026-09-23T09:05:00.000Z",
    score: "78",
    scoreValue: 78,
    status: "Partially Compliant",
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
    document: "FIR-220 · HVAC Excursion Wing B",
    type: "FIR",
    date: new Date("2026-09-22T18:40:00Z").toLocaleString(),
    createdAt: "2026-09-22T18:40:00.000Z",
    score: "61",
    scoreValue: 61,
    status: "Non-Compliant",
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
    document: "SOP-991 · Cleaning Validation",
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
    document: "BPR-702 · Oral Solid Dose Lot 19C",
    type: "BPR",
    date: new Date("2026-09-18T16:02:00Z").toLocaleString(),
    createdAt: "2026-09-18T16:02:00.000Z",
    score: "72",
    scoreValue: 72,
    status: "Partially Compliant",
    summary: "Compression records present; IPC sampling timestamps incomplete.",
    recommendation: "Backfill IPC timestamps and verify blend uniformity attachments.",
    findings: ["IPC sample times missing for stage 3", "Blend uniformity PDF not linked"],
    detail: "",
  },
  {
    id: "rpt-fir-118",
    document: "FIR-118 · Label Mix-Risk Near Miss",
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
    document: "SOP-550 · Deviation Management",
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
    document: "BPR-640 · Aseptic Media Fill",
    type: "BPR",
    date: new Date("2026-09-10T07:20:00Z").toLocaleString(),
    createdAt: "2026-09-10T07:20:00.000Z",
    score: "83",
    scoreValue: 83,
    status: "Partially Compliant",
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

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function filterReportRows(
  rows: ReportRow[],
  filters: ReportFilters,
): ReportRow[] {
  const query = filters.search.trim().toLowerCase();
  const from = filters.from ? startOfDay(filters.from).getTime() : null;
  const to = filters.to ? endOfDay(filters.to).getTime() : null;

  return rows.filter((row) => {
    if (query) {
      const haystack = `${row.document} ${row.type} ${row.id}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.status !== "all") {
      if (bucketStatus(row.status) !== filters.status) return false;
    }

    if (from != null || to != null) {
      if (!row.createdAt) return false;
      const time = Date.parse(row.createdAt);
      if (Number.isNaN(time)) return false;
      if (from != null && time < from) return false;
      if (to != null && time > to) return false;
    }

    return true;
  });
}
