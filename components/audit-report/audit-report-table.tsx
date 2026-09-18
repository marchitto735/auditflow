"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const COL_PX = {
  document: 200,
  type: 88,
  timestamp: 168,
  score: 88,
  scoreGap: 24,
  status: 128,
} as const;

const TABLE_MIN_WIDTH =
  COL_PX.document +
  COL_PX.type +
  COL_PX.timestamp +
  COL_PX.score +
  COL_PX.scoreGap +
  COL_PX.status;

function colStyle(width: number): CSSProperties {
  return { width, minWidth: width };
}

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
    <Card
      className={cn(
        "h-full min-w-0 rounded-2xl bg-[oklch(97%_0_0)] p-0 shadow-none",
        preview ? "pointer-events-none border-0" : "border border-border",
      )}
    >
      <CardContent className="flex h-full min-w-0 flex-col p-4 md:p-5">
        <h3 className="m-0 text-sm font-medium text-foreground">{title}</h3>
        <div className="mt-3 min-w-0 text-sm text-foreground whitespace-normal break-words [overflow-wrap:anywhere]">
          {children}
        </div>
      </CardContent>
    </Card>
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
        <div className="w-full overflow-x-auto">
          <table
            data-slot="table"
            className="caption-bottom border-separate border-spacing-0 text-sm whitespace-nowrap"
            style={{
              tableLayout: "fixed",
              width: "100%",
              minWidth: TABLE_MIN_WIDTH,
            }}
          >
            <colgroup>
              {(Object.keys(COL_PX) as (keyof typeof COL_PX)[]).map((key) => (
                <col
                  key={key}
                  style={{ width: COL_PX[key], minWidth: COL_PX[key] }}
                />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow className="hover:bg-transparent [&>th]:border-b [&>th]:border-b-[1px] [&>th]:border-border">
                <TableHead className="px-6" style={colStyle(COL_PX.document)}>
                  <HeaderLabel label="Document" />
                </TableHead>
                <TableHead style={colStyle(COL_PX.type)}>
                  <HeaderLabel label="Type" />
                </TableHead>
                <TableHead style={colStyle(COL_PX.timestamp)}>
                  <HeaderLabel label="Timestamp" />
                </TableHead>
                <TableHead className="pr-0" style={colStyle(COL_PX.score)}>
                  <HeaderLabel label="Score" />
                </TableHead>
                <TableHead
                  aria-hidden
                  className="p-0"
                  style={colStyle(COL_PX.scoreGap)}
                />
                <TableHead className="pl-0 pr-6" style={colStyle(COL_PX.status)}>
                  <HeaderLabel label="Status" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell
                  className="align-top overflow-hidden px-6 py-4 font-medium"
                  style={colStyle(COL_PX.document)}
                >
                  <CellTooltip
                    label={[fileName, clauseLabel].filter(Boolean).join(" · ")}
                  >
                    <span className="block w-full cursor-default truncate">
                      {fileName}
                    </span>
                  </CellTooltip>
                </TableCell>
                <TableCell
                  className="align-top overflow-hidden py-4"
                  style={colStyle(COL_PX.type)}
                >
                  <CellTooltip label={documentType}>
                    <span className="block w-full cursor-default truncate">
                      {documentType}
                    </span>
                  </CellTooltip>
                </TableCell>
                <TableCell
                  className="align-top overflow-hidden py-4"
                  style={colStyle(COL_PX.timestamp)}
                >
                  <CellTooltip label={date}>
                    <span className="block w-full cursor-default truncate">
                      {date}
                    </span>
                  </CellTooltip>
                </TableCell>
                <TableCell
                  className="align-top py-4 pr-0"
                  style={colStyle(COL_PX.score)}
                >
                  {score}
                </TableCell>
                <TableCell
                  aria-hidden
                  className="p-0"
                  style={colStyle(COL_PX.scoreGap)}
                />
                <TableCell
                  className="align-top overflow-hidden py-4 pl-0 pr-6"
                  style={colStyle(COL_PX.status)}
                >
                  {status === "—" ? (
                    "—"
                  ) : (
                    <Badge
                      variant="secondary"
                      className={cn(
                        STATUS_BADGE_CLASS,
                        statusBadgeClass(status),
                      )}
                    >
                      {status}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </table>
        </div>
        <Collapsible
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          className="min-w-0 border-t border-border px-6 py-4"
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-left text-sm font-medium text-foreground"
            >
              Audit Details
              <ChevronDown
                className={cn(
                  "size-3.5 shrink-0 text-muted-foreground transition-transform duration-300",
                  detailsOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
          </CollapsibleTrigger>
          <div className="mt-3">
            <div
              className={cn(
                "relative grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                detailsOpen ? "grid-rows-[1fr]" : "pointer-events-none select-none grid-rows-[18px]",
              )}
              aria-hidden={!detailsOpen}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
                  <DetailColumn title="Summary" preview={!detailsOpen}>
                    <p className="m-0">{summary}</p>
                  </DetailColumn>
                  <DetailColumn title="Findings" preview={!detailsOpen}>
                    <ul className="m-0 list-disc space-y-2 pl-4">
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
                  "pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-b from-transparent to-[oklch(100%_0_0)] transition-opacity duration-300",
                  detailsOpen ? "opacity-0" : "opacity-100",
                )}
              />
            </div>
          </div>
        </Collapsible>
      </div>
    </TooltipProvider>
  );
}
