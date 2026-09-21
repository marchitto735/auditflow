"use client";

import type { ReactNode } from "react";
import { CircleHelp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SECTION_HEADER_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type DashboardSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

/**
 * Section chrome for bento modules — title + discreet info trigger.
 * Description lives in the tooltip only to avoid layout clutter.
 */
export function DashboardSection({
  title,
  description,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="flex shrink-0 items-center gap-1.5">
        <h2 className={cn(SECTION_HEADER_CLASS, "m-0 text-foreground")}>
          {title}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-zinc-400 transition-colors hover:bg-zinc-200/80 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800/30"
              aria-label={`About ${title}`}
            >
              <CircleHelp className="size-3.5" strokeWidth={1.75} aria-hidden />
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
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </section>
  );
}
