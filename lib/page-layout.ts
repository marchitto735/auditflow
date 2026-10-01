/** Outer page gutter: consistent horizontal inset from screen / sidebar edge. */
export const PAGE_GUTTER_CLASS = "w-full min-w-0 px-6 md:px-8";

/** Centered content rail — caps width on ultra-wide displays. */
export const PAGE_INNER_CLASS = "mx-auto w-full max-w-[1200px]";

/**
 * Uniform dashboard grid gutter — 24px on both axes (row sections + card columns).
 */
export const DASHBOARD_GAP_CLASS = "gap-6";

/**
 * Vertical gap between major dashboard sections (e.g. Snapshot → Launcher).
 */
export const DASHBOARD_SECTION_GAP_CLASS = "gap-6";

/**
 * Space above page titles — 20px from the top of the content scrollport
 * (desktop aligns with the sidebar brand bar). Mobile still stacks below
 * the slim menu-bar spacer in `Header`.
 */
export const PAGE_CONTENT_TOP_CLASS = "pt-5";

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

/**
 * Compact form dialogs (Upload policy, Sync framework, Invite user, etc.).
 * Overrides DialogContent defaults to a shared md width + flat chrome.
 */
export const DIALOG_CONTENT_CLASS =
  "gap-0 overflow-hidden bg-white p-0 shadow-none md:max-w-md md:rounded-2xl md:border md:border-neutral-200";

/**
 * Tall form dialogs (New audit) — same shell as `DIALOG_CONTENT_CLASS` with a height cap.
 */
export const DIALOG_CONTENT_TALL_CLASS =
  "gap-0 overflow-hidden bg-white p-0 shadow-none md:max-h-[min(90vh,840px)] md:max-w-md md:rounded-2xl md:border md:border-neutral-200";

/** Dialog title row — hairline under header, room for absolute close. */
export const DIALOG_HEADER_CLASS =
  "shrink-0 border-b border-neutral-200 p-4 pr-12 text-left";

export const DIALOG_TITLE_CLASS =
  "m-0 text-lg font-medium text-neutral-900";

export const DIALOG_DESCRIPTION_CLASS =
  "m-0 mt-1 text-sm font-normal text-muted-foreground";

/** Scrollable field stack between header and footer. */
export const DIALOG_BODY_CLASS = "flex flex-col gap-4 p-4";

export const DIALOG_FOOTER_CLASS =
  "shrink-0 border-t border-neutral-200 p-4";

/** Label → control stack inside dialogs. */
export const DIALOG_FIELD_CLASS = "flex flex-col gap-1.5";

export const DIALOG_LABEL_CLASS =
  "text-sm font-medium leading-none text-neutral-900";

/** Invalid field border / focus — pairs with `FIELD_ERROR_TEXT_CLASS`. */
export const FIELD_INVALID_CLASS =
  "border-rose-500 hover:border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20 data-[state=open]:border-rose-500";

export const FIELD_ERROR_TEXT_CLASS = "m-0 text-xs text-rose-600";

/**
 * File picker / specialized field trigger — same height & chrome as Input / Select.
 */
export const DIALOG_FILE_TRIGGER_CLASS =
  "flex h-9 min-h-9 w-full items-center justify-start gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-normal text-neutral-900 shadow-none transition-colors hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Unified data-table toolbar anatomy:
 * [Search — flush left] …… [exactly 3 filter dropdowns — flush right]
 */
export const TABLE_TOOLBAR_ROW_CLASS =
  "flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3";

/**
 * Card header block above a data table — title/subtitle (+ optional toolbar).
 * Matches Action Items: 16px top/bottom padding, zinc hairline under the block.
 */
export const TABLE_CARD_HEADER_CLASS =
  "relative flex shrink-0 flex-col gap-3 border-b border-zinc-200 px-4 pt-4 pb-4";

/** Title-only card header (no toolbar row) — same padding and hairline. */
export const TABLE_CARD_TITLE_HEADER_CLASS =
  "relative shrink-0 border-b border-zinc-200 px-4 pt-4 pb-4";

/** Sticky column-header chrome for long inventory tables. */
export const TABLE_STICKY_HEADER_CLASS = "sticky top-0 z-20";

export const TABLE_TOOLBAR_SEARCH_WRAP_CLASS =
  "relative min-w-0 w-full sm:w-[min(100%,20rem)] sm:shrink-0";

export const TABLE_TOOLBAR_FILTERS_CLASS =
  "flex w-full min-w-0 shrink-0 flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:justify-end";

export const TABLE_TOOLBAR_ACTIONS_CLASS =
  "flex w-full shrink-0 items-center gap-2 sm:ml-auto sm:w-auto sm:justify-end";

/**
 * Primary table-header / page-header CTA — fixed width so New audit / New policy /
 * Sync / Export buttons align across pages; label stays centered.
 */
export const TABLE_TOOLBAR_PRIMARY_BUTTON_CLASS =
  "h-[length:var(--cta-height)]! min-h-[length:var(--cta-height)]! w-[200px] shrink-0 justify-center rounded-md px-3 text-sm";

/** Page-level primary action in the SectionHeader actions slot. */
export const PAGE_HEADER_PRIMARY_BUTTON_CLASS =
  TABLE_TOOLBAR_PRIMARY_BUTTON_CLASS;

/**
 * Filter dropdown / date-picker trigger — same type as toolbar search.
 * Uses `neutral-900` (not zinc) so Tailwind merge correctly overrides
 * `FIELD_CONTROL_CLASS` placeholder tokens on shared Input.
 */
export const TABLE_TOOLBAR_FILTER_TRIGGER_CLASS =
  "inline-flex h-9 items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-400 hover:bg-neutral-50 data-[state=open]:border-neutral-400 data-[state=open]:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30";

/**
 * Table toolbar search field — matches filter trigger typography
 * (`text-sm font-medium text-neutral-900` for value and placeholder).
 */
export const TABLE_TOOLBAR_SEARCH_INPUT_CLASS =
  "h-9 pl-9 text-sm font-medium text-neutral-900 placeholder:font-medium placeholder:text-neutral-900 md:text-sm";

/** Search affordance icon inside toolbar search fields. */
export const TABLE_TOOLBAR_SEARCH_ICON_CLASS =
  "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-900";

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
  "w-14 max-w-none overflow-visible px-2 pr-4 text-right text-sm font-medium text-clip text-neutral-900";

export const TABLE_ROW_ACTIONS_CELL_CLASS =
  "h-12 w-14 max-w-none overflow-visible px-2 pr-4 py-0 text-right text-clip align-middle";

/** Static dashboard card chrome — flat white surface, subtle zinc border, no elevation. */
export const DASHBOARD_CARD_CLASS =
  "rounded-2xl border border-neutral-200 bg-white shadow-none";

/**
 * Interactive card chrome — same as dashboard cards; border shift on hover only (no shadow).
 */
export const INTERACTIVE_CARD_CLASS =
  "rounded-2xl border border-neutral-200 bg-white shadow-none transition-colors duration-200 ease-in-out hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-neutral-900/30";

/**
 * Status KPI / audit telemetry cards — height hugs content (no fixed clip).
 */
export const DASHBOARD_TRACK_CARD_HEIGHT_CLASS = "h-auto min-h-0";

/**
 * Audit Fleet tiles — height hugs content (matches Status KPIs).
 */
export const AUDIT_LAUNCHER_CARD_HEIGHT_CLASS = "h-auto min-h-0";

/**
 * Shared KPI / status summary strip — three equal cards across md+.
 * Used on Dashboard, Audits, Policies, Frameworks, and Reports.
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
 * Shared section / card eyebrow label — sentence case at rest (no CSS uppercase).
 * 14px / medium; use for card headers, KPI eyebrows, and section overlines.
 */
export const SECTION_LABEL_CLASS =
  "text-sm font-medium tracking-normal text-neutral-900";

/**
 * Card eyebrow — identical to sidebar section headers for visual hierarchy.
 */
export const CARD_EYEBROW_CLASS = `m-0 ${SECTION_LABEL_CLASS}`;

/**
 * Muted overline — sheet/panel sub-headers (Summary, Findings, metadata).
 * Matches eyebrow size (14px medium).
 */
export const OVERLINE_LABEL_CLASS =
  "m-0 text-sm font-medium tracking-normal text-neutral-500";

/**
 * Top-right card corner label (SOP / YTD / etc.) — acronym codes stay uppercase.
 */
export const CARD_CORNER_LABEL_CLASS =
  "m-0 shrink-0 font-mono text-xs font-medium uppercase tracking-wider text-neutral-500";

/**
 * @deprecated Use `CARD_EYEBROW_CLASS` — kept as an alias for one eyebrow system.
 */
export const CARD_SECTION_EYEBROW_CLASS = CARD_EYEBROW_CLASS;

/**
 * Eyebrow → title / body stack — 8px gap on every card header.
 */
export const CARD_HEADER_STACK_CLASS = "flex min-w-0 flex-col gap-2";

/**
 * Margin below an eyebrow when siblings are not wrapped in `CARD_HEADER_STACK_CLASS`.
 * Matches the stack gap (8px).
 */
export const CARD_EYEBROW_OFFSET_CLASS = "mt-2";

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
 * Supporting description under page titles and card section eyebrows —
 * matches `SectionHeader` metadata (`text-sm` / muted).
 */
export const SECTION_DESCRIPTION_CLASS =
  "m-0 mt-1 text-sm font-normal text-muted-foreground";

/**
 * Primary card title (26px / semibold) — audit fleet metric titles, etc.
 */
export const CARD_TITLE_CLASS =
  "text-[26px] font-semibold leading-tight tracking-tight";

/**
 * Status KPI primary metric value (24px / semibold).
 */
export const CARD_METRIC_CLASS =
  "text-[24px] font-semibold leading-tight tracking-tight";

/**
 * Shared interactive card body — compact padding, no fixed min-height.
 */
export const CARD_CONTENT_CLASS =
  "flex h-full flex-col gap-2 p-4";

/**
 * Standard card body / subtitle copy — same metadata scale as page descriptions.
 */
export const CARD_BODY_CLASS =
  "m-0 text-sm font-normal leading-snug text-muted-foreground";

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
