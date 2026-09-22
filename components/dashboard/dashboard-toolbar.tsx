"use client";

import { ChevronDown, ListFilter, Search } from "lucide-react";
import * as React from "react";
import {
  activityStatusLabel,
  type ActivityRow,
} from "@/components/activity-table/activity-table";
import {
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
  DASHBOARD_MENU_ITEM_SELECTED_CLASS,
} from "@/components/dashboard/card-actions-menu";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DASHBOARD_CARD_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export type DashboardTypeFilter = "all" | "SOP" | "BPR" | "FIR";
export type DashboardStatusFilter =
  | "all"
  | "Compliant"
  | "Partial"
  | "Critical";
export type DashboardDateRangeFilter = "all" | "7d" | "30d" | "90d";

export type DashboardToolbarValues = {
  search: string;
  type: DashboardTypeFilter;
  status: DashboardStatusFilter;
  dateRange: DashboardDateRangeFilter;
};

function dateRangeStart(range: DashboardDateRangeFilter): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);
  return start;
}

export function filterActivityRows(
  rows: ActivityRow[],
  filters: DashboardToolbarValues,
): ActivityRow[] {
  const query = filters.search.trim().toLowerCase();
  const rangeStart = dateRangeStart(filters.dateRange);

  return rows.filter((row) => {
    if (filters.type !== "all" && row.type !== filters.type) return false;

    if (filters.status !== "all") {
      if (activityStatusLabel(row.status) !== filters.status) return false;
    }

    if (query) {
      const haystack = `${row.document} ${row.id} ${row.type}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (rangeStart) {
      const parsed = Date.parse(row.date);
      if (Number.isNaN(parsed) || parsed < rangeStart.getTime()) return false;
    }

    return true;
  });
}

type DashboardToolbarProps = {
  value: DashboardToolbarValues;
  onChange: (next: DashboardToolbarValues) => void;
  className?: string;
  /** Embed inside another card (no nested card chrome). */
  embedded?: boolean;
};

const CONTROL_CLASS =
  "inline-flex h-10 w-full min-w-[9.5rem] items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-sidebar-muted/40 px-3 text-sm font-medium transition-colors duration-200 hover:border-zinc-400 hover:bg-zinc-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:w-[10.5rem]";

function filterTriggerClass(extra?: string) {
  return cn(CONTROL_CLASS, "text-black", extra);
}

type FilterOption<T extends string> = {
  value: T;
  label: string;
};

function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: readonly FilterOption<T>[];
  onChange: (next: T) => void;
  className?: string;
}) {
  const [mounted, setMounted] = React.useState(false);
  const selected = options.find((option) => option.value === value);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const trigger = (
    <button
      type="button"
      aria-label={label}
      className={filterTriggerClass(className)}
    >
      <span className="min-w-0 flex-1 truncate text-left">
        {selected?.label ?? label}
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 text-black" aria-hidden />
    </button>
  );

  if (!mounted) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className={DASHBOARD_MENU_CONTENT_CLASS}
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
                onChange(option.value);
              }}
            >
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "SOP", label: "SOP" },
  { value: "BPR", label: "BPR" },
  { value: "FIR", label: "FIR" },
] as const satisfies readonly FilterOption<DashboardTypeFilter>[];

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "Compliant", label: "Compliant" },
  { value: "Partial", label: "Partial" },
  { value: "Critical", label: "Critical" },
] as const satisfies readonly FilterOption<DashboardStatusFilter>[];

const DATE_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
] as const satisfies readonly FilterOption<DashboardDateRangeFilter>[];

function activeFilterCount(value: DashboardToolbarValues) {
  let count = 0;
  if (value.type !== "all") count += 1;
  if (value.status !== "all") count += 1;
  if (value.dateRange !== "all") count += 1;
  return count;
}

function MobileFilterSection<T extends string>({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: T;
  options: readonly FilterOption<T>[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="m-0 px-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
        {title}
      </p>
      <div className="flex flex-col gap-0.5 rounded-xl border border-zinc-200 bg-white p-1">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={cn(
                DASHBOARD_MENU_ITEM_CLASS,
                "w-full text-left",
                isSelected && DASHBOARD_MENU_ITEM_SELECTED_CLASS,
              )}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MobileFiltersSheet({
  value,
  onChange,
}: {
  value: DashboardToolbarValues;
  onChange: (partial: Partial<DashboardToolbarValues>) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const count = activeFilterCount(value);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const triggerClass = filterTriggerClass(
    "w-auto min-w-0 shrink-0 gap-1.5 px-3 md:hidden",
  );

  const trigger = (
    <button type="button" aria-label="Open filters" className={triggerClass}>
      <ListFilter className="size-4 shrink-0" aria-hidden />
      <span>Filters</span>
      {count > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-[11px] font-semibold leading-5 text-white">
          {count}
        </span>
      ) : (
        <ChevronDown className="h-4 w-4 shrink-0 text-black" aria-hidden />
      )}
    </button>
  );

  if (!mounted) return trigger;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        aria-label="Open filters"
        className={triggerClass}
        onClick={() => setOpen(true)}
      >
        <ListFilter className="size-4 shrink-0" aria-hidden />
        <span>Filters</span>
        {count > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-[11px] font-semibold leading-5 text-white">
            {count}
          </span>
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-black" aria-hidden />
        )}
      </button>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] gap-0 rounded-t-2xl border-zinc-200 bg-[#F7F7F7] p-0"
      >
        <SheetHeader className="shrink-0 border-b border-zinc-200 px-4 py-4">
          <SheetTitle className="text-left text-base font-medium text-black">
            Filters
          </SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
          <MobileFilterSection
            title="Type"
            value={value.type}
            options={TYPE_OPTIONS}
            onChange={(type) => onChange({ type })}
          />
          <MobileFilterSection
            title="Status"
            value={value.status}
            options={STATUS_OPTIONS}
            onChange={(status) => onChange({ status })}
          />
          <MobileFilterSection
            title="Date range"
            value={value.dateRange}
            options={DATE_OPTIONS}
            onChange={(dateRange) => onChange({ dateRange })}
          />
        </div>
        <div className="shrink-0 border-t border-zinc-200 px-4 py-3">
          <button
            type="button"
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            onClick={() => setOpen(false)}
          >
            Done
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function DashboardToolbar({
  value,
  onChange,
  className,
  embedded = false,
}: DashboardToolbarProps) {
  function patch(partial: Partial<DashboardToolbarValues>) {
    onChange({ ...value, ...partial });
  }

  const controls = (
    <div
      className={cn(
        "flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4",
        embedded && "px-4 py-3",
      )}
      role="search"
      aria-label="Search and filter audits"
    >
      <div className="flex min-w-0 w-full items-center gap-2 md:max-w-md md:flex-1">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-black"
            aria-hidden
          />
          <Input
            type="search"
            value={value.search}
            onChange={(event) => patch({ search: event.target.value })}
            placeholder="Search documents"
            aria-label="Search documents"
            className="h-10 border-zinc-200 bg-sidebar-muted/40 pl-9 text-sm font-medium text-black transition-colors duration-200 placeholder:text-black hover:border-zinc-400 hover:bg-zinc-50/50 md:text-sm"
          />
        </div>
        <MobileFiltersSheet value={value} onChange={patch} />
      </div>

      <div className="hidden w-full flex-col gap-3 md:flex md:w-auto md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-3">
        <FilterDropdown
          label="Filter by type"
          value={value.type}
          options={TYPE_OPTIONS}
          onChange={(type) => patch({ type })}
        />
        <FilterDropdown
          label="Filter by status"
          value={value.status}
          options={STATUS_OPTIONS}
          onChange={(status) => patch({ status })}
        />
        <FilterDropdown
          label="Filter by date range"
          value={value.dateRange}
          options={DATE_OPTIONS}
          onChange={(dateRange) => patch({ dateRange })}
        />
      </div>
    </div>
  );

  if (embedded) {
    return <div className={className}>{controls}</div>;
  }

  return (
    <Card className={cn(DASHBOARD_CARD_CLASS, className)}>
      <CardContent className="p-4">{controls}</CardContent>
    </Card>
  );
}
