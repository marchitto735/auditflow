"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART } from "@/lib/chart-tokens";
import {
  GMP_THRESHOLD,
  OPEN_FINDINGS,
  SCORE_CATEGORIES,
  SCORE_TRENDS,
  type FindingSeverity,
  type FindingStatus,
} from "@/lib/dashboard-insights";
import {
  CARD_SECTION_EYEBROW_CLASS,
  SECTION_DESCRIPTION_CLASS,
  DASHBOARD_CARD_CLASS,
  TABLE_CARD_HEADER_CLASS,
  TABLE_TOOLBAR_FILTERS_CLASS,
  TABLE_TOOLBAR_FILTER_TRIGGER_CLASS,
  TABLE_TOOLBAR_ROW_CLASS,
  TABLE_TOOLBAR_SEARCH_ICON_CLASS,
  TABLE_TOOLBAR_SEARCH_INPUT_CLASS,
  TABLE_TOOLBAR_SEARCH_WRAP_CLASS,
} from "@/lib/page-layout";
import { formatStatusLabel } from "@/lib/status-label";
import { cn } from "@/lib/utils";

const SEVERITY_ORDER: FindingSeverity[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

const DEFAULT_PAGE_SIZE = 3;
const FINDINGS_TABLE_MIN_WIDTH_CLASS = "min-w-[54rem]";

const SORTED_FINDINGS = [...OPEN_FINDINGS].sort(
  (a, b) =>
    SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
);

function findingStatusBadgeVariant(status: FindingStatus) {
  switch (status) {
    case "Open":
      return "warning" as const;
    case "Remediation":
      return "warning" as const;
    case "Pending verification":
      return "success" as const;
    default:
      return "outline" as const;
  }
}

function FindingStatusBadge({ status }: { status: FindingStatus }) {
  return (
    <Badge variant={findingStatusBadgeVariant(status)}>
      {formatStatusLabel(status)}
    </Badge>
  );
}

type FindingsSeverityFilter = "all" | FindingSeverity;
type FindingsStatusFilter = "all" | FindingStatus;
type FindingsTypeFilter = "all" | "SOP" | "BPR" | "FIR";

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
  { value: "Remediation", label: "Remediation" },
  { value: "Pending verification", label: "Pending verification" },
];

const FINDINGS_TYPE_OPTIONS: {
  value: FindingsTypeFilter;
  label: string;
}[] = [
  { value: "all", label: "All types" },
  { value: "SOP", label: "SOP" },
  { value: "BPR", label: "BPR" },
  { value: "FIR", label: "FIR" },
];

function findingDocumentType(document: string): FindingsTypeFilter | null {
  const upper = document.trim().toUpperCase();
  if (upper.startsWith("SOP")) return "SOP";
  if (upper.startsWith("BPR")) return "BPR";
  if (upper.startsWith("FIR")) return "FIR";
  return null;
}
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
  const [docType, setDocType] = useState<FindingsTypeFilter>("all");
  const [menusMounted, setMenusMounted] = useState(false);

  useEffect(() => {
    setMenusMounted(true);
  }, []);

  const catalog = useMemo(() => {
    const query = search.trim().toLowerCase();
    return SORTED_FINDINGS.filter((row) => {
      if (severity !== "all" && row.severity !== severity) return false;
      if (status !== "all" && row.status !== status) return false;
      if (docType !== "all" && findingDocumentType(row.document) !== docType) {
        return false;
      }
      if (query) {
        const haystack =
          `${row.title} ${row.document} ${row.regulation} ${row.source} ${row.detectedAgo} ${row.severity} ${row.status}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [search, severity, status, docType]);

  const totalCount = catalog.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = catalog.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setPage(1);
  }, [pageSize, search, severity, status, docType]);

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
        <div className={TABLE_CARD_HEADER_CLASS}>
          <div className="min-w-0 pr-10">
            <p className={CARD_SECTION_EYEBROW_CLASS}>Action items</p>
            <p className={SECTION_DESCRIPTION_CLASS}>
              Highest-severity open items across active audits.
            </p>
          </div>
          <div className="absolute top-3 right-3">
            <CardActionsMenu
              label="Action items"
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
                label="Type"
                value={docType}
                options={FINDINGS_TYPE_OPTIONS}
                menusMounted={menusMounted}
                onChange={setDocType}
              />
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
                  className={FINDINGS_TABLE_MIN_WIDTH_CLASS}
                  containerClassName="overflow-visible"
                >
                  <colgroup>
                    <col className="w-[28%]" style={{ width: "28%" }} />
                    <col className="w-[17%]" style={{ width: "17%" }} />
                    <col className="w-[15%]" style={{ width: "15%" }} />
                    <col className="w-[14%]" style={{ width: "14%" }} />
                    <col className="w-[10%]" style={{ width: "10%" }} />
                    <col className="w-[16%]" style={{ width: "16%" }} />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Finding</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Regulation</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Detected</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <TruncatedText text={row.title} />
                        </TableCell>
                        <TableCell>
                          <TruncatedText
                            className="font-mono tabular-nums"
                            text={row.document}
                          />
                        </TableCell>
                        <TableCell>
                          <span className="whitespace-nowrap">
                            {row.regulation}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="whitespace-nowrap">{row.source}</span>
                        </TableCell>
                        <TableCell>
                          <span className="whitespace-nowrap tabular-nums text-neutral-900">
                            {row.detectedAgo}
                          </span>
                        </TableCell>
                        <TableCell>
                          <FindingStatusBadge status={row.status} />
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
          <p className={CARD_SECTION_EYEBROW_CLASS}>Category breakdown</p>
          <p className={SECTION_DESCRIPTION_CLASS}>
            GMP threshold {GMP_THRESHOLD}%.
          </p>
        </div>
        <div className="absolute top-3 right-3">
          <CardActionsMenu
            label="Category breakdown"
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

const COMPLIANCE_TREND_Y_TICKS = [100, 90, 80, 70] as const;
const COMPLIANCE_TREND_Y_WIDTH = 28;

/**
 * Native Recharts tick positions; force a shared flush-left x so labels
 * align with the card header text (SVG origin = content padding edge).
 */
function ComplianceTrendYTick({
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value?: number | string };
}) {
  if (y == null || payload?.value == null) return null;

  return (
    <text
      x={0}
      y={y}
      dy={4}
      textAnchor="start"
      fill={CHART.structuralMuted}
      fontSize={12}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {payload.value}
    </text>
  );
}

const COMPLIANCE_TREND_STROKE = "#10b981";
const COMPLIANCE_TREND_AMBER = "#f59e0b";
const COMPLIANCE_TREND_AMBER_LABEL = "#b45309";

/**
 * Sits just above the dashed GMP line, flush to the right edge of the plot.
 */
function GmpStandardLabel({
  viewBox,
}: {
  viewBox?: { x?: number; y?: number; width?: number };
}) {
  if (viewBox?.x == null || viewBox.y == null || viewBox.width == null) {
    return null;
  }

  return (
    <text
      x={viewBox.x + viewBox.width}
      y={viewBox.y}
      dy={-8}
      textAnchor="end"
      fill={COMPLIANCE_TREND_AMBER_LABEL}
      fontSize={12}
      fontWeight={500}
    >
      GMP {GMP_THRESHOLD}%
    </text>
  );
}
export function ComplianceTrendPanel({ className }: { className?: string }) {
  const trend = SCORE_TRENDS[90];
  const fillId = `compliance-trend-fill-${GMP_THRESHOLD}`;

  return (
    <Card className={cn(DASHBOARD_CARD_CLASS, "h-full", className)}>
      <CardContent className="relative flex h-full flex-col gap-0 px-4 pt-4 pb-[10px]">
        <div className="min-w-0 pr-10">
          <p className={CARD_SECTION_EYEBROW_CLASS}>Compliance score</p>
          <p className={SECTION_DESCRIPTION_CLASS}>
            90-day rating against the {GMP_THRESHOLD}% benchmark.
          </p>
        </div>
        <div className="absolute top-3 right-3">
          <CardActionsMenu
            label="Compliance score"
            actions={CHART_CARD_MENU_ACTIONS}
          />
        </div>
        <div className="min-h-[280px] w-full min-w-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[...trend]}
              margin={{ top: 18, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={COMPLIANCE_TREND_STROKE}
                    stopOpacity={0.32}
                  />
                  <stop
                    offset="100%"
                    stopColor={COMPLIANCE_TREND_STROKE}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke={CHART.grid}
                vertical={false}
                horizontal
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                padding={{ left: 0, right: 0 }}
                tick={{
                  fill: CHART.structuralMuted,
                  fontSize: 12,
                }}
              />
              <YAxis
                orientation="left"
                domain={[70, 100]}
                ticks={[...COMPLIANCE_TREND_Y_TICKS]}
                tickLine={false}
                axisLine={{ stroke: CHART.grid, strokeWidth: 1 }}
                width={COMPLIANCE_TREND_Y_WIDTH}
                tickMargin={0}
                tick={<ComplianceTrendYTick />}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${CHART.track}`,
                  boxShadow: "none",
                  fontSize: 14,
                }}
                formatter={(value) => [`${value}%`, "Score"]}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke={COMPLIANCE_TREND_STROKE}
                strokeWidth={2}
                fill={`url(#${fillId})`}
                dot={{ r: 3, fill: COMPLIANCE_TREND_STROKE, strokeWidth: 0 }}
                activeDot={{ r: 4, fill: COMPLIANCE_TREND_STROKE, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <ReferenceLine
                y={GMP_THRESHOLD}
                stroke={COMPLIANCE_TREND_AMBER}
                strokeDasharray="4 4"
                strokeWidth={1.25}
                label={<GmpStandardLabel />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
