import "server-only";

import { unstable_cache } from "next/cache";
import type { AuditWorkflowId } from "@/lib/audit-workflows";
import { toPublicSopReport, type SopAuditReport } from "@/lib/sop-report";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export type StoredAuditReport = SopAuditReport & {
  id: string;
  workflow: AuditWorkflowId;
  document_id: string | null;
};

const REPORT_TABLES: { workflow: AuditWorkflowId; table: string; idField: string }[] =
  [
    { workflow: "sop", table: "sop_reports", idField: "sop_id" },
    { workflow: "bpr", table: "bpr_reports", idField: "bpr_id" },
    { workflow: "fir", table: "fir_reports", idField: "fir_id" },
  ];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapRow(
  workflow: AuditWorkflowId,
  idField: string,
  row: Record<string, unknown>,
): StoredAuditReport {
  const publicReport = toPublicSopReport(row);
  return {
    ...publicReport,
    id: String(row.id ?? `${workflow}-${row.created_at ?? ""}`),
    workflow,
    document_id:
      row[idField] == null ? null : String(row[idField]),
  };
}

async function loadTable(
  workflow: AuditWorkflowId,
  table: string,
  idField: string,
  limit: number,
): Promise<StoredAuditReport[]> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn(`[Audit reports] ${table}: ${error.message}`);
      return [];
    }

    return (data ?? [])
      .filter(isRecord)
      .map((row) => mapRow(workflow, idField, row));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[Audit reports] ${table}: ${message}`);
    return [];
  }
}

async function fetchStoredAuditReports(
  limit: number,
): Promise<StoredAuditReport[]> {
  const groups = await Promise.all(
    REPORT_TABLES.map(({ workflow, table, idField }) =>
      loadTable(workflow, table, idField, limit),
    ),
  );

  return groups
    .flat()
    .sort((a, b) => {
      const aTime = a.created_at ? Date.parse(a.created_at) : 0;
      const bTime = b.created_at ? Date.parse(b.created_at) : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

/** Cached list so dashboard prefetch + navigation share a warm result. */
export async function listStoredAuditReports(
  limit = 40,
): Promise<StoredAuditReport[]> {
  const cached = unstable_cache(
    () => fetchStoredAuditReports(limit),
    ["stored-audit-reports", String(limit)],
    { revalidate: 60 },
  );
  return cached();
}
