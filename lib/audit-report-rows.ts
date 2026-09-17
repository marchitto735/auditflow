import type { ActivityRow } from "@/components/activity-table/activity-table";
import type { AuditWorkflowId } from "@/lib/audit-workflows";
import type { AuditLogRow } from "@/lib/dashboard-insights";
import type { SopAuditReport } from "@/lib/sop-report";

type StoredReport = SopAuditReport & {
  id: string;
  workflow: AuditWorkflowId;
  document_id: string | null;
};

function logStatus(status: string | null): AuditLogRow["status"] {
  const value = (status ?? "").toLowerCase();
  if (value.includes("critical")) return "Critical";
  if (value.includes("compliant") && !value.includes("partial")) {
    return "Compliant";
  }
  return "Partial";
}

export function storedReportToActivityRow(report: StoredReport): ActivityRow {
  const findings = report.findings.length
    ? report.findings.map((item, index) => `${index + 1}. ${item}`).join(" ")
    : "";

  return {
    id: report.id,
    document:
      report.document_id || `${report.workflow.toUpperCase()} report`,
    type: report.workflow.toUpperCase(),
    date: report.created_at
      ? new Date(report.created_at).toLocaleString()
      : "—",
    score: report.score != null ? String(report.score) : "—",
    status: report.status ?? "—",
    detail: [report.summary, findings, report.recommendation]
      .filter((part) => part && part !== "—")
      .join("\n\n"),
  };
}

export function storedReportToAuditLogRow(report: StoredReport): AuditLogRow {
  return {
    id: report.id,
    document:
      report.document_id || `${report.workflow.toUpperCase()} report`,
    type: report.workflow.toUpperCase() as AuditLogRow["type"],
    date: report.created_at
      ? new Date(report.created_at).toLocaleString()
      : "—",
    score: report.score ?? 0,
    auditor: "AuditFlow",
    status: logStatus(report.status),
  };
}
