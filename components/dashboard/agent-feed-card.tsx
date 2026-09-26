"use client";

import { AlertTriangle, CircleAlert } from "lucide-react";
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

type FeedStatus = "info" | "warn" | "error";

type FeedEvent = {
  time: string;
  subsystem: string;
  message: string;
  status?: FeedStatus;
};

const FEED_EVENTS: FeedEvent[] = [
  {
    time: "10:12 AM",
    subsystem: "Agent",
    message: "Batch reconciliation queued for BPR-204.",
  },
  {
    time: "10:11 AM",
    subsystem: "Notifier",
    message: "Stakeholder digest prepared for review.",
  },
  {
    time: "10:10 AM",
    subsystem: "Validator",
    message: "Cross-check complete — 2 residual findings.",
  },
  {
    time: "10:09 AM",
    subsystem: "Scanner",
    message: "Low-confidence OCR on page 4 — manual review suggested.",
    status: "warn",
  },
  {
    time: "10:08 AM",
    subsystem: "Exporter",
    message: "Draft audit packet packaged (PDF).",
  },
  {
    time: "10:07 AM",
    subsystem: "Linker",
    message: "Evidence folder synced to clause 7.5.2.",
  },
  {
    time: "10:06 AM",
    subsystem: "Scanner",
    message: "OCR finished on SOP Manufacturing v4.2.",
  },
  {
    time: "10:05 AM",
    subsystem: "Classifier",
    message: "Document typed as Standard Operating Procedure.",
  },
  {
    time: "10:04 AM",
    subsystem: "Parser",
    message: "SOP-001 parsed successfully.",
  },
  {
    time: "10:03 AM",
    subsystem: "Matcher",
    message: "Clause 5.5.1 mapped to training records.",
  },
  {
    time: "10:02 AM",
    subsystem: "Scorer",
    message: "Compliance score recalculated (88%).",
  },
  {
    time: "10:01 AM",
    subsystem: "Indexer",
    message: "Framework ISO 13485:2016 loaded.",
  },
  {
    time: "10:00 AM",
    subsystem: "Watcher",
    message: "New document staged for FIR audit.",
  },
  {
    time: "9:59 AM",
    subsystem: "Health",
    message: "Downstream model timeout — retrying (attempt 2/3).",
    status: "error",
  },
  {
    time: "9:58 AM",
    subsystem: "Agent",
    message: "Session ready — awaiting configuration.",
  },
  {
    time: "9:57 AM",
    subsystem: "Cache",
    message: "Clause corpus warmed (142 entries).",
  },
  {
    time: "9:56 AM",
    subsystem: "Auth",
    message: "Auditor context bound for Kevin Marchitto.",
  },
  {
    time: "9:55 AM",
    subsystem: "Health",
    message: "Downstream model endpoint responding (42ms).",
  },
  {
    time: "9:54 AM",
    subsystem: "Scheduler",
    message: "Overnight FIR sweep completed.",
  },
  {
    time: "9:53 AM",
    subsystem: "Diff",
    message: "Detected revision on SOP_Cleaning_v3.1.",
  },
  {
    time: "9:52 AM",
    subsystem: "Queue",
    message: "3 audits pending initialization.",
  },
  {
    time: "9:51 AM",
    subsystem: "Bootstrap",
    message: "AuditFlow agent runtime online.",
  },
];

/** Subtle thin scrollbar for the agent feed log. */
const FEED_SCROLLBAR_CLASS = cn(
  "overflow-x-hidden overflow-y-auto overscroll-y-contain overscroll-x-none",
  "[scrollbar-width:thin]",
  "[scrollbar-color:#d4d4d8_transparent]",
  "[&::-webkit-scrollbar]:w-1.5",
  "[&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-full",
  "[&::-webkit-scrollbar-thumb]:bg-zinc-300",
  "[&::-webkit-scrollbar-thumb:hover]:bg-zinc-400",
);

type AgentFeedCardProps = {
  className?: string;
};

export function AgentFeedCard({ className }: AgentFeedCardProps) {
  return (
    <Card
      className={cn(
        DASHBOARD_CARD_CLASS,
        "flex h-full min-h-0 flex-col overflow-hidden",
        className,
      )}
    >
      <CardContent
        className={cn(
          CARD_CONTENT_CLASS,
          "flex h-full min-h-0 flex-1 flex-col gap-3 overflow-hidden",
        )}
      >
        <div className="shrink-0">
          <p className={CARD_SECTION_EYEBROW_CLASS}>Activity Feed</p>
          <p className="text-body1 m-0 mt-1 text-zinc-600">
            Real-time agent events across validation, scoring, and export.
          </p>
        </div>

        <ul
          className={cn(
            TELEMETRY_LIST_CLASS,
            "max-h-[350px] min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-1",
            FEED_SCROLLBAR_CLASS,
          )}
          aria-label="AI agent activity feed"
        >
          {FEED_EVENTS.map((event) => {
            const status = event.status ?? "info";
            const isWarn = status === "warn";
            const isError = status === "error";
            const messageTone = isError
              ? "text-red-700"
              : isWarn
                ? "text-amber-700"
                : "text-black";

            return (
              <li
                key={`${event.time}-${event.subsystem}-${event.message}`}
                className="m-0 min-w-0 list-none"
              >
                <div
                  className={cn(TELEMETRY_ROW_CLASS, "min-w-0 rounded-lg")}
                >
                  <p
                    className={cn(
                      "text-base m-0 min-w-0 max-w-[65%] flex-1 overflow-hidden leading-snug text-pretty",
                      messageTone,
                    )}
                  >
                    {event.message}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    {isWarn ? (
                      <AlertTriangle
                        className="size-3.5 shrink-0 text-amber-700"
                        aria-hidden
                        strokeWidth={2}
                      />
                    ) : null}
                    {isError ? (
                      <CircleAlert
                        className="size-3.5 shrink-0 text-red-700"
                        aria-hidden
                        strokeWidth={2}
                      />
                    ) : null}
                    <time className={TELEMETRY_META_CLASS} dateTime={event.time}>
                      {event.time}
                    </time>
                    <span
                      className={cn(
                        TELEMETRY_PILL_CLASS,
                        isError && "border-red-200 bg-red-50 text-red-700",
                        isWarn && "border-amber-200 bg-amber-50 text-amber-700",
                      )}
                    >
                      {event.subsystem}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
