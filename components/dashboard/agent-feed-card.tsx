"use client";

import { useState } from "react";
import { CardActionsMenu, FEED_CARD_MENU_ACTIONS } from "@/components/dashboard/card-actions-menu";
import { Badge, type BadgeTone } from "@/components/ui/badge";
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
  DASHBOARD_CARD_CLASS,
  SECTION_DESCRIPTION_CLASS,
  TABLE_CARD_TITLE_HEADER_CLASS,
  TELEMETRY_META_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type FeedState = "Success" | "Running" | "Failed";

type FeedEvent = {
  timestamp: string;
  dateTime: string;
  message: string;
  target: string;
  actor: string;
  state: FeedState;
};

const FEED_EVENTS: FeedEvent[] = [
  {
    timestamp: "Sep 30, 10:12 AM",
    dateTime: "2026-09-30T10:12:00",
    message: "Batch reconciliation queued for BPR-204.",
    target: "BPR-204",
    actor: "Agent",
    state: "Running",
  },
  {
    timestamp: "Sep 30, 10:11 AM",
    dateTime: "2026-09-30T10:11:00",
    message: "Stakeholder digest prepared for review.",
    target: "Stakeholder digest",
    actor: "Notifier",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 10:10 AM",
    dateTime: "2026-09-30T10:10:00",
    message: "Cross-check complete — 2 residual findings.",
    target: "—",
    actor: "Validator",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 10:09 AM",
    dateTime: "2026-09-30T10:09:00",
    message: "Low-confidence OCR on page 4 — manual review suggested.",
    target: "SOP Manufacturing v4.2",
    actor: "Scanner",
    state: "Running",
  },
  {
    timestamp: "Sep 30, 10:08 AM",
    dateTime: "2026-09-30T10:08:00",
    message: "Draft audit packet packaged (PDF).",
    target: "Audit packet",
    actor: "Exporter",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 10:07 AM",
    dateTime: "2026-09-30T10:07:00",
    message: "Evidence folder synced to clause 7.5.2.",
    target: "Clause 7.5.2",
    actor: "Linker",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 10:06 AM",
    dateTime: "2026-09-30T10:06:00",
    message: "OCR finished on SOP Manufacturing v4.2.",
    target: "SOP Manufacturing v4.2",
    actor: "Scanner",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 10:05 AM",
    dateTime: "2026-09-30T10:05:00",
    message: "Document typed as standard operating procedure.",
    target: "SOP-001",
    actor: "Classifier",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 10:04 AM",
    dateTime: "2026-09-30T10:04:00",
    message: "SOP-001 parsed successfully.",
    target: "SOP-001",
    actor: "Parser",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 10:03 AM",
    dateTime: "2026-09-30T10:03:00",
    message: "Clause 5.5.1 mapped to training records.",
    target: "Clause 5.5.1",
    actor: "Matcher",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 10:02 AM",
    dateTime: "2026-09-30T10:02:00",
    message: "Compliance score recalculated (88%).",
    target: "—",
    actor: "Scorer",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 10:01 AM",
    dateTime: "2026-09-30T10:01:00",
    message: "Framework ISO 13485:2016 loaded.",
    target: "ISO 13485:2016",
    actor: "Indexer",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 10:00 AM",
    dateTime: "2026-09-30T10:00:00",
    message: "New document staged for FIR audit.",
    target: "FIR audit",
    actor: "Watcher",
    state: "Running",
  },
  {
    timestamp: "Sep 30, 9:59 AM",
    dateTime: "2026-09-30T09:59:00",
    message: "Downstream model timeout — retrying (attempt 2/3).",
    target: "—",
    actor: "Health",
    state: "Failed",
  },
  {
    timestamp: "Sep 30, 9:58 AM",
    dateTime: "2026-09-30T09:58:00",
    message: "Session ready — awaiting configuration.",
    target: "—",
    actor: "Agent",
    state: "Running",
  },
  {
    timestamp: "Sep 30, 9:57 AM",
    dateTime: "2026-09-30T09:57:00",
    message: "Clause corpus warmed (142 entries).",
    target: "Clause corpus",
    actor: "Cache",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 9:56 AM",
    dateTime: "2026-09-30T09:56:00",
    message: "Auditor context bound for Kevin Marchitto.",
    target: "Kevin Marchitto",
    actor: "Auth",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 9:55 AM",
    dateTime: "2026-09-30T09:55:00",
    message: "Downstream model endpoint responding (42ms).",
    target: "—",
    actor: "Health",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 9:54 AM",
    dateTime: "2026-09-30T09:54:00",
    message: "Overnight FIR sweep completed.",
    target: "FIR sweep",
    actor: "Scheduler",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 9:53 AM",
    dateTime: "2026-09-30T09:53:00",
    message: "Detected revision on SOP_Cleaning_v3.1.",
    target: "SOP_Cleaning_v3.1",
    actor: "Diff",
    state: "Success",
  },
  {
    timestamp: "Sep 30, 9:52 AM",
    dateTime: "2026-09-30T09:52:00",
    message: "3 audits pending initialization.",
    target: "Audit queue",
    actor: "Queue",
    state: "Running",
  },
  {
    timestamp: "Sep 30, 9:51 AM",
    dateTime: "2026-09-30T09:51:00",
    message: "AuditFlow agent runtime online.",
    target: "—",
    actor: "Bootstrap",
    state: "Success",
  },
];

function stateTone(state: FeedState): BadgeTone {
  switch (state) {
    case "Success":
      return "success";
    case "Running":
      return "warning";
    case "Failed":
      return "danger";
  }
}

const FEED_TABLE_MIN_WIDTH_CLASS = "min-w-[52rem]";
const DEFAULT_PAGE_SIZE = 5;

type AgentFeedCardProps = {
  className?: string;
};

export function AgentFeedCard({ className }: AgentFeedCardProps) {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);

  const totalCount = FEED_EVENTS.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = FEED_EVENTS.slice(pageStart, pageStart + pageSize);

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
        "flex w-full min-w-0 flex-col overflow-hidden",
        className,
      )}
    >
      <CardContent className="flex min-w-0 flex-col p-0">
        <div className={TABLE_CARD_TITLE_HEADER_CLASS}>
          <div className="min-w-0 pr-10">
            <p className={CARD_SECTION_EYEBROW_CLASS}>Activity stream</p>
            <p className={SECTION_DESCRIPTION_CLASS}>
              Real-time system events across validation, scoring, and export.
            </p>
          </div>
          <div className="absolute top-3 right-3">
            <CardActionsMenu
              label="Activity stream"
              actions={FEED_CARD_MENU_ACTIONS}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col" style={{ overflowAnchor: "none" }}>
          <div className="min-w-0 overflow-x-auto">
            <Table
              className={FEED_TABLE_MIN_WIDTH_CLASS}
              containerClassName="overflow-visible"
            >
              <colgroup>
                <col className="w-[18%]" style={{ width: "18%" }} />
                <col className="w-[34%]" style={{ width: "34%" }} />
                <col className="w-[18%]" style={{ width: "18%" }} />
                <col className="w-[15%]" style={{ width: "15%" }} />
                <col className="w-[15%]" style={{ width: "15%" }} />
              </colgroup>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((event) => (
                  <TableRow
                    key={`${event.dateTime}-${event.actor}-${event.message}`}
                  >
                    <TableCell>
                      <time
                        className={TELEMETRY_META_CLASS}
                        dateTime={event.dateTime}
                      >
                        {event.timestamp}
                      </time>
                    </TableCell>
                    <TableCell>
                      <TruncatedText text={event.message} />
                    </TableCell>
                    <TableCell>
                      <TruncatedText
                        className="font-mono tabular-nums"
                        text={event.target}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge tone="neutral">{event.actor}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge tone={stateTone(event.state)}>{event.state}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <TablePaginationBar
            className={FEED_TABLE_MIN_WIDTH_CLASS}
            pageRowsCount={pageRows.length}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            paginationLabel="Activity feed pagination"
          />
        </div>
      </CardContent>
    </Card>
  );
}
