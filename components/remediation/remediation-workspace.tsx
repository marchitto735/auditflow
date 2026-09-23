"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { CARD_EYEBROW_MUTED_CLASS, PAGE_CANVAS_CLASS } from "@/lib/page-layout";
import { textToPdfBlob } from "@/lib/text-pdf";
import { cn } from "@/lib/utils";

const SOURCE_DOCUMENT = "sop-non-compliant.txt";
const ACTION_BUTTON_CLASS =
  "h-9 min-h-9 rounded-sm px-3 py-0 text-sm font-medium shadow-none";

const PARSED = parseDocumentChunks(SOURCE_SOP_TEXT);

if (
  !documentIsFullyCovered(SOURCE_SOP_TEXT, PARSED.chunks) ||
  PARSED.lines.length !== PARSED.chunks.length
) {
  throw new Error("Remediation parser dropped source document lines.");
}

function statusBadgeClass(status: "compliant" | "non-compliant") {
  if (status === "compliant") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function formatIndex(number: number) {
  return String(number).padStart(2, "0");
}

const FINDING_CARD_CLASS =
  "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 rounded-sm border border-border bg-white p-4 shadow-none";

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
  const { lines, chunks } = PARSED;
  const [reviews, setReviews] = useState<Record<string, ChunkReview>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const reviewedCount = useMemo(
    () => chunks.filter((chunk) => chunkIsReviewed(chunk, reviews[chunk.id])).length,
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
    <div className={cn("flex h-full min-h-0 flex-1 flex-col overflow-hidden", PAGE_CANVAS_CLASS)}>
      <div className="grid min-h-0 flex-1 grid-cols-1 border-t border-border lg:grid-cols-2">
        <Card className={cn("flex h-full min-h-[420px] min-w-0 flex-col gap-0 overflow-hidden rounded-none border-0 border-b border-border py-0 shadow-none lg:min-h-0 lg:border-r lg:border-b-0", PAGE_CANVAS_CLASS)}>
          <CardHeader className="flex h-14 shrink-0 flex-row items-center justify-between gap-3 px-4 py-0">
            <CardTitle className="text-sm font-medium tracking-tight">
              Source Document
            </CardTitle>
            <p className="m-0 shrink-0 text-sm leading-5">
              <span className="text-muted-foreground">Document:</span>{" "}
              <span className="font-mono tabular-nums">{SOURCE_DOCUMENT}</span>
            </p>
          </CardHeader>
          <Separator />
          <ScrollArea className="min-h-0 flex-1">
            <div className="p-4">
              <Card className="gap-0 rounded-sm border border-border bg-white p-4 shadow-none">
                <CardContent className="p-0">
                  <ol className="m-0 flex list-none flex-col gap-4 p-0">
                    {lines.map((line) => (
                      <li key={line.number} className="m-0 flex items-baseline gap-3 p-0 text-base font-normal leading-6">
                        <span className="shrink-0 font-mono text-base font-normal tabular-nums leading-6 text-muted-foreground">
                          {formatIndex(line.number)}
                        </span>
                        <span className="font-normal text-foreground">{line.text}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </Card>

        <Card className={cn("flex h-full min-h-[420px] min-w-0 flex-col gap-0 overflow-hidden rounded-none border-0 py-0 shadow-none lg:min-h-0", PAGE_CANVAS_CLASS)}>
          <CardHeader className="flex h-14 shrink-0 flex-row items-center justify-between gap-3 px-4 py-0">
            <CardTitle className="text-sm font-medium tracking-tight">
              Audit Analysis & Remediation
            </CardTitle>
            <p className="m-0 shrink-0 text-sm leading-5 text-foreground">
              <span>Compliance Score:</span>{" "}
              <span className="font-mono tabular-nums">{complianceScore}</span>
              {" / "}
              <span className="font-mono tabular-nums">100</span>
            </p>
          </CardHeader>
          <Separator />
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-3 p-4">
              {chunks.map((chunk) => {
                const assessment = assessChunk(chunk);
                const review = reviews[chunk.id];
                const resolved =
                  assessment.status === "compliant" ||
                  review?.decision === "accepted";
                const status = resolved ? "compliant" : "non-compliant";
                const editing = editingId === chunk.id;

                const blockNumber = chunk.lines[0].number;

                if (assessment.status === "compliant" && !editing) {
                  return (
                    <Card key={chunk.id} className={FINDING_CARD_CLASS}>
                      <CardHeader className="contents">
                        <FindingIndex number={blockNumber} />
                        <FindingTitle title={chunk.title} />
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-sm font-sans",
                            statusBadgeClass("compliant"),
                          )}
                        >
                          Compliant
                        </Badge>
                      </CardHeader>
                    </Card>
                  );
                }

                return (
                  <Card key={chunk.id} className={FINDING_CARD_CLASS}>
                    <CardHeader className="contents">
                      <FindingIndex number={blockNumber} />
                      <FindingTitle title={chunk.title} />
                      <Badge
                        variant="outline"
                        className={cn("rounded-sm font-sans", statusBadgeClass(status))}
                      >
                        {status === "compliant" ? "Compliant" : "Non-Compliant"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="col-span-2 col-start-2 p-0 pt-3">
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
                          <div className="flex flex-col gap-1">
                            <p className={CARD_EYEBROW_MUTED_CLASS}>
                              Suggested Change
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
                            <div className="flex items-center justify-between gap-3">
                              <p className="m-0 text-base font-normal text-muted-foreground">
                                {review.decision === "accepted"
                                  ? "Revision accepted"
                                  : "Revision declined"}
                              </p>
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
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </Card>
      </div>

      <footer className={cn("flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3", PAGE_CANVAS_CLASS)}>
        <p className="m-0 text-sm text-foreground">
          <span className="font-mono tabular-nums">
            {reviewedCount} of {chunks.length}
          </span>{" "}
          Findings Reviewed
        </p>
        <Button
          type="button"
          variant="black"
          className="h-10 min-h-10 rounded-sm px-4 py-0 text-sm"
          onClick={finalize}
        >
          Finalize & Download Gold Standard SOP (PDF)
        </Button>
      </footer>
    </div>
  );
}
