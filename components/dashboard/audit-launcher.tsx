"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useConfigureAudit } from "@/components/configure-audit-modal/configure-audit-context";
import {
  AUDIT_WORKFLOWS,
  type AuditWorkflowId,
} from "@/lib/audit-workflows";
import {
  CARD_CONTENT_CLASS,
  CARD_CTA_ARROW_CLASS,
  CARD_CTA_CLASS,
  CARD_EYEBROW_CLASS,
  CARD_FOOTER_CLASS,
  CARD_TITLE_CLASS,
  DASHBOARD_GAP_CLASS,
  INTERACTIVE_CARD_CLASS,
} from "@/lib/page-layout";
import { workflowStatusDotClass } from "@/lib/chart-tokens";
import { cn } from "@/lib/utils";

const CARD_CLASS = cn(
  INTERACTIVE_CARD_CLASS,
  "group flex w-full min-w-0 flex-col text-left text-inherit",
);

/** Full name + acronym for card titles. */
const TITLE_DISPLAY: Record<AuditWorkflowId, string> = {
  sop: "Standard Operating Procedure (SOP)",
  bpr: "Batch Production Record (BPR)",
  fir: "Facility\u00A0Inspection Report (FIR)",
};

type LauncherMetrics = {
  /** Last 5 run scores (0–100) for the sparkline. */
  trend: number[];
  chunks: string;
  latency: string;
  success: string;
};

const LAUNCHER_METRICS: Record<AuditWorkflowId, LauncherMetrics> = {
  sop: {
    trend: [86, 88, 84, 91, 89],
    chunks: "1.4k",
    latency: "1.2s",
    success: "98%",
  },
  bpr: {
    trend: [78, 82, 80, 85, 83],
    chunks: "2.1k",
    latency: "1.8s",
    success: "94%",
  },
  fir: {
    trend: [72, 70, 74, 76, 75],
    chunks: "0.9k",
    latency: "0.9s",
    success: "91%",
  },
};

/** Sparkline stroke mirrors the status pip on each card. */
function workflowStatusSparkClass(status: string): string {
  switch (status) {
    case "Active":
      return "text-emerald-500";
    case "Ready":
    case "Pending":
      return "text-amber-500";
    case "Draft":
    default:
      return "text-zinc-400";
  }
}

function TrendSparkline({
  values,
  label,
  className,
}: {
  values: number[];
  label: string;
  className?: string;
}) {
  const width = 72;
  const height = 28;
  /** Keep stroke ends + terminal dot inside the viewBox / card edge. */
  const padX = 4;
  const padY = 3;
  const plotWidth = width - padX * 2;
  const plotHeight = height - padY * 2;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  const points = values
    .map((value, index) => {
      const x =
        values.length === 1
          ? width / 2
          : padX + (index / (values.length - 1)) * plotWidth;
      const y = height - padY - ((value - min) / range) * plotHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const last = values[values.length - 1] ?? 0;
  const lastX = padX + plotWidth;
  const lastY = height - padY - ((last - min) / range) * plotHeight;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("mr-1 shrink-0 overflow-visible", className)}
      role="img"
      aria-label={label}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle cx={lastX} cy={lastY} r="2" fill="currentColor" />
    </svg>
  );
}

export function AuditLauncherCard({
  id,
  className,
  style,
}: {
  id: AuditWorkflowId;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { openConfigureAudit } = useConfigureAudit();
  const workflow = AUDIT_WORKFLOWS[id];
  const title = TITLE_DISPLAY[id];
  const metrics = LAUNCHER_METRICS[id];

  return (
    <button
      type="button"
      className={cn(CARD_CLASS, className)}
      style={style}
      onClick={() => openConfigureAudit(id)}
      aria-label={`Launch ${title}`}
    >
      <Card className="flex h-full w-full min-h-0 flex-col border-0 bg-transparent shadow-none">
        <CardContent
          className={cn(
            CARD_CONTENT_CLASS,
            "h-full w-full min-h-0 flex-col gap-2.5 text-left",
          )}
        >
          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={CARD_EYEBROW_CLASS}>Audit</p>
                <h3
                  className={cn(
                    CARD_TITLE_CLASS,
                    "m-0 mt-1 max-w-full text-balance text-zinc-950",
                  )}
                >
                  {title}
                </h3>
              </div>
              <div className="mr-1 flex shrink-0 flex-col items-end gap-1 pt-0.5">
                <span className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
                  Score
                </span>
                <TrendSparkline
                  values={metrics.trend}
                  label={`${workflow.label} score trend over last five runs`}
                  className={workflowStatusSparkClass(workflow.status)}
                />
              </div>
            </div>

            <p className="text-body1 m-0 flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-zinc-950">
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full",
                  workflowStatusDotClass(workflow.status),
                )}
                aria-hidden
              />
              <span>{workflow.status}</span>
              <span className="text-zinc-500" aria-hidden>
                •
              </span>
              <span className="text-zinc-500">Last Run {workflow.lastRun}</span>
            </p>
          </div>

          <div className="mt-auto flex min-w-0 flex-col gap-2">
            <div
              className="flex min-w-0 flex-row items-center gap-2 overflow-hidden whitespace-nowrap text-[11px] leading-none text-zinc-500"
              aria-label={`${workflow.label} operational metrics`}
            >
              <span className="shrink-0">
                <span className="text-zinc-500">Chunks</span>{" "}
                <span className="font-medium text-zinc-950">
                  {metrics.chunks}
                </span>
              </span>
              <span className="shrink-0 text-zinc-300" aria-hidden>
                ·
              </span>
              <span className="shrink-0">
                <span className="text-zinc-500">Latency</span>{" "}
                <span className="font-medium text-zinc-950">
                  {metrics.latency}
                </span>
              </span>
              <span className="shrink-0 text-zinc-300" aria-hidden>
                ·
              </span>
              <span className="min-w-0 truncate">
                <span className="text-zinc-500">Success</span>{" "}
                <span className="font-medium text-zinc-950">
                  {metrics.success}
                </span>
              </span>
            </div>

            <div className={cn(CARD_FOOTER_CLASS, "-translate-y-px")}>
              <span className={CARD_CTA_CLASS}>
                <span>Launch</span>
                <ChevronRight className={CARD_CTA_ARROW_CLASS} aria-hidden />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

/**
 * Split launcher stack:
 * - Row 1: SOP locked to KPI row height
 * - Row 2: BPR + FIR share remaining height (flush with Recent Activity)
 */
export default function AuditLauncher({
  topCardHeight,
  className,
}: {
  /** Height of the top (SOP) card — matches the KPI row. */
  topCardHeight?: number | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col",
        DASHBOARD_GAP_CLASS,
        className,
      )}
    >
      <AuditLauncherCard
        id="sop"
        className="shrink-0"
        style={
          topCardHeight && topCardHeight > 0
            ? { height: topCardHeight, minHeight: topCardHeight }
            : undefined
        }
      />

      <div
        className={cn(
          "grid min-h-0 flex-1 grid-rows-2",
          DASHBOARD_GAP_CLASS,
        )}
      >
        <AuditLauncherCard id="bpr" className="h-full min-h-0" />
        <AuditLauncherCard id="fir" className="h-full min-h-0" />
      </div>
    </div>
  );
}
