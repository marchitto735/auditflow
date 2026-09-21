"use client";

import { ChevronDown, Search } from "lucide-react";
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
  "inline-flex h-10 w-full min-w-[9.5rem] items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium sm:w-[10.5rem]";

function filterTriggerClass() {
  return cn(CONTROL_CLASS, "text-black");
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
}: {
  label: string;
  value: T;
  options: readonly FilterOption<T>[];
  onChange: (next: T) => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  const selected = options.find((option) => option.value === value);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const trigger = (
    <button type="button" aria-label={label} className={filterTriggerClass()}>
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
        "flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        embedded && "px-4 py-3",
      )}
      role="search"
      aria-label="Search and filter audits"
    >
      <div className="relative min-w-0 w-full sm:max-w-md sm:flex-1">
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
          className="h-10 border-zinc-200 bg-white pl-9 text-sm font-medium text-black placeholder:text-black md:text-sm"
        />
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
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
