"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityTable,
  type ActivityRow,
} from "@/components/activity-table/activity-table";
import {
  DashboardToolbar,
  filterActivityRows,
  type DashboardToolbarValues,
} from "@/components/dashboard/dashboard-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DASHBOARD_CARD_CLASS } from "@/lib/page-layout";

const PAGE_SIZE_OPTIONS = [3, 5, 10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 5;
/** Locked viewport: exactly this many body rows fit the card. */
const LOCKED_VISIBLE_ROWS = 5;
/** Demo catalog size for pagination chrome when fewer stored reports exist. */
const DEMO_TOTAL_RESULTS = 194;
/** Fallback row height before the first paint measurement (matches py-3 cells). */
const ESTIMATED_ROW_HEIGHT = 49;
const ESTIMATED_THEAD_HEIGHT = 41;
const ESTIMATED_TOOLBAR_HEIGHT = 57;
const ESTIMATED_FOOTER_HEIGHT = 57;

const INITIAL_FILTERS: DashboardToolbarValues = {
  search: "",
  type: "all",
  status: "all",
  dateRange: "all",
};

/** Seeded first-page demos for the default 5-row viewport. */
const SEED_ACTIVITY_ROWS: ActivityRow[] = [
  {
    id: "demo-activity-0",
    document: "d4463c58-f981-45cf-ac12…",
    type: "SOP",
    date: new Date(Date.UTC(2026, 8, 19, 5, 50, 44)).toLocaleString(),
    score: "85",
    status: "Partial",
  },
  {
    id: "demo-activity-1",
    document: "a91e2b07-3c44-4d1a-9f08…",
    type: "SOP",
    date: new Date(Date.UTC(2026, 8, 19, 5, 49, 44)).toLocaleString(),
    score: "85",
    status: "Partial",
  },
  {
    id: "demo-activity-2",
    document: "7c0f18e2-bb5a-4e91-82d3…",
    type: "SOP",
    date: new Date(Date.UTC(2026, 8, 19, 5, 48, 44)).toLocaleString(),
    score: "85",
    status: "Partial",
  },
  {
    id: "demo-activity-3",
    document: "e2b4d901-6a17-48c0-b5fe…",
    type: "SOP",
    date: new Date(Date.UTC(2026, 8, 19, 5, 47, 44)).toLocaleString(),
    score: "85",
    status: "Partial",
  },
  {
    id: "demo-activity-4",
    document: "5f83a1c0-29de-4b6f-91aa…",
    type: "SOP",
    date: new Date(Date.UTC(2026, 8, 19, 5, 46, 44)).toLocaleString(),
    score: "85",
    status: "Partial",
  },
];

function padActivityRows(rows: ActivityRow[], targetCount: number): ActivityRow[] {
  const seeded =
    rows.length > 0
      ? rows
      : SEED_ACTIVITY_ROWS.slice(
          0,
          Math.min(SEED_ACTIVITY_ROWS.length, targetCount),
        );
  if (seeded.length >= targetCount) return seeded;
  const padded = [...seeded];
  for (let index = padded.length; index < targetCount; index += 1) {
    const seed = (index + 1).toString(16).padStart(8, "0");
    padded.push({
      id: `demo-activity-${index}`,
      document: `${seed}${seed}${seed.slice(0, 4)}…`,
      type: index % 3 === 0 ? "BPR" : index % 5 === 0 ? "FIR" : "SOP",
      date: new Date(
        Date.UTC(2026, 8, 19, 5, 50 - (index % 40), 44),
      ).toLocaleString(),
      score: String(80 + (index % 15)),
      status: index % 7 === 0 ? "Compliant" : "Partial",
    });
  }
  return padded;
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

function estimateLockedCardHeight() {
  return (
    ESTIMATED_TOOLBAR_HEIGHT +
    ESTIMATED_THEAD_HEIGHT +
    LOCKED_VISIBLE_ROWS * ESTIMATED_ROW_HEIGHT +
    ESTIMATED_FOOTER_HEIGHT
  );
}

export default function RecentActivity({
  rows,
  className,
}: {
  rows: ActivityRow[];
  className?: string;
}) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<DashboardToolbarValues>(INITIAL_FILTERS);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [cardHeight, setCardHeight] = useState(estimateLockedCardHeight);
  const [tableViewportHeight, setTableViewportHeight] = useState(
    ESTIMATED_THEAD_HEIGHT + LOCKED_VISIBLE_ROWS * ESTIMATED_ROW_HEIGHT,
  );

  const catalog = useMemo(() => {
    const padded = padActivityRows(rows, Math.max(DEMO_TOTAL_RESULTS, pageSize));
    return filterActivityRows(padded, filters);
  }, [rows, pageSize, filters]);

  const totalCount = catalog.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = catalog.slice(pageStart, pageStart + pageSize);
  const pageItems = buildPageItems(currentPage, totalPages);

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  useLayoutEffect(() => {
    const toolbarH =
      toolbarRef.current?.getBoundingClientRect().height ??
      ESTIMATED_TOOLBAR_HEIGHT;
    const footerH =
      footerRef.current?.getBoundingClientRect().height ??
      ESTIMATED_FOOTER_HEIGHT;
    const thead = tableWrapRef.current?.querySelector("thead");
    const sampleRow = tableWrapRef.current?.querySelector("tbody tr");
    const theadH =
      thead?.getBoundingClientRect().height ?? ESTIMATED_THEAD_HEIGHT;
    const rowH =
      sampleRow?.getBoundingClientRect().height || ESTIMATED_ROW_HEIGHT;

    const bodyH = Math.ceil(LOCKED_VISIBLE_ROWS * rowH);
    const viewportH = Math.ceil(theadH + bodyH);
    const nextCardHeight = Math.ceil(toolbarH + viewportH + footerH);

    setTableViewportHeight((current) =>
      current === viewportH ? current : viewportH,
    );
    setCardHeight((current) =>
      current === nextCardHeight ? current : nextCardHeight,
    );
  }, [pageRows.length, pageSize]);

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value));
    setPage(1);
  }

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden",
        DASHBOARD_CARD_CLASS,
        className,
      )}
      style={{ height: cardHeight, minHeight: cardHeight }}
    >
      <CardContent className="flex h-full min-h-0 flex-col p-0">
        <div ref={toolbarRef} className="shrink-0 border-b border-zinc-200">
          <DashboardToolbar
            embedded
            value={filters}
            onChange={setFilters}
          />
        </div>

        {catalog.length === 0 ? (
          <p className="text-body1 m-0 px-4 py-4 text-muted-foreground">
            No audits match the current search and filters.
          </p>
        ) : (
          <>
            <div
              ref={tableWrapRef}
              className="min-h-0 shrink-0 overflow-auto"
              style={{ height: tableViewportHeight }}
            >
              <ActivityTable rows={pageRows} />
            </div>

            <div
              ref={footerRef}
              className="mt-auto flex shrink-0 flex-col gap-3 border-t border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="m-0 text-sm text-black">
                Showing {pageRows.length} of {totalCount} results
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-black">Show</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger
                    aria-label="Rows per page"
                    className="h-8 w-[4.5rem] rounded-md border-zinc-200 px-2 text-sm text-black"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <nav
                className="flex h-8 flex-wrap items-center gap-1"
                aria-label="Activity table pagination"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8! min-h-8! px-2 text-sm font-medium text-black hover:bg-zinc-100"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Prev
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
                          ? "bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white"
                          : "text-black hover:bg-zinc-100",
                      )}
                      aria-current={item === currentPage ? "page" : undefined}
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </Button>
                  ),
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8! min-h-8! px-2 text-sm font-medium text-black hover:bg-zinc-100"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  Next
                </Button>
              </nav>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
