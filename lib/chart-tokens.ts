/**
 * AuditFlow chart + status palette.
 * Neutrals for chrome and trend series; semantic emerald / amber / red
 * only for status-driven signals.
 * CSS mirrors live in `:root` as `--chart-*` / `--status-*` / `--primary`.
 */

export const CHART = {
  /** Primary series / trend lines — charcoal */
  primary: "var(--chart-primary)",
  /** Active bar fill */
  structural: "var(--chart-structural)",
  /** Softened below-threshold bars */
  structuralMuted: "#737373",
  /** Gauge / high score fill */
  gauge: "var(--status-success)",
  /** Inactive tracks / background bars */
  track: "var(--chart-track)",
  /** Quieter track */
  trackSoft: "#f5f5f5",
  /** Grid lines */
  grid: "#e5e5e5",
  /** Reference / baseline dashed lines */
  reference: "#a3a3a3",
  /** Critical severity */
  critical: "var(--status-critical)",
  /** High severity / warning */
  high: "var(--status-warning)",
  /** Medium — charcoal primary */
  medium: "var(--chart-primary)",
  /** Low — mid gray */
  low: "var(--chart-2)",
  /** Success / verified */
  success: "var(--status-success)",
  /** Caution / pending */
  caution: "var(--status-warning)",
} as const;

/**
 * Shared geometry weight across KPI charts — bars, donuts, and gauges
 * read at the same engineered density.
 */
export const CHART_GEOMETRY = {
  /** Ring / arc stroke width (px) */
  stroke: 12,
  /** Max active bar column width (px) — same optical weight as linear tracks */
  barMaxSize: 12,
  /** Horizontal breathing room between bar columns */
  barCategoryGap: "28%",
  /** Top corner radius for columns — square tops */
  barRadius: [0, 0, 0, 0] as [number, number, number, number],
} as const;

export type ChartSeverity = "Critical" | "High" | "Medium" | "Low";

export type WorkflowStatus =
  | "Active"
  | "Ready"
  | "Draft"
  | "Pending"
  | "Synced"
  | "Flagged"
  | "Verified";

export function severityFill(severity: ChartSeverity): string {
  switch (severity) {
    case "Critical":
      return CHART.critical;
    case "High":
      return CHART.high;
    case "Medium":
      return CHART.medium;
    default:
      return CHART.low;
  }
}

/** Tailwind class for severity pips (tables, legends). */
export function severityDotClass(severity: ChartSeverity): string {
  switch (severity) {
    case "Critical":
      return "bg-status-critical";
    case "High":
      return "bg-status-warning";
    case "Medium":
      return "bg-primary";
    default:
      return "bg-primary/50";
  }
}

/** Unified Badge tone for severity chips in tables. */
export function severityBadgeVariant(
  severity: ChartSeverity,
): "destructive" | "warning" | "outline" {
  switch (severity) {
    case "Critical":
      return "destructive";
    case "High":
    case "Medium":
      return "warning";
    default:
      return "outline";
  }
}

/**
 * Dashboard telemetry status → sparkline + status pip.
 * Semantic colors only when the label represents that state;
 * in-progress / active operational series use charcoal primary.
 */
function workflowStatusTone(status: string): {
  spark: string;
  dot: string;
} {
  switch (status) {
    case "Active":
      return { spark: "text-primary", dot: "bg-primary" };
    case "Ready":
    case "Pending":
      return { spark: "text-status-warning", dot: "bg-status-warning" };
    case "Draft":
      return { spark: "text-neutral-400", dot: "bg-neutral-400" };
    case "Synced":
    case "Verified":
      return { spark: "text-status-success", dot: "bg-status-success" };
    case "Flagged":
      return { spark: "text-status-critical", dot: "bg-status-critical" };
    default:
      return { spark: "text-primary", dot: "bg-primary" };
  }
}

/** Audit launcher / KPI status pips. */
export function workflowStatusDotClass(status: string): string {
  return workflowStatusTone(status).dot;
}

/** Sparkline stroke color — matches status pip for the same label. */
export function workflowStatusSparkClass(status: string): string {
  return workflowStatusTone(status).spark;
}

/** Score → series fill (gauge, category bars) — status-driven. */
export function scoreSeriesColor(score: number): string {
  if (score < 70) return CHART.critical;
  if (score <= 85) return CHART.caution;
  return CHART.success;
}

/** Tailwind bg utility for score progress fills. */
export function scoreFillClass(score: number): string {
  if (score < 70) return "bg-status-critical";
  if (score <= 85) return "bg-status-warning";
  return "bg-status-success";
}
