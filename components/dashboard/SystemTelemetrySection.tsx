"use client";

import * as React from "react";
import { AgentFeedCard } from "@/components/dashboard/agent-feed-card";
import { CompliancePipelineCard } from "@/components/dashboard/compliance-pipeline-card";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { DASHBOARD_GAP_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

/**
 * System Telemetry macro section — pipeline (~60%) + agent feed (~40%).
 * Feed card height locks to the pipeline card; the log scrolls internally.
 */
export function SystemTelemetrySection({ className }: { className?: string }) {
  const pipelineRef = React.useRef<HTMLDivElement>(null);
  const feedRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const pipelineEl = pipelineRef.current;
    const feedEl = feedRef.current;
    if (!pipelineEl || !feedEl) return;

    const syncHeight = () => {
      // Stacked layout on small screens — let each card size naturally.
      if (window.matchMedia("(max-width: 1023px)").matches) {
        feedEl.style.height = "";
        feedEl.style.maxHeight = "";
        return;
      }
      const height = pipelineEl.getBoundingClientRect().height;
      feedEl.style.height = `${height}px`;
      feedEl.style.maxHeight = `${height}px`;
    };

    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(pipelineEl);
    window.addEventListener("resize", syncHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeight);
      feedEl.style.height = "";
      feedEl.style.maxHeight = "";
    };
  }, []);

  return (
    <DashboardSection
      title="System Telemetry"
      description="Real-time AI agent execution pulse, background cache status, and queue telemetry."
      className={className}
    >
      <div
        className={cn(
          "grid grid-cols-1 items-stretch lg:grid-cols-12",
          DASHBOARD_GAP_CLASS,
        )}
      >
        <div ref={pipelineRef} className="flex min-h-0 min-w-0 lg:col-span-7">
          <CompliancePipelineCard className="h-full w-full" />
        </div>
        <div
          ref={feedRef}
          className="flex min-h-0 min-w-0 flex-col lg:col-span-5"
        >
          <AgentFeedCard className="h-full min-h-0 w-full" />
        </div>
      </div>
    </DashboardSection>
  );
}
