"use client";

import { Fragment, useState, type MouseEvent, type ReactNode } from "react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TruncatedText } from "@/components/ui/truncated-text";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const ACTIVITY_COLUMNS = [
  { key: "document", label: "Document", headerClassName: "px-4 w-[30%]", width: "30%" },
  { key: "type", label: "Type", width: "15%" },
  { key: "date", label: "Timestamp", width: "25%" },
  { key: "score", label: "Score", width: "15%" },
  { key: "status", label: "Status", headerClassName: "px-4 w-[15%]", width: "15%" },
] as const;

export type ActivityColumnKey = (typeof ACTIVITY_COLUMNS)[number]["key"];

export type ActivityRow = {
  id: string;
  document: string;
  type: string;
  date: string;
  score: string;
  status: string;
  detail?: string;
};

function toTitleCase(value: string) {
  return value
    .trim()
    .split(/([\s/_-]+)/)
    .map((part) => {
      if (/^[\s/_-]+$/.test(part)) return part;
      return part
        .split("")
        .map((char, index) =>
          index === 0 ? char.toUpperCase() : char.toLowerCase(),
        )
        .join("");
    })
    .join("");
}

export function activityStatusLabel(status: string | null | undefined) {
  const raw = (status ?? "").trim();
  if (!raw) return "—";

  const value = raw.toLowerCase();
  if (value.includes("critical")) return "Critical";
  if (value.includes("compliant") && !value.includes("partial")) {
    return "Compliant";
  }
  if (value.includes("partial")) return "Partial";
  if (value === "pass" || value === "passed") return "Pass";
  if (value === "fail" || value === "failed") return "Fail";
  if (value === "review") return "Review";

  return toTitleCase(raw);
}

export function statusBadgeClass(status: string | null | undefined) {
  const label = activityStatusLabel(status);
  if (label === "Compliant" || label === "Pass") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (label === "Critical" || label === "Fail") {
    return "border-red-200 bg-red-50 text-red-800";
  }
  return "border-amber-200 bg-amber-50 text-amber-900";
}

export const STATUS_BADGE_CLASS =
  "h-auto min-h-0 border-0 px-3 py-1 text-xs font-medium leading-none";

export function statusDotClass(status: string | null | undefined) {
  const label = activityStatusLabel(status);
  if (label === "Compliant" || label === "Pass") return "bg-emerald-500";
  if (label === "Critical" || label === "Fail") return "bg-red-600";
  if (label === "Partial" || label === "Review") return "bg-amber-500";
  if (label === "—") return "";
  return "bg-slate-400";
}

export function ActivityStatus({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const label = activityStatusLabel(status);
  if (label === "—") {
    return <span className={className}>—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-2 text-foreground",
        className,
      )}
    >
      <span
        className={cn("size-2.5 shrink-0 rounded-full", statusDotClass(status))}
        aria-hidden
      />
      <span className="min-w-0 truncate">{label}</span>
    </span>
  );
}

function cellKey(rowId: string, column: ActivityColumnKey) {
  return `${rowId}:${column}`;
}

export function ActivityTable({
  rows,
  expandable = false,
  headerAction,
}: {
  rows: ActivityRow[];
  expandable?: boolean;
  headerAction?: ReactNode;
}) {
  const [openRows, setOpenRows] = useState<Set<string>>(() => new Set());
  const [openCells, setOpenCells] = useState<Set<string>>(() => new Set());
  const [openColumns, setOpenColumns] = useState<Set<ActivityColumnKey>>(
    () => new Set(),
  );

  function toggleSet<T>(current: Set<T>, value: T) {
    const next = new Set(current);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  function isWrapped(rowId: string, column: ActivityColumnKey) {
    return (
      openColumns.has(column) ||
      openCells.has(cellKey(rowId, column)) ||
      openRows.has(rowId)
    );
  }

  function handleHeaderClick(column: ActivityColumnKey) {
    if (!expandable) return;
    setOpenColumns((current) => toggleSet(current, column));
  }

  function handleRowClick(row: ActivityRow) {
    if (!expandable || !row.detail) return;
    setOpenRows((current) => toggleSet(current, row.id));
  }

  function handleCellClick(
    event: MouseEvent,
    row: ActivityRow,
    column: ActivityColumnKey,
  ) {
    if (!expandable) return;
    event.stopPropagation();
    setOpenCells((current) => toggleSet(current, cellKey(row.id, column)));
    if (row.detail && (column === "document" || column === "type")) {
      setOpenRows((current) => {
        const next = new Set(current);
        next.add(row.id);
        return next;
      });
    }
  }

  return (
    <TooltipProvider delayDuration={150}>
    <Table className="table-fixed w-full">
      <colgroup>
        {ACTIVITY_COLUMNS.map((column) => (
          <col key={column.key} style={{ width: column.width }} />
        ))}
      </colgroup>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {ACTIVITY_COLUMNS.map((column) => (
            <TableHead
              key={column.key}
              className={cn(
                "headerClassName" in column && column.headerClassName,
                expandable && "cursor-pointer select-none",
              )}
              style={{ width: column.width }}
              onClick={() => handleHeaderClick(column.key)}
            >
              {column.key === "status" && headerAction ? (
                <div className="flex items-center justify-between gap-2">
                  <span>{column.label}</span>
                  {headerAction}
                </div>
              ) : (
                column.label
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const open = openRows.has(row.id);
          return (
            <Fragment key={row.id}>
              <TableRow
                className={cn(
                  "hover:bg-transparent",
                  expandable && "cursor-pointer",
                )}
                onClick={() => handleRowClick(row)}
              >
                <TableCell
                  className="overflow-hidden px-4"
                  style={{ width: ACTIVITY_COLUMNS[0].width }}
                  onClick={(event) =>
                    handleCellClick(event, row, "document")
                  }
                >
                  {isWrapped(row.id, "document") ? (
                    <span className="block whitespace-normal break-words">
                      {row.document}
                    </span>
                  ) : (
                    <TruncatedText text={row.document} />
                  )}
                </TableCell>
                <TableCell
                  className="overflow-hidden"
                  style={{ width: ACTIVITY_COLUMNS[1].width }}
                  onClick={(event) => handleCellClick(event, row, "type")}
                >
                  {isWrapped(row.id, "type") ? (
                    <span className="block whitespace-normal break-words">
                      {row.type}
                    </span>
                  ) : (
                    <TruncatedText text={row.type} />
                  )}
                </TableCell>
                <TableCell
                  className="overflow-hidden"
                  style={{ width: ACTIVITY_COLUMNS[2].width }}
                  onClick={(event) => handleCellClick(event, row, "date")}
                >
                  {isWrapped(row.id, "date") ? (
                    <span className="block whitespace-normal break-words">
                      {row.date}
                    </span>
                  ) : (
                    <TruncatedText text={row.date} />
                  )}
                </TableCell>
                <TableCell
                  className="overflow-hidden"
                  style={{ width: ACTIVITY_COLUMNS[3].width }}
                  onClick={(event) => handleCellClick(event, row, "score")}
                >
                  {row.score}
                </TableCell>
                <TableCell
                  className="overflow-hidden px-4"
                  style={{ width: ACTIVITY_COLUMNS[4].width }}
                  onClick={(event) => handleCellClick(event, row, "status")}
                >
                  {row.status === "—" ? (
                    "—"
                  ) : (
                    <ActivityStatus status={row.status} />
                  )}
                </TableCell>
              </TableRow>
              {expandable && row.detail ? (
                <TableRow
                  className={cn("hover:bg-transparent", !open && "hidden")}
                >
                  <TableCell colSpan={5} className="max-w-none overflow-visible whitespace-normal p-0">
                    <Collapsible open={open}>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-1">
                          <p className="text-body1 m-0 w-full max-w-lg whitespace-normal text-foreground break-words [overflow-wrap:anywhere]">
                            {row.detail}
                          </p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
    </TooltipProvider>
  );
}
