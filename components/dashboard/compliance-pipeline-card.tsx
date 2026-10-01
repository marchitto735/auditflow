"use client";

import { useEffect, useState } from "react";
import { CardActionsMenu, FEED_CARD_MENU_ACTIONS } from "@/components/dashboard/card-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePaginationBar,
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

const DEFAULT_PAGE_SIZE = 3;
const TABLE_BODY_ROWS = 3;

const STAGES: PipelineStage[] = STAGE_ORDER.map((stage) => ({
  ...stage,
  count: ACTIVE_JOBS.filter((job) => job.stageId === stage.id).length,
}));

/** Pipeline telemetry — stage cards filter the document queue. */
export function CompliancePipelineCard({ className }: { className?: string }) {
  const [selectedStage, setSelectedStage] = useState<PipelineStageId | null>(
    null,
  );
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const visibleJobs = selectedStage
    ? ACTIVE_JOBS.filter((job) => job.stageId === selectedStage)
    : ACTIVE_JOBS;
  const selectedLabel = STAGES.find((stage) => stage.id === selectedStage)?.label;
  const totalCount = visibleJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = visibleJobs.slice(pageStart, pageStart + pageSize);
  const occupiedRows = pageRows.length === 0 ? 1 : pageRows.length;
  const spacerCount = Math.max(0, TABLE_BODY_ROWS - occupiedRows);

  useEffect(() => {
    setPage(1);
  }, [pageSize, selectedStage]);

  function selectStage(stageId: PipelineStageId) {
    setSelectedStage((current) => (current === stageId ? null : stageId));
  }

  function handlePageSizeChange(value: string) {
    const scrollY = window.scrollY;
    setPageSize(Number(value));
    setPage(1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    });
  }
  return (
    <Card
      className={cn(
        DASHBOARD_CARD_CLASS,
        "flex h-full min-h-0 w-full flex-col overflow-hidden",
        className,
      )}
    >
      <CardContent className="flex h-full min-h-0 flex-col p-0">
        <div className="relative min-w-0 shrink-0 px-4 pt-4 pb-0">
          <div className="min-w-0 pr-10">
            <p className={CARD_SECTION_EYEBROW_CLASS}>Document tracker</p>
            <p className={SECTION_DESCRIPTION_CLASS}>
              Active document volume by stage from ingest through export.
            </p>
          </div>
          <div className="absolute top-3 right-3">
            <CardActionsMenu
              label="Document tracker"
              actions={FEED_CARD_MENU_ACTIONS}
            />
          </div>
        </div>

        <ol
          className="m-0 flex shrink-0 list-none flex-wrap items-stretch gap-2 border-b border-zinc-200 px-4 pt-3 pb-4"
          aria-label="Compliance pipeline stages"
        >
          {STAGES.map((stage) => {
            const selected = selectedStage === stage.id;
            return (
              <li key={stage.id} className="flex min-w-0 flex-1">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectStage(stage.id)}
                  className={cn(
                    "flex w-full min-w-0 cursor-pointer flex-col gap-1 overflow-hidden rounded-lg border px-2.5 py-2 text-left transition-colors select-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2",
                    selected
                      ? "border-neutral-900 bg-white hover:border-neutral-900 hover:bg-white"
                      : "border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-white",
                  )}
                >
                  <span className="min-w-0 truncate text-sm font-medium text-neutral-900">
                    {stage.label}
                  </span>
                  <span className="m-0 whitespace-nowrap font-mono text-sm tabular-nums text-neutral-900">
                    {stage.count} Active
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="flex min-h-0 flex-1 flex-col">
        <Table
          containerClassName="overflow-visible"
          aria-label="Active pipeline jobs"
        >
          <colgroup>
            <col style={{ width: "34%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "26%" }} />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>ID / Version</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Current Stage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="text-muted-foreground">
                  No documents in {selectedLabel}.
                </TableCell>
              </TableRow>
            ) : null}
            {pageRows.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <TruncatedText text={job.document} />
                </TableCell>
                <TableCell>
                  <TruncatedText
                    className="font-mono tabular-nums"
                    text={job.version}
                  />
                </TableCell>
                <TableCell>
                  <span className={TELEMETRY_META_CLASS}>{job.eta}</span>
                </TableCell>
                <TableCell>
                  <Badge tone="neutral">{job.stage}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {Array.from({ length: spacerCount }, (_, index) => (
              <TableRow
                key={`spacer-${index}`}
                aria-hidden
                className="hover:bg-transparent"
              >
                <TableCell colSpan={4} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePaginationBar
          className="mt-auto"
          pageRowsCount={pageRows.length}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          paginationLabel="Document tracker pagination"
        />
        </div>
      </CardContent>
    </Card>
  );
}
