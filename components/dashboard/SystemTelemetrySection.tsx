"use client";

import * as React from "react";
import { AgentFeedCard } from "@/components/dashboard/agent-feed-card";
import { CompliancePipelineCard } from "@/components/dashboard/compliance-pipeline-card";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { cn } from "@/lib/utils";

/**
 * System Telemetry — equal 2-col desktop grid.
 * Pipeline hugs content; feed matches that height and scrolls internally.
 */
export function SystemTelemetrySection({ className }: { className?: string }) {
  const pipelineRef = React.useRef<HTMLDivElement>(null);
  const feedRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const pipelineEl = pipelineRef.current;
    const feedEl = feedRef.current;
    if (!pipelineEl || !feedEl) return;

    const syncHeight = () => {
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
      title="Metrics"
      description="Real-time AI agent execution pulse, background cache status, and queue telemetry."
      className={className}
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div ref={pipelineRef} className="min-w-0">
          <CompliancePipelineCard />
        </div>
        <div
          ref={feedRef}
          className="flex min-h-0 min-w-0 flex-col overflow-hidden"
        >
          <AgentFeedCard className="h-full min-h-0" />
        </div>
      </div>
    </DashboardSection>
  );
}
