"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import {
  CardActionsMenu,
  CHART_CARD_MENU_ACTIONS,
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
  DASHBOARD_MENU_ITEM_SELECTED_CLASS,
  TABLE_CARD_MENU_ACTIONS,
} from "@/components/dashboard/card-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { CHART, severityBadgeVariant } from "@/lib/chart-tokens";
import {
  GMP_THRESHOLD,
  OPEN_FINDINGS,
  SCORE_CATEGORIES,
  SCORE_TRENDS,
  type FindingSeverity,
} from "@/lib/dashboard-insights";
import {
  CARD_SECTION_EYEBROW_CLASS,
  SECTION_DESCRIPTION_CLASS,
  DASHBOARD_CARD_CLASS,
  TABLE_TOOLBAR_ACTIONS_CLASS,
  TABLE_TOOLBAR_FILTERS_CLASS,
  TABLE_TOOLBAR_FILTER_TRIGGER_CLASS,
  TABLE_TOOLBAR_PRIMARY_BUTTON_CLASS,
  TABLE_TOOLBAR_ROW_CLASS,
  TABLE_TOOLBAR_SEARCH_ICON_CLASS,
  TABLE_TOOLBAR_SEARCH_INPUT_CLASS,
  TABLE_TOOLBAR_SEARCH_WRAP_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const SEVERITY_ORDER: FindingSeverity[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

const DEFAULT_PAGE_SIZE = 3;
const FINDINGS_TABLE_MIN_WIDTH_CLASS = "min-w-[36rem]";

const SORTED_FINDINGS = [...OPEN_FINDINGS].sort(
  (a, b) =>
    SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
);

function SeverityStatus({ severity }: { severity: FindingSeverity }) {
  return <Badge variant={severityBadgeVariant(severity)}>{severity}</Badge>;
}

type FindingsSeverityFilter = "all" | FindingSeverity;
type FindingsStatusFilter =
  | "all"
  | "Open"
  | "In Remediation"
  | "Pending Verification";

const FINDINGS_SEVERITY_OPTIONS: {
  value: FindingsSeverityFilter;
  label: string;
}[] = [
  { value: "all", label: "All severity" },
  { value: "Critical", label: "Critical" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

const FINDINGS_STATUS_OPTIONS: {
  value: FindingsStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All status" },
  { value: "Open", label: "Open" },
  { value: "In Remediation", label: "In Remediation" },
  { value: "Pending Verification", label: "Pending Verification" },
];

function FindingsFilterSelect<T extends string>({
  label,
  value,
  options,
  menusMounted,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  menusMounted: boolean;
  onChange: (value: T) => void;
}) {
  const selected =
    options.find((option) => option.value === value)?.label ?? label;
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
      aria-label={label}
      className={cn(TABLE_TOOLBAR_FILTER_TRIGGER_CLASS, "min-w-[8.5rem]")}
    >
      <span className="truncate">{selected}</span>
      <ChevronDown className="size-4 shrink-0 text-neutral-900" aria-hidden />
    </button>
  );

  if (!menusMounted) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={cn(DASHBOARD_MENU_CONTENT_CLASS, "min-w-[12rem]")}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          releaseTriggerFocus();
        }}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <DropdownMenuItem
              key={option.value}
              className={cn(
                DASHBOARD_MENU_ITEM_CLASS,
                isSelected && DASHBOARD_MENU_ITEM_SELECTED_CLASS,
              )}
              onSelect={() => onChange(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Priority findings table — unified toolbar + Critical/High first. */
export function FindingsSummaryPanel({ className }: { className?: string }) {
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<FindingsSeverityFilter>("all");
  const [status, setStatus] = useState<FindingsStatusFilter>("all");
  const [menusMounted, setMenusMounted] = useState(false);

  useEffect(() => {
    setMenusMounted(true);
  }, []);

  const catalog = useMemo(() => {
    const query = search.trim().toLowerCase();
    return SORTED_FINDINGS.filter((row) => {
      if (severity !== "all" && row.severity !== severity) return false;
      if (status !== "all" && row.status !== status) return false;
      if (query) {
        const haystack =
          `${row.title} ${row.document} ${row.severity} ${row.status}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [search, severity, status]);

  const totalCount = catalog.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = catalog.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setPage(1);
  }, [pageSize, search, severity, status]);

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
        <div className="relative flex shrink-0 flex-col gap-3 border-b border-zinc-200 px-4 pt-[16px] pb-3">
          <div className="min-w-0 pr-10">
            <p className={CARD_SECTION_EYEBROW_CLASS}>Priority Findings</p>
            <p className={SECTION_DESCRIPTION_CLASS}>
              Highest-severity open items across active audits.
            </p>
          </div>
          <div className="absolute top-3 right-3">
            <CardActionsMenu
              label="Priority Findings"
              actions={TABLE_CARD_MENU_ACTIONS}
            />
          </div>

          <div
            className={TABLE_TOOLBAR_ROW_CLASS}
            role="search"
            aria-label="Search and filter priority findings"
          >
            <div className={TABLE_TOOLBAR_SEARCH_WRAP_CLASS}>
              <Search
                className={TABLE_TOOLBAR_SEARCH_ICON_CLASS}
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Search findings or documents"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={TABLE_TOOLBAR_SEARCH_INPUT_CLASS}
              />
            </div>
            <div className={TABLE_TOOLBAR_FILTERS_CLASS}>
              <FindingsFilterSelect
                label="Severity"
                value={severity}
                options={FINDINGS_SEVERITY_OPTIONS}
                menusMounted={menusMounted}
                onChange={setSeverity}
              />
              <FindingsFilterSelect
                label="Status"
                value={status}
                options={FINDINGS_STATUS_OPTIONS}
                menusMounted={menusMounted}
                onChange={setStatus}
              />
            </div>
            <div className={TABLE_TOOLBAR_ACTIONS_CLASS}>
              <Button
                type="button"
                variant="black"
                className={TABLE_TOOLBAR_PRIMARY_BUTTON_CLASS}
                asChild
              >
                <Link href="/dashboard/findings">View All</Link>
              </Button>
            </div>
          </div>
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col"
          style={{ overflowAnchor: "none" }}
        >
          {totalCount === 0 ? (
            <p className="text-body1 m-0 px-4 py-4 text-muted-foreground">
              No findings match the current search and filters.
            </p>
          ) : (
            <>
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
                        className="h-12 border-0 hover:bg-neutral-50"
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
                        <TableCell className="h-12 px-4 py-0">
                          {row.status}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <TablePaginationBar
                className={FINDINGS_TABLE_MIN_WIDTH_CLASS}
                pageRowsCount={pageRows.length}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                paginationLabel="Priority findings pagination"
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Read-only category score bars for the command center. */
export function CategoryBreakdownPanel({ className }: { className?: string }) {
  return (
    <Card className={cn(DASHBOARD_CARD_CLASS, "h-full", className)}>
      <CardContent className="relative flex h-full flex-col gap-3 p-4 pb-6">
        <div className="min-w-0 pr-10">
          <p className={CARD_SECTION_EYEBROW_CLASS}>Category Breakdown</p>
          <p className={SECTION_DESCRIPTION_CLASS}>
            GMP threshold {GMP_THRESHOLD}%.
          </p>
        </div>
        <div className="absolute top-3 right-3">
          <CardActionsMenu
            label="Category Breakdown"
            actions={CHART_CARD_MENU_ACTIONS}
          />
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
                  className="h-full rounded-none bg-neutral-900"
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

/** Y-axis ticks — right-aligned tabular nums flush to a fixed-width rail. */
function ComplianceTrendYTick({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value?: number | string };
}) {
  if (x == null || y == null || payload?.value == null) return null;

  return (
    <text
      x={x}
      y={y}
      dx={-2}
      dy={4}
      textAnchor="end"
      fill={CHART.structuralMuted}
      fontSize={12}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {payload.value}
    </text>
  );
}

/** Read-only 90d compliance score trend for the command center. */
export function ComplianceTrendPanel({ className }: { className?: string }) {
  const trend = SCORE_TRENDS[90];

  return (
    <Card className={cn(DASHBOARD_CARD_CLASS, "h-full", className)}>
      <CardContent className="relative flex h-full flex-col gap-3 p-4">
        <div className="min-w-0 pr-10">
          <p className={CARD_SECTION_EYEBROW_CLASS}>Compliance Trend</p>
          <p className={SECTION_DESCRIPTION_CLASS}>
            90-day score vs {GMP_THRESHOLD}% GMP standard.
          </p>
        </div>
        <div className="absolute top-3 right-3">
          <CardActionsMenu
            label="Compliance Trend"
            actions={CHART_CARD_MENU_ACTIONS}
          />
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...trend]}
              margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
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
                width={36}
                tick={<ComplianceTrendYTick />}
                tickMargin={0}
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
