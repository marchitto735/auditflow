"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Canonical AuditFlow data table — matches the Action Items dashboard card:
 * fixed 48px header + body rows, hairline under column headers via cell
 * border (border-separate), row separators on body cells, and pagination
 * via TablePaginationBar.
 */
function Table({
  className,
  containerClassName,
  children,
  ...props
}: React.ComponentProps<"table"> & {
  containerClassName?: string
}) {
  const tableChildren = React.Children.toArray(children).filter(
    (child) => typeof child !== "string" || child.trim().length > 0,
  )

  return (
    <div
      data-slot="table-container"
      className={cn("relative w-full overflow-x-auto", containerClassName)}
    >
      <table
        data-slot="table"
        className={cn(
          "w-full caption-bottom table-fixed border-separate border-spacing-0 text-sm font-normal text-foreground",
          className,
        )}
        {...props}
      >
        {tableChildren}
      </table>
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "border-b-0 bg-white [&_tr]:border-b-0 [&_tr]:bg-white [&_tr]:hover:bg-transparent",
        className,
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "divide-y divide-border border-b-0 [&_td]:text-sm [&_td]:font-normal [&_td]:text-foreground [&>tr:not(:first-child)>td]:border-t [&>tr:not(:first-child)>td]:border-border",
        className,
      )}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "h-12 border-0 transition-colors hover:bg-neutral-50 has-aria-expanded:bg-neutral-50 data-[state=selected]:bg-neutral-100",
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 max-w-0 overflow-hidden border-b border-border bg-white px-4 py-0 text-left align-middle text-sm font-medium whitespace-nowrap text-ellipsis text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "h-12 max-w-0 overflow-hidden px-4 py-0 align-middle text-sm font-normal whitespace-nowrap text-ellipsis text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

export {
  TablePaginationBar,
  TABLE_PAGE_SIZE_OPTIONS,
  buildTablePageItems,
  type TablePaginationBarProps,
  type TablePageSize,
} from "@/components/ui/table-pagination"
