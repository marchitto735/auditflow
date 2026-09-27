/**
 * Swiss SaaS chart + status palette — monochrome ink scale.
 * CSS mirrors live in `:root` as `--chart-*`.
 */

export const CHART = {
  /** Primary series / trend lines */
  primary: "oklch(35% 0 0)",
  /** Active bar fill */
  structural: "oklch(40% 0 0)",
  /** Softened below-threshold bars */
  structuralMuted: "oklch(72% 0 0)",
  /** Gauge / high score fill */
  gauge: "oklch(45% 0 0)",
  /** Inactive tracks / background bars */
  track: "oklch(90% 0 0)",
  /** Quieter track */
  trackSoft: "oklch(96.5% 0 0)",
  /** Grid lines */
  grid: "oklch(94.5% 0 0)",
  /** Reference / baseline dashed lines */
  reference: "oklch(70% 0 0)",
  /** Critical severity */
  critical: "oklch(35% 0 0)",
  /** High severity */
  high: "oklch(45% 0 0)",
  /** Medium severity */
  medium: "oklch(55% 0 0)",
  /** Low / secondary */
  low: "oklch(70% 0 0)",
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

/** Tailwind class for severity pips (tables, legends) — grayscale. */
export function severityDotClass(severity: ChartSeverity): string {
  switch (severity) {
    case "Critical":
      return "bg-neutral-900";
    case "High":
      return "bg-neutral-700";
    case "Medium":
      return "bg-neutral-500";
    default:
      return "bg-neutral-300";
  }
}

/**
 * Dashboard telemetry status → grayscale sparkline + status pip.
 */
function workflowStatusTone(status: string): {
  spark: string;
  dot: string;
} {
  switch (status) {
    case "Active":
      return { spark: "text-neutral-900", dot: "bg-neutral-900" };
    case "Ready":
    case "Pending":
      return { spark: "text-neutral-600", dot: "bg-neutral-600" };
    case "Draft":
      return { spark: "text-neutral-400", dot: "bg-neutral-400" };
    case "Synced":
      return { spark: "text-neutral-700", dot: "bg-neutral-700" };
    case "Flagged":
      return { spark: "text-neutral-800", dot: "bg-neutral-800" };
    case "Verified":
      return { spark: "text-neutral-900", dot: "bg-neutral-900" };
    default:
      return { spark: "text-neutral-500", dot: "bg-neutral-500" };
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

/** Score → series fill (gauge, category bars). */
export function scoreSeriesColor(score: number): string {
  if (score < 70) return CHART.critical;
  if (score <= 85) return CHART.medium;
  return CHART.gauge;
}

/** Tailwind bg utility for score progress fills — grayscale. */
export function scoreFillClass(score: number): string {
  if (score < 70) return "bg-neutral-800";
  if (score <= 85) return "bg-neutral-500";
  return "bg-neutral-900";
}
