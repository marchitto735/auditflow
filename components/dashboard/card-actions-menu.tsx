"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const CARD_MENU_ACTIONS = [
  "Copy Configuration Link",
  "Send to Reviewer",
  "Export Schema",
  "View Run History",
] as const;

export type CardMenuAction = (typeof CARD_MENU_ACTIONS)[number];

/** Shared meatball / filter dropdown panel chrome. */
export const DASHBOARD_MENU_CONTENT_CLASS =
  "min-w-[11.5rem] rounded-xl border border-zinc-200 bg-white p-1 text-zinc-950 shadow-sm";

/** Shared meatball / filter dropdown item — inset hover via parent p-1. */
export const DASHBOARD_MENU_ITEM_CLASS =
  "cursor-pointer rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-800 focus:bg-zinc-100 focus:text-zinc-950";

/** Selected filter option fill (sidebar active parity). */
export const DASHBOARD_MENU_ITEM_SELECTED_CLASS =
  "bg-[#F1F1F1] text-zinc-900 focus:bg-[#F1F1F1] focus:text-zinc-900";

type CardActionsMenuProps = {
  label: string;
  actions?: readonly CardMenuAction[];
  onAction?: (action: CardMenuAction) => void;
  className?: string;
};

const TRIGGER_CLASS =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-[#EDEDED] hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800/30";

/**
 * Shared Swiss bento card meatball menu — subtle trigger, slate hover items.
 * Radix menu IDs differ across SSR/CSR — mount after hydrate with a matching placeholder.
 */
export function CardActionsMenu({
  label,
  actions = CARD_MENU_ACTIONS,
  onAction,
  className,
}: CardActionsMenuProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(TRIGGER_CLASS, className)}
        aria-label={`${label} actions`}
      >
        <MoreHorizontal className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(TRIGGER_CLASS, className)}
          aria-label={`${label} actions`}
          onClick={(event) => {
            event.stopPropagation();
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <MoreHorizontal className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className={DASHBOARD_MENU_CONTENT_CLASS}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {actions.map((action) => (
          <DropdownMenuItem
            key={action}
            className={DASHBOARD_MENU_ITEM_CLASS}
            onSelect={() => {
              onAction?.(action);
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {action}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
