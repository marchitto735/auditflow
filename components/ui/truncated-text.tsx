"use client";

import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TruncatedTextProps = {
  text: string;
  className?: string;
  /** Extra content after the truncated label (e.g. icons). */
  children?: ReactNode;
};

/**
 * Single-line truncate with an accessible tooltip for the full value.
 * Use for dense table cells and other constrained text.
 */
export function TruncatedText({ text, className, children }: TruncatedTextProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={cn(
            "block min-w-0 max-w-full cursor-default truncate outline-none focus-visible:underline",
            className,
          )}
        >
          {text}
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="start"
        className="max-w-sm whitespace-normal break-words text-left"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
