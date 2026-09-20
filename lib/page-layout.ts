/** Outer page gutter: consistent horizontal inset from screen / sidebar edge. */
export const PAGE_GUTTER_CLASS = "w-full min-w-0 px-6 md:px-8";

/** Centered content rail — caps width on ultra-wide displays. */
export const PAGE_INNER_CLASS = "mx-auto w-full max-w-[1400px]";

/**
 * Uniform dashboard grid gutter — 24px on both axes (row sections + card columns).
 */
export const DASHBOARD_GAP_CLASS = "gap-6";

/**
 * App canvas behind cards — light theme maps `--background` to zinc-50.
 * Prefer this (or `bg-background`) over hard-coded whites on page shells.
 */
export const PAGE_CANVAS_CLASS = "bg-zinc-50 dark:bg-background color:bg-background";

/** Shared height for sidebar brand bar + main sticky navbar. */
export const APP_TOPBAR_HEIGHT_CLASS = "h-16";

/** Icon utility buttons: 4px radius hover target */
export const NAV_UTILITY_BUTTON_CLASS =
  "nav-button flex h-9 w-9 min-h-9 min-w-9 items-center justify-center rounded-sm p-0! bg-transparent border-0 shadow-none transition-colors hover:bg-[var(--sidebar-hover)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(40%_0.035_165)]";

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
 * Card footer action link — muted → dark on hover, no underline, arrow nudge.
 * Parent must use `group`.
 */
export const CARD_CTA_CLASS =
  "inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-zinc-500 no-underline transition-colors duration-150 group-hover:text-zinc-900";

export const CARD_CTA_ARROW_CLASS =
  "h-4 w-4 transition-transform duration-150 group-hover:translate-x-1";
