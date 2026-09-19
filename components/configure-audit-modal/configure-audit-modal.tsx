"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  FileText,
  Loader2,
  Paperclip,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AuditWorkflowId } from "@/lib/audit-workflows";
import { AUDIT_WORKFLOWS } from "@/lib/audit-workflows";
import {
  AUDIT_FRAMEWORKS,
  frameworkSearchKeywords,
  frameworkSearchValue,
  getAuditFramework,
  getClausesForFramework,
} from "@/lib/audit-frameworks";
import { cn } from "@/lib/utils";

const DEFAULT_SELECTED_SHORT_NAMES = ["1.1", "5.5.1"] as const;
const DEFAULT_FILE = "SOP_Manufacturing_v4.2.pdf";
const DEFAULT_FRAMEWORK = AUDIT_FRAMEWORKS[0]?.value ?? "iso-9001-2015";

const SECTION_LABEL =
  "mb-2 text-xs font-semibold uppercase tracking-wider text-black";

function defaultSelectionForFramework(frameworkValue: string) {
  const clauses = getClausesForFramework(frameworkValue);
  const preferred = clauses.filter((clause) =>
    (DEFAULT_SELECTED_SHORT_NAMES as readonly string[]).includes(
      clause.shortName,
    ),
  );
  if (preferred.length > 0) {
    return new Set(preferred.map((clause) => clause.id));
  }
  return new Set(clauses.slice(0, 3).map((clause) => clause.id));
}

function frameworkFilter(
  value: string,
  search: string,
  keywords?: string[],
) {
  const query = search.trim().toLowerCase();
  if (!query) return 1;
  const haystack = [value, ...(keywords ?? [])].join(" ").toLowerCase();
  const words = query.split(/\s+/).filter(Boolean);
  return words.every((word) => haystack.includes(word)) ? 1 : 0;
}

type ConfigureAuditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: AuditWorkflowId;
};

export function ConfigureAuditModal({
  open,
  onOpenChange,
  workflowId,
}: ConfigureAuditModalProps) {
  const router = useRouter();
  const workflow = AUDIT_WORKFLOWS[workflowId];

  const [framework, setFramework] = React.useState(DEFAULT_FRAMEWORK);
  const [frameworkOpen, setFrameworkOpen] = React.useState(false);
  const [clauseOpen, setClauseOpen] = React.useState(false);
  const [attachedFile, setAttachedFile] = React.useState<File | null>(null);
  const [attachedFileName, setAttachedFileName] = React.useState<string | null>(
    DEFAULT_FILE,
  );
  const [clauseQuery, setClauseQuery] = React.useState("");
  const [selectedClauses, setSelectedClauses] = React.useState<Set<string>>(
    () => defaultSelectionForFramework(DEFAULT_FRAMEWORK),
  );
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [initError, setInitError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setFramework(DEFAULT_FRAMEWORK);
    setFrameworkOpen(false);
    setClauseOpen(false);
    setAttachedFile(null);
    setAttachedFileName(DEFAULT_FILE);
    setClauseQuery("");
    setSelectedClauses(defaultSelectionForFramework(DEFAULT_FRAMEWORK));
    setIsInitializing(false);
    setInitError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, workflowId]);

  const selectedFramework = getAuditFramework(framework);
  const frameworkClauses = React.useMemo(
    () => getClausesForFramework(framework),
    [framework],
  );

  const filteredClauses = React.useMemo(() => {
    const q = clauseQuery.trim().toLowerCase();
    if (!q) return frameworkClauses;
    const words = q.split(/\s+/).filter(Boolean);
    return frameworkClauses.filter((clause) => {
      const haystack = [
        clause.id,
        clause.label,
        clause.shortName,
        clause.section,
        clause.description,
        `clause ${clause.shortName}`,
      ]
        .join(" ")
        .toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
  }, [clauseQuery, frameworkClauses]);

  const selectedClauseSummary = React.useMemo(() => {
    if (selectedClauses.size === 0) return "Select clauses…";
    const selected = frameworkClauses.filter((clause) =>
      selectedClauses.has(clause.id),
    );
    if (selected.length === 0) {
      return `${selectedClauses.size} clauses selected`;
    }
    if (selected.length === 1) {
      return `Clause ${selected[0].shortName} · ${selected[0].description.replace(/\.$/, "")}`;
    }
    return `${selected.length} clauses selected`;
  }, [frameworkClauses, selectedClauses]);

  function selectFramework(value: string) {
    setFramework(value);
    setFrameworkOpen(false);
    setClauseOpen(false);
    setClauseQuery("");
    setSelectedClauses(defaultSelectionForFramework(value));
  }

  function toggleClause(id: string, checked: boolean) {
    setSelectedClauses((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleClauseOpenChange(nextOpen: boolean) {
    setClauseOpen(nextOpen);
    if (!nextOpen) setClauseQuery("");
  }

  function assignDocument(file: File | null) {
    if (!file) {
      setAttachedFile(null);
      setAttachedFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setAttachedFile(file);
    setAttachedFileName(file.name);
  }

  function handleBrowseClick() {
    fileInputRef.current?.click();
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    assignDocument(file);
  }

  function handleDropZoneDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDropZoneDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0] ?? null;
    if (!file) return;
    assignDocument(file);
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    // Block dismiss / accidental resets while Initialize is in flight.
    if (isInitializing && !nextOpen) return;
    onOpenChange(nextOpen);
  }

  async function handleInitialize() {
    if (isInitializing) return;
    if (selectedClauses.size === 0) {
      setInitError("Select at least one clause before initializing.");
      return;
    }

    setInitError(null);
    setIsInitializing(true);
    setFrameworkOpen(false);
    setClauseOpen(false);

    try {
      const params = new URLSearchParams();
      params.set("framework", framework);
      params.set("workflow", workflowId);
      if (attachedFileName) {
        params.set("document", attachedFileName);
      }
      params.set("clauses", Array.from(selectedClauses).join(","));

      // Final audit results report (skips clause-selection workspace).
      const destination = `/audit/results?${params.toString()}`;

      await Promise.resolve(router.push(destination));
      onOpenChange(false);
    } catch (error) {
      setIsInitializing(false);
      setInitError(
        error instanceof Error
          ? error.message
          : "Unable to start audit analysis. Please try again.",
      );
    }
  }

  const assessmentLabel =
    workflow.id === "sop"
      ? "SOP"
      : workflow.id === "bpr"
        ? "BPR"
        : "FIR";

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        showCloseButton={false}
        centerInViewport
        overlayClassName="bg-black/60 backdrop-blur-sm"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[min(90vh,840px)] md:w-full md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2"
      >
        <div className="flex max-h-[min(90vh,840px)] w-full flex-col overflow-hidden rounded-xl border border-black/20 bg-white text-black shadow-2xl">
          <DialogHeader className="shrink-0 gap-1 border-b border-black/10 px-6 py-5 text-left">
            <DialogTitle className="m-0 text-xl font-medium tracking-tight text-black">
              Configure Audit Parameters
            </DialogTitle>
            <DialogDescription className="m-0 max-w-xl text-sm font-normal text-muted-foreground">
              Choose a framework, select clauses, and link target documentation
              for the {assessmentLabel} compliance assessment.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {/* Framework Selection — searchable combobox */}
            <section>
              <h3 className={SECTION_LABEL}>Framework Selection</h3>
              <Popover
                modal
                open={frameworkOpen}
                onOpenChange={setFrameworkOpen}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    role="combobox"
                    aria-expanded={frameworkOpen}
                    className={cn(
                      "relative flex h-14 w-full items-center justify-between rounded-lg border border-black/20 bg-white px-3 pt-4 text-left text-sm font-medium text-black transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30",
                      frameworkOpen && "bg-neutral-50",
                    )}
                  >
                    <span className="pointer-events-none absolute left-3 top-2 text-[10px] font-medium uppercase tracking-wide text-black/60">
                      Select Framework / Version
                    </span>
                    <span className="min-w-0 flex-1 truncate pr-2">
                      {selectedFramework?.label ?? "Select framework"}
                    </span>
                    <ChevronDown className="size-4 shrink-0 opacity-70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  avoidCollisions={false}
                  onWheel={(event) => event.stopPropagation()}
                  onTouchMove={(event) => event.stopPropagation()}
                  className="z-[300] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border border-black/20 bg-white p-0 text-black shadow-lg"
                >
                  <Command
                    filter={frameworkFilter}
                    className="flex max-h-[280px] flex-col overflow-hidden rounded-lg bg-white text-black"
                  >
                    <CommandInput
                      placeholder="Search frameworks (ISO, FDA, NIST…)"
                      className="text-sm text-black placeholder:text-black/45"
                    />
                    <CommandList
                      className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
                      style={{ maxHeight: 220 }}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup className="overflow-visible">
                        {AUDIT_FRAMEWORKS.map((item) => {
                          const isSelected = item.value === framework;
                          return (
                            <CommandItem
                              key={item.value}
                              value={frameworkSearchValue(item)}
                              keywords={frameworkSearchKeywords(item)}
                              onSelect={() => selectFramework(item.value)}
                              className={cn(
                                "cursor-pointer gap-2 text-sm text-black data-[selected=true]:bg-neutral-100 data-[selected=true]:text-black",
                                isSelected && "bg-neutral-100",
                              )}
                            >
                              <Check
                                className={cn(
                                  "size-4 shrink-0",
                                  isSelected ? "opacity-100" : "opacity-0",
                                )}
                              />
                              <span className="min-w-0 flex-1 truncate">
                                {item.label}
                              </span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </section>

            {/* Clause Selection — searchable multi-select combobox */}
            <section>
              <h3 className={SECTION_LABEL}>Clause Selection</h3>
              <Popover
                modal
                open={clauseOpen}
                onOpenChange={handleClauseOpenChange}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    role="combobox"
                    aria-expanded={clauseOpen}
                    className={cn(
                      "relative flex h-14 w-full items-center justify-between rounded-lg border border-black/20 bg-white px-3 pt-4 text-left text-sm font-medium text-black transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30",
                      clauseOpen && "bg-neutral-50",
                    )}
                  >
                    <span className="pointer-events-none absolute left-3 top-2 text-[10px] font-medium uppercase tracking-wide text-black/60">
                      Select Clauses
                    </span>
                    <span className="min-w-0 flex-1 truncate pr-2">
                      {selectedClauseSummary}
                    </span>
                    <ChevronDown className="size-4 shrink-0 opacity-70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  avoidCollisions={false}
                  onWheel={(event) => event.stopPropagation()}
                  onTouchMove={(event) => event.stopPropagation()}
                  className="z-[300] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border border-black/20 bg-white p-0 text-black shadow-lg"
                >
                  <Command
                    shouldFilter={false}
                    className="flex max-h-[320px] flex-col overflow-hidden rounded-lg bg-white text-black"
                  >
                    <CommandInput
                      value={clauseQuery}
                      onValueChange={setClauseQuery}
                      placeholder="Search clauses (e.g., 5.5.1 or 'training')."
                      className="text-sm text-black placeholder:text-black/45"
                    />
                    <CommandList
                      className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
                      style={{ maxHeight: 240 }}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      <CommandEmpty>No clauses match your search.</CommandEmpty>
                      <CommandGroup className="overflow-visible p-0">
                        {filteredClauses.map((clause) => {
                          const checked = selectedClauses.has(clause.id);
                          const description = clause.description.replace(
                            /\.$/,
                            "",
                          );
                          return (
                            <CommandItem
                              key={clause.id}
                              value={`${clause.shortName} ${clause.description}`}
                              onSelect={() =>
                                toggleClause(clause.id, !checked)
                              }
                              className="cursor-pointer items-start gap-3 rounded-none px-3 py-2.5 text-sm text-black data-[selected=true]:bg-neutral-50 data-[selected=true]:text-black"
                            >
                              <Checkbox
                                checked={checked}
                                tabIndex={-1}
                                className="mt-0.5 pointer-events-none"
                                aria-hidden
                              />
                              <span className="min-w-0 flex-1 leading-snug text-black">
                                <span className="font-medium text-black">
                                  Clause {clause.shortName}
                                </span>
                                <span className="text-black"> · </span>
                                <span className="text-black">{description}</span>
                              </span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  <div className="flex items-center justify-between border-t border-black/10 px-3 py-2">
                    <span className="text-xs text-black">
                      {selectedClauses.size} selected
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 px-2 text-xs font-medium text-black hover:bg-neutral-100"
                      onClick={() => setClauseOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </section>

            {/* Target Documentation */}
            <section>
              <h3 className={SECTION_LABEL}>Target Documentation</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                className="sr-only"
                onChange={handleFileInputChange}
                aria-hidden
                tabIndex={-1}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={handleBrowseClick}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleBrowseClick();
                  }
                }}
                onDragOver={handleDropZoneDragOver}
                onDrop={handleDropZoneDrop}
                className="flex cursor-pointer flex-col gap-3 rounded-lg border border-black/20 bg-white px-4 py-4 transition-colors hover:border-black/40 hover:bg-neutral-50 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 text-sm text-black">
                  <Paperclip className="size-4 shrink-0 text-black" aria-hidden />
                  <span className="leading-snug">
                    Drag &amp; drop target {assessmentLabel} PDF or browse your
                    computer…
                  </span>
                </div>
                <Button
                  type="button"
                  variant="muted"
                  className="h-9 shrink-0 rounded-lg border border-black/10 bg-neutral-200 px-4 text-sm font-medium text-black hover:bg-neutral-300"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleBrowseClick();
                  }}
                >
                  Browse
                </Button>
              </div>

              {attachedFileName ? (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-black/15 bg-white px-3 py-2.5">
                  <FileText className="size-4 shrink-0 text-black" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-black">
                    {attachedFileName}
                    {attachedFile
                      ? ` · ${(attachedFile.size / 1024).toFixed(0)} KB`
                      : null}
                  </span>
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-sm text-black transition-colors hover:bg-neutral-100"
                    aria-label="Remove attached document"
                    onClick={() => assignDocument(null)}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : null}
            </section>
          </div>

          <DialogFooter className="shrink-0 flex-col gap-3 border-t border-black/10 px-6 py-4 sm:flex-col">
            {initError ? (
              <p className="m-0 w-full text-sm text-black" role="alert">
                {initError}
              </p>
            ) : null}
            <div className="flex w-full flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg border-black bg-transparent px-4 text-sm font-medium text-black hover:bg-neutral-100"
                onClick={() => handleDialogOpenChange(false)}
                disabled={isInitializing}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="black"
                className="h-10 rounded-lg px-5 text-sm font-medium"
                onClick={() => {
                  void handleInitialize();
                }}
                disabled={selectedClauses.size === 0 || isInitializing}
                aria-busy={isInitializing}
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Initializing…
                  </>
                ) : (
                  "Initialize Audit Analysis"
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
