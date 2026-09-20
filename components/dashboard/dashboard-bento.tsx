"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DASHBOARD_GAP_CLASS } from "@/lib/page-layout";

type DashboardBentoProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
};

/**
 * Asymmetric dashboard grid that locks the left column height to the right
 * column (metrics + table), so the AI Agent Feed can fill leftover space and
 * scroll internally without pushing the bento out of alignment.
 */
export function DashboardBento({ left, right, className }: DashboardBentoProps) {
  const leftRef = React.useRef<HTMLDivElement>(null);
  const rightRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const leftEl = leftRef.current;
    const rightEl = rightRef.current;
    if (!leftEl || !rightEl) return;

    const syncHeight = () => {
      // Mobile: stack naturally — clear any locked height.
      if (window.matchMedia("(max-width: 1023px)").matches) {
        leftEl.style.height = "";
        return;
      }
      leftEl.style.height = `${rightEl.getBoundingClientRect().height}px`;
    };

    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(rightEl);
    window.addEventListener("resize", syncHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeight);
    };
  }, []);

  return (
    <div
      className={cn(
        "grid grid-cols-1 items-start lg:grid-cols-[minmax(260px,380px)_minmax(0,1fr)]",
        DASHBOARD_GAP_CLASS,
        className,
      )}
    >
      <div
        ref={leftRef}
        className={cn(
          "flex min-h-0 min-w-0 flex-col overflow-hidden",
          DASHBOARD_GAP_CLASS,
        )}
      >
        {left}
      </div>
      <div ref={rightRef} className={cn("flex min-w-0 flex-col", DASHBOARD_GAP_CLASS)}>
        {right}
      </div>
    </div>
  );
}
