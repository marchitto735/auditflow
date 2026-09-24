"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
} from "@/components/dashboard/card-actions-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardHeader,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  assessChunk,
  buildGoldStandard,
  documentIsFullyCovered,
  parseDocumentChunks,
  SOURCE_SOP_TEXT,
  type ChunkReview,
  type DocumentChunk,
} from "@/lib/document-chunks";
import { CARD_EYEBROW_MUTED_CLASS, DASHBOARD_CARD_CLASS, PAGE_CANVAS_CLASS, SECTION_HEADER_CLASS } from "@/lib/page-layout";
import { textToPdfBlob } from "@/lib/text-pdf";
import { cn } from "@/lib/utils";

const SOURCE_DOCUMENT = "sop-non-compliant.txt";
/** Page gutter alignment — flush with hamburger / outer layout bounds. */
const PAGE_EDGE_ALIGN_CLASS = "pl-6 pr-6 md:pl-8 md:pr-8";
const ACTION_BUTTON_CLASS =
  "h-9 min-h-9 rounded-sm px-3 py-0 text-sm font-medium shadow-none";

const PARSED = parseDocumentChunks(SOURCE_SOP_TEXT);

if (
  !documentIsFullyCovered(SOURCE_SOP_TEXT, PARSED.chunks) ||
  PARSED.lines.length !== PARSED.chunks.length
) {
  throw new Error("Remediation parser dropped source document lines.");
}

type FindingStatusValue = "compliant" | "non-compliant" | "partial";

function statusDotClass(status: FindingStatusValue) {
  if (status === "compliant") return "bg-emerald-500";
  if (status === "partial") return "bg-amber-500";
  return "bg-red-600";
}

function statusLabel(status: FindingStatusValue) {
  if (status === "compliant") return "Compliant";
  if (status === "partial") return "Partial";
  return "Non-Compliant";
}

function FindingStatus({ status }: { status: FindingStatusValue }) {
  return (
    <span className="inline-flex items-center gap-2 text-base font-normal leading-6 text-foreground">
      <span
        className={cn("size-2.5 shrink-0 rounded-full", statusDotClass(status))}
        aria-hidden
      />
      {statusLabel(status)}
    </span>
  );
}

const DOCUMENT_ACTIONS_TRIGGER_CLASS =
  "inline-flex h-6 shrink-0 items-center gap-1 rounded-sm border border-zinc-200 bg-white px-2 text-sm font-medium leading-none text-foreground shadow-none transition-colors hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function DocumentActionsMenu({
  items,
}: {
  items: { label: string; onSelect: () => void }[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const trigger = (
    <button type="button" className={DOCUMENT_ACTIONS_TRIGGER_CLASS}>
      Actions
      <ChevronDown className="size-4 shrink-0" aria-hidden />
    </button>
  );

  if (!mounted) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className={DASHBOARD_MENU_CONTENT_CLASS}>
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            className={DASHBOARD_MENU_ITEM_CLASS}
            onSelect={item.onSelect}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatIndex(number: number) {
  return String(number).padStart(2, "0");
}

function FindingIndex({ number }: { number: number }) {
  return (
    <span className="font-mono text-base font-normal tabular-nums leading-6 text-muted-foreground">
      {formatIndex(number)}
    </span>
  );
}

function FindingTitle({ title }: { title: string }) {
  return (
    <span className="min-w-0 text-base font-normal leading-6 text-foreground">
      {title}
    </span>
  );
}

function chunkIsReviewed(
  chunk: DocumentChunk,
  review: ChunkReview | undefined,
) {
  if (assessChunk(chunk).status === "compliant") return true;
  return review?.decision === "accepted" || review?.decision === "declined";
}

export default function RemediationWorkspace() {
  const { chunks } = PARSED;
  const [reviews, setReviews] = useState<Record<string, ChunkReview>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const reviewedCount = useMemo(
    () => chunks.filter((chunk) => chunkIsReviewed(chunk, reviews[chunk.id])).length,
    [chunks, reviews],
  );

  const flaggedCount = useMemo(
    () =>
      chunks.filter((chunk) => {
        if (assessChunk(chunk).status === "compliant") return false;
        return reviews[chunk.id]?.decision !== "accepted";
      }).length,
    [chunks, reviews],
  );

  const complianceScore = Math.round((reviewedCount / chunks.length) * 100);

  function setDecision(id: string, decision: ChunkReview["decision"], revision = "") {
    setReviews((current) => ({
      ...current,
      [id]: {
        decision,
        revision: revision || current[id]?.revision || "",
      },
    }));
    if (editingId === id) {
      setEditingId(null);
      setDraft("");
    }
  }

  function startEdit(chunk: DocumentChunk) {
    const assessment = assessChunk(chunk);
    setEditingId(chunk.id);
    setDraft(reviews[chunk.id]?.revision || assessment.changeRequired);
  }

  function undoDecision(id: string) {
    setDecision(id, "pending");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft("");
  }

  function runComplianceCheck(id: string) {
    const revision = draft.trim();
    if (!revision) {
      toast.error("Enter a revision before running the compliance check.");
      return;
    }
    setDecision(id, "accepted", revision);
    toast.success("Compliance check passed. Revision accepted.");
  }

  function downloadSource() {
    const blob = new Blob([SOURCE_SOP_TEXT], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = SOURCE_DOCUMENT;
    link.click();
    URL.revokeObjectURL(url);
  }

  function finalize() {
    const document = buildGoldStandard(chunks, reviews);
    const blob = textToPdfBlob(document);
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = "gold-standard-sop.pdf";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Gold Standard SOP downloaded.");
  }

  return (
    <div className={cn("flex h-0 max-h-[calc(100dvh-4rem)] min-h-0 w-full flex-1 flex-col overflow-hidden", PAGE_CANVAS_CLASS)}>
      <header className={cn("mb-[-20px] flex h-11 shrink-0 items-start", PAGE_EDGE_ALIGN_CLASS)}>
        <h2 className={cn(SECTION_HEADER_CLASS, "m-0 text-foreground")}>
          Compliance Validation
        </h2>
      </header>

      <div className={cn("flex min-h-0 w-full flex-1 flex-col overflow-hidden", PAGE_EDGE_ALIGN_CLASS)}>
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden lg:w-1/2">
        <CardHeader className="flex h-14 min-w-0 w-full shrink-0 flex-row items-center gap-3 px-0 py-0 lg:gap-6">
          <span className="shrink-0 text-base font-medium leading-6 text-foreground">
            Edit Document
          </span>
          <span className="ml-auto min-w-0 truncate font-mono text-sm leading-5 tabular-nums text-foreground">
            {SOURCE_DOCUMENT}
          </span>
          <p className="m-0 shrink-0 text-sm font-normal leading-5 text-foreground">
            <span className="font-mono tabular-nums">{complianceScore}</span>
            {" / "}
            <span className="font-mono tabular-nums">100</span>
          </p>
          <DocumentActionsMenu
            items={[
              {
                label: "Copy filename",
                onSelect: () => {
                  void navigator.clipboard.writeText(SOURCE_DOCUMENT);
                  toast.success("Filename copied.");
                },
              },
              {
                label: "Download source",
                onSelect: downloadSource,
              },
              {
                label: "Copy score",
                onSelect: () => {
                  void navigator.clipboard.writeText(`${complianceScore} / 100`);
                  toast.success("Score copied.");
                },
              },
              {
                label: "Export certified SOP",
                onSelect: finalize,
              },
            ]}
          />
        </CardHeader>

        <div className="flex min-h-0 flex-1 flex-col pt-2">
          <Card className={cn(DASHBOARD_CARD_CLASS, "h-0 min-h-0 w-full flex-1 gap-0 overflow-y-auto p-4")}>
            <ol className="m-0 flex list-none flex-col divide-y divide-zinc-200 p-0">
              {chunks.map((chunk) => {
                const assessment = assessChunk(chunk);
                const review = reviews[chunk.id];
                const resolved =
                  assessment.status === "compliant" ||
                  review?.decision === "accepted";
                const status = resolved ? "compliant" : "non-compliant";
                const editing = editingId === chunk.id;
                const blockNumber = chunk.lines[0].number;
                const showDetails = assessment.status !== "compliant" || editing;

                return (
                  <li
                    key={chunk.id}
                    className="m-0 grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-3 p-0 py-4 first:pt-0 last:pb-0"
                  >
                    <FindingIndex number={blockNumber} />
                    <FindingTitle title={chunk.title} />
                    <FindingStatus status={status} />
                    {showDetails ? (
                      <div className="col-span-2 col-start-2 min-w-0">
                        {editing ? (
                          <div className="flex flex-col gap-3">
                            <Textarea
                              value={draft}
                              onChange={(event) => setDraft(event.target.value)}
                              aria-label={`Revision for ${chunk.title}`}
                              className="min-h-28 rounded-sm border-border bg-muted/40"
                            />
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className={ACTION_BUTTON_CLASS}
                                onClick={cancelEdit}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                variant="black"
                                className={ACTION_BUTTON_CLASS}
                                onClick={() => runComplianceCheck(chunk.id)}
                              >
                                Run Compliance Check
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3">
                              <p className={CARD_EYEBROW_MUTED_CLASS}>
                                Suggested Revision
                              </p>
                              <p className="m-0 text-base font-normal leading-6 text-foreground">
                                {review?.decision === "accepted"
                                  ? review.revision
                                  : assessment.changeRequired}
                              </p>
                            </div>
                            {review?.decision === "pending" || !review ? (
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={ACTION_BUTTON_CLASS}
                                  onClick={() =>
                                    setDecision(
                                      chunk.id,
                                      "accepted",
                                      assessment.changeRequired,
                                    )
                                  }
                                >
                                  Accept Revision
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={ACTION_BUTTON_CLASS}
                                  onClick={() => startEdit(chunk)}
                                >
                                  Edit Manually
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-3">
                                {review.decision === "declined" ? (
                                  <p className="m-0 mr-auto text-base font-normal text-muted-foreground">
                                    Revision declined
                                  </p>
                                ) : null}
                                <button
                                  type="button"
                                  className="rounded-sm text-sm font-medium text-foreground underline-offset-2 hover:underline"
                                  onClick={() => undoDecision(chunk.id)}
                                >
                                  Undo
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>
        </div>
      </div>

      <footer className={cn("relative z-10 shrink-0 pt-12 pb-4 lg:pb-8", PAGE_EDGE_ALIGN_CLASS, PAGE_CANVAS_CLASS)}>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3 lg:w-1/2">
          <p className="m-0 text-base font-normal leading-6 text-red-600">
            {flaggedCount}{" "}
            Non-Compliant {flaggedCount === 1 ? "Finding" : "Findings"}
          </p>
          <Button
            type="button"
            variant="black"
            className="h-10 min-h-10 rounded-sm px-4 py-0 text-sm font-medium disabled:bg-zinc-200 disabled:text-zinc-400 disabled:opacity-100"
            disabled={flaggedCount > 0}
            onClick={finalize}
          >
            Export Certified SOP
          </Button>
        </div>
      </footer>
    </div>
  );
}
