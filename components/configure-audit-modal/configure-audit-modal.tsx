"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  CircleHelp,
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
import { AUDIT_TYPE_OPTIONS, AUDIT_WORKFLOWS } from "@/lib/audit-workflows";
import {
  AUDIT_FRAMEWORKS,
  frameworkSearchKeywords,
  frameworkSearchValue,
  getAuditFramework,
  getClausesForFramework,
} from "@/lib/audit-frameworks";
import { cn } from "@/lib/utils";
import { SECTION_HEADER_CLASS } from "@/lib/page-layout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Shared section labels — text-sm, uniform weight. */
const SECTION_LABEL = "mb-2 text-sm font-medium text-black";

/** Shared field shell for Frameworks / Clauses / Docs. */
const FIELD_SURFACE_CLASS =
  "relative flex min-h-14 w-full cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-sidebar-muted/40 px-3 py-3 text-left shadow-none transition-colors duration-200 ease-in-out hover:border-zinc-400 hover:bg-zinc-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800/30";

const FIELD_SURFACE_OPEN_CLASS = "border-border bg-zinc-50 shadow-sm";

/** Selected pills scroll inside the field instead of growing the trigger. */
const PILL_AREA_CLASS =
  "flex max-h-28 min-w-0 flex-1 flex-wrap content-start items-center gap-1.5 overflow-y-auto overscroll-contain py-0.5";

/** Inline selection / file pill token. */
const PILL_CLASS =
  "inline-flex h-auto max-w-full items-center gap-1 rounded-full border border-border/60 bg-zinc-50 py-2 pl-2.5 pr-1 text-sm font-medium leading-normal text-black";

const PILL_REMOVE_CLASS =
  "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-black";

const PLACEHOLDER_CLASS =
  "flex items-center py-0.5 text-sm leading-normal text-muted-foreground";

const POPOVER_CLASS =
  "z-[300] flex w-[var(--radix-popover-trigger-width)] max-h-[min(18rem,var(--radix-popover-content-available-height,18rem))] flex-col overflow-hidden rounded-lg border border-border/60 bg-white p-0 text-black shadow-sm";

/** Always drop under the field; height is capped so content scrolls inside the modal. */
const POPOVER_POSITION_PROPS = {
  side: "bottom" as const,
  align: "start" as const,
  sideOffset: 6,
  avoidCollisions: false,
};
const DROPDOWN_FOOTER_CLASS =
  "flex shrink-0 items-center justify-between border-t border-border/60 bg-white px-3 py-2";

/** Overrides cmdk `h-full` so the shell respects the popover max-height. */
const COMMAND_SHELL_CLASS =
  "flex h-auto max-h-full min-h-0 flex-1 flex-col overflow-hidden bg-white text-black [&_[cmdk-list]]:max-h-60 [&_[cmdk-list]]:min-h-0 [&_[cmdk-list]]:overflow-y-auto [&_[cmdk-list]]:overscroll-contain";

const COMMAND_LIST_CLASS =
  "max-h-60 min-h-0 overflow-y-auto overscroll-contain";

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
      <span className="min-w-0 truncate leading-normal">{label}</span>
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
  disabled = false,
  ...props
}: React.ComponentProps<"div"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="combobox"
      tabIndex={disabled ? -1 : 0}
      aria-expanded={open}
      aria-disabled={disabled || undefined}
      {...props}
      onKeyDown={(event) => {
        if (disabled) return;
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
        disabled &&
          "pointer-events-none cursor-not-allowed opacity-60 hover:border-zinc-200 hover:bg-sidebar-muted/40",
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
  /** Prefill from dashboard card; null when opened blank from New Audit. */
  initialWorkflowId: AuditWorkflowId | null;
};

export function ConfigureAuditModal({
  open,
  onOpenChange,
  initialWorkflowId,
}: ConfigureAuditModalProps) {
  const router = useRouter();

  const [auditType, setAuditType] = React.useState<AuditWorkflowId | null>(
    null,
  );
  const [auditTypeOpen, setAuditTypeOpen] = React.useState(false);
  const [frameworks, setFrameworks] = React.useState<string[]>([]);
  const [frameworkOpen, setFrameworkOpen] = React.useState(false);
  const [clauseOpen, setClauseOpen] = React.useState(false);
  const [docsOpen, setDocsOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [attachedFiles, setAttachedFiles] = React.useState<StagedFile[]>([]);
  const [clauseQuery, setClauseQuery] = React.useState("");
  const [selectedClauses, setSelectedClauses] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [initError, setInitError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const hasAuditType = auditType != null;
  const selectedAuditTypeOption = AUDIT_TYPE_OPTIONS.find(
    (item) => item.value === auditType,
  );

  function resetDependentFields() {
    setFrameworks([]);
    setFrameworkOpen(false);
    setClauseOpen(false);
    setDocsOpen(false);
    setAttachedFiles([]);
    setClauseQuery("");
    setSelectedClauses(new Set());
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  React.useEffect(() => {
    if (!open) return;
    setAuditType(initialWorkflowId);
    setAuditTypeOpen(false);
    resetDependentFields();
    setIsInitializing(false);
    setInitError(null);
  }, [open, initialWorkflowId]);

  function toggleAuditType(value: AuditWorkflowId) {
    const next = auditType === value ? null : value;
    setAuditType(next);
    resetDependentFields();
  }

  function removeAuditType() {
    setAuditType(null);
    resetDependentFields();
  }

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

  function handleFrameworkOpenChange(nextOpen: boolean) {
    if (nextOpen && !hasAuditType) return;
    setFrameworkOpen(nextOpen);
  }

  function handleClauseOpenChange(nextOpen: boolean) {
    if (nextOpen && !hasAuditType) return;
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
    if (!nextOpen) setHelpOpen(false);
    onOpenChange(nextOpen);
  }

  async function handleInitialize() {
    if (isInitializing) return;
    if (!auditType) {
      setInitError("Select an audit type before initializing.");
      return;
    }
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
    setAuditTypeOpen(false);
    setFrameworkOpen(false);
    setClauseOpen(false);
    setDocsOpen(false);

    try {
      const params = new URLSearchParams();
      params.set("framework", frameworks[0]);
      if (frameworks.length > 1) {
        params.set("frameworks", frameworks.join(","));
      }
      params.set("workflow", auditType);
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

  const assessmentLabel = auditType
    ? AUDIT_WORKFLOWS[auditType].label
    : null;
  const helperText = `Choose audit type, framework(s), select clauses, and link target documentation${
    assessmentLabel
      ? ` for the ${assessmentLabel} compliance assessment.`
      : " for the compliance assessment."
  }`;

  const submitLabel =
    docCount > 1
      ? `Start Audit (${docCount} Docs)`
      : "Start Audit";

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        showCloseButton={false}
        centerInViewport
        overlayClassName="bg-black/60 backdrop-blur-sm"
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[min(90vh,840px)] md:w-full md:max-w-xl md:p-0 md:-translate-x-1/2 md:-translate-y-1/2"
      >
        <div className="flex max-h-[min(90vh,840px)] w-full flex-col overflow-hidden rounded-xl border border-border/60 bg-white text-black shadow-lg">
          <DialogHeader className="shrink-0 flex-row items-center gap-1.5 border-b border-border/60 p-4 text-left">
            <DialogTitle className={cn(SECTION_HEADER_CLASS, "m-0 text-black")}>
              New Audit
            </DialogTitle>
            <TooltipProvider delayDuration={200}>
              <Tooltip open={helpOpen} onOpenChange={setHelpOpen}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-zinc-800/30"
                    aria-label="About New Audit"
                    aria-expanded={helpOpen}
                    onClick={() => setHelpOpen(true)}
                  >
                    <CircleHelp
                      className="size-3.5"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="start"
                  sideOffset={6}
                  avoidCollisions={false}
                  className="z-[80] max-w-[16rem] rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-left text-zinc-50 shadow-none"
                >
                  <p className="m-0 text-xs font-medium tracking-tight">
                    New Audit
                  </p>
                  <p className="m-0 mt-1 text-xs leading-snug text-zinc-300">
                    {helperText}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DialogDescription className="sr-only">{helperText}</DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
            {/* Audit Type */}
            <section>
              <h3 className={SECTION_LABEL}>Audit Type</h3>
              <Popover
                modal
                open={auditTypeOpen}
                onOpenChange={setAuditTypeOpen}
              >
                <PopoverTrigger asChild>
                  <FieldComboboxTrigger
                    open={auditTypeOpen}
                    onOpenChange={setAuditTypeOpen}
                  >
                    <div
                      className={PILL_AREA_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      {!selectedAuditTypeOption ? (
                        <span className={PLACEHOLDER_CLASS}>
                          Select audit type…
                        </span>
                      ) : (
                        <SelectionPill
                          label={selectedAuditTypeOption.label}
                          removeLabel={`Remove ${selectedAuditTypeOption.label}`}
                          onRemove={removeAuditType}
                        />
                      )}
                    </div>
                  </FieldComboboxTrigger>
                </PopoverTrigger>
                <PopoverContent
                  {...POPOVER_POSITION_PROPS}
                  onWheel={(event) => event.stopPropagation()}
                  onTouchMove={(event) => event.stopPropagation()}
                  className={POPOVER_CLASS}
                >
                  <Command
                    filter={frameworkFilter}
                    className={COMMAND_SHELL_CLASS}
                  >
                    <CommandInput
                      placeholder="Search audit types (SOP, BPR, FIR…)"
                      className="shrink-0 text-sm text-black placeholder:text-zinc-400"
                    />
                    <CommandList
                      className={COMMAND_LIST_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      <CommandEmpty>No audit type found.</CommandEmpty>
                      <CommandGroup>
                        {AUDIT_TYPE_OPTIONS.map((item) => {
                          const isSelected = auditType === item.value;
                          return (
                            <CommandItem
                              key={item.value}
                              value={item.label}
                              keywords={item.keywords}
                              onSelect={() => toggleAuditType(item.value)}
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
                      {auditType ? 1 : 0} selected
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className={DONE_BUTTON_CLASS}
                      onClick={() => setAuditTypeOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </section>

            {/* Framework Selection */}
            <section>
              <h3 className={SECTION_LABEL}>Framework Selection</h3>
              <Popover
                modal
                open={frameworkOpen}
                onOpenChange={handleFrameworkOpenChange}
              >
                <PopoverTrigger asChild>
                  <FieldComboboxTrigger
                    open={frameworkOpen}
                    onOpenChange={handleFrameworkOpenChange}
                    disabled={!hasAuditType}
                  >
                    <div
                      className={PILL_AREA_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      {!hasAuditType ? (
                        <span className={PLACEHOLDER_CLASS}>
                          Select an audit type first…
                        </span>
                      ) : selectedFrameworkItems.length === 0 ? (
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
                  {...POPOVER_POSITION_PROPS}
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
                      className="shrink-0 text-sm text-black placeholder:text-zinc-400"
                    />
                    <CommandList
                      className={COMMAND_LIST_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup>
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
                    disabled={!hasAuditType}
                  >
                    <div
                      className={PILL_AREA_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      {!hasAuditType ? (
                        <span className={PLACEHOLDER_CLASS}>
                          Select an audit type first…
                        </span>
                      ) : selectedClauseItems.length === 0 ? (
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
                  {...POPOVER_POSITION_PROPS}
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
                      className="shrink-0 text-sm text-black placeholder:text-zinc-400"
                    />
                    <CommandList
                      className={COMMAND_LIST_CLASS}
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
                        <CommandGroup>
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
                    <div
                      className={PILL_AREA_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      {attachedFiles.length === 0 ? (
                        <span className={PLACEHOLDER_CLASS}>
                          Drag & drop target {assessmentLabel ?? "audit"} PDFs…
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
                  {...POPOVER_POSITION_PROPS}
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
                        Upload {assessmentLabel ?? "audit"} PDF or documents…
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
                  {assessmentLabel ?? "doc"}
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

          <DialogFooter className="shrink-0 flex-col gap-3 border-t border-border/60 p-4 sm:flex-col">
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
                  !hasAuditType ||
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
