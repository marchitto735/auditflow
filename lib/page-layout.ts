/** Outer page gutter: consistent horizontal inset from screen / sidebar edge. */
export const PAGE_GUTTER_CLASS = "w-full min-w-0 px-6 md:px-8";

/** Centered content rail — caps width on ultra-wide displays. */
export const PAGE_INNER_CLASS = "mx-auto w-full max-w-[1400px]";

/**
 * Uniform dashboard grid gutter — 24px on both axes (row sections + card columns).
 */
export const DASHBOARD_GAP_CLASS = "gap-6";

/**
 * Vertical gap between major dashboard sections (e.g. Snapshot → Launcher).
 */
export const DASHBOARD_SECTION_GAP_CLASS = "gap-6";

/**
 * Space below the top nav before page content — shared with sidebar nav
 * so the first content row aligns. Kept flush for denser Swiss rhythm.
 */
export const PAGE_CONTENT_TOP_CLASS = "pt-0";

/**
 * App canvas behind cards — neutral light grey (greyscale).
 * Prefer this (or `bg-background`) over hard-coded whites on page shells.
 */
export const PAGE_CANVAS_CLASS = "bg-[#F7F7F7] dark:bg-background color:bg-background";

/** Shared height for sidebar brand bar + main sticky navbar. */
export const APP_TOPBAR_HEIGHT_CLASS = "h-16";

/** Icon utility buttons — same radius as sidebar nav; hover visible on canvas + white. */
export const NAV_UTILITY_BUTTON_CLASS =
  "nav-button flex h-9 w-9 min-h-9 min-w-9 items-center justify-center rounded-[6px] p-0! bg-transparent border-0 shadow-none transition-colors hover:bg-[#EDEDED] dark:hover:bg-zinc-700/40 color:hover:bg-[oklch(100%_0_0_/0.09)] [&_svg]:size-5 [&_svg]:shrink-0";

/** Static dashboard card chrome — flat white surface, subtle zinc border, no shadow. */
export const DASHBOARD_CARD_CLASS =
  "rounded-2xl border border-zinc-200 bg-white shadow-none";

/**
 * Status KPI cards — fixed 160px track height.
 */
export const DASHBOARD_TRACK_CARD_HEIGHT_CLASS = "h-[160px] min-h-[160px]";

/**
 * Audit Fleet tiles — fixed 160px track height (matches Status KPIs).
 */
export const AUDIT_LAUNCHER_CARD_HEIGHT_CLASS = "h-[160px] min-h-[160px]";

/**
 * Shared responsive grid for Audit Launcher + Compliance Snapshot (3 cards each).
 * Stack only on small mobile; lock 3-up from `md` so bento stays side-by-side
 * across tablet / split-screen / desktop (avoids early single-column collapse).
 */
export const DASHBOARD_TRIPLE_CARD_GRID_CLASS =
  "grid grid-cols-1 items-stretch gap-6 md:grid-cols-3";

/**
 * Recent Activity card — filter bar + table header + 3 body rows + pagination.
 * Locked so the footer never clips when the grid flexes.
 */
/**
 * Recent Activity / History card — height follows toolbar + table viewport + footer.
 * Table body viewport (header bottom → footer top) is fixed in RecentActivity.
 */
export const RECENT_ACTIVITY_CARD_HEIGHT_CLASS = "h-auto";

/**
 * Interactive card chrome — flat at rest; soft border + shadow lift on hover.
 * Compose with layout utilities (flex, group, etc.) as needed.
 */
export const INTERACTIVE_CARD_CLASS =
  "rounded-2xl border border-zinc-200 bg-white shadow-none transition-all duration-200 ease-in-out hover:border-zinc-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-zinc-800/30";

/**
 * Card eyebrow — default type-scale label for all cards.
 * All-caps, 13px / medium.
 * Prefer full words in source copy; CSS `uppercase` handles presentation
 * (write “Average Score”, not “Avg Score”).
 */
export const CARD_EYEBROW_CLASS =
  "m-0 text-[13px] font-medium uppercase tracking-wider text-black";

/**
 * Section card eyebrow — title case, 14px / semibold (no uppercase transform).
 */
export const CARD_SECTION_EYEBROW_CLASS =
  "m-0 text-[14px] font-semibold tracking-tight text-black";

/**
 * Eyebrow → title stack — 8px gap on every dashboard card header.
 */
export const CARD_HEADER_STACK_CLASS = "flex min-w-0 flex-col gap-2";

/**
 * Alias of `CARD_EYEBROW_CLASS` — single eyebrow style across the design system.
 */
export const CARD_EYEBROW_MUTED_CLASS = CARD_EYEBROW_CLASS;

/**
 * Page section grouping label (18px / medium).
 */
export const SECTION_HEADER_CLASS =
  "text-lg font-medium leading-tight tracking-tight";

/**
 * Primary card title (26px / bold) — audit fleet metric titles, etc.
 */
export const CARD_TITLE_CLASS =
  "text-[26px] font-bold leading-tight tracking-tight";

/**
 * Status KPI primary metric value (26px / bold).
 */
export const CARD_METRIC_CLASS =
  "text-[26px] font-bold leading-tight tracking-tight";

/**
 * Shared interactive card body — compact padding, no fixed min-height.
 */
export const CARD_CONTENT_CLASS =
  "flex h-full flex-col gap-2 p-4";

/**
 * Shared card footer — tight gap above CTA for Swiss density.
 */
export const CARD_FOOTER_CLASS =
  "flex w-full shrink-0 justify-end pt-1";

/**
 * Card footer action link — muted → dark on hover, no underline, arrow nudge.
 * Parent must use `group`.
 */
export const CARD_CTA_CLASS =
  "inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-zinc-500 no-underline transition-colors duration-150 group-hover:text-zinc-900";

export const CARD_CTA_ARROW_CLASS =
  "h-4 w-4 transition-transform duration-150 group-hover:translate-x-1";

/**
 * Shared right-hand metadata for telemetry cards (pipeline ETAs, feed timestamps).
 */
export const TELEMETRY_META_CLASS =
  "shrink-0 font-mono text-sm font-normal tabular-nums text-black whitespace-nowrap";

/**
 * Shared agent/stage badge pill for telemetry rows.
 */
export const TELEMETRY_PILL_CLASS =
  "inline-flex shrink-0 items-center rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap text-zinc-700";

/**
 * Shared telemetry list stack (pipeline jobs + activity feed).
 */
export const TELEMETRY_LIST_CLASS =
  "m-0 flex list-none flex-col gap-3 p-0";

/**
 * Shared telemetry list row: message/primary left, metadata right.
 */
export const TELEMETRY_ROW_CLASS =
  "m-0 flex min-w-0 shrink-0 items-center justify-between gap-4";
