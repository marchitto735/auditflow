"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConfigureAudit } from "@/components/configure-audit-modal/configure-audit-context";
import {
  AUDIT_WORKFLOWS,
  type AuditWorkflowId,
} from "@/lib/audit-workflows";
import {
  AUDIT_LAUNCHER_CARD_HEIGHT_CLASS,
  CARD_BODY_CLASS,
  CARD_CONTENT_CLASS,
  CARD_CORNER_LABEL_CLASS,
  CARD_EYEBROW_MUTED_CLASS,
  CARD_FOOTER_CLASS,
  CARD_TITLE_CLASS,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_TRIPLE_CARD_GRID_CLASS,
} from "@/lib/page-layout";
import { workflowStatusDotClass, workflowStatusSparkClass } from "@/lib/chart-tokens";
import { toSentenceCase } from "@/lib/status-label";
import { cn } from "@/lib/utils";

const FEATURED_CARD_CLASS = cn(
  DASHBOARD_CARD_CLASS,
  "flex w-full min-w-0 shrink-0 flex-col text-left",
);

/** Regulatory domain eyebrows — compact telemetry KPI cards only. */
const EYEBROW_DISPLAY: Record<AuditWorkflowId, string> = {
  sop: "Policy control",
  bpr: "Production log",
  fir: "Site audit",
};

/** Dashboard compact telemetry — shorthand acronym in the card corner. */
const WORKFLOW_ACRONYM: Record<AuditWorkflowId, string> = {
  sop: "SOP",
  bpr: "BPR",
  fir: "FIR",
};

/** Featured Audits page titles — full document type names. */
const FEATURED_TITLE_DISPLAY: Record<AuditWorkflowId, string> = {
  sop: "Standard operating procedure (SOP)",
  bpr: "Batch production record (BPR)",
  fir: "Facility inspection report (FIR)",
};

/** Dashboard compact titles — live counts for fleet telemetry. */
const COMPACT_TITLE_DISPLAY: Record<AuditWorkflowId, string> = {
  sop: "42",
  bpr: "128",
  fir: "14",
};

/** Single-sentence pipeline summaries — Audits featured launch cards. */
const FEATURE_DESCRIPTION: Record<AuditWorkflowId, string> = {
  sop: "Parses master process docs against active workflows and flags deviations.",
  bpr: "Cross-references batch yields and parameter logs to validate critical compliance.",
  fir: "Audits facility checklist logs and tracks open findings through corrective action timelines.",
};

type LauncherMetrics = {
  trend: number[];
  /** Left-footer volume label (e.g. Clauses / Chunks). */
  volumeLabel: string;
  chunks: string;
  latency: string;
  success: string;
  /** Pipeline throughput — bottom-right telemetry (e.g. docs/min or s/doc). */
  throughput: string;
};

/** Dashboard Quick Launch only — not shown on the dedicated Audits page. */
const LAUNCHER_METRICS: Record<AuditWorkflowId, LauncherMetrics> = {
  sop: {
    trend: [38, 40, 39, 41, 42],
    volumeLabel: "Clauses",
    chunks: "1.4k",
    latency: "1.2s",
    success: "98%",
    throughput: "~1.2s/doc",
  },
  bpr: {
    trend: [112, 118, 121, 125, 128],
    volumeLabel: "Chunks",
    chunks: "2.1k",
    latency: "1.8s",
    success: "94%",
    throughput: "~1.8s/doc",
  },
  fir: {
    trend: [11, 12, 13, 13, 14],
    volumeLabel: "Chunks",
    chunks: "0.9k",
    latency: "0.9s",
    success: "91%",
    throughput: "~0.9s/doc",
  },
};

export function TrendSparkline({
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
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn("max-w-[76px] overflow-hidden", className)}
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
  const eyebrow = EYEBROW_DISPLAY[id];
  const acronym = WORKFLOW_ACRONYM[id];
  const title = featured
    ? FEATURED_TITLE_DISPLAY[id]
    : COMPACT_TITLE_DISPLAY[id];
  /** Sparklines + ops metrics on compact pipeline cards (Audits). */
  const metrics = featured ? null : LAUNCHER_METRICS[id];
  const description = featured ? FEATURE_DESCRIPTION[id] : null;

  function handleActivate() {
    openConfigureAudit(id);
  }

  if (featured) {
    return (
      <div
        data-audit-launcher-card={id}
        className={cn(FEATURED_CARD_CLASS, "min-h-0 h-full", className)}
      >
        <Card className="flex h-full w-full min-h-0 flex-col border-0 bg-transparent shadow-none">
          <CardContent
            className={cn(
              CARD_CONTENT_CLASS,
              "flex h-full w-full min-h-0 flex-col justify-between gap-4 overflow-visible p-4 text-left",
            )}
          >
            <div className="flex min-w-0 flex-col gap-2">
              <h3
                className={cn(
                  CARD_TITLE_CLASS,
                  "m-0 max-w-full hyphens-auto break-words text-pretty text-neutral-900",
                )}
              >
                {title}
              </h3>

              {description ? (
                <p
                  className={cn(
                    CARD_BODY_CLASS,
                    "max-w-[36ch] text-pretty",
                  )}
                >
                  {description}
                </p>
              ) : null}
            </div>

            <div className={cn(CARD_FOOTER_CLASS, "w-full justify-stretch pt-0")}>
              <Button
                type="button"
                variant="black"
                className="w-full"
                onClick={handleActivate}
              >
                Run audit
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
        "flex w-full min-w-0 flex-col overflow-hidden text-left",
        AUDIT_LAUNCHER_CARD_HEIGHT_CLASS,
        className,
      )}
    >
      <Card className="flex h-auto w-full min-h-0 min-w-0 flex-col border-0 bg-transparent shadow-none">
        <CardContent
          className={cn(
            CARD_CONTENT_CLASS,
            "flex h-auto w-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden px-4 pt-4 pb-[16px] text-left",
          )}
        >
          <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 sm:gap-x-3">
            <div className="flex min-w-0 flex-col gap-2 overflow-hidden">
              <p
                className={cn(
                  CARD_EYEBROW_MUTED_CLASS,
                  "min-w-0 max-w-full truncate",
                )}
              >
                {eyebrow}
              </p>
              <h3
                className={cn(
                  CARD_TITLE_CLASS,
                  "m-0 max-w-full break-words text-pretty text-neutral-900",
                )}
              >
                {title}
              </h3>
            </div>
            {metrics ? (
              <div className="flex w-[3.75rem] max-w-full shrink-0 flex-col items-center justify-start gap-1 sm:w-[4.75rem]">
                <TrendSparkline
                  values={metrics.trend}
                  label={`${workflow.label} score trend over last five runs`}
                  className={cn(
                    "max-w-full",
                    workflowStatusSparkClass(workflow.status),
                  )}
                />
                <p
                  className={CARD_CORNER_LABEL_CLASS}
                  aria-label={`${workflow.label} document type ${acronym}`}
                >
                  {acronym}
                </p>
              </div>
            ) : null}
          </div>

          <p
            className="text-sm m-0 flex min-w-0 flex-wrap items-center justify-start gap-x-2 gap-y-1 font-sans leading-snug text-neutral-900"
            aria-label={`${workflow.label} status ${workflow.status}, last run ${workflow.lastRun}`}
          >
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full",
                workflowStatusDotClass(workflow.status),
              )}
              aria-hidden
            />
            <span className="shrink-0 font-normal text-foreground">
              {toSentenceCase(workflow.status)}
            </span>
            <span className="shrink-0 text-neutral-900" aria-hidden>
              •
            </span>
            <span className="min-w-0 break-words text-neutral-900">
              Last run {workflow.lastRun}
            </span>
          </p>

          {metrics ? (
            <div
              className="mt-auto flex min-w-0 flex-wrap items-end justify-between gap-x-3 gap-y-1"
              aria-label={`${workflow.label} operational metrics`}
            >
              <div className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-snug text-neutral-900">
                <span className="shrink-0 whitespace-nowrap">
                  <span className="text-neutral-900">{metrics.volumeLabel}</span>{" "}
                  <span className="font-medium text-neutral-900">{metrics.chunks}</span>
                </span>
                <span className="shrink-0 text-neutral-900" aria-hidden>
                  ·
                </span>
                <span className="shrink-0 whitespace-nowrap">
                  <span className="text-neutral-900">Latency</span>{" "}
                  <span className="font-medium text-neutral-900">{metrics.latency}</span>
                </span>
                <span className="shrink-0 text-neutral-900" aria-hidden>
                  ·
                </span>
                <span className="shrink-0 whitespace-nowrap">
                  <span className="text-neutral-900">Success</span>{" "}
                  <span className="font-medium text-neutral-900">{metrics.success}</span>
                </span>
              </div>
              <p
                className="m-0 max-w-full shrink-0 text-right text-xs font-medium tabular-nums tracking-wider break-words text-muted-foreground"
                aria-label={`${workflow.label} throughput ${metrics.throughput}`}
              >
                {metrics.throughput}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Audit launcher grid — SOP / BPR / FIR tiles.
 * Compact: score sparkline + ops metrics (pipeline context).
 * Featured (Audits page): benefit bullets + primary CTAs, no telemetry.
 */
export default function AuditLauncher({
  className,
  variant = "featured",
}: {
  className?: string;
  /** `featured` — Audits page: taller cards, primary CTAs, no telemetry. */
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
