/**
 * Swiss SaaS chart + status palette — saturated mineral / jewel tones
 * with quiet zinc tracks. CSS mirrors live in `:root` as `--chart-*`.
 */

export const CHART = {
  /** Luminous cobalt-teal — bar series / trend lines */
  primary: "oklch(52% 0.12 215)",
  /** Active bar fill (slightly deeper cobalt) */
  structural: "oklch(48% 0.13 220)",
  /** Softer cobalt for below-threshold bars */
  structuralMuted: "oklch(68% 0.06 220)",
  /** Polished forest emerald — healthy gauge / high scores */
  gauge: "oklch(52% 0.14 155)",
  /** Inactive tracks / background bars — zinc-200 */
  track: "oklch(92% 0.004 286)",
  /** Quieter track — zinc-100 */
  trackSoft: "oklch(96.5% 0.002 286)",
  /** Grid lines */
  grid: "oklch(94.5% 0.003 286)",
  /** Reference / baseline dashed lines */
  reference: "oklch(70% 0.01 286)",
  /** Donut / severity — rich crimson */
  critical: "oklch(52% 0.18 25)",
  /** Burnt orange */
  high: "oklch(62% 0.16 45)",
  /** Warm ochre / amber */
  medium: "oklch(72% 0.14 75)",
  /** Slate — low / quiet */
  low: "oklch(58% 0.02 260)",
} as const;

/**
 * Shared geometry weight across KPI charts — bars, donuts, and gauges
 * read at the same engineered density.
 */
export const CHART_GEOMETRY = {
  /** Ring / arc stroke width (px) — matches category breakdown `h-1.5` */
  stroke: 6,
  /** Max active bar column width (px) — same optical weight as linear tracks */
  barMaxSize: 6,
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
