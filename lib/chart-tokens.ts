/**
 * Swiss SaaS chart + status palette — high-contrast jewel tones
 * matched to Active/Ready status indicators (emerald-500 / amber-500).
 * CSS mirrors live in `:root` as `--chart-*`.
 */

export const CHART = {
  /** Bright cobalt — bar series / trend lines */
  primary: "oklch(58% 0.18 230)",
  /** Punchy active bar fill */
  structural: "oklch(55% 0.2 235)",
  /** Softened but still vivid below-threshold bars */
  structuralMuted: "oklch(72% 0.1 230)",
  /** Vivid emerald-500 — matches Active sparkline / status pip */
  gauge: "oklch(70% 0.17 162)",
  /** Inactive tracks / background bars — slightly cooler zinc */
  track: "oklch(90% 0.01 250)",
  /** Quieter track — zinc-100 */
  trackSoft: "oklch(96.5% 0.002 286)",
  /** Grid lines */
  grid: "oklch(94.5% 0.003 286)",
  /** Reference / baseline dashed lines */
  reference: "oklch(70% 0.01 286)",
  /** Donut / severity — rich crimson */
  critical: "oklch(55% 0.22 25)",
  /** Vivid orange-500 — high severity ring segment */
  high: "oklch(70% 0.19 45)",
  /** Vivid amber-500 — medium severity / Ready status */
  medium: "oklch(76% 0.17 75)",
  /** Soft slate — low / secondary ring segment (inactive track) */
  low: "oklch(70% 0.015 260)",
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

export type WorkflowStatus = "Active" | "Ready" | "Draft" | "Pending";

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
      return "bg-red-600";
    case "High":
      return "bg-orange-500";
    case "Medium":
      return "bg-amber-500";
    default:
      return "bg-slate-400";
  }
}

/** Audit launcher / workflow status pips. */
export function workflowStatusDotClass(status: string): string {
  switch (status) {
    case "Active":
      return "bg-emerald-500";
    case "Ready":
    case "Pending":
      return "bg-amber-500";
    case "Draft":
    default:
      return "bg-zinc-400";
  }
}

/** Score → series fill (gauge, category bars). */
export function scoreSeriesColor(score: number): string {
  if (score < 70) return CHART.critical;
  if (score <= 85) return CHART.medium;
  return CHART.gauge;
}

/** Tailwind bg utility for score progress fills. */
export function scoreFillClass(score: number): string {
  if (score < 70) return "bg-red-600";
  if (score <= 85) return "bg-amber-500";
  return "bg-emerald-600";
}
