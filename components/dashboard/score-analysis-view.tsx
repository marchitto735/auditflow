"use client";

import * as React from "react";
import {
  CardActionsMenu,
  CHART_CARD_MENU_ACTIONS,
  TABLE_CARD_MENU_ACTIONS,
} from "@/components/dashboard/card-actions-menu";
import {
  CategoryBreakdownPanel,
  ComplianceTrendPanel,
} from "@/components/dashboard/status-detail-panels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  TablePaginationBar,
  TableRow,
} from "@/components/ui/table";
import { TruncatedText } from "@/components/ui/truncated-text";
import { severityBadgeVariant } from "@/lib/chart-tokens";
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

const DEFAULT_PAGE_SIZE = 3;

function departmentBadgeVariant(status: DepartmentScoreRow["status"]) {
  switch (status) {
    case "On Track":
      return "success" as const;
    case "Watch":
      return "warning" as const;
    case "At Risk":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function DepartmentStatus({ status }: { status: DepartmentScoreRow["status"] }) {
  return <Badge variant={departmentBadgeVariant(status)}>{status}</Badge>;
}

function VarianceSeverity({
  severity,
}: {
  severity: VarianceLogRow["severity"];
}) {
  return <Badge variant={severityBadgeVariant(severity)}>{severity}</Badge>;
}

function usePagedRows<T>(rows: readonly T[], pageSize: number, page: number) {
  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(pageStart, pageStart + pageSize);
  return { totalCount, totalPages, currentPage, pageRows };
}

/**
 * Analytics deep-dive — summary cards plus department distribution,
 * variance log, and reporting filters.
 */
export default function ScoreAnalysisView() {
  const [dateRange, setDateRange] = React.useState<DateRange>("90d");
  const [department, setDepartment] =
    React.useState<DepartmentFilter>("all");

  const [deptPageSize, setDeptPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [deptPage, setDeptPage] = React.useState(1);
  const [variancePageSize, setVariancePageSize] =
    React.useState(DEFAULT_PAGE_SIZE);
  const [variancePage, setVariancePage] = React.useState(1);

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
              <p className="m-0 mt-1 text-base font-normal text-neutral-600">
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
                        <TruncatedText text={row.department} />
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3 font-mono tabular-nums">
                        {row.audits}
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3 font-mono tabular-nums">
                        {row.avgScore}%
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3 font-mono tabular-nums">
                        {row.delta}
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3 font-mono tabular-nums">
                        {row.belowGmp}
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3">
                        <DepartmentStatus status={row.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <TablePaginationBar
              pageRowsCount={deptPaging.pageRows.length}
              totalCount={deptPaging.totalCount}
              pageSize={deptPageSize}
              onPageSizeChange={handleDeptPageSizeChange}
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
              <p className="m-0 mt-1 text-base font-normal text-neutral-600">
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
                      <TableCell className="border-t border-zinc-100 px-4 py-3 font-mono tabular-nums">
                        {row.date}
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3">
                        <TruncatedText text={row.signal} />
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3">
                        <TruncatedText text={row.domain} />
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3 font-mono tabular-nums">
                        {row.variance}
                      </TableCell>
                      <TableCell className="border-t border-zinc-100 px-4 py-3">
                        <VarianceSeverity severity={row.severity} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <TablePaginationBar
              pageRowsCount={variancePaging.pageRows.length}
              totalCount={variancePaging.totalCount}
              pageSize={variancePageSize}
              onPageSizeChange={handleVariancePageSizeChange}
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
