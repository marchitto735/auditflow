"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
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

/**
 * Command-center chrome — time range, unit scope, live pulse, and freshness.
 * Built from shadcn ToggleGroup, Select, Button, and Badge.
 */
export function DashboardCommandHeader({ className }: { className?: string }) {
  const [range, setRange] = React.useState<TimeRange>("24h");
  const [unit, setUnit] = React.useState<UnitFilter>("all");
  const [live, setLive] = React.useState(true);
  const [secondsAgo, setSecondsAgo] = React.useState(0);

  React.useEffect(() => {
    if (!live) return;
    setSecondsAgo(0);
    const id = window.setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [live]);

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
                "data-[state=on]:bg-[#E4E8EE] data-[state=on]:font-semibold data-[state=on]:text-zinc-900",
                "data-[state=off]:bg-transparent data-[state=off]:font-medium data-[state=off]:text-zinc-500",
              )}
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Select
          value={unit}
          onValueChange={(value) => {
            setUnit(value as UnitFilter);
            setSecondsAgo(0);
          }}
        >
          <SelectTrigger
            aria-label="Filter by unit"
            className="h-9 w-auto min-w-[8.5rem] border-zinc-200 bg-white font-medium shadow-none"
          >
            <SelectValue placeholder="All units" />
          </SelectTrigger>
          <SelectContent align="start">
            {UNIT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          aria-pressed={live}
          aria-label={live ? "Pause live updates" : "Resume live updates"}
          onClick={() => setLive((prev) => !prev)}
          className="h-9 min-h-9 gap-2 border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 shadow-none hover:bg-zinc-50/80 [&_svg]:size-3.5 [&_svg]:text-zinc-500"
        >
          <span
            className="relative flex size-2.5 shrink-0 items-center justify-center"
            aria-hidden
          >
            {live ? (
              <>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative size-2.5 rounded-full bg-emerald-500" />
              </>
            ) : (
              <span className="size-2.5 rounded-full bg-zinc-300" />
            )}
          </span>
          <span>{live ? "Live" : "Paused"}</span>
          {live ? <Pause aria-hidden /> : <Play aria-hidden />}
        </Button>
      </div>

      <Badge
        variant="ghost"
        className="h-auto px-0 py-0 text-sm font-normal text-zinc-500 tabular-nums"
      >
        {formatUpdatedLabel(secondsAgo)}
      </Badge>
    </div>
  );
}
