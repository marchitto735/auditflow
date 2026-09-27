"use client";

import { useEffect, useMemo, useState } from "react";
import { useConfigureAudit } from "@/components/configure-audit-modal/configure-audit-context";
import { CardActionsMenu } from "@/components/dashboard/card-actions-menu";
import {
  DashboardToolbar,
  type DashboardToolbarValues,
} from "@/components/dashboard/dashboard-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePaginationBar,
  TableRow,
} from "@/components/ui/table";
import { TruncatedText } from "@/components/ui/truncated-text";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  CARD_SECTION_EYEBROW_CLASS,
  DASHBOARD_CARD_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 3;
const TABLE_MIN_WIDTH_CLASS = "min-w-[42rem]";

const QUEUE_MENU_ACTIONS = [
  "Export CSV",
  "Export PDF",
  "Refresh",
  "Clear filters",
] as const;

const INITIAL_FILTERS: DashboardToolbarValues = {
  search: "",
  type: "all",
  status: "all",
  dateRange: "all",
};

const CELL_X_PAD_CLASS = "px-4";
const HEADER_CELL_CLASS = cn(CELL_X_PAD_CLASS, "h-10");
const BODY_CELL_CLASS = cn(CELL_X_PAD_CLASS, "h-12 py-0");
const BODY_ROW_CLASS = "h-12 border-0";
const STICKY_HEADER_DIVIDER_CLASS =
  "border-b-0 shadow-[0_1px_0_0_var(--border)] [&_tr]:border-b-0";

const QUEUE_COLUMNS = [
  {
    key: "document",
    label: "Document",
    width: "32%",
    minWidth: "12rem",
    widthClass: "w-[32%] min-w-[12rem]",
  },
  {
    key: "type",
    label: "Type",
    width: "22%",
    minWidth: "8rem",
    widthClass: "w-[22%] min-w-[8rem]",
  },
  {
    key: "queueStatus",
    label: "Queue Status",
    width: "28%",
    minWidth: "10rem",
    widthClass: "w-[28%] min-w-[10rem]",
  },
  {
    key: "estTime",
    label: "Est. Time",
    width: "18%",
    minWidth: "5rem",
    widthClass: "w-[18%] min-w-[5rem]",
  },
] as const;

type QueueRow = {
  id: string;
  document: string;
  type: string;
  queueStatus: string;
  estTime: string;
};

const SEED_QUEUE_ROWS: QueueRow[] = [
  {
    id: "queue-0",
    document: "SOP-8490-Rev4.pdf",
    type: "Standard Workflow",
    queueStatus: "Ready (In Queue)",
    estTime: "~4s",
  },
  {
    id: "queue-1",
    document: "BPR-Batch-2026-A.csv",
    type: "Production Log",
    queueStatus: "Parsing Chunks",
    estTime: "~12s",
  },
  {
    id: "queue-2",
    document: "FIR-Facility-East-Q3.docx",
    type: "Site Audit",
    queueStatus: "Pending Upload",
    estTime: "—",
  },
  {
    id: "queue-3",
    document: "SOP-Cleaning-Line-B.pdf",
    type: "Standard Workflow",
    queueStatus: "Ready (In Queue)",
    estTime: "~6s",
  },
  {
    id: "queue-4",
    document: "BPR-Lot-7781.xlsx",
    type: "Production Log",
    queueStatus: "Parsing Chunks",
    estTime: "~9s",
  },
  {
    id: "queue-5",
    document: "FIR-Warehouse-North.docx",
    type: "Site Audit",
    queueStatus: "Ready (In Queue)",
    estTime: "~5s",
  },
  {
    id: "queue-6",
    document: "SOP-Changeover-Pack.pdf",
    type: "Standard Workflow",
    queueStatus: "Pending Upload",
    estTime: "—",
  },
  {
    id: "queue-7",
    document: "BPR-Campaign-14.csv",
    type: "Production Log",
    queueStatus: "Ready (In Queue)",
    estTime: "~8s",
  },
  {
    id: "queue-8",
    document: "FIR-Cleanroom-A2.docx",
    type: "Site Audit",
    queueStatus: "Parsing Chunks",
    estTime: "~11s",
  },
  {
    id: "queue-9",
    document: "SOP-Labeling-Control.pdf",
    type: "Standard Workflow",
    queueStatus: "Ready (In Queue)",
    estTime: "~3s",
  },
  {
    id: "queue-10",
    document: "BPR-Yield-Recalc.xlsx",
    type: "Production Log",
    queueStatus: "Pending Upload",
    estTime: "—",
  },
  {
    id: "queue-11",
    document: "FIR-Utilities-Round.docx",
    type: "Site Audit",
    queueStatus: "Ready (In Queue)",
    estTime: "~7s",
  },
];

function queueDocumentType(document: string): "SOP" | "BPR" | "FIR" | null {
  if (document.startsWith("SOP")) return "SOP";
  if (document.startsWith("BPR")) return "BPR";
  if (document.startsWith("FIR")) return "FIR";
  return null;
}

function filterQueueRows(
  rows: QueueRow[],
  filters: DashboardToolbarValues,
): QueueRow[] {
  const query = filters.search.trim().toLowerCase();

  return rows.filter((row) => {
    if (
      filters.type !== "all" &&
      queueDocumentType(row.document) !== filters.type
    ) {
      return false;
    }

    const status = row.queueStatus.toLowerCase();
    if (filters.status === "Compliant" && !status.includes("ready")) {
      return false;
    }
    if (filters.status === "Partial" && !status.includes("parsing")) {
      return false;
    }
    if (filters.status === "Critical" && !status.includes("pending")) {
      return false;
    }

    if (query) {
      const haystack =
        `${row.document} ${row.type} ${row.queueStatus} ${row.id}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

function queueStatusBadgeVariant(status: string) {
  const value = status.toLowerCase();
  if (value.includes("ready")) return "success" as const;
  if (value.includes("pending")) return "warning" as const;
  if (value.includes("parsing")) return "warning" as const;
  return "outline" as const;
}

function QueueStatus({ status }: { status: string }) {
  return (
    <Badge variant={queueStatusBadgeVariant(status)}>{status}</Badge>
  );
}

function ExecutionQueueTable({ rows }: { rows: QueueRow[] }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Table
        className="w-full min-w-[42rem] table-fixed border-separate border-spacing-0"
        containerClassName="overflow-visible"
      >
        <colgroup>
          {QUEUE_COLUMNS.map((column) => (
            <col
              key={column.key}
              className={column.widthClass}
              style={{ width: column.width, minWidth: column.minWidth }}
            />
          ))}
        </colgroup>
        <TableHeader
          className={cn("sticky top-0 z-20 bg-white", STICKY_HEADER_DIVIDER_CLASS)}
        >
          <TableRow className="border-0 bg-white hover:bg-transparent">
            {QUEUE_COLUMNS.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  HEADER_CELL_CLASS,
                  column.widthClass,
                  "sticky top-0 z-20 border-b-0 bg-white text-left",
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody
          className={cn(
            "divide-y divide-border border-b-0",
            "[&>tr:not(:first-child)>td]:border-t [&>tr:not(:first-child)>td]:border-border",
          )}
        >
          {rows.map((row) => (
            <TableRow key={row.id} className={cn(BODY_ROW_CLASS, "hover:bg-neutral-50")}>
              <TableCell
                className={cn(
                  BODY_CELL_CLASS,
                  QUEUE_COLUMNS[0].widthClass,
                  "max-w-0 overflow-hidden text-left",
                )}
              >
                <TruncatedText text={row.document} />
              </TableCell>
              <TableCell
                className={cn(
                  BODY_CELL_CLASS,
                  QUEUE_COLUMNS[1].widthClass,
                  "max-w-0 overflow-hidden text-left",
                )}
              >
                <TruncatedText text={row.type} />
              </TableCell>
              <TableCell
                className={cn(
                  BODY_CELL_CLASS,
                  QUEUE_COLUMNS[2].widthClass,
                  "max-w-0 overflow-hidden text-left",
                )}
              >
                <QueueStatus status={row.queueStatus} />
              </TableCell>
              <TableCell
                className={cn(
                  BODY_CELL_CLASS,
                  QUEUE_COLUMNS[3].widthClass,
                  "text-left font-mono tabular-nums",
                )}
              >
                {row.estTime}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}

/**
 * Active Execution Queue — Audits page table matching Dashboard History chrome.
 */
export default function ActiveExecutionQueue({
  className,
}: {
  className?: string;
}) {
  const { openConfigureAudit } = useConfigureAudit();
  const [filters, setFilters] = useState<DashboardToolbarValues>(INITIAL_FILTERS);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);

  const catalog = useMemo(
    () => filterQueueRows(SEED_QUEUE_ROWS, filters),
    [filters],
  );
  const totalCount = catalog.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = catalog.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  function handlePageSizeChange(value: string) {
    const scrollY = window.scrollY;
    setPageSize(Number(value));
    setPage(1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    });
  }

  return (
    <Card
      className={cn(
        "flex shrink-0 flex-col overflow-hidden",
        DASHBOARD_CARD_CLASS,
        className,
      )}
    >
      <CardContent className="flex flex-col p-0">
        <div className="relative flex shrink-0 flex-col gap-3 border-b border-zinc-200 px-4 pt-[16px] pb-3">
          <div className="min-w-0 pr-10">
            <p className={CARD_SECTION_EYEBROW_CLASS}>Execution Queue</p>
            <p className="m-0 mt-2 text-base font-normal text-neutral-600">
              Documents waiting to run, parsing, or pending upload.
            </p>
          </div>
          <div className="absolute top-3 right-3">
            <CardActionsMenu
              label="Execution Queue"
              actions={QUEUE_MENU_ACTIONS}
              onAction={(action) => {
                if (action === "Clear filters") {
                  setFilters(INITIAL_FILTERS);
                }
              }}
            />
          </div>
          <DashboardToolbar
            embedded
            className="px-0 py-0"
            value={filters}
            onChange={setFilters}
            action={
              <Button
                type="button"
                variant="black"
                className="h-9! min-h-9! shrink-0 gap-1.5 rounded-md px-3 text-sm"
                onClick={() => openConfigureAudit(null)}
              >
                Run next
              </Button>
            }
          />
        </div>

        {catalog.length === 0 ? (
          <p className="text-body1 m-0 px-4 py-4 text-muted-foreground">
            No queue items match the current search and filters.
          </p>
        ) : (
          <div
            className="flex shrink-0 flex-col"
            style={{ overflowAnchor: "none" }}
          >
            <ExecutionQueueTable rows={pageRows} />

            <TablePaginationBar
              className={TABLE_MIN_WIDTH_CLASS}
              pageRowsCount={pageRows.length}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              paginationLabel="Execution queue pagination"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
