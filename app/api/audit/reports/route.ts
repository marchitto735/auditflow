import { NextResponse } from "next/server";
import { listStoredAuditReports } from "@/lib/services/list-audit-reports";

export const runtime = "nodejs";

function errorText(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function GET() {
  try {
    const reports = await listStoredAuditReports();
    return NextResponse.json({ ok: true, reports });
  } catch (error) {
    return NextResponse.json({ error: errorText(error) }, { status: 500 });
  }
}
