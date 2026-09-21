"use client";

import { Search } from "lucide-react";
import {
  activityStatusLabel,
  type ActivityRow,
} from "@/components/activity-table/activity-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  "h-10 w-full min-w-[9.5rem] rounded-lg border-zinc-200 bg-white text-sm font-medium sm:w-[10.5rem]";

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
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
          aria-hidden
        />
        <Input
          type="search"
          value={value.search}
          onChange={(event) => patch({ search: event.target.value })}
          placeholder="Search documents and IDs…"
          aria-label="Search documents and IDs"
          className="h-10 border-zinc-200 bg-white pl-9 text-sm font-medium md:text-sm"
        />
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
        <Select
          value={value.type}
          onValueChange={(next) =>
            patch({ type: next as DashboardTypeFilter })
          }
        >
          <SelectTrigger aria-label="Filter by type" className={CONTROL_CLASS}>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="SOP">SOP</SelectItem>
            <SelectItem value="BPR">BPR</SelectItem>
            <SelectItem value="FIR">FIR</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={value.status}
          onValueChange={(next) =>
            patch({ status: next as DashboardStatusFilter })
          }
        >
          <SelectTrigger
            aria-label="Filter by status"
            className={CONTROL_CLASS}
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="Compliant">Compliant</SelectItem>
            <SelectItem value="Partial">Partial</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={value.dateRange}
          onValueChange={(next) =>
            patch({ dateRange: next as DashboardDateRangeFilter })
          }
        >
          <SelectTrigger
            aria-label="Filter by date range"
            className={CONTROL_CLASS}
          >
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
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
