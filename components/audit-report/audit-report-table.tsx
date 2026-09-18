"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  Copy,
  FileText,
  History,
  MoreHorizontal,
  SlidersHorizontal,
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
import { cn } from "@/lib/utils";

export { statusBadgeClass };

type AuditReportTableProps = {
  report: SopAuditReport | null;
  fileName: string;
  documentType: string;
  clauseLabel: string;
  timestamp: Date;
};

const COLUMN_GUTTER_CLASS = "gap-x-12";
const REPORT_GRID_CLASS = cn(
  "grid w-full grid-cols-1 gap-y-4 md:grid-cols-3",
  COLUMN_GUTTER_CLASS,
);
const META_FIELD_CLASS = "flex min-w-0 flex-col gap-2 text-body1";
const META_VALUE_CLASS = "text-body1 text-foreground";
const ACTION_ITEM_CLASS =
  "cursor-pointer gap-2 text-sm hover:bg-slate-100 focus:bg-slate-100";

function HeaderLabel({
  label,
}: {
  label: string;
}) {
  return (
    <span className="text-sm font-bold text-foreground">{label}</span>
  );
}

function StatusValue({ status }: { status: string }) {
  if (status === "—") {
    return <span className={META_VALUE_CLASS}>—</span>;
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2 text-body1 text-foreground">
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-full",
          status === "Compliant" && "bg-[#22C55E]",
          status === "Critical" && "bg-[#EF4444]",
          status === "Partial" && "bg-[#F5C400]",
          status !== "Compliant" &&
            status !== "Critical" &&
            status !== "Partial" &&
            "bg-[oklch(70%_0_0)]",
        )}
        aria-hidden
      />
      <span className="truncate">{status}</span>
    </span>
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
      <h3 className="m-0 mb-2 w-full shrink-0 truncate text-left text-sm font-bold text-foreground">
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

function AuditReportActionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 min-h-8 min-w-8 shrink-0 rounded-md border-0 bg-transparent p-0 text-slate-700 shadow-none hover:bg-slate-100"
          aria-label="Report actions"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[13rem] rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
      >
        <DropdownMenuItem className={ACTION_ITEM_CLASS}>
          <FileText className="size-4" />
          Export Row Data
        </DropdownMenuItem>
        <DropdownMenuItem className={ACTION_ITEM_CLASS}>
          <Copy className="size-4" />
          Copy Audit ID
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-200" />
        <DropdownMenuItem className={ACTION_ITEM_CLASS}>
          <History className="size-4" />
          View Full Change History
        </DropdownMenuItem>
        <DropdownMenuItem className={ACTION_ITEM_CLASS}>
          <SlidersHorizontal className="size-4" />
          Manage Columns
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
}: AuditReportTableProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const date = timestamp.toLocaleString();
  const score = report?.score != null ? String(report.score) : "—";
  const status = activityStatusLabel(report?.status);
  const summary = report?.summary?.trim() || "—";
  const findings = useMemo(() => {
    if (report?.findings.length) return report.findings;
    return ["No findings reported."];
  }, [report]);
  const recommendation = report?.recommendation?.trim() || "—";

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-w-0 w-full">
        <div className="relative px-6 pt-6 pb-2">
          <div className="absolute top-6 right-6 z-10">
            <AuditReportActionsMenu />
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
            <div className="flex min-w-0 items-start gap-6">
              <div className={cn(META_FIELD_CLASS, "shrink-0")}>
                <HeaderLabel label="Type" />
                <CellTooltip label={documentType}>
                  <span className={cn("block cursor-default whitespace-nowrap", META_VALUE_CLASS)}>
                    {documentType}
                  </span>
                </CellTooltip>
              </div>
              <div className={cn(META_FIELD_CLASS, "ml-12 min-w-0")}>
                <HeaderLabel label="Timestamp" />
                <CellTooltip label={date}>
                  <span className={cn("block min-w-0 cursor-default truncate", META_VALUE_CLASS)}>
                    {date}
                  </span>
                </CellTooltip>
              </div>
            </div>
            <div className="flex min-w-0 items-start gap-6 pr-10">
              <div className={cn(META_FIELD_CLASS, "shrink-0")}>
                <HeaderLabel label="Score" />
                <span className={META_VALUE_CLASS}>{score}</span>
              </div>
              <div className={cn(META_FIELD_CLASS, "ml-12 min-w-0")}>
                <HeaderLabel label="Status" />
                <StatusValue status={status} />
              </div>
            </div>
          </div>
        </div>
        <Collapsible
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          className="min-w-0"
        >
          <div className="mt-4 mb-3 border-t border-border" />
          <div className="flex flex-col gap-3 px-6 py-4">
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
                "mt-[2px] grid transition-[grid-template-rows] duration-300 ease-out",
                detailsOpen
                  ? "grid-rows-[1fr]"
                  : "pointer-events-none grid-rows-[6.5rem]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="rounded-lg bg-white p-0 shadow-none">
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
