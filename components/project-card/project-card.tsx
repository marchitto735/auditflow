"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatSopReportDownload,
  type SopAuditReport,
} from "@/lib/sop-report";
import { cn } from "@/lib/utils";

const AUDIT_CLAUSE_ID = "27";
const CLAUSE_DOCUMENTS = [
  "SOP",
  "Policy",
  "Work Instruction",
  "Form",
  "Training Record",
] as const;

function serializeUnknownError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  if (typeof error === "object" && error !== null) {
    return {
      ...error,
      message: "message" in error ? String(error.message) : undefined,
    };
  }
  return { message: String(error) };
}

export type ProjectCardProps = {
  title: string;
  description: string;
  image: string;
  href?: string;
  /** Default: “See Case Study”. */
  ctaLabel?: string;
  /** When true, CTA uploads a PDF and POSTs to the SOP n8n webhook. */
  runAudit?: boolean;
  /** Default: side-by-side on md+ (home). `vertical`: image on top, copy + CTA below (case study “Next project”). */
  layout?: "horizontal" | "vertical";
};

export default function ProjectCard({
  title,
  description,
  image,
  href,
  ctaLabel = "See Case Study",
  runAudit: isAuditCard = false,
  layout = "horizontal",
}: ProjectCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingDocTypeRef = useRef<(typeof CLAUSE_DOCUMENTS)[number] | null>(
    null,
  );
  const [auditStatus, setAuditStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<
    (typeof CLAUSE_DOCUMENTS)[number] | null
  >(null);

  const [processedAt, setProcessedAt] = useState<Date | null>(null);
  const [sopReport, setSopReport] = useState<SopAuditReport | null>(null);

  function resetAudit() {
    setAuditStatus("idle");
    setAuditMessage(null);
    setSelectedFile(null);
    setSelectedDocType(null);
    setProcessedAt(null);
    setSopReport(null);
  }

  function downloadReport() {
    const fileName = selectedFile?.name ?? "SOP.pdf";
    const report = sopReport
      ? formatSopReportDownload(sopReport, fileName)
      : ["AuditFlow SOP Report", "", `File: ${fileName}`].join("\n");

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-report-clause-${AUDIT_CLAUSE_ID}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleRunAudit() {
    if (!selectedFile || auditStatus === "loading") return;

    setAuditStatus("loading");
    setAuditMessage(`Running SOP audit for ${selectedFile.name}…`);
    console.log("[Run Audit] Uploading SOP PDF via /api/audit/run…", {
      clause_id: AUDIT_CLAUSE_ID,
      documentType: selectedDocType,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
    });

    try {
      const body = new FormData();
      body.append("file", selectedFile);
      body.append("clause_id", AUDIT_CLAUSE_ID);
      if (selectedDocType) {
        body.append("document_type", selectedDocType);
      }

      const started = Date.now();
      const response = await fetch("/api/audit/run", {
        method: "POST",
        body,
      });
      const raw = await response.text();
      let payload: {
        ok?: boolean;
        webhook?: unknown;
        error?: string;
        details?: unknown;
        fileName?: string;
        report?: SopAuditReport;
      } = {};
      if (raw) {
        try {
          payload = JSON.parse(raw) as typeof payload;
        } catch {
          payload = { error: raw.slice(0, 300) };
        }
      }

      const elapsed = Date.now() - started;
      if (elapsed < 1400) {
        await new Promise((resolve) => setTimeout(resolve, 1400 - elapsed));
      }

      if (!response.ok || !payload.ok || !payload.report) {
        const message =
          (typeof payload.error === "string" && payload.error.trim()) ||
          `SOP audit failed (${response.status} ${response.statusText})`.trim();
        setAuditStatus("error");
        setAuditMessage(message);
        console.warn(
          `[Run Audit] SOP audit failed: ${response.status} ${message}`,
        );
        return;
      }

      setSopReport(payload.report);
      setAuditStatus("success");
      setProcessedAt(
        payload.report.created_at
          ? new Date(payload.report.created_at)
          : new Date(),
      );
      console.log("[Run Audit] SOP report ready", payload.report);
    } catch (error) {
      setAuditStatus("error");
      const serialized = serializeUnknownError(error);
      setAuditMessage(serialized.message || "Failed to trigger SOP workflow");
      console.warn(
        `[Run Audit] SOP webhook request failed: ${serialized.message}`,
      );
    }
  }

  function openFilePicker(docType: (typeof CLAUSE_DOCUMENTS)[number]) {
    if (auditStatus === "loading") return;
    pendingDocTypeRef.current = docType;
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setSelectedFile(file);
    setSelectedDocType(pendingDocTypeRef.current);
    setAuditStatus("idle");
    setAuditMessage(null);
    setSopReport(null);
  }

  if (isAuditCard) {
    if (auditStatus === "success") {
      return (
        <div className="w-full min-w-0">
          <Card className="relative w-full max-w-[520px] overflow-hidden rounded-3xl border-0 bg-[oklch(100%_0_0)] shadow-none p-0 gap-0">
            <CardContent className="flex flex-col bg-[oklch(100%_0_0)] p-6 md:p-8">
              <button
                type="button"
                onClick={resetAudit}
                className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-[oklch(94%_0_0)] text-[oklch(0%_0_0)] hover:bg-[oklch(90%_0_0)]"
                aria-label="Close report"
              >
                <X className="size-5" />
              </button>

              <div className="pt-8 text-center">
                <h4 className="text-h4 font-semibold text-[oklch(0%_0_0)] m-0 mb-3">
                  Audit Processed!
                </h4>
                <p className="text-body1 text-[oklch(0%_0_0)] m-0 mb-8 mx-auto max-w-[36ch]">
                  Your SOP documentation has been processed and here are the
                  results of your report.
                </p>
              </div>

              <div className="mb-6 rounded-2xl bg-[oklch(95%_0_0)] p-4 md:p-5">
                <div className="flex items-center justify-between gap-3 pb-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="size-6 shrink-0 text-[oklch(35%_0.04_264)]" />
                    <p className="text-body1 font-semibold text-[oklch(0%_0_0)] m-0 truncate">
                      {selectedFile?.name ?? "SOP.pdf"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-[oklch(88%_0_0)] px-3 py-1 text-button uppercase tracking-wide text-[oklch(35%_0_0)]">
                    {sopReport?.status ?? "Processed"}
                  </span>
                </div>
                <div className="border-t border-[oklch(88%_0_0)] pt-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-body1 text-[oklch(0%_0_0)]">
                      Score:
                    </span>
                    <span className="text-body1 font-semibold text-right text-[oklch(0%_0_0)]">
                      {sopReport?.score ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-body1 text-[oklch(0%_0_0)]">
                      Audited Clause:
                    </span>
                    <span className="text-body1 font-semibold text-right text-[oklch(0%_0_0)]">
                      Question {sopReport?.clause_id ?? AUDIT_CLAUSE_ID} (Doc
                      Practices)
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-body1 text-[oklch(0%_0_0)]">
                      Timestamp:
                    </span>
                    <span className="text-body1 font-semibold text-right text-[oklch(0%_0_0)]">
                      {(processedAt ?? new Date()).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {sopReport?.summary ? (
                <div className="mb-6">
                  <p className="text-body1 font-semibold text-[oklch(0%_0_0)] m-0 mb-2">
                    Summary
                  </p>
                  <p className="text-body2 text-[oklch(0%_0_0)] m-0">
                    {sopReport.summary}
                  </p>
                </div>
              ) : null}

              {sopReport?.findings.length ? (
                <div className="mb-6">
                  <p className="text-body1 font-semibold text-[oklch(0%_0_0)] m-0 mb-2">
                    Findings
                  </p>
                  <ul className="m-0 list-none p-0 space-y-2">
                    {sopReport.findings.map((finding) => (
                      <li
                        key={finding}
                        className="flex gap-2 text-body2 text-[oklch(0%_0_0)]"
                      >
                        <span
                          className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-[oklch(0%_0_0)]"
                          aria-hidden
                        />
                        <span className="min-w-0">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {sopReport?.recommendation ? (
                <div className="mb-8">
                  <p className="text-body1 font-semibold text-[oklch(0%_0_0)] m-0 mb-2">
                    Recommendation
                  </p>
                  <p className="text-body2 text-[oklch(0%_0_0)] m-0">
                    {sopReport.recommendation}
                  </p>
                </div>
              ) : (
                <div className="mb-8" />
              )}

              <Button
                type="button"
                variant="black"
                size="lg"
                className="project-card-cta w-full rounded-full"
                onClick={downloadReport}
              >
                <span className="text-button">Download Report</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="w-full min-w-0">
        <Card className="w-full max-w-[520px] overflow-hidden rounded-3xl border-0 bg-[oklch(100%_0_0)] shadow-none p-0 gap-0">
          <CardContent className="flex flex-col text-left bg-[oklch(100%_0_0)] p-6 md:p-8">
            <h4 className="text-h4 text-[oklch(0%_0_0)] m-0 mb-2">{title}</h4>
            <p className="text-body1 text-[oklch(0%_0_0)] m-0 mb-6">
              {description}
            </p>

            <p className="text-body1 font-medium text-[oklch(0%_0_0)] m-0 mb-3">
              Select a document type to upload:
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {CLAUSE_DOCUMENTS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => openFilePicker(label)}
                  disabled={auditStatus === "loading"}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-button disabled:opacity-50",
                    selectedDocType === label
                      ? "border-[oklch(0%_0_0)] bg-[oklch(0%_0_0)] text-[oklch(100%_0_0)]"
                      : "border-[oklch(0%_0_0)] bg-transparent text-[oklch(0%_0_0)] hover:bg-[oklch(96%_0_0)]",
                  )}
                >
                  <FileText className="size-4 shrink-0" aria-hidden />
                  {label}
                </button>
              ))}
            </div>

            {selectedFile ? (
              <p className="text-body2 text-[oklch(0%_0_0)] m-0 mb-3">
                Selected
                {selectedDocType ? ` ${selectedDocType}` : ""}: {selectedFile.name}
              </p>
            ) : null}

            {auditMessage ? (
              <p className="text-body2 text-[oklch(0%_0_0)] m-0 mb-4">
                {auditMessage}
              </p>
            ) : null}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={handleFileChange}
            />

            <Button
              type="button"
              variant="black"
              size="lg"
              className={cn(
                "project-card-cta relative w-full overflow-hidden rounded-full border-0",
                auditStatus === "loading" && "pointer-events-none",
              )}
              onClick={handleRunAudit}
              disabled={!selectedFile}
              aria-busy={auditStatus === "loading"}
            >
              <svg
                className="pointer-events-none absolute inset-0 size-full"
                aria-hidden
              >
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="24"
                  ry="24"
                  fill="none"
                  stroke="oklch(48% 0 0)"
                  strokeWidth="2"
                />
                {auditStatus === "loading" ? (
                  <rect
                    x="1"
                    y="1"
                    width="calc(100% - 2px)"
                    height="calc(100% - 2px)"
                    rx="24"
                    ry="24"
                    pathLength="100"
                    fill="none"
                    stroke="oklch(78% 0 0)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="16 84"
                    className="audit-cta-dash"
                  />
                ) : null}
              </svg>
              <span className="relative z-10 text-button">
                {auditStatus === "loading" ? "Running…" : ctaLabel}
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const imageArea = (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-transparent",
        layout === "vertical"
          ? "min-h-[240px] aspect-[16/8] shrink-0 rounded-t-2xl"
          : "h-full min-h-[240px] md:min-h-[320px] rounded-t-2xl md:rounded-t-none md:rounded-l-2xl",
      )}
    >
      <Image
        src={image}
        alt={title}
        fill
        // Thumbnails are swapped frequently; bypass Next's image optimizer cache
        // so updates to same-filename assets show immediately.
        unoptimized
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );

  const textCard = (
    <Card
      className={cn(
        "flex flex-col justify-center overflow-hidden bg-[oklch(100%_0_0)] border-0 shadow-none p-0 gap-0",
        layout === "vertical"
          ? "rounded-b-2xl rounded-t-none"
          : "rounded-b-2xl md:rounded-b-none md:rounded-r-2xl",
      )}
    >
      <CardContent
        className={cn(
          "flex flex-col justify-center text-left bg-[oklch(100%_0_0)]",
          layout === "vertical" ? "p-4 md:p-8" : "p-4 md:p-8 lg:p-16",
        )}
      >
        <h4 className="text-h4 text-[oklch(0%_0_0)] m-0 mb-2">{title}</h4>

        <p className="text-body1 text-[oklch(0%_0_0)] m-0 mb-8">{description}</p>

        <Button
          variant="black"
          size="lg"
          className="project-card-cta w-fit rounded-full"
          asChild
        >
          {href ? (
            <a href={href} className="text-button">
              {ctaLabel}
            </a>
          ) : (
            <span className="text-button">{ctaLabel}</span>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  if (layout === "vertical") {
    return (
      <div className="w-full min-w-0 rounded-2xl overflow-hidden bg-transparent flex flex-col">
        {imageArea}
        {textCard}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="w-full min-w-0 grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch min-h-0 md:min-h-[440px] rounded-2xl overflow-hidden bg-transparent">
        {imageArea}
        {textCard}
      </div>
    </div>
  );
}
