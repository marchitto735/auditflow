"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FileText, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/components/cart/cart-context";
import SectionHeader from "@/components/section-header/section-header";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GMP_CLAUSES, clauseSearchFilter, clauseSearchKeywords, clauseSearchValue, getGmpClause } from "@/lib/gmp-clauses";
import {
  AuditRunError,
  acceptForDocumentType,
  acceptForWorkflow,
  postAuditRun,
  validateAuditFile,
} from "@/lib/audit-client";
import {
  formatSopReportDownload,
  type SopAuditReport,
} from "@/lib/sop-report";
import { cn } from "@/lib/utils";
import {
  AUDIT_WORKFLOWS,
  documentTypesForWorkflow,
  workflowFromDocumentType,
  type AuditWorkflowId,
  type DocumentType,
} from "@/lib/audit-workflows";
import { goldStandardCatalogItem } from "@/lib/cart";
import {
  AuditReportTable,
} from "@/components/audit-report/audit-report-table";

const AUDIT_CLAUSE_ID = "27";

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
  /** When true, CTA uploads a file and POSTs to /api/audit/run. */
  runAudit?: boolean;
  /** Dashboard entry point: SOP, BPR, or FIR. Document pills switch the native workflow. */
  auditWorkflow?: AuditWorkflowId;
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
  auditWorkflow = "sop",
  layout = "horizontal",
}: ProjectCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingDocTypeRef = useRef<DocumentType | null>(null);
  const documentTypes = documentTypesForWorkflow(auditWorkflow);
  const [auditStatus, setAuditStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(
    null,
  );
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);
  const [clausePickerOpen, setClausePickerOpen] = useState(true);

  const [processedAt, setProcessedAt] = useState<Date | null>(null);
  const [sopReport, setSopReport] = useState<SopAuditReport | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const selectedClause = getGmpClause(selectedClauseId);
  const canRunAudit = Boolean(selectedClause && selectedFile);
  const { addItem } = useCart();
  const runWorkflow: AuditWorkflowId =
    workflowFromDocumentType(selectedDocType) ?? auditWorkflow;
  const runLabel = AUDIT_WORKFLOWS[runWorkflow].label;

  function resetAudit() {
    setAuditStatus("idle");
    setAuditMessage(null);
    setSelectedFile(null);
    setSelectedDocType(null);
    setSelectedClauseId(null);
    setClausePickerOpen(false);
    setProcessedAt(null);
    setSopReport(null);
  }

  function downloadReport() {
    const fileName = selectedFile?.name ?? `${runLabel}.pdf`;
    const report = sopReport
      ? formatSopReportDownload(sopReport, fileName)
      : [`AuditFlow ${runLabel} Report`, "", `File: ${fileName}`].join("\n");

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-report-clause-${selectedClause?.id ?? AUDIT_CLAUSE_ID}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function addCompliantSopToCart() {
    const clause =
      selectedClause ??
      getGmpClause(sopReport?.clause_id) ??
      getGmpClause(AUDIT_CLAUSE_ID);
    addItem(goldStandardCatalogItem(clause, selectedDocType));
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 1600);
  }

  async function handleRunAudit() {
    if (!selectedFile || !selectedClause || auditStatus === "loading") return;

    const fileError = validateAuditFile(selectedFile, runWorkflow);
    if (fileError) {
      setAuditStatus("error");
      setAuditMessage(fileError);
      return;
    }

    setAuditStatus("loading");
    setAuditMessage(`Running ${runLabel} audit for ${selectedFile.name}…`);
    setSopReport(null);

    try {
      const started = Date.now();
      const payload = await postAuditRun({
        file: selectedFile,
        clauseId: selectedClause.id,
        workflow: runWorkflow,
        documentType: selectedDocType,
      });

      const elapsed = Date.now() - started;
      if (elapsed < 800) {
        await new Promise((resolve) => setTimeout(resolve, 800 - elapsed));
      }

      setSopReport(payload.report);
      setAuditStatus("success");
      setAuditMessage(null);
      setProcessedAt(
        payload.report.created_at
          ? new Date(payload.report.created_at)
          : new Date(),
      );
    } catch (error) {
      setAuditStatus("error");
      const message =
        error instanceof AuditRunError
          ? error.message
          : error instanceof Error &&
              (error.name === "TimeoutError" || error.name === "AbortError")
            ? `${runLabel} audit timed out. Try a smaller file or run it again.`
            : serializeUnknownError(error).message ||
              `${runLabel} audit failed.`;
      setAuditMessage(message);
    }
  }

  function openFilePicker(docType: DocumentType) {
    if (!selectedClause || auditStatus === "loading") return;
    pendingDocTypeRef.current = docType;
    const input = fileInputRef.current;
    if (input) {
      input.accept = acceptForDocumentType(docType, auditWorkflow);
    }
    input?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const nextType = pendingDocTypeRef.current;
    const nextWorkflow = workflowFromDocumentType(nextType) ?? auditWorkflow;
    const fileError = validateAuditFile(file, nextWorkflow);
    setSelectedDocType(nextType);
    setSopReport(null);
    if (fileError) {
      setSelectedFile(null);
      setAuditStatus("error");
      setAuditMessage(fileError);
      return;
    }
    setSelectedFile(file);
    setAuditStatus("idle");
    setAuditMessage(null);
  }

  if (isAuditCard) {
    if (auditStatus === "success") {
      const fileName = selectedFile?.name ?? `${runLabel}.pdf`;
      const clauseLabel = selectedClause
        ? `${selectedClause.label} (${selectedClause.shortName})`
        : `Clause ${sopReport?.clause_id ?? AUDIT_CLAUSE_ID}`;

      return (
        <div className="w-full min-w-0">
          <SectionHeader
            title="Audit Report"
            description="Review your compliance breakdown and instantly resolve vulnerabilities by upgrading to a fully compliant SOP version."
            actions={
              <button
                type="button"
                onClick={resetAudit}
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-transparent text-foreground hover:bg-[var(--sidebar-hover)]"
                aria-label="Close report"
              >
                <X className="size-5" />
              </button>
            }
          />
          <div className="rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <Card className="relative w-full overflow-hidden rounded-2xl border border-border bg-[oklch(100%_0_0)] shadow-none p-0 gap-0">
              <CardContent className="h-auto bg-[oklch(100%_0_0)] p-0">
                <AuditReportTable
                  report={sopReport}
                  fileName={fileName}
                  documentType={selectedDocType ?? runLabel}
                  clauseLabel={clauseLabel}
                  timestamp={processedAt ?? new Date()}
                />
              </CardContent>
              <CardFooter className="flex w-full justify-end px-6 py-4">
                <Button
                  type="button"
                  variant="black"
                  className="rounded-full"
                  onClick={downloadReport}
                >
                  Download Report
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="mt-4 flex w-full items-center justify-center rounded-2xl border border-[oklch(90%_0_0)] bg-[oklch(95%_0_0)] px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <p className="text-body1 m-0 text-center text-[oklch(0%_0_0)]">
              Want to fix these issues immediately?{" "}
              <button
                type="button"
                className="text-button inline underline decoration-solid underline-offset-2 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0%_0_0)] focus-visible:ring-offset-2"
                onClick={addCompliantSopToCart}
              >
                {addedToCart
                  ? "Added to cart"
                  : `Upgrade ${selectedDocType ?? runLabel} Document`}
              </button>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full min-w-0 max-w-[520px]">
        <SectionHeader title={title} description={description} />
        <div className="rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <Card className="w-full overflow-hidden rounded-2xl border-0 bg-[oklch(100%_0_0)] shadow-none p-0 gap-0">
          <CardContent className="flex flex-col text-left bg-[oklch(100%_0_0)] px-6 pb-6 pt-6 md:px-8 md:pb-8">
            <Popover open={clausePickerOpen} onOpenChange={setClausePickerOpen}>
              <div className="mb-6">
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    role="combobox"
                    aria-expanded={clausePickerOpen}
                    className={cn(
                      "flex h-12 w-full items-center justify-between rounded-full border border-[oklch(0%_0_0)] bg-[oklch(100%_0_0)] px-4 text-body1 text-[oklch(0%_0_0)] transition-colors hover:bg-[oklch(96%_0_0)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0%_0_0)] focus-visible:ring-offset-2",
                      clausePickerOpen && "bg-[oklch(96%_0_0)]",
                    )}
                  >
                    <span
                      className={
                        selectedClause ? undefined : "text-muted-foreground"
                      }
                    >
                      {selectedClause?.label ?? "Select Clause..."}
                    </span>
                    <ChevronDown className="size-5 shrink-0 opacity-70" />
                  </button>
                </PopoverTrigger>
                {clausePickerOpen ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-[oklch(88%_0_0)] bg-[oklch(100%_0_0)]">
                    <Command filter={clauseSearchFilter}>
                      <CommandInput placeholder="Search by number or keyword..." />
                      <CommandList className="max-h-[280px]">
                        <CommandEmpty>No clause found.</CommandEmpty>
                        <CommandGroup>
                          {GMP_CLAUSES.map((clause) => (
                            <CommandItem
                              key={clause.id}
                              value={clauseSearchValue(clause)}
                              keywords={clauseSearchKeywords(clause)}
                              onSelect={() => {
                                setSelectedClauseId(clause.id);
                                setSelectedFile(null);
                                setSelectedDocType(null);
                                setAuditStatus("idle");
                                setAuditMessage(null);
                                setSopReport(null);
                                setClausePickerOpen(false);
                              }}
                              className={cn(
                                "items-start",
                                selectedClauseId === clause.id &&
                                  "bg-[oklch(96%_0_0)]",
                              )}
                            >
                              <span className="flex min-w-0 flex-col gap-0.5">
                                <span>{clause.label}</span>
                                <span className="text-body2 text-muted-foreground line-clamp-1">
                                  {clause.shortName}
                                  {" · "}
                                  {clause.description}
                                </span>
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                ) : null}
              </div>
            </Popover>

            {selectedClause ? (
              <>
                <p className="text-body1 text-[oklch(0%_0_0)] m-0 mb-6">
                  {selectedClause.description}
                </p>

                <p
                  className="text-body1 m-0 mb-3 text-[oklch(0%_0_0)]"
                  style={{ fontWeight: 600 }}
                >
                  Documents needed for this clause:
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {documentTypes.map((label) => (
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
              </>
            ) : null}

            {selectedFile ? (
              <p className="text-body2 text-[oklch(0%_0_0)] m-0 mb-3">
                Selected
                {selectedDocType ? ` ${selectedDocType}` : ""}: {selectedFile.name}
              </p>
            ) : null}

            {auditMessage ? (
              <p
                role={auditStatus === "error" ? "alert" : "status"}
                className={cn(
                  "text-body2 m-0 mb-4",
                  auditStatus === "error"
                    ? "text-[oklch(42%_0.16_25)]"
                    : "text-[oklch(0%_0_0)]",
                )}
              >
                {auditMessage}
              </p>
            ) : null}

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptForWorkflow(auditWorkflow)}
              className="sr-only"
              onChange={handleFileChange}
            />

            <Button
              type="button"
              variant="black"
              size="lg"
              className={cn(
                "project-card-cta relative w-full overflow-hidden rounded-full border-0 disabled:opacity-100 disabled:bg-[oklch(90%_0_0)] disabled:text-[oklch(62%_0_0)]",
                auditStatus === "loading" && "pointer-events-none",
              )}
              onClick={handleRunAudit}
              disabled={!canRunAudit || auditStatus === "loading"}
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
