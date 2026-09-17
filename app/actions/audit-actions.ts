'use server'

import { listStoredAuditReports } from "@/lib/services/list-audit-reports";

export async function getStoredAuditReports(limit = 40) {
  return listStoredAuditReports(limit);
}
