"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Download,
  FileText,
  MoreHorizontal,
  Package,
  Search,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import {
  activityStatusLabel,
  statusBadgeClass,
  STATUS_BADGE_CLASS,
  TECHNICAL_VALUE_CLASS,
  isTechnicalId,
} from "@/components/activity-table/activity-table";
import {
  CardActionsMenu,
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
  DASHBOARD_MENU_ITEM_SELECTED_CLASS,
  TABLE_CARD_MENU_ACTIONS,
} from "@/components/dashboard/card-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CARD_METRIC_CLASS,
  CARD_SECTION_EYEBROW_CLASS,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_GAP_CLASS,
  TABLE_ROW_ACTIONS_CELL_CLASS,
  TABLE_ROW_ACTIONS_HEAD_CLASS,
} from "@/lib/page-layout";
import {
  INITIAL_REPORT_FILTERS,
  computeReportsKpis,
  filterReportRows,
  type ReportFilters,
  type ReportRow,
  type ReportStatusFilter,
} from "@/lib/reports";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;
const TABLE_MIN_WIDTH_CLASS = "min-w-[56rem]";

const STATUS_OPTIONS: { value: ReportStatusFilter; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "Compliant", label: "Compliant" },
  { value: "Partial", label: "Partial" },
  { value: "Failed", label: "Failed" },
];

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

function FilterSelect<T extends string>({
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
      className="inline-flex h-9 min-w-[8.5rem] items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-400 hover:bg-neutral-50 data-[state=open]:border-neutral-400 data-[state=open]:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
    >
      <span className="truncate">{selected}</span>
      <ChevronDown className="size-4 shrink-0 text-neutral-900" aria-hidden />
    </button>
  );

  return menusMounted ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className={DASHBOARD_MENU_CONTENT_CLASS}
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
              onSelect={() => {
                releaseTriggerFocus();
                onChange(option.value);
              }}
            >
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    trigger
  );
}

function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: Date | null;
  to: Date | null;
  onChange: (range: { from: Date | null; to: Date | null }) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected: DateRange | undefined =
    from || to ? { from: from ?? undefined, to: to ?? undefined } : undefined;

  const label =
    from && to
      ? `${format(from, "MMM d, yyyy")} – ${format(to, "MMM d, yyyy")}`
      : from
        ? `${format(from, "MMM d, yyyy")} – …`
        : "Date range";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Filter by date range"
          className="inline-flex h-9 min-w-[11rem] items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-400 hover:bg-neutral-50 data-[state=open]:border-neutral-400 data-[state=open]:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
        >
          <span className="inline-flex min-w-0 items-center gap-2 truncate">
            <CalendarDays className="size-4 shrink-0 text-neutral-600" aria-hidden />
            <span className="truncate">{label}</span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-neutral-900" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-3 md:p-4">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={selected}
          onSelect={(range) => {
            onChange({
              from: range?.from ?? null,
              to: range?.to ?? null,
            });
          }}
          defaultMonth={from ?? to ?? new Date()}
        />
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-200 pt-3">
          <Button
            type="button"
            variant="ghost"
            className="h-8! min-h-8! px-2 text-sm"
            onClick={() => {
              onChange({ from: null, to: null });
              setOpen(false);
            }}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="black"
            className="h-8! min-h-8! px-3 text-sm"
            onClick={() => setOpen(false)}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
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

function ReportsKpiHeader({ rows }: { rows: ReportRow[] }) {
  const kpis = useMemo(() => computeReportsKpis(rows), [rows]);
  const ratioTotal = kpis.compliantCount + kpis.partialCount;
  const compliantPct =
    ratioTotal > 0
      ? Math.round((kpis.compliantCount / ratioTotal) * 100)
      : null;

  const cards: Array<{
    eyebrow: string;
    value: string;
    meta: string;
    icon: typeof FileText;
    monoMeta?: boolean;
  }> = [
    {
      eyebrow: "Completed Audits",
      value: String(kpis.totalCompleted),
      meta: "Stored pipeline reports",
      icon: FileText,
    },
    {
      eyebrow: "Avg Compliance",
      value: kpis.averageScore != null ? `${kpis.averageScore}%` : "—",
      meta: "Mean score across reports",
      icon: ClipboardList,
    },
    {
      eyebrow: "Compliant vs Partial",
      value: `${kpis.compliantCount} / ${kpis.partialCount}`,
      meta:
        compliantPct != null
          ? `${compliantPct}% compliant · ${kpis.failedCount} failed`
          : `${kpis.failedCount} failed`,
      icon: ShieldAlert,
    },
    {
      eyebrow: "Last Audit",
      value: kpis.lastAuditAt
        ? format(new Date(kpis.lastAuditAt), "MMM d")
        : "—",
      meta: kpis.lastAuditLabel,
      icon: CalendarDays,
      monoMeta: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.eyebrow}
            className={cn("overflow-hidden", DASHBOARD_CARD_CLASS)}
          >
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className={CARD_SECTION_EYEBROW_CLASS}>{card.eyebrow}</p>
                <span className="inline-flex size-8 items-center justify-center rounded-md bg-[var(--primary-muted)] text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
              </div>
              <p className={cn(CARD_METRIC_CLASS, "m-0 text-neutral-900")}>
                {card.value}
              </p>
              <p
                className={cn(
                  "m-0 truncate text-xs text-neutral-500",
                  card.monoMeta && "font-mono tabular-nums",
                )}
              >
                {card.meta}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ReportStatusBadge({ status }: { status: string }) {
  const label = activityStatusLabel(status);
  if (label === "—") return <span>—</span>;
  return (
    <Badge
      variant="outline"
      className={cn(STATUS_BADGE_CLASS, statusBadgeClass(status))}
    >
      {label === "Fail" || label === "Critical" ? "Failed" : label === "Pass" ? "Compliant" : label}
    </Badge>
  );
}

function RowActionsMenu({
  row,
  menusMounted,
  onInspect,
  onViewLog,
}: {
  row: ReportRow;
  menusMounted: boolean;
  onInspect: (row: ReportRow) => void;
  onViewLog: (row: ReportRow) => void;
}) {
  const trigger = (
    <Button
      type="button"
      variant="ghost"
      className="h-8! min-h-8! w-8! rounded-md p-0!"
      aria-label={`Actions for ${row.document}`}
    >
      <MoreHorizontal className="size-4" />
    </Button>
  );

  function downloadPdf() {
    toast.success("PDF export queued", {
      description: `${row.document} · report package`,
    });
  }

  if (!menusMounted) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={DASHBOARD_MENU_CONTENT_CLASS}>
        <DropdownMenuItem
          className={DASHBOARD_MENU_ITEM_CLASS}
          onSelect={downloadPdf}
        >
          <Download className="size-4" aria-hidden />
          Download PDF Report
        </DropdownMenuItem>
        <DropdownMenuItem
          className={DASHBOARD_MENU_ITEM_CLASS}
          onSelect={() => onViewLog(row)}
        >
          <ClipboardList className="size-4" aria-hidden />
          View Immutable Audit Log
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={DASHBOARD_MENU_ITEM_CLASS}
          onSelect={() => onInspect(row)}
        >
          <FileText className="size-4" aria-hidden />
          Inspect Clauses
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ReportInspectSheet({
  report,
  open,
  onOpenChange,
}: {
  report: ReportRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-neutral-200 bg-white p-0 sm:max-w-lg"
      >
        <SheetHeader className="shrink-0 border-b border-neutral-200 px-4 py-4 text-left">
          <SheetTitle className="m-0 text-base font-medium text-neutral-900">
            {report?.document ?? "Inspect clauses"}
          </SheetTitle>
          <SheetDescription className="m-0 mt-1 font-mono text-xs text-neutral-500">
            {report
              ? `${report.id} · ${report.type} · score ${report.score}`
              : "Select a report row to inspect findings."}
          </SheetDescription>
        </SheetHeader>

        {report ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="m-0 text-xs text-neutral-500">Status</p>
                <div className="mt-1.5">
                  <ReportStatusBadge status={report.status} />
                </div>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="m-0 text-xs text-neutral-500">Timestamp</p>
                <p className="m-0 mt-1 font-mono text-xs text-neutral-900">
                  {report.date}
                </p>
              </div>
            </div>

            {report.summary ? (
              <div>
                <p className="m-0 mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Summary
                </p>
                <p className="m-0 text-sm leading-relaxed text-neutral-800">
                  {report.summary}
                </p>
              </div>
            ) : null}

            <div>
              <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Findings / clauses
              </p>
              {report.findings.length === 0 ? (
                <p className="m-0 text-sm text-muted-foreground">
                  No clause findings recorded for this report.
                </p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {report.findings.map((finding, index) => (
                    <li
                      key={`${report.id}-finding-${index}`}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    >
                      <span className="mr-2 font-mono text-xs text-neutral-500">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {finding}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {report.recommendation ? (
              <div>
                <p className="m-0 mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Recommendation
                </p>
                <p className="m-0 text-sm leading-relaxed text-neutral-800">
                  {report.recommendation}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function AuditLogSheet({
  report,
  open,
  onOpenChange,
}: {
  report: ReportRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const entries = report
    ? [
        {
          step: "Ingest",
          detail: `Document ${report.document} entered the native audit pipeline.`,
          at: report.createdAt
            ? format(new Date(report.createdAt), "MMM d, yyyy HH:mm:ss")
            : report.date,
        },
        {
          step: "Clause evaluation",
          detail: `${report.findings.length || "—"} findings recorded against gold-standard controls.`,
          at: report.createdAt
            ? format(
                new Date(Date.parse(report.createdAt) + 45_000),
                "MMM d, yyyy HH:mm:ss",
              )
            : "—",
        },
        {
          step: "Score sealed",
          detail: `Compliance score ${report.score} · status ${activityStatusLabel(report.status)}.`,
          at: report.createdAt
            ? format(
                new Date(Date.parse(report.createdAt) + 90_000),
                "MMM d, yyyy HH:mm:ss",
              )
            : "—",
        },
        {
          step: "Immutable write",
          detail: `Report ${report.id} committed to audit store (append-only).`,
          at: report.createdAt
            ? format(
                new Date(Date.parse(report.createdAt) + 120_000),
                "MMM d, yyyy HH:mm:ss",
              )
            : "—",
        },
      ]
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-neutral-200 bg-white p-0 sm:max-w-lg"
      >
        <SheetHeader className="shrink-0 border-b border-neutral-200 px-4 py-4 text-left">
          <SheetTitle className="m-0 text-base font-medium text-neutral-900">
            Immutable audit log
          </SheetTitle>
          <SheetDescription className="m-0 mt-1 font-mono text-xs text-neutral-500">
            {report?.id ?? "Select a report"}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto p-4">
          <ol className="m-0 flex list-none flex-col gap-0 border-l border-neutral-200 p-0 pl-4">
            {entries.map((entry) => (
              <li key={entry.step} className="relative pb-5 last:pb-0">
                <span
                  className="absolute top-1.5 -left-[1.28rem] size-2.5 rounded-full bg-primary"
                  aria-hidden
                />
                <p className="m-0 text-sm font-medium text-neutral-900">
                  {entry.step}
                </p>
                <p className="m-0 mt-0.5 text-sm text-neutral-600">
                  {entry.detail}
                </p>
                <p className="m-0 mt-1 font-mono text-[11px] tabular-nums text-neutral-500">
                  {entry.at}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function ReportsTableCard({
  rows,
  className,
}: {
  rows: ReportRow[];
  className?: string;
}) {
  const [filters, setFilters] = useState<ReportFilters>(INITIAL_REPORT_FILTERS);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [menusMounted, setMenusMounted] = useState(false);
  const [inspectRow, setInspectRow] = useState<ReportRow | null>(null);
  const [logRow, setLogRow] = useState<ReportRow | null>(null);

  useEffect(() => {
    setMenusMounted(true);
  }, []);

  const filtered = useMemo(
    () => filterReportRows(rows, filters),
    [rows, filters],
  );

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(pageStart, pageStart + pageSize);
  const pageItems = buildPageItems(currentPage, totalPages);

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  function patchFilters(partial: Partial<ReportFilters>) {
    setFilters((current) => ({ ...current, ...partial }));
  }

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

  function exportBatch() {
    toast.success("Batch package export started", {
      description: `${filtered.length} report${filtered.length === 1 ? "" : "s"} in current filter set.`,
    });
  }

  return (
    <>
      <div className={cn("flex w-full flex-col", DASHBOARD_GAP_CLASS, className)}>
        <ReportsKpiHeader rows={rows} />

        <Card
          className={cn(
            "flex shrink-0 flex-col overflow-hidden",
            DASHBOARD_CARD_CLASS,
          )}
        >
          <CardContent className="flex flex-col p-0">
            <div className="relative flex shrink-0 flex-col gap-3 border-b border-neutral-200 px-4 pt-[16px] pb-3">
              <div className="min-w-0 pr-10 md:pr-52">
                <p className={CARD_SECTION_EYEBROW_CLASS}>Audit Reports</p>
                <p className="text-body1 m-0 mt-1 text-neutral-600">
                  Completed SOP, BPR, and FIR audits with scores, status, and
                  immutable export actions.
                </p>
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <Button
                  type="button"
                  variant="black"
                  className="hidden h-9! min-h-9! gap-1.5 rounded-md px-3 text-sm sm:inline-flex"
                  onClick={exportBatch}
                >
                  <Package className="size-4" aria-hidden />
                  Export Batch Package
                </Button>
                <CardActionsMenu
                  label="Audit Reports"
                  actions={TABLE_CARD_MENU_ACTIONS}
                />
              </div>

              <div
                className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4"
                role="search"
                aria-label="Search and filter audit reports"
              >
                <div className="relative min-w-0 w-full md:max-w-md md:flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-900"
                    aria-hidden
                  />
                  <Input
                    type="search"
                    placeholder="Search document ID or type"
                    value={filters.search}
                    onChange={(event) =>
                      patchFilters({ search: event.target.value })
                    }
                    className="h-9 pl-9"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <FilterSelect
                    label="Status"
                    value={filters.status}
                    options={STATUS_OPTIONS}
                    menusMounted={menusMounted}
                    onChange={(status) => patchFilters({ status })}
                  />
                  <DateRangePicker
                    from={filters.from}
                    to={filters.to}
                    onChange={({ from, to }) => patchFilters({ from, to })}
                  />
                  <Button
                    type="button"
                    variant="black"
                    className="h-9! min-h-9! gap-1.5 rounded-md px-3 text-sm sm:hidden"
                    onClick={exportBatch}
                  >
                    <Package className="size-4" aria-hidden />
                    Export Batch
                  </Button>
                </div>
              </div>
            </div>

            {totalCount === 0 ? (
              <p className="text-body1 m-0 px-4 py-4 text-muted-foreground">
                No reports match the current search and filters.
              </p>
            ) : (
              <div
                className="flex shrink-0 flex-col"
                style={{ overflowAnchor: "none" }}
              >
                <Table
                  className={cn(
                    "w-full table-fixed border-separate border-spacing-0",
                    TABLE_MIN_WIDTH_CLASS,
                  )}
                  containerClassName="overflow-x-auto"
                >
                  <TableHeader className="sticky top-0 z-20 bg-white shadow-[0_1px_0_0_var(--border)]">
                    <TableRow className="border-0 bg-white hover:bg-transparent">
                      <TableHead className="h-10 w-[28%] px-4 text-left text-sm font-medium text-neutral-900">
                        Document
                      </TableHead>
                      <TableHead className="h-10 w-[10%] px-4 text-left text-sm font-medium text-neutral-900">
                        Type
                      </TableHead>
                      <TableHead className="h-10 w-[22%] px-4 text-left text-sm font-medium text-neutral-900">
                        Timestamp
                      </TableHead>
                      <TableHead className="h-10 w-[10%] px-4 text-left text-sm font-medium text-neutral-900">
                        Score
                      </TableHead>
                      <TableHead className="h-10 w-[18%] px-4 text-left text-sm font-medium text-neutral-900">
                        Status
                      </TableHead>
                      <TableHead className={TABLE_ROW_ACTIONS_HEAD_CLASS}>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border border-b-0 [&>tr:not(:first-child)>td]:border-t [&>tr:not(:first-child)>td]:border-border">
                    {pageRows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="border-0 bg-white hover:bg-neutral-50"
                      >
                        <TableCell className="h-12 max-w-0 px-4 py-0 align-middle">
                          <button
                            type="button"
                            className={cn(
                              "block w-full min-w-0 truncate text-left text-sm font-medium text-neutral-900 transition-colors hover:underline",
                              isTechnicalId(row.document) && TECHNICAL_VALUE_CLASS,
                            )}
                            onClick={() => setInspectRow(row)}
                          >
                            {row.document}
                          </button>
                        </TableCell>
                        <TableCell className="h-12 max-w-0 px-4 py-0 align-middle">
                          <span className="block truncate text-sm text-neutral-800">
                            {row.type}
                          </span>
                        </TableCell>
                        <TableCell className="h-12 max-w-0 px-4 py-0 align-middle">
                          <span
                            className={cn(
                              "block truncate text-sm text-neutral-800",
                              TECHNICAL_VALUE_CLASS,
                            )}
                          >
                            {row.date}
                          </span>
                        </TableCell>
                        <TableCell className="h-12 px-4 py-0 align-middle">
                          <span className={cn("text-sm", TECHNICAL_VALUE_CLASS)}>
                            {row.score}
                            {row.score !== "—" ? "%" : ""}
                          </span>
                        </TableCell>
                        <TableCell className="h-12 px-4 py-0 align-middle">
                          <ReportStatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className={TABLE_ROW_ACTIONS_CELL_CLASS}>
                          <RowActionsMenu
                            row={row}
                            menusMounted={menusMounted}
                            onInspect={setInspectRow}
                            onViewLog={setLogRow}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

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

                  <div className="hidden w-full items-center justify-between gap-4 px-4 md:flex">
                    <p className="m-0 text-sm text-muted-foreground">
                      Showing {pageRows.length} of {totalCount} results
                    </p>
                    <div className="flex min-w-0 items-center gap-4">
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
      </div>

      <ReportInspectSheet
        report={inspectRow}
        open={inspectRow != null}
        onOpenChange={(open) => {
          if (!open) setInspectRow(null);
        }}
      />
      <AuditLogSheet
        report={logRow}
        open={logRow != null}
        onOpenChange={(open) => {
          if (!open) setLogRow(null);
        }}
      />
    </>
  );
}
