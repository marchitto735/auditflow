"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { DASHBOARD_MENU_CONTENT_CLASS } from "@/components/dashboard/card-actions-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const TABLE_ROW_ACTION_TRIGGER_CLASS =
  "h-8! w-8! min-h-8! min-w-8! rounded-md p-0!";

type TableRowActionsMenuProps = {
  /** Accessible name, e.g. `Actions for SOP-8490`. */
  label: string;
  /** Hydration-safe: render a disabled trigger until client menus mount. */
  menusMounted: boolean;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * Canonical row meatball ("…") — same chrome as Team / User directory.
 * Place in the far-right column after Status via TABLE_ROW_ACTIONS_* tokens.
 *
 * Use on full management pages only:
 * Audits, Policies, Frameworks, Reports, Tickets, Team.
 *
 * Do NOT use on dashboard summary / read-only widgets:
 * Action items, Document tracker, Activity stream.
 */
export function TableRowActionsMenu({
  label,
  menusMounted,
  children,
  className,
  contentClassName,
}: TableRowActionsMenuProps) {
  const trigger = (
    <Button
      type="button"
      variant="ghost"
      className={cn(TABLE_ROW_ACTION_TRIGGER_CLASS, className)}
      aria-label={label}
      disabled={!menusMounted}
    >
      <MoreHorizontal className="size-4" />
    </Button>
  );

  if (!menusMounted) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className={cn(
          DASHBOARD_MENU_CONTENT_CLASS,
          "min-w-[11.5rem]",
          contentClassName,
        )}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
