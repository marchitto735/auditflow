"use client";

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

type CardActionsMenuProps = {
  label: string;
  actions?: readonly CardMenuAction[];
  onAction?: (action: CardMenuAction) => void;
  className?: string;
};

/**
 * Shared Swiss bento card meatball menu — subtle trigger, slate hover items.
 */
export function CardActionsMenu({
  label,
  actions = CARD_MENU_ACTIONS,
  onAction,
  className,
}: CardActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800/30",
            className,
          )}
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
        className="min-w-[11.5rem] rounded-xl border border-zinc-200 bg-white p-1 text-zinc-950 shadow-sm"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {actions.map((action) => (
          <DropdownMenuItem
            key={action}
            className="cursor-pointer rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-800 focus:bg-zinc-100 focus:text-zinc-950"
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
