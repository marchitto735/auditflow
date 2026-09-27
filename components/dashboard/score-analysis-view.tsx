"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  CardActionsMenu,
  CHART_CARD_MENU_ACTIONS,
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
  DASHBOARD_MENU_ITEM_SELECTED_CLASS,
  TABLE_CARD_MENU_ACTIONS,
} from "@/components/dashboard/card-actions-menu";
import {
  CategoryBreakdownPanel,
  ComplianceTrendPanel,
} from "@/components/dashboard/status-detail-panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TruncatedText } from "@/components/ui/truncated-text";
import { severityDotClass } from "@/lib/chart-tokens";
import {
  DEPARTMENT_SCORES,
  VARIANCE_LOG,
  type DepartmentScoreRow,
  type VarianceLogRow,
} from "@/lib/dashboard-insights";
import {
  CARD_SECTION_EYEBROW_CLASS,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_GAP_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const DATE_RANGES = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "365d", label: "Last 12 months" },
  { value: "custom", label: "Custom range" },
] as const;

type DateRange = (typeof DATE_RANGES)[number]["value"];

const DEPARTMENT_FILTERS = [
  { value: "all", label: "All departments" },
  ...DEPARTMENT_SCORES.map((row) => ({
    value: row.id,
    label: row.department,
  })),
] as const;

type DepartmentFilter = (typeof DEPARTMENT_FILTERS)[number]["value"];

const PAGE_SIZE_OPTIONS = [3, 5, 10, 25] as const;
const DEFAULT_PAGE_SIZE = 3;

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
  const triggerRef = React.useRef<HTMLButtonElement>(null);

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
      className="inline-flex h-8 w-[4.5rem] items-center justify-between gap-1 rounded-md border border-neutral-200 bg-white px-2 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:border-neutral-400 hover:bg-neutral-50 data-[state=open]:border-neutral-400 data-[state=open]:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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

function AnalyticsPaginationNav({
  pageItems,
  currentPage,
  totalPages,
  onPageChange,
  label,
  className,
}: {
  pageItems: Array<number | "ellipsis">;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label: string;
  className?: string;
}) {
  return (
    <nav
      className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      aria-label={label}
    >
      <Button
        type="button"
        variant="ghost"
        className="h-8! min-h-8! rounded-md px-2 text-sm font-medium text-neutral-500 shadow-none hover:bg-neutral-100 hover:text-neutral-900"
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
                ? "bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] hover:text-primary-foreground"
                : "text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900",
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
        className="h-8! min-h-8! rounded-md px-2 text-sm font-medium text-neutral-500 shadow-none hover:bg-neutral-100 hover:text-neutral-900"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </Button>
    </nav>
  );
}

function TableFooterBar({
  pageRowsCount,
  totalCount,
  pageSize,
  menusMounted,
  onPageSizeChange,
  pageItems,
  currentPage,
  totalPages,
  onPageChange,
  paginationLabel,
}: {
  pageRowsCount: number;
  totalCount: number;
  pageSize: number;
  menusMounted: boolean;
  onPageSizeChange: (value: string) => void;
  pageItems: Array<number | "ellipsis">;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  paginationLabel: string;
}) {
  return (
    <div className="relative z-20 shrink-0 border-t-0 bg-white py-3 shadow-[0_-1px_0_0_var(--border)]">
      <div className="flex flex-col gap-3 px-4 md:hidden">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="m-0 min-w-0 text-sm text-muted-foreground">
            Showing {pageRowsCount} of {totalCount} results
          </p>
          <PageSizeSelector
            pageSize={pageSize}
            menusMounted={menusMounted}
            onChange={onPageSizeChange}
            menuAlign="start"
          />
        </div>
        <AnalyticsPaginationNav
          pageItems={pageItems}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          label={paginationLabel}
          className="justify-center"
        />
      </div>

      <div className="hidden w-full items-center justify-between gap-4 md:flex">
        <p className="m-0 px-4 text-sm text-muted-foreground">
          Showing {pageRowsCount} of {totalCount} results
        </p>
        <div className="flex min-w-0 items-center justify-end gap-4 px-4">
          <PageSizeSelector
            pageSize={pageSize}
            menusMounted={menusMounted}
            onChange={onPageSizeChange}
            menuAlign="end"
          />
          <AnalyticsPaginationNav
            pageItems={pageItems}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            label={paginationLabel}
            className="shrink-0 justify-end"
          />
        </div>
      </div>
    </div>
  );
}

function departmentStatusDotClass(status: DepartmentScoreRow["status"]) {
  switch (status) {
    case "On Track":
      return "bg-status-success";
    case "Watch":
      return "bg-status-warning";
    case "At Risk":
      return "bg-status-critical";
    default:
      return "bg-neutral-400";
  }
}

function DepartmentStatus({ status }: { status: DepartmentScoreRow["status"] }) {
  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-2 text-foreground">
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-full",
          departmentStatusDotClass(status),
        )}
        aria-hidden
      />
      <span className="min-w-0 truncate">{status}</span>
    </span>
  );
}

function VarianceSeverity({
  severity,
}: {
  severity: VarianceLogRow["severity"];
}) {
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

function usePagedRows<T>(rows: readonly T[], pageSize: number, page: number) {
  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(pageStart, pageStart + pageSize);
  const pageItems = buildPageItems(currentPage, totalPages);
  return { totalCount, totalPages, currentPage, pageRows, pageItems };
}

/**
 * Analytics deep-dive — summary cards plus department distribution,
 * variance log, and reporting filters.
 */
export default function ScoreAnalysisView() {
  const [dateRange, setDateRange] = React.useState<DateRange>("90d");
  const [department, setDepartment] =
    React.useState<DepartmentFilter>("all");
  const [menusMounted, setMenusMounted] = React.useState(false);

  const [deptPageSize, setDeptPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [deptPage, setDeptPage] = React.useState(1);
  const [variancePageSize, setVariancePageSize] =
    React.useState(DEFAULT_PAGE_SIZE);
  const [variancePage, setVariancePage] = React.useState(1);

  React.useEffect(() => {
    setMenusMounted(true);
  }, []);

  const departments =
    department === "all"
      ? DEPARTMENT_SCORES
      : DEPARTMENT_SCORES.filter((row) => row.id === department);

  const deptPaging = usePagedRows(departments, deptPageSize, deptPage);
  const variancePaging = usePagedRows(
    VARIANCE_LOG,
    variancePageSize,
    variancePage,
  );

  React.useEffect(() => {
    setDeptPage(1);
  }, [department, deptPageSize]);

  React.useEffect(() => {
    setVariancePage(1);
  }, [variancePageSize]);

  function handleDeptPageSizeChange(value: string) {
    const scrollY = window.scrollY;
    setDeptPageSize(Number(value));
    setDeptPage(1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    });
  }

  function handleVariancePageSizeChange(value: string) {
    const scrollY = window.scrollY;
    setVariancePageSize(Number(value));
    setVariancePage(1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    });
  }

  return (
    <div className={cn("flex flex-col", DASHBOARD_GAP_CLASS)}>
      {/* Reporting controls */}
      <div className="flex w-full min-w-0 flex-wrap items-center gap-3">
        <Select
          value={dateRange}
          onValueChange={(value) => setDateRange(value as DateRange)}
        >
          <SelectTrigger
            aria-label="Date range"
            className="h-9 w-auto min-w-[10.5rem] text-sm font-medium"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={department}
          onValueChange={(value) => setDepartment(value as DepartmentFilter)}
        >
          <SelectTrigger
            aria-label="Department"
            className="h-9 w-auto min-w-[12rem] text-sm font-medium"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENT_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="button" variant="black" className="h-9 min-h-9">
          Export Packet
        </Button>
      </div>

      {/* Summary continuity with dashboard widgets */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <CategoryBreakdownPanel />
        <ComplianceTrendPanel />
      </div>

      {/* Department score distribution */}
      <Card
        className={cn(
          DASHBOARD_CARD_CLASS,
          "flex min-h-0 w-full flex-col overflow-hidden",
        )}
      >
        <CardContent className="flex flex-col p-0">
          <div className="relative shrink-0 border-b border-zinc-200 px-4 pt-[16px] pb-3">
            <div className="min-w-0 pr-10">
              <p className={CARD_SECTION_EYEBROW_CLASS}>
                Department Distribution
              </p>
              <p className="text-body1 m-0 mt-1 text-neutral-600">
                Score averages, audit volume, and GMP risk by department.
              </p>
            </div>
            <div className="absolute top-3 right-3">
              <CardActionsMenu
                label="Department Distribution"
                actions={TABLE_CARD_MENU_ACTIONS}
              />
            </div>
          </div>

          <div
            className="flex min-h-0 flex-1 flex-col"
            style={{ overflowAnchor: "none" }}
          >
            <div className="min-h-0 overflow-x-auto">
              <Table className="w-full min-w-[40rem] table-fixed border-separate border-spacing-0">
                <TableHeader>
                  <TableRow className="border-0 bg-white hover:bg-transparent">
                    <TableHead className="w-[28%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Department
                    </TableHead>
                    <TableHead className="w-[12%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Audits
                    </TableHead>
                    <TableHead className="w-[14%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Avg Score
                    </TableHead>
                    <TableHead className="w-[14%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Δ 90d
                    </TableHead>
                    <TableHead className="w-[14%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Below GMP
                    </TableHead>
                    <TableHead className="w-[18%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deptPaging.pageRows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-0 hover:bg-neutral-50"
                    >
                      <TableCell className="border-t border-zinc-100 px-4 py-3">
                        <TruncatedText
                          text={row.department}
                          className="text-sm font-medium text-neutral-900"
                        />
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3 font-mono text-sm tabular-nums text-neutral-900">
                        {row.audits}
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3 font-mono text-sm tabular-nums text-neutral-900">
                        {row.avgScore}%
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3 font-mono text-sm tabular-nums text-neutral-900">
                        {row.delta}
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3 font-mono text-sm tabular-nums text-neutral-900">
                        {row.belowGmp}
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3 text-sm">
                        <DepartmentStatus status={row.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <TableFooterBar
              pageRowsCount={deptPaging.pageRows.length}
              totalCount={deptPaging.totalCount}
              pageSize={deptPageSize}
              menusMounted={menusMounted}
              onPageSizeChange={handleDeptPageSizeChange}
              pageItems={deptPaging.pageItems}
              currentPage={deptPaging.currentPage}
              totalPages={deptPaging.totalPages}
              onPageChange={setDeptPage}
              paginationLabel="Department distribution pagination"
            />
          </div>
        </CardContent>
      </Card>

      {/* Historical variance / anomaly log */}
      <Card
        className={cn(
          DASHBOARD_CARD_CLASS,
          "flex min-h-0 w-full flex-col overflow-hidden",
        )}
      >
        <CardContent className="flex flex-col p-0">
          <div className="relative shrink-0 border-b border-zinc-200 px-4 pt-[16px] pb-3">
            <div className="min-w-0 pr-10">
              <p className={CARD_SECTION_EYEBROW_CLASS}>Variance Log</p>
              <p className="text-body1 m-0 mt-1 text-neutral-600">
                Historical score anomalies and domain-level variance signals.
              </p>
            </div>
            <div className="absolute top-3 right-3">
              <CardActionsMenu
                label="Variance Log"
                actions={CHART_CARD_MENU_ACTIONS}
              />
            </div>
          </div>

          <div
            className="flex min-h-0 flex-1 flex-col"
            style={{ overflowAnchor: "none" }}
          >
            <div className="min-h-0 overflow-x-auto">
              <Table className="w-full min-w-[44rem] table-fixed border-separate border-spacing-0">
                <TableHeader>
                  <TableRow className="border-0 bg-white hover:bg-transparent">
                    <TableHead className="w-[16%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Date
                    </TableHead>
                    <TableHead className="w-[38%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Signal
                    </TableHead>
                    <TableHead className="w-[22%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Domain
                    </TableHead>
                    <TableHead className="w-[12%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Variance
                    </TableHead>
                    <TableHead className="w-[12%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Severity
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variancePaging.pageRows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-0 hover:bg-neutral-50"
                    >
                      <TableCell className="border-t border-zinc-100 px-4 py-3 font-mono text-sm tabular-nums text-neutral-900">
                        {row.date}
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3">
                        <TruncatedText
                          text={row.signal}
                          className="text-sm text-neutral-900"
                        />
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3">
                        <TruncatedText
                          text={row.domain}
                          className="text-sm text-neutral-900"
                        />
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3 font-mono text-sm tabular-nums text-neutral-900">
                        {row.variance}
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3 text-sm">
                        <VarianceSeverity severity={row.severity} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <TableFooterBar
              pageRowsCount={variancePaging.pageRows.length}
              totalCount={variancePaging.totalCount}
              pageSize={variancePageSize}
              menusMounted={menusMounted}
              onPageSizeChange={handleVariancePageSizeChange}
              pageItems={variancePaging.pageItems}
              currentPage={variancePaging.currentPage}
              totalPages={variancePaging.totalPages}
              onPageChange={setVariancePage}
              paginationLabel="Variance log pagination"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
