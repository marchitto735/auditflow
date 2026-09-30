"use client";

import { useState } from "react";
import { CardActionsMenu, FEED_CARD_MENU_ACTIONS } from "@/components/dashboard/card-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TruncatedText } from "@/components/ui/truncated-text";
import {
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
  version: string;
  stageId: PipelineStageId;
  stage: string;
  eta: string;
};

const STAGE_ORDER: readonly Omit<PipelineStage, "count">[] = [
  { id: "ingest", label: "Ingest" },
  { id: "validate", label: "Validate" },
  { id: "score", label: "Score" },
  { id: "review", label: "Review" },
  { id: "export", label: "Export" },
];

const ACTIVE_JOBS: PipelineJob[] = [
  {
    id: "job-ingest-1",
    document: "SOP cleaning",
    version: "v3.1",
    stageId: "ingest",
    stage: "Ingest",
    eta: "5m",
  },
  {
    id: "job-ingest-2",
    document: "Media fill batch",
    version: "BPR-640",
    stageId: "ingest",
    stage: "Ingest",
    eta: "7m",
  },
  {
    id: "job-validate-1",
    document: "SOP manufacturing",
    version: "v4.2",
    stageId: "validate",
    stage: "Validate",
    eta: "2m",
  },
  {
    id: "job-score-1",
    document: "Batch record",
    version: "BPR-204",
    stageId: "score",
    stage: "Score",
    eta: "6m",
  },
  {
    id: "job-score-2",
    document: "Complaint handling",
    version: "SOP-7720",
    stageId: "score",
    stage: "Score",
    eta: "4m",
  },
  {
    id: "job-score-3",
    document: "Packaging clearance",
    version: "BPR-5509",
    stageId: "score",
    stage: "Score",
    eta: "11m",
  },
  {
    id: "job-review-1",
    document: "Facility walkthrough",
    version: "FIR",
    stageId: "review",
    stage: "Review",
    eta: "12m",
  },
];

const STAGES: PipelineStage[] = STAGE_ORDER.map((stage) => ({
  ...stage,
  count: ACTIVE_JOBS.filter((job) => job.stageId === stage.id).length,
}));

/** Pipeline telemetry — stage cards filter the document queue. */
export function CompliancePipelineCard({ className }: { className?: string }) {
  const [selectedStage, setSelectedStage] = useState<PipelineStageId | null>(
    null,
  );
  const visibleJobs = selectedStage
    ? ACTIVE_JOBS.filter((job) => job.stageId === selectedStage)
    : ACTIVE_JOBS;
  const selectedLabel = STAGES.find((stage) => stage.id === selectedStage)?.label;

  function selectStage(stageId: PipelineStageId) {
    setSelectedStage((current) => (current === stageId ? null : stageId));
  }
  return (
    <Card
      className={cn(
        DASHBOARD_CARD_CLASS,
        "flex h-auto w-full flex-col overflow-hidden lg:h-full lg:max-h-full lg:min-h-0",
        className,
      )}
    >
      <CardContent className="relative flex h-auto min-h-0 flex-col p-0 lg:h-full lg:overflow-hidden">
        <div className="relative min-w-0 shrink-0 px-4 pt-4 pb-3">
          <div className="min-w-0 pr-10">
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
        </div>

        <ol
          className="m-0 flex shrink-0 list-none flex-wrap items-stretch gap-2 px-4 pt-4 pb-4"
          aria-label="Compliance pipeline stages"
        >
          {STAGES.map((stage, index) => {
            const selected = selectedStage === stage.id;
            return (
              <li key={stage.id} className="flex min-w-0 flex-1">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectStage(stage.id)}
                  className={cn(
                    "flex w-full min-w-0 cursor-pointer flex-col gap-1 rounded-lg border px-3 py-2 text-left transition-colors select-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2",
                    selected
                      ? "border-neutral-900 bg-white hover:border-neutral-900 hover:bg-white"
                      : "border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-white",
                  )}
                >
                  <span className="font-mono text-sm font-semibold uppercase tracking-wider text-neutral-900 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-neutral-900">
                    {stage.label}
                  </span>
                  <span className="m-0 font-mono text-sm tabular-nums text-neutral-900">
                    {stage.count} Active
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        {selectedStage ? (
          <div className="shrink-0 px-4 pb-3">
            <button
              type="button"
              onClick={() => setSelectedStage(null)}
              className="cursor-pointer text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
            >
              All stages
            </button>
          </div>
        ) : null}

        <div className="min-h-0 w-full max-h-72 overflow-auto overscroll-contain lg:max-h-none lg:flex-1">
        <Table
          className="w-full table-fixed border-separate border-spacing-0"
          containerClassName="overflow-visible"
          aria-label="Active pipeline jobs"
        >
          <colgroup>
            <col style={{ width: "34%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "26%" }} />
          </colgroup>
          <TableHeader className="sticky top-0 z-10 border-b-0 bg-white shadow-[0_1px_0_0_var(--border)] [&_tr]:border-b-0">
            <TableRow className="border-0 bg-white hover:bg-transparent">
              <TableHead className="sticky top-0 z-10 h-10 border-t border-b-0 border-zinc-200 bg-white px-4 text-left">
                Document
              </TableHead>
              <TableHead className="sticky top-0 z-10 h-10 border-t border-b-0 border-zinc-200 bg-white px-4 text-left">
                ID / Version
              </TableHead>
              <TableHead className="sticky top-0 z-10 h-10 border-t border-b-0 border-zinc-200 bg-white px-4 text-left">
                ETA
              </TableHead>
              <TableHead className="sticky top-0 z-10 h-10 border-t border-b-0 border-zinc-200 bg-white px-4 text-left">
                Current Stage
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            className={cn(
              "divide-y divide-border border-b-0",
              "[&>tr:not(:first-child)>td]:border-t [&>tr:not(:first-child)>td]:border-border",
            )}
          >
            {visibleJobs.length === 0 ? (
              <TableRow className="h-12 border-0 hover:bg-transparent">
                <TableCell
                  colSpan={4}
                  className="h-12 px-4 py-0 text-muted-foreground"
                >
                  No documents in {selectedLabel}.
                </TableCell>
              </TableRow>
            ) : null}
            {visibleJobs.map((job) => (
              <TableRow
                key={job.id}
                className="h-12 border-0 hover:bg-neutral-50"
              >
                <TableCell className="h-12 px-4 py-0">
                  <TruncatedText text={job.document} />
                </TableCell>
                <TableCell className="h-12 px-4 py-0">
                  <TruncatedText
                    className="font-mono tabular-nums"
                    text={job.version}
                  />
                </TableCell>
                <TableCell className="h-12 px-4 py-0">
                  <span className={TELEMETRY_META_CLASS}>{job.eta}</span>
                </TableCell>
                <TableCell className="h-12 px-4 py-0">
                  <Badge tone="neutral">{job.stage}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
