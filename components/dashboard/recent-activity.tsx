"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  ActivityTable,
  type ActivityRow,
} from "@/components/activity-table/activity-table";
import {
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
  DASHBOARD_MENU_ITEM_SELECTED_CLASS,
} from "@/components/dashboard/card-actions-menu";
import {
  DashboardToolbar,
  filterActivityRows,
  type DashboardToolbarValues,
} from "@/components/dashboard/dashboard-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_CARD_CLASS,
  RECENT_ACTIVITY_CARD_HEIGHT_CLASS,
} from "@/lib/page-layout";

const PAGE_SIZE_OPTIONS = [3, 5, 10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 5;
/** Demo catalog size for pagination chrome when fewer stored reports exist. */
const DEMO_TOTAL_RESULTS = 194;

/** Stable SSR/CSR date string — avoid `toLocaleString()` hydration drift. */
function formatDemoDate(utcMinutesOffset: number) {
  const minutes = 50 - utcMinutesOffset;
  const mm = String(Math.max(0, minutes)).padStart(2, "0");
  return `9/19/2026, 1:${mm}:44 AM`;
}

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
    date: formatDemoDate(0),
    score: "85",
    status: "Partial",
  },
  {
    id: "demo-activity-1",
    document: "a91e2b07-3c44-4d1a-9f08…",
    type: "SOP",
    date: formatDemoDate(1),
    score: "85",
    status: "Partial",
  },
  {
    id: "demo-activity-2",
    document: "7c0f18e2-bb5a-4e91-82d3…",
    type: "SOP",
    date: formatDemoDate(2),
    score: "85",
    status: "Partial",
  },
  {
    id: "demo-activity-3",
    document: "e2b4d901-6a17-48c0-b5fe…",
    type: "SOP",
    date: formatDemoDate(3),
    score: "85",
    status: "Partial",
  },
  {
    id: "demo-activity-4",
    document: "5f83a1c0-29de-4b6f-91aa…",
    type: "SOP",
    date: formatDemoDate(4),
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
      date: formatDemoDate(index % 40),
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

export default function RecentActivity({
  rows,
  className,
}: {
  rows: ActivityRow[];
  className?: string;
}) {
  const [filters, setFilters] = useState<DashboardToolbarValues>(INITIAL_FILTERS);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [menusMounted, setMenusMounted] = useState(false);

  useEffect(() => {
    setMenusMounted(true);
  }, []);

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

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value));
    setPage(1);
  }

  return (
    <Card
      className={cn(
        "flex shrink-0 flex-col overflow-hidden",
        RECENT_ACTIVITY_CARD_HEIGHT_CLASS,
        DASHBOARD_CARD_CLASS,
        className,
      )}
    >
      <CardContent className="flex h-full min-h-0 flex-col p-0">
        <div className="shrink-0 border-b border-zinc-200">
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
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
              <ActivityTable rows={pageRows} />
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="m-0 text-sm text-black">
                Showing {pageRows.length} of {totalCount} results
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-black">Show</span>
                {menusMounted ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Rows per page"
                        className="inline-flex h-8 w-[4.5rem] items-center justify-between gap-1 rounded-md border border-zinc-200 bg-white px-2 text-sm font-medium text-black"
                      >
                        <span>{pageSize}</span>
                        <ChevronDown
                          className="h-4 w-4 shrink-0 text-black"
                          aria-hidden
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={6}
                      className={DASHBOARD_MENU_CONTENT_CLASS}
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
                              handlePageSizeChange(String(size));
                            }}
                          >
                            {size}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button
                    type="button"
                    aria-label="Rows per page"
                    className="inline-flex h-8 w-[4.5rem] items-center justify-between gap-1 rounded-md border border-zinc-200 bg-white px-2 text-sm font-medium text-black"
                  >
                    <span>{pageSize}</span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-black"
                      aria-hidden
                    />
                  </button>
                )}
              </div>

              <nav
                className="flex h-8 flex-wrap items-center gap-1"
                aria-label="Activity table pagination"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8! min-h-8! px-2 text-sm font-medium text-zinc-500 shadow-none transition-colors duration-150 hover:bg-transparent hover:text-zinc-900"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
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
                      onClick={() => setPage(item)}
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
