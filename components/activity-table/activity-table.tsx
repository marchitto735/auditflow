"use client";

import { Fragment, useState, type MouseEvent, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const ACTIVITY_COLUMNS = [
  { key: "document", label: "Document", headerClassName: "px-6 w-[30%]", width: "30%" },
  { key: "type", label: "Type", width: "15%" },
  { key: "date", label: "Date", width: "25%" },
  { key: "score", label: "Score", width: "15%" },
  { key: "status", label: "Status", headerClassName: "px-6 w-[15%]", width: "15%" },
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

export function activityStatusLabel(status: string | null | undefined) {
  const value = (status ?? "").toLowerCase();
  if (value.includes("critical")) return "Critical";
  if (value.includes("compliant") && !value.includes("partial")) {
    return "Compliant";
  }
  if (value.includes("partial")) return "Partial";
  if (!value.trim()) return "—";
  return status!.trim();
}

export function statusBadgeClass(status: string | null | undefined) {
  const label = activityStatusLabel(status);
  if (label === "Compliant") {
    return "bg-[oklch(93%_0.05_145)] text-[oklch(32%_0.08_145)]";
  }
  if (label === "Critical") {
    return "bg-[oklch(93%_0.05_25)] text-[oklch(38%_0.12_25)]";
  }
  return "bg-[oklch(96%_0.06_95)] text-[oklch(42%_0.1_85)]";
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
                  className="overflow-hidden px-6 font-medium"
                  style={{ width: ACTIVITY_COLUMNS[0].width }}
                  title={row.document}
                  onClick={(event) =>
                    handleCellClick(event, row, "document")
                  }
                >
                  <span
                    className={cn(
                      "block",
                      isWrapped(row.id, "document")
                        ? "whitespace-normal break-words"
                        : "truncate",
                    )}
                  >
                    {row.document}
                  </span>
                </TableCell>
                <TableCell
                  className="overflow-hidden"
                  style={{ width: ACTIVITY_COLUMNS[1].width }}
                  title={row.type}
                  onClick={(event) => handleCellClick(event, row, "type")}
                >
                  <span
                    className={cn(
                      "block",
                      isWrapped(row.id, "type")
                        ? "whitespace-normal break-words"
                        : "truncate",
                    )}
                  >
                    {row.type}
                  </span>
                </TableCell>
                <TableCell
                  className="overflow-hidden"
                  style={{ width: ACTIVITY_COLUMNS[2].width }}
                  title={row.date}
                  onClick={(event) => handleCellClick(event, row, "date")}
                >
                  <span
                    className={cn(
                      "block",
                      isWrapped(row.id, "date")
                        ? "whitespace-normal break-words"
                        : "truncate",
                    )}
                  >
                    {row.date}
                  </span>
                </TableCell>
                <TableCell
                  className="overflow-hidden"
                  style={{ width: ACTIVITY_COLUMNS[3].width }}
                  onClick={(event) => handleCellClick(event, row, "score")}
                >
                  {row.score}
                </TableCell>
                <TableCell
                  className="overflow-hidden px-6"
                  style={{ width: ACTIVITY_COLUMNS[4].width }}
                  onClick={(event) => handleCellClick(event, row, "status")}
                >
                  {row.status === "—" ? (
                    "—"
                  ) : (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "border-0 font-medium",
                        statusBadgeClass(row.status),
                      )}
                    >
                      {activityStatusLabel(row.status)}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
              {expandable && row.detail ? (
                <TableRow
                  className={cn("hover:bg-transparent", !open && "hidden")}
                >
                  <TableCell colSpan={5} className="p-0">
                    <Collapsible open={open}>
                      <CollapsibleContent>
                        <p className="text-sm m-0 whitespace-normal px-6 pb-4 pt-1 text-foreground">
                          {row.detail}
                        </p>
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
  );
}
