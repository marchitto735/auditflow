"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
  DASHBOARD_MENU_ITEM_SELECTED_CLASS,
} from "@/components/dashboard/card-actions-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { DASHBOARD_CARD_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [3, 5, 10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 3;
const TABLE_MIN_WIDTH_CLASS = "min-w-[42rem]";
const FOOTER_DOCUMENT_COL_WIDTH = "32%";
const FOOTER_GRID_TEMPLATE = `${FOOTER_DOCUMENT_COL_WIDTH} minmax(0,1fr)`;

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

function queueStatusDotClass(status: string) {
  const value = status.toLowerCase();
  if (value.includes("parsing")) return "bg-amber-500";
  if (value.includes("ready")) return "bg-emerald-500";
  if (value.includes("pending")) return "bg-zinc-400";
  return "bg-zinc-400";
}

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);
  return items;
}

function PageSizeSelector({
  pageSize,
  menusMounted,
  onChange,
  menuAlign = "end",
}: {
  pageSize: number;
  menusMounted: boolean;
  onChange: (value: string) => void;
  menuAlign?: "start" | "center" | "end";
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  function releaseTriggerFocus() {
    triggerRef.current?.blur();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      aria-label="Rows per page"
      className="inline-flex h-8 w-[4.5rem] items-center justify-between gap-1 rounded-md border border-zinc-200 bg-sidebar-muted/40 px-2 text-sm font-medium text-black transition-colors duration-200 hover:border-zinc-400 hover:bg-zinc-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span>{pageSize}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-black" aria-hidden />
    </button>
  );

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="text-sm text-muted-foreground">Rows per page:</span>
      {menusMounted ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          <DropdownMenuContent
            align={menuAlign}
            sideOffset={6}
            className={DASHBOARD_MENU_CONTENT_CLASS}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              releaseTriggerFocus();
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => {
              const isSelected = size === pageSize;
              return (
                <DropdownMenuItem
                  key={size}
                  className={cn(
                    DASHBOARD_MENU_ITEM_CLASS,
                    isSelected && DASHBOARD_MENU_ITEM_SELECTED_CLASS,
                  )}
                  onSelect={() => {
                    releaseTriggerFocus();
                    onChange(String(size));
                  }}
                >
                  {size}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        trigger
      )}
    </div>
  );
}

function QueuePaginationNav({
  pageItems,
  currentPage,
  totalPages,
  onPageChange,
  className,
}: {
  pageItems: Array<number | "ellipsis">;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  return (
    <nav
      className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      aria-label="Execution queue pagination"
    >
      <Button
        type="button"
        variant="ghost"
        className="h-8! min-h-8! px-2 text-sm font-medium text-zinc-500 shadow-none transition-colors duration-150 hover:bg-transparent hover:text-zinc-900"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        Previous
      </Button>
      {pageItems.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-8 items-center px-1 text-sm text-black"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant="ghost"
            className={cn(
              "h-8! min-h-8! w-8! rounded-md p-0! text-sm font-medium",
              item === currentPage
                ? "bg-zinc-500 text-white hover:bg-zinc-400 hover:text-white"
                : "text-black hover:bg-zinc-100",
            )}
            aria-current={item === currentPage ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        type="button"
        variant="ghost"
        className="h-8! min-h-8! px-2 text-sm font-medium text-zinc-500 shadow-none transition-colors duration-150 hover:bg-transparent hover:text-zinc-900"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </Button>
    </nav>
  );
}

function QueueStatus({ status }: { status: string }) {
  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-2 text-foreground">
      <span
        className={cn("size-2.5 shrink-0 rounded-full", queueStatusDotClass(status))}
        aria-hidden
      />
      <span className="min-w-0 truncate">{status}</span>
    </span>
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
            <TableRow key={row.id} className={cn(BODY_ROW_CLASS, "hover:bg-transparent")}>
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
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [menusMounted, setMenusMounted] = useState(false);

  useEffect(() => {
    setMenusMounted(true);
  }, []);

  const catalog = useMemo(() => SEED_QUEUE_ROWS, []);
  const totalCount = catalog.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = catalog.slice(pageStart, pageStart + pageSize);
  const pageItems = buildPageItems(currentPage, totalPages);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

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
        <div className="flex shrink-0 flex-col" style={{ overflowAnchor: "none" }}>
          <ExecutionQueueTable rows={pageRows} />

          <div className="relative z-20 shrink-0 border-t-0 bg-white py-3 shadow-[0_-1px_0_0_var(--border)]">
            <div className="flex flex-col gap-3 px-4 md:hidden">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="m-0 min-w-0 text-sm text-muted-foreground">
                  Showing {pageRows.length} of {totalCount} results
                </p>
                <PageSizeSelector
                  pageSize={pageSize}
                  menusMounted={menusMounted}
                  onChange={handlePageSizeChange}
                  menuAlign="start"
                />
              </div>
              <QueuePaginationNav
                pageItems={pageItems}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                className="justify-center"
              />
            </div>

            <div
              className={cn(
                "hidden w-full items-center md:grid",
                TABLE_MIN_WIDTH_CLASS,
              )}
              style={{ gridTemplateColumns: FOOTER_GRID_TEMPLATE }}
            >
              <p className="m-0 px-4 text-sm text-muted-foreground">
                Showing {pageRows.length} of {totalCount} results
              </p>
              <div className="flex min-w-0 items-center justify-between gap-4 px-4">
                <PageSizeSelector
                  pageSize={pageSize}
                  menusMounted={menusMounted}
                  onChange={handlePageSizeChange}
                  menuAlign="start"
                />
                <QueuePaginationNav
                  pageItems={pageItems}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  className="shrink-0 justify-end"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
