"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  ACTIVITY_COLUMNS,
  ActivityTable,
  type ActivityRow,
} from "@/components/activity-table/activity-table";
import {
  CardActionsMenu,
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
  DASHBOARD_MENU_ITEM_SELECTED_CLASS,
  TABLE_CARD_MENU_ACTIONS,
} from "@/components/dashboard/card-actions-menu";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  CARD_SECTION_EYEBROW_CLASS,
  DASHBOARD_CARD_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [3, 5, 10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

/** Match ActivityTable `table-fixed` + colgroup so footer locks to the same grid. */
const ACTIVITY_TABLE_MIN_WIDTH_CLASS = "min-w-[42rem]";
const FOOTER_DOCUMENT_COL_WIDTH = ACTIVITY_COLUMNS[0].width;
const FOOTER_GRID_TEMPLATE = `${FOOTER_DOCUMENT_COL_WIDTH} minmax(0,1fr)`;

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
      className="inline-flex h-8 w-[4.5rem] items-center justify-between gap-1 rounded-md border border-zinc-200 bg-sidebar-muted/40 px-2 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:border-zinc-400 hover:bg-zinc-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span>{pageSize}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-neutral-900" aria-hidden />
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

function ReportsPaginationNav({
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
      aria-label="Audit reports pagination"
    >
      <Button
        type="button"
        variant="ghost"
        className="h-8! min-h-8! rounded-md px-2 text-sm font-medium text-neutral-500 shadow-none hover:bg-zinc-100 hover:text-neutral-900"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        Previous
      </Button>
      {pageItems.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-8 items-center px-1 text-sm text-neutral-900"
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
                ? "bg-neutral-800 text-white hover:bg-neutral-800 hover:text-white"
                : "text-neutral-900 hover:bg-zinc-100",
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
        className="h-8! min-h-8! rounded-md px-2 text-sm font-medium text-neutral-500 shadow-none hover:bg-zinc-100 hover:text-neutral-900"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </Button>
    </nav>
  );
}

export default function ReportsTableCard({
  rows,
  className,
}: {
  rows: ActivityRow[];
  className?: string;
}) {
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [menusMounted, setMenusMounted] = useState(false);

  useEffect(() => {
    setMenusMounted(true);
  }, []);

  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(pageStart, pageStart + pageSize);
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
        <div className="relative shrink-0 border-b border-zinc-200 px-4 pt-[16px] pb-3">
          <div className="min-w-0 pr-10">
            <p className={CARD_SECTION_EYEBROW_CLASS}>Audit Reports</p>
            <p className="text-body1 m-0 mt-1 text-neutral-600">
              Completed SOP, BPR, and FIR audits with scores and status.
            </p>
          </div>
          <div className="absolute top-3 right-3">
            <CardActionsMenu
              label="Audit Reports"
              actions={TABLE_CARD_MENU_ACTIONS}
            />
          </div>
        </div>

        {totalCount === 0 ? (
          <p className="text-body1 m-0 px-4 py-4 text-muted-foreground">
            No stored reports yet. Run an SOP, BPR, or FIR audit to populate
            this list.
          </p>
        ) : (
          <div
            className="flex shrink-0 flex-col"
            style={{ overflowAnchor: "none" }}
          >
            <ActivityTable rows={pageRows} expandable />

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
                <ReportsPaginationNav
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
                  ACTIVITY_TABLE_MIN_WIDTH_CLASS,
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
                  <ReportsPaginationNav
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
        )}
      </CardContent>
    </Card>
  );
}
