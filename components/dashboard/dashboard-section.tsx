"use client";

import type { ReactNode } from "react";
import { CircleHelp } from "lucide-react";
import { CardActionsMenu } from "@/components/dashboard/card-actions-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SECTION_HEADER_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type DashboardSectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

/**
 * Section title row — help on the left, meatball menu on the right.
 */
export function DashboardSectionHeader({
  title,
  description,
  className,
}: DashboardSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <h2 className={cn(SECTION_HEADER_CLASS, "m-0 text-foreground")}>
          {title}
        </h2>
        {description ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800/30"
                aria-label={`About ${title}`}
              >
                <CircleHelp
                  className="size-3.5"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="start"
              className="max-w-[16rem] rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-left text-zinc-50 shadow-none"
            >
              <p className="m-0 text-xs font-medium tracking-tight">{title}</p>
              <p className="m-0 mt-1 text-xs leading-snug text-zinc-300">
                {description}
              </p>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <CardActionsMenu label={title} />
    </div>
  );
}

type DashboardSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Section chrome — title + help on the left, one meatball menu on the right.
 */
export function DashboardSection({
  title,
  description,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn("flex min-w-0 flex-col gap-2", className)}>
      <DashboardSectionHeader title={title} description={description} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </section>
  );
}
