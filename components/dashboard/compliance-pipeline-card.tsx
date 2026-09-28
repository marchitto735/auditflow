"use client";

import { CardActionsMenu, FEED_CARD_MENU_ACTIONS } from "@/components/dashboard/card-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CARD_CONTENT_CLASS,
  CARD_SECTION_EYEBROW_CLASS,
  SECTION_DESCRIPTION_CLASS,
  DASHBOARD_CARD_CLASS,
  TELEMETRY_META_CLASS,
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
    document: "SOP manufacturing v4.2",
    stageId: "validate",
    stage: "Validate",
    eta: "2m",
  },
  {
    id: "job-2",
    document: "BPR-204 batch record",
    stageId: "score",
    stage: "Score",
    eta: "6m",
  },
  {
    id: "job-3",
    document: "FIR facility walkthrough",
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
      <CardContent className={cn(CARD_CONTENT_CLASS, "relative h-auto gap-3")}>
        <div className="min-w-0 shrink-0 pr-10">
          <p className={CARD_SECTION_EYEBROW_CLASS}>Compliance pipeline</p>
          <p className={SECTION_DESCRIPTION_CLASS}>
            Active document volume by stage from ingest through export.
          </p>
        </div>
        <div className="absolute top-3 right-3">
          <CardActionsMenu
            label="Compliance pipeline"
            actions={FEED_CARD_MENU_ACTIONS}
          />
        </div>

        <ol
          className="m-0 flex list-none flex-wrap items-stretch gap-2 p-0"
          aria-label="Compliance pipeline stages"
        >
          {STAGES.map((stage, index) => (
            <li key={stage.id} className="flex min-w-0 flex-1">
              <div
                className={cn(
                  "flex w-full min-w-0 cursor-default flex-col gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left select-none",
                )}
              >
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-900 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-neutral-900">
                  {stage.label}
                </span>
                <span className="text-body1 m-0 font-mono tabular-nums text-neutral-900">
                  {stage.count} Active
                </span>
              </div>
            </li>
          ))}
        </ol>

        <ul
          className="m-0 mt-2 grid list-none grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 gap-y-3 p-0"
          aria-label="Active pipeline jobs"
        >
          {ACTIVE_JOBS.map((job) => (
            <li key={job.id} className="contents">
              <p className="text-base m-0 min-w-0 truncate leading-snug text-foreground">
                {job.document}
              </p>
              <span
                className={cn(
                  TELEMETRY_META_CLASS,
                  "inline-flex items-center gap-1 justify-self-start",
                )}
              >
                <span>ETA</span>
                <span className="inline-block w-[3ch] text-left tabular-nums">
                  {job.eta}
                </span>
              </span>
              <Badge className="justify-self-start" variant="outline">
                {job.stage}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
