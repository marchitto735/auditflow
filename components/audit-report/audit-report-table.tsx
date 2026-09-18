"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  activityStatusLabel,
  STATUS_BADGE_CLASS,
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

const REPORT_GRID_CLASS = "grid w-full grid-cols-1 gap-4 md:grid-cols-3";
const META_FIELD_CLASS = "flex shrink-0 flex-col gap-3 text-sm";
const META_VALUE_CLASS = "text-sm leading-5 text-foreground";

function HeaderLabel({
  label,
}: {
  label: string;
}) {
  return (
    <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
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
      <h3 className="m-0 mb-1 w-full shrink-0 truncate text-left text-sm font-medium leading-5 text-foreground">
        {title}
      </h3>
      <div
        className={cn(
          "min-w-0 text-left text-sm leading-5 text-foreground whitespace-normal break-words [overflow-wrap:anywhere]",
          preview
            ? "line-clamp-2 overflow-hidden"
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
        <div className="overflow-x-auto px-6 pt-4 pb-2">
          <div className="flex w-[calc(100%-192px)] items-start justify-between gap-6 text-left text-sm">
            <div className={cn(META_FIELD_CLASS, "min-w-0 max-w-[12rem]")}>
              <HeaderLabel label="Document" />
              <CellTooltip
                label={[fileName, clauseLabel].filter(Boolean).join(" · ")}
              >
                <span className={cn("block min-w-0 cursor-default truncate", META_VALUE_CLASS)}>
                  {fileName}
                </span>
              </CellTooltip>
            </div>
            <div className={META_FIELD_CLASS}>
              <HeaderLabel label="Type" />
              <CellTooltip label={documentType}>
                <span className={cn("block cursor-default whitespace-nowrap", META_VALUE_CLASS)}>
                  {documentType}
                </span>
              </CellTooltip>
            </div>
            <div className={META_FIELD_CLASS}>
              <HeaderLabel label="Timestamp" />
              <CellTooltip label={date}>
                <span className={cn("block cursor-default whitespace-nowrap", META_VALUE_CLASS)}>
                  {date}
                </span>
              </CellTooltip>
            </div>
            <div className={META_FIELD_CLASS}>
              <HeaderLabel label="Score" />
              <span className={META_VALUE_CLASS}>{score}</span>
            </div>
            <div className={META_FIELD_CLASS}>
              <HeaderLabel label="Status" />
              {status === "—" ? (
                <span className={META_VALUE_CLASS}>—</span>
              ) : (
                <Badge
                  variant="secondary"
                  className={cn(
                    STATUS_BADGE_CLASS,
                    "text-sm leading-5",
                    statusBadgeClass(status),
                  )}
                >
                  {status}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Collapsible
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          className="min-w-0"
        >
          <div className="relative">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className={cn(
                  "absolute inset-x-0 top-0 z-10 cursor-pointer border-0 bg-transparent p-0",
                  detailsOpen ? "h-[5.5rem]" : "inset-0",
                )}
                aria-label="Toggle audit details"
              />
            </CollapsibleTrigger>
            <div
              className={cn(
                "flex flex-col gap-3 px-6 py-4",
                !detailsOpen && "pointer-events-none",
              )}
            >
              <div className="inline-flex items-center gap-1 text-sm font-medium leading-5 text-foreground">
                Audit Details
                <ChevronDown
                  className={cn(
                    "size-3.5 shrink-0 text-muted-foreground transition-transform duration-300",
                    detailsOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </div>
              <div
                className={cn(
                  "relative grid transition-[grid-template-rows] duration-300 ease-out",
                  detailsOpen ? "grid-rows-[1fr]" : "grid-rows-[4.5rem]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
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
                <div
                  className={cn(
                    "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-[oklch(100%_0_0)] transition-opacity duration-300",
                    detailsOpen ? "opacity-0" : "opacity-100",
                  )}
                />
              </div>
            </div>
          </div>
        </Collapsible>
      </div>
    </TooltipProvider>
  );
}
