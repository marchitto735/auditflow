"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
  DASHBOARD_MENU_ITEM_SELECTED_CLASS,
} from "@/components/dashboard/card-actions-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { DROPDOWN_TRIGGER_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const TIME_RANGES = [
  { value: "24h", label: "Last 24 h" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
] as const;

type TimeRange = (typeof TIME_RANGES)[number]["value"];

const UNIT_OPTIONS = [
  { value: "all", label: "All units" },
  { value: "unit-a", label: "Unit A" },
  { value: "unit-b", label: "Unit B" },
  { value: "unit-c", label: "Unit C" },
] as const;

type UnitFilter = (typeof UNIT_OPTIONS)[number]["value"];

function formatUpdatedLabel(secondsAgo: number) {
  if (secondsAgo < 60) return `Updated ${secondsAgo} s ago`;
  const minutes = Math.floor(secondsAgo / 60);
  if (minutes < 60) return `Updated ${minutes} m ago`;
  const hours = Math.floor(minutes / 60);
  return `Updated ${hours} h ago`;
}

function UnitFilterDropdown({
  value,
  onChange,
}: {
  value: UnitFilter;
  onChange: (next: UnitFilter) => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  const selected =
    UNIT_OPTIONS.find((option) => option.value === value)?.label ?? "All units";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const trigger = (
    <button
      type="button"
      aria-label="Filter by unit"
      className={cn(
        "inline-flex h-9 w-auto min-w-[8.5rem] items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium",
        DROPDOWN_TRIGGER_CLASS,
      )}
    >
      <span className="min-w-0 flex-1 truncate text-left">{selected}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-neutral-900 opacity-70" aria-hidden />
    </button>
  );

  if (!mounted) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={DASHBOARD_MENU_CONTENT_CLASS}
      >
        {UNIT_OPTIONS.map((option) => {
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

/**
 * Time-range filter bar (Last 24 h, 7/30/90 days, All units, Live).
 * Set to true to show it again above the metric cards.
 */
export const SHOW_DASHBOARD_TIME_RANGE_FILTER = false;

/**
 * Command-center chrome — time range, unit scope, live status, and freshness.
 */
export function DashboardCommandHeader({ className }: { className?: string }) {
  const [range, setRange] = React.useState<TimeRange>("24h");
  const [unit, setUnit] = React.useState<UnitFilter>("all");
  const [secondsAgo, setSecondsAgo] = React.useState(0);

  React.useEffect(() => {
    setSecondsAgo(0);
    const id = window.setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <ToggleGroup
          type="single"
          value={range}
          onValueChange={(value) => {
            if (!value) return;
            setRange(value as TimeRange);
            setSecondsAgo(0);
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Time range"
          className="rounded-lg border border-zinc-200 bg-zinc-100/80 p-0.5 shadow-none"
        >
          {TIME_RANGES.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className={cn(
                "h-8 rounded-md border-0 px-3 shadow-none first:rounded-md last:rounded-md data-[spacing=0]:rounded-md data-[spacing=0]:first:rounded-md data-[spacing=0]:last:rounded-md",
                "data-[state=on]:bg-primary data-[state=on]:font-medium data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-[var(--primary-hover)] data-[state=on]:hover:text-primary-foreground",
                "data-[state=off]:bg-transparent data-[state=off]:font-medium data-[state=off]:text-neutral-500 data-[state=off]:hover:bg-neutral-200 data-[state=off]:hover:text-neutral-900",
                "focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-0",
              )}
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <UnitFilterDropdown
          value={unit}
          onChange={(next) => {
            setUnit(next);
            setSecondsAgo(0);
          }}
        />

        <span
          className="inline-flex h-9 min-h-9 cursor-default items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-foreground shadow-none select-none"
          aria-label="System status: live"
          role="status"
        >
          <span
            className="size-2.5 shrink-0 rounded-full bg-emerald-600"
            aria-hidden
          />
          <span>Live</span>
        </span>
      </div>

      <span className="text-sm font-medium text-neutral-500 tabular-nums">
        {formatUpdatedLabel(secondsAgo)}
      </span>
    </div>
  );
}
