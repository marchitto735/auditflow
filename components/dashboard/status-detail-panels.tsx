"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  CardActionsMenu,
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
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART, scoreFillClass, severityDotClass } from "@/lib/chart-tokens";
import {
  GMP_THRESHOLD,
  OPEN_FINDINGS,
  SCORE_CATEGORIES,
  SCORE_TRENDS,
  type FindingSeverity,
} from "@/lib/dashboard-insights";
import {
  CARD_SECTION_EYEBROW_CLASS,
  DASHBOARD_CARD_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const SEVERITY_ORDER: FindingSeverity[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

const PAGE_SIZE_OPTIONS = [3, 5, 10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 3;
const FINDINGS_TABLE_MIN_WIDTH_CLASS = "min-w-[36rem]";
const FOOTER_FINDING_COL_WIDTH = "40%";
const FOOTER_GRID_TEMPLATE = `${FOOTER_FINDING_COL_WIDTH} minmax(0,1fr)`;

const FINDINGS_MENU_ACTIONS = [
  "Export CSV",
  "Export PDF",
  "Refresh",
] as const;

const SORTED_FINDINGS = [...OPEN_FINDINGS].sort(
  (a, b) =>
    SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
);

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

function FindingsPaginationNav({
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
      aria-label="Priority findings pagination"
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

function SeverityStatus({ severity }: { severity: FindingSeverity }) {
  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-2 text-foreground">
      <span
        className={cn("size-2.5 shrink-0 rounded-full", severityDotClass(severity))}
        aria-hidden
      />
      <span className="min-w-0 truncate">{severity}</span>
    </span>
  );
}

/** Read-only findings table — Critical/High first, static dashboard display. */
export function FindingsSummaryPanel({ className }: { className?: string }) {
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [menusMounted, setMenusMounted] = useState(false);

  useEffect(() => {
    setMenusMounted(true);
  }, []);

  const catalog = SORTED_FINDINGS;
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
        "flex h-full min-h-0 flex-col overflow-hidden",
        DASHBOARD_CARD_CLASS,
        className,
      )}
    >
      <CardContent className="flex h-full min-h-0 flex-col p-0">
        <div className="relative shrink-0 border-b border-zinc-200 px-4 pt-[16px] pb-3">
          <div className="min-w-0 pr-10">
            <p className={CARD_SECTION_EYEBROW_CLASS}>Priority Findings</p>
            <p className="text-body1 m-0 mt-1 text-zinc-600">
              Highest-severity open items across active audits.
            </p>
          </div>
          <div className="absolute top-3 right-3">
            <CardActionsMenu
              label="Priority Findings"
              actions={FINDINGS_MENU_ACTIONS}
            />
          </div>
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col"
          style={{ overflowAnchor: "none" }}
        >
          <div className="min-h-0 flex-1 overflow-x-auto">
            <Table
              className={cn(
                "w-full table-fixed border-separate border-spacing-0",
                FINDINGS_TABLE_MIN_WIDTH_CLASS,
              )}
              containerClassName="overflow-visible"
            >
              <colgroup>
                <col
                  className="w-[40%] min-w-[12rem]"
                  style={{ width: "40%" }}
                />
                <col
                  className="w-[22%] min-w-[8rem]"
                  style={{ width: "22%" }}
                />
                <col
                  className="w-[16%] min-w-[6rem]"
                  style={{ width: "16%" }}
                />
                <col
                  className="w-[22%] min-w-[7rem]"
                  style={{ width: "22%" }}
                />
              </colgroup>
              <TableHeader className="border-b-0 shadow-[0_1px_0_0_var(--border)] [&_tr]:border-b-0">
                <TableRow className="border-0 bg-white hover:bg-transparent">
                  <TableHead className="h-10 border-b-0 bg-white px-4 text-left">
                    Finding
                  </TableHead>
                  <TableHead className="h-10 border-b-0 bg-white px-4 text-left">
                    Document
                  </TableHead>
                  <TableHead className="h-10 border-b-0 bg-white px-4 text-left">
                    Severity
                  </TableHead>
                  <TableHead className="h-10 border-b-0 bg-white px-4 text-left">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody
                className={cn(
                  "divide-y divide-border border-b-0",
                  "[&>tr:not(:first-child)>td]:border-t [&>tr:not(:first-child)>td]:border-border",
                )}
              >
                {pageRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="h-12 border-0 hover:bg-transparent"
                  >
                    <TableCell className="h-12 px-4 py-0">
                      <TruncatedText text={row.title} />
                    </TableCell>
                    <TableCell className="h-12 px-4 py-0">
                      <TruncatedText text={row.document} />
                    </TableCell>
                    <TableCell className="h-12 px-4 py-0">
                      <SeverityStatus severity={row.severity} />
                    </TableCell>
                    <TableCell className="h-12 px-4 py-0 text-sm text-foreground">
                      {row.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
              <FindingsPaginationNav
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
                FINDINGS_TABLE_MIN_WIDTH_CLASS,
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
                <FindingsPaginationNav
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

/** Read-only category score bars for the command center. */
export function CategoryBreakdownPanel({ className }: { className?: string }) {
  return (
    <Card className={cn(DASHBOARD_CARD_CLASS, "h-full", className)}>
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div>
          <p className={CARD_SECTION_EYEBROW_CLASS}>Category Breakdown</p>
          <p className="text-body1 m-0 mt-1 text-zinc-600">
            GMP threshold {GMP_THRESHOLD}%.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {SCORE_CATEGORIES.map((category) => (
            <div key={category.name}>
              <div className="mb-1 flex items-baseline justify-between gap-4">
                <p className="text-body1 m-0 text-foreground">
                  {category.name}
                </p>
                <p className="text-body1 m-0 font-medium tabular-nums text-foreground">
                  {category.score}%
                </p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-none bg-zinc-200">
                <div
                  className={cn(
                    "h-full rounded-none",
                    scoreFillClass(category.score),
                  )}
                  style={{ width: `${category.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Read-only 90d compliance score trend for the command center. */
export function ComplianceTrendPanel({ className }: { className?: string }) {
  const trend = SCORE_TRENDS[90];

  return (
    <Card className={cn(DASHBOARD_CARD_CLASS, "h-full", className)}>
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div>
          <p className={CARD_SECTION_EYEBROW_CLASS}>Compliance Trend</p>
          <p className="text-body1 m-0 mt-1 text-zinc-600">
            90-day score vs {GMP_THRESHOLD}% GMP standard.
          </p>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...trend]}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: CHART.structuralMuted, fontSize: 12 }}
              />
              <YAxis
                domain={[70, 100]}
                tickLine={false}
                axisLine={false}
                width={32}
                tick={{ fill: CHART.structuralMuted, fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${CHART.track}`,
                  boxShadow: "none",
                  fontSize: 13,
                }}
              />
              <ReferenceLine
                y={GMP_THRESHOLD}
                stroke={CHART.reference}
                strokeDasharray="3 5"
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={CHART.primary}
                strokeWidth={1.75}
                dot={{ r: 2.5, fill: CHART.primary, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
