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
 * Uniform bottom breathing room under the last page content frame.
 * Matches Dashboard’s historical inset: 64px (mobile) / 80px (md+).
 * Used as a scroll-spacer height in the sidebar layout.
 */
export const PAGE_CONTENT_BOTTOM_CLASS = "h-16 md:h-20";

/**
 * App canvas behind cards — neutral light grey (greyscale).
 * Prefer this (or `bg-background`) over hard-coded whites on page shells.
 */
export const PAGE_CANVAS_CLASS = "bg-[#F7F7F7] dark:bg-background color:bg-background";

/** Shared height for sidebar brand bar + main sticky navbar. */
export const APP_TOPBAR_HEIGHT_CLASS = "h-16";

/** Icon utility buttons — same radius as sidebar nav; grayscale hover. */
export const NAV_UTILITY_BUTTON_CLASS =
  "nav-button flex h-9 w-9 min-h-9 min-w-9 items-center justify-center rounded-[6px] p-0! bg-transparent border-0 shadow-none transition-colors hover:bg-[#e9e9e9] hover:text-neutral-900 dark:hover:bg-zinc-700/50 color:hover:bg-white/14 [&_svg]:size-5 [&_svg]:shrink-0";

/**
 * Resting surface for inputs, selects, and filter triggers — pure grayscale.
 */
export const FIELD_SURFACE_CLASS =
  "border border-neutral-200 bg-white text-neutral-900";

/** Neutral hover / open for bordered filter triggers / selects. */
export const INTERACTIVE_CONTROL_HOVER_CLASS =
  "transition-colors hover:border-neutral-400 hover:bg-neutral-50 data-[state=open]:border-neutral-400 data-[state=open]:bg-neutral-50";

/**
 * Shared dropdown / select trigger chrome — white at rest;
 * refined neutral border/fill on hover, open, and focus (no brand blue).
 */
export const DROPDOWN_TRIGGER_CLASS =
  "border border-neutral-200 bg-white text-neutral-900 shadow-none transition-colors duration-200 hover:border-neutral-400 hover:bg-neutral-50 data-[state=open]:border-neutral-400 data-[state=open]:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:text-neutral-900";

/** Shared input / textarea resting + engagement chrome — grayscale only. */
export const FIELD_CONTROL_CLASS =
  "border border-neutral-200 bg-white text-neutral-900 transition-colors placeholder:text-neutral-500 hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Soft neutral hover fill for ghost controls, pills, and secondary chrome. */
export const INTERACTIVE_HOVER_CLASS =
  "transition-colors hover:bg-neutral-100 hover:text-neutral-900";

/** Table body row hover — subtle neutral tint. */
export const TABLE_ROW_HOVER_CLASS =
  "transition-colors hover:bg-neutral-50";

/**
 * Row meatball (`…`) column — fixed width, visible overflow (avoids default
 * `text-ellipsis` phantom dots), and right padding inside the card edge.
 */
export const TABLE_ROW_ACTIONS_HEAD_CLASS =
  "h-10 w-14 max-w-none overflow-visible px-2 pr-4 text-right text-sm font-medium text-clip text-neutral-900";

export const TABLE_ROW_ACTIONS_CELL_CLASS =
  "h-12 w-14 max-w-none overflow-visible px-2 pr-4 py-0 text-right text-clip align-middle";

/** Static dashboard card chrome — flat white surface, subtle zinc border, no shadow. */
export const DASHBOARD_CARD_CLASS =
  "rounded-2xl border border-neutral-200 bg-white shadow-none";

/**
 * Status KPI / audit telemetry cards — height hugs content (no fixed clip).
 */
export const DASHBOARD_TRACK_CARD_HEIGHT_CLASS = "h-auto min-h-0";

/**
 * Audit Fleet tiles — height hugs content (matches Status KPIs).
 */
export const AUDIT_LAUNCHER_CARD_HEIGHT_CLASS = "h-auto min-h-0";

/**
 * Shared responsive grid for 3-card strips (KPI row, framework row, Audits featured).
 * Never 2-up — odd count of 3 orphans a card. Stack, then 3-across.
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
  "rounded-2xl border border-neutral-200 bg-white shadow-none transition-all duration-200 ease-in-out hover:border-neutral-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-neutral-900/30";

/**
 * Card eyebrow — single style for every card header on Dashboard + Audits.
 * All-caps, 13px / medium, tracked-out.
 * Prefer full words in source copy; CSS `uppercase` handles presentation
 * (write “Policy Control”, not “POLICY CONTROL”).
 */
export const CARD_EYEBROW_CLASS =
  "m-0 text-[13px] font-medium uppercase tracking-wider text-neutral-900";

/**
 * Top-right card corner label (SOP / YTD / etc.) — stacked under telemetry sparklines.
 */
export const CARD_CORNER_LABEL_CLASS =
  "m-0 shrink-0 font-mono text-xs font-medium uppercase tracking-wider text-neutral-500";

/**
 * @deprecated Use `CARD_EYEBROW_CLASS` — kept as an alias for one eyebrow system.
 */
export const CARD_SECTION_EYEBROW_CLASS = CARD_EYEBROW_CLASS;

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
  "inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-neutral-500 no-underline transition-colors duration-150 group-hover:text-neutral-900";

export const CARD_CTA_ARROW_CLASS =
  "h-4 w-4 transition-transform duration-150 group-hover:translate-x-1";

/**
 * Shared right-hand metadata for telemetry cards (pipeline ETAs, feed timestamps).
 */
export const TELEMETRY_META_CLASS =
  "shrink-0 font-mono text-sm font-normal tabular-nums text-neutral-700 whitespace-nowrap";

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
