"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import {
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
  DASHBOARD_MENU_ITEM_SELECTED_CLASS,
} from "@/components/dashboard/card-actions-menu"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

/** Canonical page-size choices for every AuditFlow data table. */
export const TABLE_PAGE_SIZE_OPTIONS = [3, 5, 10, 25, 50] as const

export type TablePageSize = (typeof TABLE_PAGE_SIZE_OPTIONS)[number]

/**
 * Compact page-number list with ellipsis for large ranges.
 * Shared by all table footers so pagination chrome stays identical.
 */
export function buildTablePageItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const items: Array<number | "ellipsis"> = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) items.push("ellipsis")
  for (let page = start; page <= end; page += 1) items.push(page)
  if (end < totalPages - 1) items.push("ellipsis")
  items.push(totalPages)
  return items
}

function PageSizeSelector({
  pageSize,
  pageSizeOptions,
  menusMounted,
  onChange,
  menuAlign = "end",
}: {
  pageSize: number
  pageSizeOptions: readonly number[]
  menusMounted: boolean
  onChange: (value: string) => void
  menuAlign?: "start" | "center" | "end"
}) {
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  function releaseTriggerFocus() {
    triggerRef.current?.blur()
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      aria-label="Rows per page"
      className="inline-flex h-8 w-[4.5rem] items-center justify-between gap-1 rounded-md border border-neutral-200 bg-white px-2 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:border-neutral-400 hover:bg-neutral-50 data-[state=open]:border-neutral-400 data-[state=open]:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span>{pageSize}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-neutral-900" aria-hidden />
    </button>
  )

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="text-sm text-muted-foreground">Rows</span>
      {menusMounted ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          <DropdownMenuContent
            align={menuAlign}
            sideOffset={6}
            className={DASHBOARD_MENU_CONTENT_CLASS}
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              releaseTriggerFocus()
            }}
          >
            {pageSizeOptions.map((size) => {
              const isSelected = size === pageSize
              return (
                <DropdownMenuItem
                  key={size}
                  className={cn(
                    DASHBOARD_MENU_ITEM_CLASS,
                    isSelected && DASHBOARD_MENU_ITEM_SELECTED_CLASS,
                  )}
                  onSelect={() => {
                    releaseTriggerFocus()
                    onChange(String(size))
                  }}
                >
                  {size}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        trigger
      )}
    </div>
  )
}

function TablePaginationNav({
  pageItems,
  currentPage,
  totalPages,
  onPageChange,
  label,
  className,
}: {
  pageItems: Array<number | "ellipsis">
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  label: string
  className?: string
}) {
  return (
    <nav
      className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      aria-label={label}
    >
      <Button
        type="button"
        variant="ghost"
        className="h-8! min-h-8! rounded-md px-2 text-sm font-medium text-neutral-500 shadow-none hover:bg-neutral-100 hover:text-neutral-900"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        Previous
      </Button>
      {pageItems.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-8 items-center px-1 text-sm text-neutral-900"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant="ghost"
            className={cn(
              "h-8! min-h-8! w-8! rounded-md p-0! text-sm font-medium",
              item === currentPage
                ? "bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] hover:text-primary-foreground"
                : "text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900",
            )}
            aria-current={item === currentPage ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        type="button"
        variant="ghost"
        className="h-8! min-h-8! rounded-md px-2 text-sm font-medium text-neutral-500 shadow-none hover:bg-neutral-100 hover:text-neutral-900"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </Button>
    </nav>
  )
}

export type TablePaginationBarProps = {
  /** Rows visible on the current page. */
  pageRowsCount: number
  /** Total rows in the active (filtered) dataset. */
  totalCount: number
  pageSize: number
  /** Defaults to the canonical AuditFlow page-size list. */
  pageSizeOptions?: readonly number[]
  onPageSizeChange: (value: string) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Accessible name for the pagination nav (e.g. "Policies table pagination"). */
  paginationLabel: string
  className?: string
  /**
   * When false, render the page-size trigger without the dropdown portal
   * (SSR / hydration-safe). Defaults to managing mount state internally.
   */
  menusMounted?: boolean
}

/**
 * Unified table footer — left count, right page-size + pagination.
 * Use under every paginated AuditFlow data table.
 */
function TablePaginationBar({
  pageRowsCount,
  totalCount,
  pageSize,
  pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  currentPage,
  totalPages,
  onPageChange,
  paginationLabel,
  className,
  menusMounted: menusMountedProp,
}: TablePaginationBarProps) {
  const [menusMountedInternal, setMenusMountedInternal] = React.useState(false)

  React.useEffect(() => {
    setMenusMountedInternal(true)
  }, [])

  const menusMounted = menusMountedProp ?? menusMountedInternal
  const pageItems = buildTablePageItems(currentPage, totalPages)
  const countLabel = `${pageRowsCount} of ${totalCount}`

  return (
    <div
      data-slot="table-pagination"
      className={cn(
        "relative z-20 shrink-0 border-t-0 bg-white py-4 shadow-[0_-1px_0_0_var(--border)]",
        className,
      )}
    >
      {/* Mobile: count + rows selector, then centered pagination */}
      <div className="flex flex-col gap-3 px-4 md:hidden">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="m-0 min-w-0 text-sm text-muted-foreground">{countLabel}</p>
          <PageSizeSelector
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            menusMounted={menusMounted}
            onChange={onPageSizeChange}
            menuAlign="start"
          />
        </div>
        <TablePaginationNav
          pageItems={pageItems}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          label={paginationLabel}
          className="justify-center"
        />
      </div>

      {/* Desktop: count left — rows/page + prev/next right */}
      <div className="hidden w-full items-center justify-between gap-4 md:flex">
        <p className="m-0 px-4 text-sm text-muted-foreground">{countLabel}</p>
        <div className="flex min-w-0 items-center justify-end gap-4 px-4">
          <PageSizeSelector
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            menusMounted={menusMounted}
            onChange={onPageSizeChange}
            menuAlign="end"
          />
          <TablePaginationNav
            pageItems={pageItems}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            label={paginationLabel}
            className="shrink-0 justify-end"
          />
        </div>
      </div>
    </div>
  )
}

export { TablePaginationBar }
