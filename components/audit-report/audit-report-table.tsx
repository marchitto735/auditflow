"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  Copy,
  Download,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ActivityStatus,
  activityStatusLabel,
  statusBadgeClass,
} from "@/components/activity-table/activity-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SopAuditReport } from "@/lib/sop-report";
import { NAV_UTILITY_BUTTON_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export { statusBadgeClass };

type AuditReportTableProps = {
  report: SopAuditReport | null;
  fileName: string;
  documentType: string;
  clauseLabel: string;
  timestamp: Date;
  onDownloadReport?: () => void;
  onRerunAudit?: () => void;
};

const COLUMN_GUTTER_CLASS = "gap-x-12";
const REPORT_GRID_CLASS = cn(
  "grid w-full grid-cols-1 gap-y-4 md:grid-cols-3",
  COLUMN_GUTTER_CLASS,
);
const META_FIELD_CLASS = "flex min-w-0 flex-col gap-2";
const META_VALUE_CLASS = "text-body1 text-foreground";
const ACTION_ITEM_CLASS =
  "cursor-pointer gap-2 text-sm hover:bg-slate-100 focus:bg-slate-100";

function HeaderLabel({
  label,
}: {
  label: string;
}) {
  return (
    <span className="text-sm font-medium text-foreground">{label}</span>
  );
}

function DetailColumn({
  title,
  children,
  preview = false,
}: {
  title: string;
  children: ReactNode;
  preview?: boolean;
}) {
  return (
    <div className="flex h-full min-w-0 flex-col items-stretch text-left">
      <h3 className="m-0 mb-2 w-full shrink-0 truncate text-left text-sm font-medium text-foreground">
        {title}
      </h3>
      <div
        className={cn(
          "text-body1 min-w-0 text-left text-foreground whitespace-normal break-words [overflow-wrap:anywhere]",
          preview
            ? "line-clamp-3 overflow-hidden"
            : "pb-1",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function CellTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" align="start">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function AuditReportActionsMenu({
  auditId,
  onDownloadReport,
  onRerunAudit,
}: {
  auditId: string;
  onDownloadReport?: () => void;
  onRerunAudit?: () => void;
}) {
  async function copyAuditId() {
    try {
      await navigator.clipboard.writeText(auditId);
    } catch {
      // Clipboard may be unavailable in insecure contexts.
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(NAV_UTILITY_BUTTON_CLASS, "shrink-0 text-foreground")}
          aria-label="Row actions"
        >
          <MoreHorizontal className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[13rem] rounded-2xl border border-slate-200 bg-white p-1 shadow-lg"
      >
        <DropdownMenuItem
          className={ACTION_ITEM_CLASS}
          onSelect={() => onDownloadReport?.()}
        >
          <Download className="size-4" />
          Download Report
        </DropdownMenuItem>
        <DropdownMenuItem className={ACTION_ITEM_CLASS} onSelect={copyAuditId}>
          <Copy className="size-4" />
          Copy Audit ID
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-200" />
        <DropdownMenuItem
          className={ACTION_ITEM_CLASS}
          onSelect={() => onRerunAudit?.()}
        >
          <RefreshCw className="size-4" />
          Re-run Audit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AuditReportTable({
  report,
  fileName,
  documentType,
  clauseLabel,
  timestamp,
  onDownloadReport,
  onRerunAudit,
}: AuditReportTableProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const date = timestamp.toLocaleString();
  const score = report?.score != null ? String(report.score) : "—";
  const status = activityStatusLabel(report?.status);
  const auditId = report?.clause_id
    ? `clause-${report.clause_id}`
    : fileName || "audit";
  const summary = report?.summary?.trim() || "—";
  const findings = useMemo(() => {
    if (report?.findings.length) return report.findings;
    return ["No findings reported."];
  }, [report]);
  const recommendation = report?.recommendation?.trim() || "—";

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-w-0 w-full">
        <div className="relative border-b border-border bg-muted px-4 pt-4 pb-4">
          <div className="absolute top-4 right-4 z-10">
            <AuditReportActionsMenu
              auditId={auditId}
              onDownloadReport={onDownloadReport}
              onRerunAudit={onRerunAudit}
            />
          </div>
          <div className={cn(REPORT_GRID_CLASS, "items-start text-left")}>
            <div className={cn(META_FIELD_CLASS, "min-w-0")}>
              <HeaderLabel label="Document" />
              <CellTooltip
                label={[fileName, clauseLabel].filter(Boolean).join(" · ")}
              >
                <span className={cn("block min-w-0 cursor-default truncate", META_VALUE_CLASS)}>
                  {fileName}
                </span>
              </CellTooltip>
            </div>
            <div className="flex min-w-0 items-start gap-4">
              <div className={cn(META_FIELD_CLASS, "shrink-0")}>
                <HeaderLabel label="Type" />
                <CellTooltip label={documentType}>
                  <span className={cn("block cursor-default whitespace-nowrap", META_VALUE_CLASS)}>
                    {documentType}
                  </span>
                </CellTooltip>
              </div>
              <div className={cn(META_FIELD_CLASS, "ml-4 min-w-0")}>
                <HeaderLabel label="Timestamp" />
                <CellTooltip label={date}>
                  <span className={cn("block min-w-0 cursor-default truncate", META_VALUE_CLASS)}>
                    {date}
                  </span>
                </CellTooltip>
              </div>
            </div>
            <div className="flex min-w-0 items-start gap-4 pr-4">
              <div className={cn(META_FIELD_CLASS, "shrink-0")}>
                <HeaderLabel label="Score" />
                <span className={META_VALUE_CLASS}>{score}</span>
              </div>
              <div className={cn(META_FIELD_CLASS, "ml-4 min-w-0")}>
                <HeaderLabel label="Status" />
                <ActivityStatus status={status} className="text-body1" />
              </div>
            </div>
          </div>
        </div>
        <Collapsible
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          className="min-w-0"
        >
          <div className="flex flex-col gap-4 px-4 pt-4 pb-4">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="inline-flex w-fit cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-medium text-slate-900 transition-colors hover:opacity-70"
              >
                Compliance Breakdown
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-300",
                    detailsOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
            </CollapsibleTrigger>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                detailsOpen
                  ? "grid-rows-[1fr]"
                  : "pointer-events-none grid-rows-[6.5rem]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="rounded-2xl bg-white p-0 shadow-none">
                  <div className={cn(REPORT_GRID_CLASS, "items-stretch")}>
                    <DetailColumn title="Summary" preview={!detailsOpen}>
                      <p className="m-0">{summary}</p>
                    </DetailColumn>
                    <DetailColumn title="Findings" preview={!detailsOpen}>
                      <ul className="m-0 list-disc space-y-1 pl-4">
                        {findings.map((finding) => (
                          <li key={finding}>{finding}</li>
                        ))}
                      </ul>
                    </DetailColumn>
                    <DetailColumn title="Recommendations" preview={!detailsOpen}>
                      <p className="m-0">{recommendation}</p>
                    </DetailColumn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Collapsible>
      </div>
    </TooltipProvider>
  );
}
