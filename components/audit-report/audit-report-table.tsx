"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const COL_PX = {
  document: 200,
  type: 88,
  timestamp: 168,
  score: 88,
  scoreGap: 24,
  status: 112,
  details: 420,
} as const;

const TABLE_MIN_WIDTH =
  COL_PX.document +
  COL_PX.type +
  COL_PX.timestamp +
  COL_PX.score +
  COL_PX.scoreGap +
  COL_PX.status +
  COL_PX.details;

function colStyle(width: number): CSSProperties {
  return { width, minWidth: width };
}

function HeaderLabel({
  label,
  expanded,
  onToggle,
}: {
  label: string;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const chevron = (
    <ChevronDown
      className={cn(
        "size-3.5 shrink-0 text-muted-foreground",
        expanded && "rotate-180",
      )}
      aria-hidden
    />
  );

  if (!onToggle) {
    return (
      <span className="inline-flex items-center gap-1">
        {label}
        {chevron}
      </span>
    );
  }

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-left font-medium"
      onClick={onToggle}
      aria-expanded={expanded}
    >
      {label}
      {chevron}
    </button>
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
  const [detailsOpen, setDetailsOpen] = useState(true);

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
            <TableHead className="pl-0" style={colStyle(COL_PX.status)}>
              <HeaderLabel label="Status" />
            </TableHead>
            <TableHead className="px-6" style={colStyle(COL_PX.details)}>
              <HeaderLabel
                label="Audit Details"
                expanded={detailsOpen}
                onToggle={() => setDetailsOpen((open) => !open)}
              />
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
              className="align-top overflow-hidden py-4 pl-0"
              style={colStyle(COL_PX.status)}
            >
              {status === "—" ? (
                "—"
              ) : (
                <Badge
                  variant="secondary"
                  className={cn(
                    "border-0 font-medium",
                    statusBadgeClass(status),
                  )}
                >
                  {status}
                </Badge>
              )}
            </TableCell>
            <TableCell
              className="align-top whitespace-normal px-6 py-4"
              style={colStyle(COL_PX.details)}
            >
              <div
                className={cn(
                  "whitespace-normal break-words text-sm text-foreground",
                  detailsOpen
                    ? "max-h-56 overflow-y-auto overflow-x-hidden overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:oklch(80%_0_0)_transparent]"
                    : "line-clamp-1 overflow-hidden",
                )}
              >
                <p className="m-0">{summary}</p>
                <p className="text-body2 m-0 mt-3 font-medium">Findings</p>
                <ul className="m-0 mt-1 list-disc space-y-1 pl-4">
                  {findings.map((finding) => (
                    <li key={finding}>{finding}</li>
                  ))}
                </ul>
                <p className="text-body2 m-0 mt-3 font-medium">
                  Recommendation
                </p>
                <p className="m-0 mt-1">{recommendation}</p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </table>
    </div>
    </TooltipProvider>
  );
}
