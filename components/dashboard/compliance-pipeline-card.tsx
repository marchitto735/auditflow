"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  CARD_CONTENT_CLASS,
  CARD_CTA_ARROW_CLASS,
  CARD_CTA_CLASS,
  CARD_EYEBROW_CLASS,
  CARD_FOOTER_CLASS,
  CARD_TITLE_CLASS,
  DASHBOARD_CARD_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type PipelineStage = {
  id: string;
  label: string;
  count: number;
  active?: boolean;
};

type PipelineJob = {
  id: string;
  document: string;
  stage: string;
  eta: string;
};

const STAGES: PipelineStage[] = [
  { id: "ingest", label: "Ingest", count: 2 },
  { id: "validate", label: "Validate", count: 1, active: true },
  { id: "score", label: "Score", count: 3 },
  { id: "review", label: "Review", count: 1 },
  { id: "export", label: "Export", count: 0 },
];

const ACTIVE_JOBS: PipelineJob[] = [
  {
    id: "job-1",
    document: "SOP Manufacturing v4.2",
    stage: "Validate",
    eta: "2m",
  },
  {
    id: "job-2",
    document: "BPR-204 Batch Record",
    stage: "Score",
    eta: "6m",
  },
  {
    id: "job-3",
    document: "FIR Facility Walkthrough",
    stage: "Review",
    eta: "12m",
  },
];

export function CompliancePipelineCard({ className }: { className?: string }) {
  return (
    <Card className={cn(DASHBOARD_CARD_CLASS, className)}>
      <CardContent className={cn(CARD_CONTENT_CLASS, "gap-3")}>
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className={CARD_EYEBROW_CLASS}>Pipeline</p>
          <h3
            className={cn(
              CARD_TITLE_CLASS,
              "m-0 max-w-full text-balance text-black",
            )}
          >
            Active Compliance Pipeline
          </h3>
        </div>

        <ol
          className="m-0 flex list-none flex-wrap items-stretch gap-2 p-0"
          aria-label="Compliance pipeline stages"
        >
          {STAGES.map((stage, index) => (
            <li
              key={stage.id}
              className={cn(
                "flex min-w-0 flex-1 flex-col gap-1 rounded-lg border px-3 py-2",
                stage.active
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 bg-white",
              )}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-medium text-black">{stage.label}</span>
              <span className="text-body1 m-0 text-zinc-600">
                {stage.count} active
              </span>
            </li>
          ))}
        </ol>

        <ul
          className="m-0 flex list-none flex-col gap-2 p-0"
          aria-label="Active pipeline jobs"
        >
          {ACTIVE_JOBS.map((job) => (
            <li
              key={job.id}
              className="flex min-w-0 items-baseline justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-body1 m-0 truncate font-medium text-black">
                  {job.document}
                </p>
                <p className="text-body1 m-0 text-zinc-600">{job.stage}</p>
              </div>
              <span className="shrink-0 text-sm font-medium tabular-nums text-zinc-500">
                ETA {job.eta}
              </span>
            </li>
          ))}
        </ul>

        <div className={cn(CARD_FOOTER_CLASS, "group")}>
          <Link href="/dashboard/audits" className={CARD_CTA_CLASS}>
            <span>View Audit Log</span>
            <ChevronRight className={CARD_CTA_ARROW_CLASS} aria-hidden />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
