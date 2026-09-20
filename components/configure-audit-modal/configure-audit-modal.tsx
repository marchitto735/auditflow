"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Loader2,
  Upload,
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

/** Shared section labels — text-sm, uniform weight. */
const SECTION_LABEL = "mb-2 text-sm font-medium text-black";

/** Shared field shell for Frameworks / Clauses / Docs. */
const FIELD_SURFACE_CLASS =
  "relative flex min-h-14 w-full cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-white px-3 py-2.5 text-left shadow-none transition-all duration-200 ease-in-out hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800/30";

const FIELD_SURFACE_OPEN_CLASS = "border-border bg-zinc-50 shadow-sm";

/** Inline selection / file pill token. */
const PILL_CLASS =
  "inline-flex max-w-full items-center gap-1 rounded-full border border-border/60 bg-zinc-50 py-1 pl-2.5 pr-1 text-sm font-medium text-black";

const PILL_REMOVE_CLASS =
  "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-black";

const PLACEHOLDER_CLASS = "text-sm text-muted-foreground";

const POPOVER_CLASS =
  "z-[300] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border border-border/60 bg-white p-0 text-black shadow-sm";

const DROPDOWN_FOOTER_CLASS =
  "flex items-center justify-between border-t border-border/60 px-3 py-2";

const COMMAND_SHELL_CLASS =
  "flex max-h-[280px] flex-col overflow-hidden rounded-lg bg-white text-black";

const COMMAND_LIST_CLASS =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain";

const COMMAND_LIST_MAX_HEIGHT = 220;

const COMMAND_ITEM_CLASS =
  "cursor-pointer gap-2 rounded-md text-sm text-black data-[selected=true]:bg-zinc-100 data-[selected=true]:text-black";

const DONE_BUTTON_CLASS =
  "h-8 px-2 text-sm font-medium text-black hover:bg-zinc-100";

const DROPDOWN_EMPTY_CLASS =
  "px-3 py-6 text-center text-sm text-zinc-500";

type StagedFile = {
  id: string;
  name: string;
  sizeBytes: number | null;
  file: File | null;
};

function MultiSelectCheck({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-black bg-white text-white transition-colors",
        checked && "border-black bg-black",
      )}
    >
      <Check
        className={cn("size-3", checked ? "opacity-100" : "opacity-0")}
        strokeWidth={3}
      />
    </span>
  );
}

function pruneClausesToFrameworks(
  clauseIds: Set<string>,
  frameworkValues: string[],
) {
  if (frameworkValues.length === 0) return new Set<string>();
  const allowed = new Set<string>();
  for (const value of frameworkValues) {
    for (const clause of getClausesForFramework(value)) {
      allowed.add(clause.id);
    }
  }
  const next = new Set<string>();
  for (const id of clauseIds) {
    if (allowed.has(id)) next.add(id);
  }
  return next;
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

function formatFileSize(bytes: number | null) {
  if (bytes == null || Number.isNaN(bytes)) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createStagedFile(file: File): StagedFile {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    sizeBytes: file.size,
    file,
  };
}

function SelectionPill({
  label,
  onRemove,
  removeLabel,
}: {
  label: string;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <span className={PILL_CLASS}>
      <span className="min-w-0 truncate">{label}</span>
      <button
        type="button"
        className={PILL_REMOVE_CLASS}
        aria-label={removeLabel}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRemove();
        }}
      >
        <X className="size-3" aria-hidden />
      </button>
    </span>
  );
}

function FieldChevron() {
  return (
    <ChevronDown
      aria-hidden
      className="pointer-events-none absolute right-3 top-1/2 size-4 shrink-0 -translate-y-1/2 text-zinc-500"
    />
  );
}

/** Non-button combobox shell so SelectionPill remove controls stay valid nested buttons. */
function FieldComboboxTrigger({
  open,
  onOpenChange,
  className,
  children,
  onKeyDown,
  ...props
}: React.ComponentProps<"div"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <div
      role="combobox"
      tabIndex={0}
      aria-expanded={open}
      {...props}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenChange(!open);
        }
        onKeyDown?.(event);
      }}
      className={cn(
        FIELD_SURFACE_CLASS,
        "pr-10",
        open && FIELD_SURFACE_OPEN_CLASS,
        className,
      )}
    >
      {children}
      <FieldChevron />
    </div>
  );
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

  const [frameworks, setFrameworks] = React.useState<string[]>([]);
  const [frameworkOpen, setFrameworkOpen] = React.useState(false);
  const [clauseOpen, setClauseOpen] = React.useState(false);
  const [docsOpen, setDocsOpen] = React.useState(false);
  const [attachedFiles, setAttachedFiles] = React.useState<StagedFile[]>([]);
  const [clauseQuery, setClauseQuery] = React.useState("");
  const [selectedClauses, setSelectedClauses] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [initError, setInitError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setFrameworks([]);
    setFrameworkOpen(false);
    setClauseOpen(false);
    setDocsOpen(false);
    setAttachedFiles([]);
    setClauseQuery("");
    setSelectedClauses(new Set());
    setIsInitializing(false);
    setInitError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, workflowId]);

  const selectedFrameworkItems = React.useMemo(
    () =>
      frameworks
        .map((value) => getAuditFramework(value))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [frameworks],
  );

  const frameworkClauses = React.useMemo(() => {
    const seen = new Set<string>();
    const merged = [];
    for (const value of frameworks) {
      for (const clause of getClausesForFramework(value)) {
        if (seen.has(clause.id)) continue;
        seen.add(clause.id);
        merged.push(clause);
      }
    }
    return merged;
  }, [frameworks]);

  const selectedClauseItems = React.useMemo(
    () =>
      frameworkClauses.filter((clause) => selectedClauses.has(clause.id)),
    [frameworkClauses, selectedClauses],
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

  const isBatchMode =
    frameworks.length > 1 || attachedFiles.length > 1;
  const docCount = attachedFiles.length;

  function toggleFramework(value: string) {
    setFrameworks((prev) => {
      const next = prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value];
      setSelectedClauses((prevClauses) =>
        pruneClausesToFrameworks(prevClauses, next),
      );
      return next;
    });
    setClauseQuery("");
  }

  function removeFramework(value: string) {
    setFrameworks((prev) => {
      const next = prev.filter((item) => item !== value);
      setSelectedClauses((prevClauses) =>
        pruneClausesToFrameworks(prevClauses, next),
      );
      return next;
    });
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

  function addFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files).map(createStagedFile);
    setAttachedFiles((prev) => {
      const names = new Set(prev.map((item) => item.name));
      const unique = incoming.filter((item) => !names.has(item.name));
      return [...prev, ...unique];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setDocsOpen(false);
  }

  function removeFile(id: string) {
    setAttachedFiles((prev) => prev.filter((item) => item.id !== id));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleBrowseClick() {
    fileInputRef.current?.click();
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files);
  }

  function handleDropZoneDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDropZoneDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    addFiles(event.dataTransfer.files);
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    if (isInitializing && !nextOpen) return;
    onOpenChange(nextOpen);
  }

  async function handleInitialize() {
    if (isInitializing) return;
    if (frameworks.length === 0) {
      setInitError("Select at least one framework before initializing.");
      return;
    }
    if (selectedClauses.size === 0) {
      setInitError("Select at least one clause before initializing.");
      return;
    }

    setInitError(null);
    setIsInitializing(true);
    setFrameworkOpen(false);
    setClauseOpen(false);
    setDocsOpen(false);

    try {
      const params = new URLSearchParams();
      params.set("framework", frameworks[0]);
      if (frameworks.length > 1) {
        params.set("frameworks", frameworks.join(","));
      }
      params.set("workflow", workflowId);
      if (attachedFiles.length === 1) {
        params.set("document", attachedFiles[0].name);
      } else if (attachedFiles.length > 1) {
        params.set(
          "documents",
          attachedFiles.map((item) => item.name).join("|"),
        );
      }
      params.set("clauses", Array.from(selectedClauses).join(","));

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

  const submitLabel =
    docCount > 1
      ? `Initialize Batch Audit Analysis (${docCount} Docs)`
      : "Initialize Audit Analysis";

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        showCloseButton={false}
        centerInViewport
        overlayClassName="bg-black/60 backdrop-blur-sm"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[min(90vh,840px)] md:w-full md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2"
      >
        <div className="flex max-h-[min(90vh,840px)] w-full flex-col overflow-hidden rounded-xl border border-border/60 bg-white text-black shadow-lg">
          <DialogHeader className="shrink-0 gap-1 border-b border-border/60 px-6 py-5 text-left">
            <DialogTitle className="m-0 text-xl font-medium tracking-tight text-black">
              Configure Audit Parameters
            </DialogTitle>
            <DialogDescription className="m-0 max-w-xl text-sm font-normal text-muted-foreground">
              Choose framework(s), select clauses, and link target documentation
              for the {assessmentLabel} compliance assessment.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {/* Framework Selection */}
            <section>
              <h3 className={SECTION_LABEL}>Framework Selection</h3>
              <Popover
                modal
                open={frameworkOpen}
                onOpenChange={setFrameworkOpen}
              >
                <PopoverTrigger asChild>
                  <FieldComboboxTrigger
                    open={frameworkOpen}
                    onOpenChange={setFrameworkOpen}
                  >
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                      {selectedFrameworkItems.length === 0 ? (
                        <span className={PLACEHOLDER_CLASS}>
                          Select frameworks…
                        </span>
                      ) : (
                        selectedFrameworkItems.map((item) => (
                          <SelectionPill
                            key={item.value}
                            label={item.label}
                            removeLabel={`Remove ${item.label}`}
                            onRemove={() => removeFramework(item.value)}
                          />
                        ))
                      )}
                    </div>
                  </FieldComboboxTrigger>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  avoidCollisions={false}
                  onWheel={(event) => event.stopPropagation()}
                  onTouchMove={(event) => event.stopPropagation()}
                  className={POPOVER_CLASS}
                >
                  <Command
                    filter={frameworkFilter}
                    className={COMMAND_SHELL_CLASS}
                  >
                    <CommandInput
                      placeholder="Search frameworks (ISO, FDA, NIST…)"
                      className="text-sm text-black placeholder:text-zinc-400"
                    />
                    <CommandList
                      className={COMMAND_LIST_CLASS}
                      style={{ maxHeight: COMMAND_LIST_MAX_HEIGHT }}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup className="overflow-visible">
                        {AUDIT_FRAMEWORKS.map((item) => {
                          const isSelected = frameworks.includes(item.value);
                          return (
                            <CommandItem
                              key={item.value}
                              value={frameworkSearchValue(item)}
                              keywords={frameworkSearchKeywords(item)}
                              onSelect={() => toggleFramework(item.value)}
                              className={cn(
                                COMMAND_ITEM_CLASS,
                                isSelected && "bg-zinc-100",
                              )}
                            >
                              <MultiSelectCheck checked={isSelected} />
                              <span className="min-w-0 flex-1 truncate">
                                {item.label}
                              </span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  <div className={DROPDOWN_FOOTER_CLASS}>
                    <span className="text-sm text-zinc-600">
                      {frameworks.length} selected
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className={DONE_BUTTON_CLASS}
                      onClick={() => setFrameworkOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </section>

            {/* Clause Selection */}
            <section>
              <h3 className={SECTION_LABEL}>Clause Selection</h3>
              <Popover
                modal
                open={clauseOpen}
                onOpenChange={handleClauseOpenChange}
              >
                <PopoverTrigger asChild>
                  <FieldComboboxTrigger
                    open={clauseOpen}
                    onOpenChange={handleClauseOpenChange}
                  >
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                      {selectedClauseItems.length === 0 ? (
                        <span className={PLACEHOLDER_CLASS}>
                          Select clauses…
                        </span>
                      ) : (
                        selectedClauseItems.map((clause) => (
                          <SelectionPill
                            key={clause.id}
                            label={`Clause ${clause.shortName}`}
                            removeLabel={`Remove clause ${clause.shortName}`}
                            onRemove={() => toggleClause(clause.id, false)}
                          />
                        ))
                      )}
                    </div>
                  </FieldComboboxTrigger>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  avoidCollisions={false}
                  onWheel={(event) => event.stopPropagation()}
                  onTouchMove={(event) => event.stopPropagation()}
                  className={POPOVER_CLASS}
                >
                  <Command
                    key={frameworks.join("|") || "no-framework"}
                    shouldFilter={false}
                    className={COMMAND_SHELL_CLASS}
                  >
                    <CommandInput
                      value={clauseQuery}
                      onValueChange={setClauseQuery}
                      placeholder="Search clauses (e.g., 5.5.1 or 'training')."
                      className="text-sm text-black placeholder:text-zinc-400"
                    />
                    <CommandList
                      className={COMMAND_LIST_CLASS}
                      style={{ maxHeight: COMMAND_LIST_MAX_HEIGHT }}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      {frameworks.length === 0 ? (
                        <p className={DROPDOWN_EMPTY_CLASS}>
                          Select a framework to see available clauses.
                        </p>
                      ) : filteredClauses.length === 0 ? (
                        <p className={DROPDOWN_EMPTY_CLASS}>
                          No clauses match your search.
                        </p>
                      ) : (
                        <CommandGroup className="overflow-visible">
                          {filteredClauses.map((clause) => {
                            const isSelected = selectedClauses.has(clause.id);
                            const description = clause.description.replace(
                              /\.$/,
                              "",
                            );
                            return (
                              <CommandItem
                                key={clause.id}
                                value={`${clause.id} ${clause.shortName} ${clause.description}`}
                                onSelect={() =>
                                  toggleClause(clause.id, !isSelected)
                                }
                                className={cn(
                                  COMMAND_ITEM_CLASS,
                                  isSelected && "bg-zinc-100",
                                )}
                              >
                                <MultiSelectCheck checked={isSelected} />
                                <span className="min-w-0 flex-1 truncate">
                                  <span className="font-medium">
                                    Clause {clause.shortName}
                                  </span>
                                  <span> · </span>
                                  <span>{description}</span>
                                </span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                  <div className={DROPDOWN_FOOTER_CLASS}>
                    <span className="text-sm text-zinc-600">
                      {selectedClauseItems.length} selected
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className={DONE_BUTTON_CLASS}
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
                multiple
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                className="sr-only"
                onChange={handleFileInputChange}
                aria-hidden
                tabIndex={-1}
              />
              <Popover modal open={docsOpen} onOpenChange={setDocsOpen}>
                <PopoverTrigger asChild>
                  <div
                    role="combobox"
                    tabIndex={0}
                    aria-expanded={docsOpen}
                    onDragOver={handleDropZoneDragOver}
                    onDrop={handleDropZoneDrop}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setDocsOpen(true);
                      }
                    }}
                    className={cn(
                      FIELD_SURFACE_CLASS,
                      "pr-10",
                      docsOpen && FIELD_SURFACE_OPEN_CLASS,
                    )}
                  >
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                      {attachedFiles.length === 0 ? (
                        <span className={PLACEHOLDER_CLASS}>
                          Drag & drop target {assessmentLabel} PDFs…
                        </span>
                      ) : (
                        attachedFiles.map((item) => {
                          const size = formatFileSize(item.sizeBytes);
                          return (
                            <SelectionPill
                              key={item.id}
                              label={size ? `${item.name} · ${size}` : item.name}
                              removeLabel={`Remove ${item.name}`}
                              onRemove={() => removeFile(item.id)}
                            />
                          );
                        })
                      )}
                    </div>
                    <FieldChevron />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  avoidCollisions={false}
                  className={POPOVER_CLASS}
                >
                  <div className="p-2">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-black transition-colors hover:bg-zinc-100"
                      onClick={handleBrowseClick}
                    >
                      <Upload className="size-4 shrink-0 text-zinc-500" aria-hidden />
                      <span className="min-w-0 flex-1">
                        Upload {assessmentLabel} PDF or documents…
                      </span>
                    </button>
                    <p className="m-0 px-3 pb-2 pt-1 text-sm text-zinc-500">
                      Or drag files onto the field above. Multiple files
                      supported.
                    </p>
                  </div>
                  <div className={DROPDOWN_FOOTER_CLASS}>
                    <span className="text-sm text-zinc-600">
                      {docCount} selected
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 px-2 text-sm font-medium text-black hover:bg-zinc-100"
                      onClick={() => setDocsOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </section>

            {isBatchMode ? (
              <section className="rounded-lg border border-border/60 bg-zinc-50 px-4 py-3">
                <h3 className="m-0 text-sm font-medium text-black">
                  Batch Mapping Summary
                </h3>
                <p className="m-0 mt-1 text-sm text-zinc-600">
                  {frameworks.length} framework
                  {frameworks.length === 1 ? "" : "s"} × {docCount}{" "}
                  {assessmentLabel}
                  {docCount === 1 ? "" : "s"} →{" "}
                  {frameworks.length * Math.max(docCount, 1)} analysis path
                  {frameworks.length * Math.max(docCount, 1) === 1 ? "" : "s"}
                </p>
                <ul className="m-0 mt-2 space-y-1 p-0 text-sm text-zinc-700">
                  {selectedFrameworkItems.map((item) => (
                    <li key={item.value} className="flex gap-2">
                      <span className="shrink-0 text-zinc-400">•</span>
                      <span className="min-w-0">
                        <span className="font-medium text-black">
                          {item.label}
                        </span>
                        {" → "}
                        {docCount === 0
                          ? "no documents staged"
                          : docCount === 1
                            ? attachedFiles[0].name
                            : `${docCount} documents`}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <DialogFooter className="shrink-0 flex-col gap-3 border-t border-border/60 px-6 py-4 sm:flex-col">
            {initError ? (
              <p className="m-0 w-full text-sm text-black" role="alert">
                {initError}
              </p>
            ) : null}
            <div className="flex w-full flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg border-zinc-800 bg-transparent px-4 text-sm font-medium text-black hover:bg-zinc-100"
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
                disabled={
                  selectedClauses.size === 0 ||
                  frameworks.length === 0 ||
                  isInitializing
                }
                aria-busy={isInitializing}
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Initializing…
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
