"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConfigureAudit } from "@/components/configure-audit-modal/configure-audit-context";
import {
  AUDIT_WORKFLOWS,
  type AuditWorkflowId,
} from "@/lib/audit-workflows";
import {
  AUDIT_LAUNCHER_CARD_HEIGHT_CLASS,
  CARD_CONTENT_CLASS,
  CARD_EYEBROW_MUTED_CLASS,
  CARD_FOOTER_CLASS,
  CARD_HEADER_STACK_CLASS,
  CARD_TITLE_CLASS,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_TRIPLE_CARD_GRID_CLASS,
} from "@/lib/page-layout";
import { workflowStatusDotClass } from "@/lib/chart-tokens";
import { cn } from "@/lib/utils";

const FEATURED_CARD_CLASS = cn(
  DASHBOARD_CARD_CLASS,
  "flex w-full min-w-0 shrink-0 flex-col text-left",
);

/** Functional category eyebrow (CSS uppercase via CARD_EYEBROW_*). */
const EYEBROW_DISPLAY: Record<AuditWorkflowId, string> = {
  sop: "Standard Operating Procedure (SOP)",
  bpr: "Batch Production Record (BPR)",
  fir: "Facility Inspection Report (FIR)",
};

/** Featured Audits page eyebrows — regulatory domain categories. */
const FEATURED_EYEBROW_DISPLAY: Record<AuditWorkflowId, string> = {
  sop: "Policy Control",
  bpr: "Production Log",
  fir: "Site Audit",
};

/** Featured Audits page titles — full document type names. */
const FEATURED_TITLE_DISPLAY: Record<AuditWorkflowId, string> = {
  sop: "Standard Operating Procedure (SOP)",
  bpr: "Batch Production Record (BPR)",
  fir: "Facility Inspection Report (FIR)",
};

/** Dashboard compact titles — live counts for fleet telemetry. */
const COMPACT_TITLE_DISPLAY: Record<AuditWorkflowId, string> = {
  sop: "738",
  bpr: "392",
  fir: "846",
};

/** Feature bullets — Audits page (`featured`) only; never on Dashboard compact. */
const FEATURE_BULLETS: Record<AuditWorkflowId, readonly [string, string, string]> = {
  sop: [
    "Parses master process documentation against active workflows.",
    "Automatically flags step-by-step deviations and clause gaps.",
    "Generates comparative compliance audit logs.",
  ],
  bpr: [
    "Cross-references batch yields and parameter logs.",
    "Validates critical control point compliance.",
    "Highlights historical variance and batch anomalies.",
  ],
  fir: [
    "Audits environmental and safety checklist logs.",
    "Summarizes open facility findings and recurring issues.",
    "Tracks required corrective action timelines.",
  ],
};

type LauncherMetrics = {
  trend: number[];
  chunks: string;
  latency: string;
  success: string;
};

/** Dashboard Quick Launch only — not shown on the dedicated Audits page. */
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
  const width = 76;
  const height = 28;
  const pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values
    .map((value, index) => {
      const x =
        pad + (index / Math.max(values.length - 1, 1)) * (width - pad * 2);
      const y =
        height - pad - ((value - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  const lastX =
    pad +
    ((values.length - 1) / Math.max(values.length - 1, 1)) * (width - pad * 2);
  const lastY =
    height -
    pad -
    ((values[values.length - 1]! - min) / range) * (height - pad * 2);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
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
  featured = false,
}: {
  id: AuditWorkflowId;
  className?: string;
  /** Larger tile + primary button CTA for the dedicated Audits page (no telemetry). */
  featured?: boolean;
}) {
  const { openConfigureAudit } = useConfigureAudit();
  const workflow = AUDIT_WORKFLOWS[id];
  const eyebrow = featured
    ? FEATURED_EYEBROW_DISPLAY[id]
    : EYEBROW_DISPLAY[id];
  const title = featured
    ? FEATURED_TITLE_DISPLAY[id]
    : COMPACT_TITLE_DISPLAY[id];
  /** Sparklines + ops metrics only on Dashboard compact Quick Launch. */
  const metrics = featured ? null : LAUNCHER_METRICS[id];
  const bullets = featured ? FEATURE_BULLETS[id] : null;

  function handleActivate() {
    openConfigureAudit(id);
  }

  if (featured) {
    return (
      <div
        data-audit-launcher-card={id}
        className={cn(FEATURED_CARD_CLASS, "min-h-[280px] h-full", className)}
      >
        <Card className="flex h-full w-full min-h-0 flex-col border-0 bg-transparent shadow-none">
          <CardContent
            className={cn(
              CARD_CONTENT_CLASS,
              "flex h-full w-full min-h-0 flex-col justify-between gap-4 overflow-visible p-4 text-left",
            )}
          >
            <div className="flex min-w-0 flex-col gap-2">
              <div className={CARD_HEADER_STACK_CLASS}>
                <p className={cn(CARD_EYEBROW_MUTED_CLASS, "max-w-full")}>
                  {eyebrow}
                </p>
                <h3
                  className={cn(
                    CARD_TITLE_CLASS,
                    "m-0 max-w-full hyphens-auto break-words text-pretty text-black",
                  )}
                >
                  {title}
                </h3>
              </div>

              {bullets ? (
                <ul className="m-0 mt-1 flex list-disc flex-col gap-3 py-0 pl-4 text-base leading-snug text-black">
                  {bullets.map((bullet) => (
                    <li key={bullet} className="pl-0.5">
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className={cn(CARD_FOOTER_CLASS, "w-full justify-stretch pt-1")}>
              <Button
                type="button"
                variant="black"
                className="w-full"
                onClick={handleActivate}
              >
                Run Audit
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      data-audit-launcher-card={id}
      className={cn(
        DASHBOARD_CARD_CLASS,
        "flex w-full min-w-0 shrink-0 flex-col text-left",
        AUDIT_LAUNCHER_CARD_HEIGHT_CLASS,
        className,
      )}
    >
      <Card className="flex h-full w-full min-h-0 flex-col border-0 bg-transparent shadow-none">
        <CardContent
          className={cn(
            CARD_CONTENT_CLASS,
            "flex h-full w-full min-h-0 flex-col justify-between gap-3 overflow-visible p-4 text-left",
          )}
        >
          <div className="flex min-w-0 flex-col gap-2">
            <p className={cn(CARD_EYEBROW_MUTED_CLASS, "max-w-full")}>
              {eyebrow}
            </p>
            <div
              className={cn(
                "grid w-full items-center gap-x-3",
                metrics
                  ? "grid-cols-[minmax(0,1fr)_auto]"
                  : "grid-cols-1",
              )}
            >
              <h3
                className={cn(
                  CARD_TITLE_CLASS,
                  "m-0 max-w-full hyphens-auto break-words text-pretty text-black",
                )}
              >
                {title}
              </h3>
              {metrics ? (
                <div className="flex w-[4.75rem] shrink-0 flex-col items-end justify-center">
                  <TrendSparkline
                    values={metrics.trend}
                    label={`${workflow.label} score trend over last five runs`}
                    className={workflowStatusSparkClass(workflow.status)}
                  />
                </div>
              ) : null}
            </div>

            <p
              className="text-body1 m-0 flex flex-wrap items-center justify-start gap-x-2 gap-y-1 font-sans leading-snug text-black"
              aria-label={`${workflow.label} status ${workflow.status}, last run ${workflow.lastRun}`}
            >
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full",
                  workflowStatusDotClass(workflow.status),
                )}
                aria-hidden
              />
              <span className="font-medium">{workflow.status}</span>
              <span className="text-black" aria-hidden>
                •
              </span>
              <span className="text-black">Last Run {workflow.lastRun}</span>
            </p>
          </div>

            <div className="mt-auto flex min-w-0 flex-col gap-2.5">
            {metrics ? (
              <div
                className="flex min-w-0 flex-row flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-snug text-black"
                aria-label={`${workflow.label} operational metrics`}
              >
                <span className="shrink-0">
                  <span className="text-black">Chunks</span>{" "}
                  <span className="font-medium text-black">{metrics.chunks}</span>
                </span>
                <span className="shrink-0 text-black" aria-hidden>
                  ·
                </span>
                <span className="shrink-0">
                  <span className="text-black">Latency</span>{" "}
                  <span className="font-medium text-black">{metrics.latency}</span>
                </span>
                <span className="shrink-0 text-black" aria-hidden>
                  ·
                </span>
                <span className="min-w-0">
                  <span className="text-black">Success</span>{" "}
                  <span className="font-medium text-black">{metrics.success}</span>
                </span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Audit launcher grid — SOP / BPR / FIR tiles.
 * Compact (Dashboard): score sparkline + ops metrics.
 * Featured (Audits page): benefit bullets + primary CTAs, no telemetry.
 */
export default function AuditLauncher({
  className,
  variant = "compact",
}: {
  className?: string;
  /** `featured` — dedicated Audits page: taller cards, primary CTAs, no telemetry. */
  variant?: "compact" | "featured";
}) {
  const featured = variant === "featured";

  return (
    <div className={cn("w-full", DASHBOARD_TRIPLE_CARD_GRID_CLASS, className)}>
      <AuditLauncherCard id="sop" featured={featured} />
      <AuditLauncherCard id="bpr" featured={featured} />
      <AuditLauncherCard id="fir" featured={featured} />
    </div>
  );
}
