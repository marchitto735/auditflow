"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import SectionHeader from "@/components/section-header/section-header";
import { AuditReportTable } from "@/components/audit-report/audit-report-table";
import { useCart } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getAuditFramework } from "@/lib/audit-frameworks";
import {
  AUDIT_WORKFLOWS,
  getAuditWorkflow,
  type AuditWorkflowId,
} from "@/lib/audit-workflows";
import { goldStandardCatalogItem } from "@/lib/cart";
import { getGmpClause } from "@/lib/gmp-clauses";
import {
  formatSopReportDownload,
  type SopAuditReport,
} from "@/lib/sop-report";

function resolveWorkflowId(value: string | null): AuditWorkflowId {
  const workflow = getAuditWorkflow(value ?? "");
  return workflow?.id ?? "sop";
}

function buildInitializedReport(input: {
  clauseIds: string[];
  frameworkLabel: string;
  workflowLabel: string;
  documentName: string;
  strictness: number;
}): SopAuditReport {
  const primary = getGmpClause(input.clauseIds[0]);
  const clauseCount = Math.max(input.clauseIds.length, 1);
  const strictness = Math.min(100, Math.max(0, input.strictness));
  const score = Math.max(
    42,
    Math.min(98, Math.round(92 - strictness * 0.18 - (clauseCount - 1) * 2)),
  );
  const status = score >= 85 ? "Pass" : score >= 70 ? "Review" : "Fail";
  const clauseNames = input.clauseIds
    .map((id) => getGmpClause(id))
    .filter(Boolean)
    .map((clause) => `Clause ${clause!.shortName}`)
    .slice(0, 6);

  const findings =
    clauseNames.length > 0
      ? clauseNames.map(
          (name, index) =>
            `${name}: documentation gap flagged under ${input.frameworkLabel} (${input.workflowLabel} review item ${index + 1}).`,
        )
      : [
          `${input.workflowLabel} analysis initialized against ${input.frameworkLabel}. No clause-level findings were returned.`,
        ];

  return {
    clause_id: primary?.id ?? input.clauseIds[0] ?? "27",
    score,
    status,
    summary: `Initialized ${input.workflowLabel} analysis for “${input.documentName}” against ${input.frameworkLabel} across ${clauseCount} selected clause${clauseCount === 1 ? "" : "s"} (strictness ${strictness}%).`,
    recommendation:
      status === "Pass"
        ? "Proceed with CAPA closure for minor documentation gaps and archive this report for the next certification cycle."
        : "Prioritize remediation on the listed clause gaps, then re-run Initialize Audit Analysis with the updated controlled document.",
    findings,
    created_at: new Date().toISOString(),
  };
}

export default function AuditResultsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const [addedToCart, setAddedToCart] = React.useState(false);

  const workflowId = resolveWorkflowId(searchParams.get("workflow"));
  const workflow = AUDIT_WORKFLOWS[workflowId];
  const framework =
    getAuditFramework(searchParams.get("framework") ?? "") ??
    getAuditFramework("iso-9001-2015");
  const documentName =
    searchParams.get("document")?.trim() || `${workflow.label}_Document.pdf`;
  const strictness = Number(searchParams.get("strictness") ?? "50");
  const clauseIds = React.useMemo(
    () =>
      (searchParams.get("clauses") ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    [searchParams],
  );

  const report = React.useMemo(
    () =>
      buildInitializedReport({
        clauseIds,
        frameworkLabel: framework?.label ?? "Selected framework",
        workflowLabel: workflow.label,
        documentName,
        strictness: Number.isFinite(strictness) ? strictness : 50,
      }),
    [clauseIds, documentName, framework?.label, strictness, workflow.label],
  );

  const primaryClause = getGmpClause(report.clause_id);
  const clauseLabel =
    clauseIds.length > 1
      ? `${clauseIds.length} clauses selected`
      : primaryClause
        ? `${primaryClause.label} (${primaryClause.shortName})`
        : `Clause ${report.clause_id}`;

  const timestamp = report.created_at
    ? new Date(report.created_at)
    : new Date();

  function downloadReport() {
    const body = formatSopReportDownload(report, documentName);
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-report-${workflowId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function upgradeDocument() {
    addItem(goldStandardCatalogItem(primaryClause, workflow.label));
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 1600);
  }

  return (
    <div className="w-full min-w-0">
      <SectionHeader
        title="Audit Report"
        description="Review your compliance breakdown and instantly resolve vulnerabilities by upgrading to a fully compliant document version."
        actions={
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-transparent text-foreground hover:bg-[var(--sidebar-hover)]"
            aria-label="Close report"
          >
            <X className="size-5" />
          </button>
        }
      />

      <div className="rounded-2xl">
        <Card className="relative w-full overflow-hidden rounded-2xl border border-border bg-[oklch(100%_0_0)] p-0 shadow-none gap-0">
          <CardContent className="h-auto bg-[oklch(100%_0_0)] p-0">
            <AuditReportTable
              report={report}
              fileName={documentName}
              documentType={workflow.label}
              clauseLabel={clauseLabel}
              timestamp={timestamp}
              onDownloadReport={downloadReport}
              onRerunAudit={() => router.push("/")}
            />
          </CardContent>
          <CardFooter className="flex w-full justify-end px-4 pt-4 pb-4">
            <Button
              type="button"
              variant="black"
              className="text-button"
              onClick={downloadReport}
            >
              Download Report
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-none transition-all duration-200 ease-in-out hover:border-zinc-300 hover:shadow-sm">
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-1.5 rounded-l-2xl bg-zinc-800"
        />
        <p className="m-0 text-center text-[14px] leading-5 text-black">
          Resolve findings by uploading a revised version.{" "}
          <button
            type="button"
            className="inline text-[14px] leading-5 font-medium text-black underline decoration-solid underline-offset-2 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800 focus-visible:ring-offset-2"
            onClick={upgradeDocument}
          >
            {addedToCart ? "Added to cart" : "Upgrade document"}
          </button>
        </p>
      </div>
    </div>
  );
}
