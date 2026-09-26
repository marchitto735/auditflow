"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  CARD_CONTENT_CLASS,
  CARD_SECTION_EYEBROW_CLASS,
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

/** Static pipeline telemetry — no stage filters or drill-down CTAs. */
export function CompliancePipelineCard({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        DASHBOARD_CARD_CLASS,
        "h-auto w-full shrink-0 self-start",
        className,
      )}
    >
      <CardContent className={cn(CARD_CONTENT_CLASS, "h-auto gap-3")}>
        <div className="shrink-0">
          <p className={CARD_SECTION_EYEBROW_CLASS}>Compliance Pipeline</p>
          <p className="text-body1 m-0 mt-1 text-zinc-600">
            Active document volume by stage from ingest through export.
          </p>
        </div>

        <ol
          className="m-0 flex list-none flex-wrap items-stretch gap-2 p-0"
          aria-label="Compliance pipeline stages"
        >
          {STAGES.map((stage, index) => (
            <li key={stage.id} className="flex min-w-0 flex-1">
              <div
                className={cn(
                  "flex w-full min-w-0 flex-col gap-1 rounded-lg border border-zinc-200 bg-sidebar-muted/40 px-3 py-2 text-left",
                )}
              >
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-black tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-black">
                  {stage.label}
                </span>
                <span className="text-body1 m-0 font-mono tabular-nums text-black">
                  {stage.count} active
                </span>
              </div>
            </li>
          ))}
        </ol>

        <ul className={cn(TELEMETRY_LIST_CLASS, "mt-2")} aria-label="Active pipeline jobs">
          {ACTIVE_JOBS.map((job) => (
            <li key={job.id} className={TELEMETRY_ROW_CLASS}>
              <p className="text-base m-0 min-w-0 max-w-[65%] flex-1 truncate leading-snug text-black">
                {job.document}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <span className={TELEMETRY_META_CLASS}>ETA {job.eta}</span>
                <span className={TELEMETRY_PILL_CLASS}>{job.stage}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
