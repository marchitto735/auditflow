"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  ActivityTable,
  type ActivityRow,
} from "@/components/activity-table/activity-table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLLAPSED_ROW_COUNT = 5;

export default function RecentActivity({
  rows,
}: {
  rows: ActivityRow[];
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleRows = expanded
    ? rows
    : rows.slice(0, COLLAPSED_ROW_COUNT);

  return (
    <Card className="overflow-hidden rounded-2xl border-0 bg-[oklch(100%_0_0)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <p className="text-body1 m-0 px-4 py-4 text-muted-foreground">
            No recent audits yet. Launch an SOP, BPR, or FIR audit to see
            activity here.
          </p>
        ) : (
          <ActivityTable
            rows={visibleRows}
            headerAction={
              rows.length > COLLAPSED_ROW_COUNT ? (
                <button
                  type="button"
                  className="-mr-2 flex size-9 shrink-0 items-center justify-center rounded-sm bg-transparent text-foreground hover:bg-[var(--sidebar-hover)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(40%_0.035_165)]"
                  aria-expanded={expanded}
                  aria-label={
                    expanded
                      ? "Show fewer activity rows"
                      : "Show more activity rows"
                  }
                  onClick={() => setExpanded((current) => !current)}
                >
                  <ChevronDown
                    className={cn(
                      "size-5 transition-transform",
                      expanded && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
              ) : null
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
