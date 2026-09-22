"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  CARD_CONTENT_CLASS,
  CARD_CTA_ARROW_CLASS,
  CARD_CTA_CLASS,
  CARD_EYEBROW_CLASS,
  CARD_FOOTER_CLASS,
  CARD_HEADER_STACK_CLASS,
  CARD_TITLE_CLASS,
  DASHBOARD_CARD_CLASS,
  TELEMETRY_LIST_CLASS,
  TELEMETRY_META_CLASS,
  TELEMETRY_PILL_CLASS,
  TELEMETRY_ROW_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type PipelineStageId = "ingest" | "validate" | "score" | "review" | "export";

type PipelineStage = {
  id: PipelineStageId;
  label: string;
  count: number;
};

type PipelineJob = {
  id: string;
  document: string;
  stageId: PipelineStageId;
  stage: string;
  eta: string;
};

const STAGES: PipelineStage[] = [
  { id: "ingest", label: "Ingest", count: 2 },
  { id: "validate", label: "Validate", count: 1 },
  { id: "score", label: "Score", count: 3 },
  { id: "review", label: "Review", count: 1 },
  { id: "export", label: "Export", count: 0 },
];

const ACTIVE_JOBS: PipelineJob[] = [
  {
    id: "job-1",
    document: "SOP Manufacturing v4.2",
    stageId: "validate",
    stage: "Validate",
    eta: "2m",
  },
  {
    id: "job-2",
    document: "BPR-204 Batch Record",
    stageId: "score",
    stage: "Score",
    eta: "6m",
  },
  {
    id: "job-3",
    document: "FIR Facility Walkthrough",
    stageId: "review",
    stage: "Review",
    eta: "12m",
  },
];

export function CompliancePipelineCard({ className }: { className?: string }) {
  const [selectedStage, setSelectedStage] = useState<PipelineStageId | null>(
    null,
  );

  const filteredJobs = useMemo(() => {
    if (!selectedStage) return ACTIVE_JOBS;
    return ACTIVE_JOBS.filter((job) => job.stageId === selectedStage);
  }, [selectedStage]);

  function handleStageClick(stageId: PipelineStageId) {
    setSelectedStage((current) => (current === stageId ? null : stageId));
  }

  return (
    <Card
      className={cn(
        DASHBOARD_CARD_CLASS,
        "group h-auto w-full shrink-0 self-start",
        className,
      )}
    >
      <CardContent className={cn(CARD_CONTENT_CLASS, "h-auto gap-3")}>
        <div className={CARD_HEADER_STACK_CLASS}>
          <p className={cn(CARD_EYEBROW_CLASS, "text-black")}>Pipeline</p>
          <h3
            className={cn(
              CARD_TITLE_CLASS,
              "m-0 max-w-full text-balance text-black",
            )}
          >
            Compliance Pipeline
          </h3>
        </div>

        <ol
          className="m-0 flex list-none flex-wrap items-stretch gap-2 p-0"
          aria-label="Compliance pipeline stages"
        >
          {STAGES.map((stage, index) => {
            const isSelected = selectedStage === stage.id;
            return (
              <li key={stage.id} className="flex min-w-0 flex-1">
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleStageClick(stage.id)}
                  className={cn(
                    "flex w-full min-w-0 cursor-pointer flex-col gap-1 rounded-lg border px-3 py-2 text-left transition-colors",
                    "hover:border-zinc-400 hover:bg-zinc-50/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isSelected
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-200 bg-sidebar-muted/40",
                  )}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-black tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-black">
                    {stage.label}
                  </span>
                  <span className="text-body1 m-0 text-black tabular-nums">
                    {stage.count} active
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <ul
          className={cn(TELEMETRY_LIST_CLASS, "mt-2")}
          aria-label={
            selectedStage
              ? `Active pipeline jobs in ${STAGES.find((s) => s.id === selectedStage)?.label}`
              : "Active pipeline jobs"
          }
        >
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <li key={job.id} className={TELEMETRY_ROW_CLASS}>
                <p className="text-base m-0 min-w-0 max-w-[65%] flex-1 truncate leading-snug text-black">
                  {job.document}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={TELEMETRY_META_CLASS}>ETA {job.eta}</span>
                  <span className={TELEMETRY_PILL_CLASS}>{job.stage}</span>
                </div>
              </li>
            ))
          ) : (
            <li className="text-body1 m-0 text-black">
              No active jobs in this stage.
              <button
                type="button"
                onClick={() => setSelectedStage(null)}
                className="ml-2 font-medium text-black underline underline-offset-2 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Show all
              </button>
            </li>
          )}
        </ul>

        <div className={CARD_FOOTER_CLASS}>
          <Link href="/dashboard/audits" className={CARD_CTA_CLASS}>
            <span>View Audit Log</span>
            <ChevronRight className={CARD_CTA_ARROW_CLASS} aria-hidden />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
