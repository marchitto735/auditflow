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
export const DASHBOARD_SECTION_GAP_CLASS = "gap-8";

/**
 * Space below the top nav before page content — shared with sidebar nav
 * so the first content row aligns. Tightened for denser rhythm with the
 * sidebar’s section spacing (`gap-4` between items and category headers).
 */
export const PAGE_CONTENT_TOP_CLASS = "pt-2";

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
 * Interactive card chrome — flat at rest; soft border + shadow lift on hover.
 * Compose with layout utilities (flex, group, etc.) as needed.
 */
export const INTERACTIVE_CARD_CLASS =
  "rounded-2xl border border-zinc-200 bg-white shadow-none transition-all duration-200 ease-in-out hover:border-zinc-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800/30";

/**
 * Card eyebrow / metric label — medium 14px.
 * Never use abbreviations (write “Average Score”, not “Avg Score”).
 */
export const CARD_EYEBROW_CLASS =
  "text-sm font-medium m-0 text-black";

/**
 * Muted card eyebrow (secondary metric cards).
 * Same no-abbreviation rule as CARD_EYEBROW_CLASS.
 */
export const CARD_EYEBROW_MUTED_CLASS =
  "text-sm font-medium m-0 text-muted-foreground";

/**
 * Page section grouping label (18px / medium).
 */
export const SECTION_HEADER_CLASS =
  "text-lg font-medium leading-tight tracking-tight";

/**
 * Primary card title / KPI display (20px / medium).
 */
export const CARD_TITLE_CLASS =
  "text-xl font-medium leading-tight tracking-tight";

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
