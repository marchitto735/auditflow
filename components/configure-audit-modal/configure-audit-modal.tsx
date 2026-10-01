"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
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
import { Label } from "@/components/ui/label";
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
import { AUDIT_TYPE_OPTIONS } from "@/lib/audit-workflows";
import {
  AUDIT_FRAMEWORKS,
  frameworkSearchKeywords,
  frameworkSearchValue,
  getAuditFramework,
  getClausesForFramework,
} from "@/lib/audit-frameworks";
import {
  DIALOG_BODY_CLASS,
  DIALOG_CONTENT_TALL_CLASS,
  DIALOG_DESCRIPTION_CLASS,
  DIALOG_FIELD_CLASS,
  DIALOG_FOOTER_CLASS,
  DIALOG_HEADER_CLASS,
  DIALOG_LABEL_CLASS,
  DIALOG_TITLE_CLASS,
  DROPDOWN_TRIGGER_CLASS,
  FIELD_ERROR_TEXT_CLASS,
  FIELD_INVALID_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

/** Shared field shell — same resting chrome as the upload/sync selects. */
const FIELD_SURFACE_CLASS = cn(
  DROPDOWN_TRIGGER_CLASS,
  "relative flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-neutral-900",
);

const FIELD_SURFACE_OPEN_CLASS = "border-border bg-zinc-50 shadow-sm";

/** Selected pills scroll inside the field instead of growing the trigger. */
const PILL_AREA_CLASS =
  "flex max-h-28 min-w-0 flex-1 flex-wrap content-start items-center gap-1.5 overflow-y-auto overscroll-contain py-0.5";

/** Inline selection / file pill token. */
const PILL_CLASS =
  "inline-flex h-6 max-w-full items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 py-0 pl-2 pr-0.5 text-sm font-medium leading-none text-neutral-900";

const PILL_REMOVE_CLASS =
  "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900";

const PLACEHOLDER_CLASS =
  "flex items-center py-0.5 text-sm leading-normal text-muted-foreground";

const POPOVER_CLASS =
  "z-[300] flex w-[var(--radix-popover-trigger-width)] max-h-[min(18rem,var(--radix-popover-content-available-height,18rem))] flex-col overflow-hidden rounded-lg border border-border/60 bg-white p-0 text-neutral-900 shadow-sm";

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
  "flex h-auto max-h-full min-h-0 flex-1 flex-col overflow-hidden bg-white text-neutral-900 [&_[cmdk-list]]:max-h-60 [&_[cmdk-list]]:min-h-0 [&_[cmdk-list]]:overflow-y-auto [&_[cmdk-list]]:overscroll-contain";

const COMMAND_LIST_CLASS =
  "max-h-60 min-h-0 overflow-y-auto overscroll-contain";

const COMMAND_ITEM_CLASS =
  "cursor-pointer gap-2 rounded-md text-sm text-neutral-900 data-[selected=true]:bg-zinc-100 data-[selected=true]:text-neutral-900";

const DONE_BUTTON_CLASS =
  "h-8 px-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900";

const DROPDOWN_EMPTY_CLASS =
  "px-3 py-6 text-center text-sm text-neutral-500";

type FieldErrors = {
  auditType?: string;
  frameworks?: string;
  clauses?: string;
};

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
        checked && "border-neutral-900 bg-neutral-900",
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
      className="pointer-events-none absolute right-3 top-1/2 size-4 shrink-0 -translate-y-1/2 text-neutral-900 opacity-70"
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
  /** Callers may pass a workflow from a card launch. The form ignores it and opens blank. */
  initialWorkflowId: AuditWorkflowId | null;
};

export function ConfigureAuditModal({
  open,
  onOpenChange,
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
  const [attachedFiles, setAttachedFiles] = React.useState<StagedFile[]>([]);
  const [evidenceFiles, setEvidenceFiles] = React.useState<StagedFile[]>([]);
  const [clauseQuery, setClauseQuery] = React.useState("");
  const [selectedClauses, setSelectedClauses] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [initError, setInitError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const evidenceInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const isFirAudit = auditType === "fir";
  const selectedAuditTypeOption = AUDIT_TYPE_OPTIONS.find(
    (item) => item.value === auditType,
  );

  function clearStagedFiles() {
    setDocsOpen(false);
    setAttachedFiles([]);
    setEvidenceFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (evidenceInputRef.current) evidenceInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  function resetSelections() {
    setFrameworks([]);
    setFrameworkOpen(false);
    setClauseOpen(false);
    setClauseQuery("");
    setSelectedClauses(new Set());
    clearStagedFiles();
  }

  React.useEffect(() => {
    if (!open) return;
    setAuditType(null);
    setAuditTypeOpen(false);
    resetSelections();
    setIsInitializing(false);
    setInitError(null);
    setFieldErrors({});
  }, [open]);

  function selectAuditType(value: AuditWorkflowId) {
    setAuditTypeOpen(false);
    if (value === auditType) return;
    setAuditType(value);
    setFieldErrors((prev) => ({ ...prev, auditType: undefined }));
    clearStagedFiles();
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
      if (next.length > 0) {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          frameworks: undefined,
        }));
      }
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
      if (next.size > 0) {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          clauses: undefined,
        }));
      }
      return next;
    });
  }

  function handleFrameworkOpenChange(nextOpen: boolean) {
    setFrameworkOpen(nextOpen);
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

  function addEvidenceFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files)
      .filter((file) => file.type.startsWith("image/") || /\.(png|jpe?g|webp|heic|gif)$/i.test(file.name))
      .map(createStagedFile);
    if (incoming.length === 0) return;
    setEvidenceFiles((prev) => {
      const names = new Set(prev.map((item) => item.name));
      const unique = incoming.filter((item) => !names.has(item.name));
      return [...prev, ...unique];
    });
    if (evidenceInputRef.current) evidenceInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  function removeEvidenceFile(id: string) {
    setEvidenceFiles((prev) => prev.filter((item) => item.id !== id));
    if (evidenceInputRef.current) evidenceInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  function handleEvidenceInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    addEvidenceFiles(event.target.files);
  }

  function handleEvidenceDropZoneDragOver(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleEvidenceDropZoneDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    addEvidenceFiles(event.dataTransfer.files);
  }

  function handleEvidenceBrowseClick() {
    evidenceInputRef.current?.click();
  }

  function handleOpenCameraClick() {
    cameraInputRef.current?.click();
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    if (isInitializing && !nextOpen) return;
    onOpenChange(nextOpen);
  }

  async function handleInitialize() {
    if (isInitializing) return;

    const nextErrors: FieldErrors = {};
    if (!auditType) {
      nextErrors.auditType = "Select an audit type.";
    }
    if (frameworks.length === 0) {
      nextErrors.frameworks = "Select at least one framework.";
    }
    if (selectedClauses.size === 0) {
      nextErrors.clauses = "Select at least one clause.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setInitError(null);
      return;
    }

    const selectedAuditType = auditType;
    if (!selectedAuditType) return;

    setFieldErrors({});
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
      params.set("workflow", selectedAuditType);
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

  const assessmentLabel = selectedAuditTypeOption?.label ?? "document";
  const helperText = selectedAuditTypeOption
    ? `Choose audit type, framework(s), select clauses, and link target documentation for the ${selectedAuditTypeOption.label} compliance assessment.`
    : "Choose audit type, framework(s), select clauses, and link target documentation for the compliance assessment.";

  const submitLabel =
    docCount > 1
      ? `Start audit (${docCount} docs)`
      : "Start audit";

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        showCloseButton
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={DIALOG_CONTENT_TALL_CLASS}
      >
        <DialogHeader className={DIALOG_HEADER_CLASS}>
          <DialogTitle className={DIALOG_TITLE_CLASS}>
            New audit
          </DialogTitle>
          <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
            {helperText}
          </DialogDescription>
        </DialogHeader>

        <div className={cn(DIALOG_BODY_CLASS, "min-h-0 flex-1 overflow-y-auto")}>
            <div className={DIALOG_FIELD_CLASS}>
              <Label className={DIALOG_LABEL_CLASS}>Audit type</Label>
              <Popover
                modal
                open={auditTypeOpen}
                onOpenChange={setAuditTypeOpen}
              >
                <PopoverTrigger asChild>
                  <FieldComboboxTrigger
                    open={auditTypeOpen}
                    onOpenChange={setAuditTypeOpen}
                    aria-invalid={Boolean(fieldErrors.auditType)}
                    aria-describedby={
                      fieldErrors.auditType
                        ? "audit-type-error"
                        : undefined
                    }
                    className={
                      fieldErrors.auditType ? FIELD_INVALID_CLASS : undefined
                    }
                  >
                    <div
                      className={PILL_AREA_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      {selectedAuditTypeOption ? (
                        <span className="min-w-0 flex-1 truncate text-sm text-neutral-900">
                          {selectedAuditTypeOption.label}
                        </span>
                      ) : (
                        <span className={PLACEHOLDER_CLASS}>
                          Select audit type…
                        </span>
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
                      className="shrink-0 text-sm text-neutral-900 placeholder:text-neutral-400"
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
                              onSelect={() => selectAuditType(item.value)}
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
                    <span className="text-sm text-neutral-600">
                      {auditType ? "1 selected" : "0 selected"}
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
              {fieldErrors.auditType ? (
                <p
                  id="audit-type-error"
                  className={FIELD_ERROR_TEXT_CLASS}
                  role="alert"
                >
                  {fieldErrors.auditType}
                </p>
              ) : null}
            </div>

            <div className={DIALOG_FIELD_CLASS}>
              <Label className={DIALOG_LABEL_CLASS}>Framework selection</Label>
              <Popover
                modal
                open={frameworkOpen}
                onOpenChange={handleFrameworkOpenChange}
              >
                <PopoverTrigger asChild>
                  <FieldComboboxTrigger
                    open={frameworkOpen}
                    onOpenChange={handleFrameworkOpenChange}
                    aria-invalid={Boolean(fieldErrors.frameworks)}
                    aria-describedby={
                      fieldErrors.frameworks
                        ? "framework-selection-error"
                        : undefined
                    }
                    className={
                      fieldErrors.frameworks ? FIELD_INVALID_CLASS : undefined
                    }
                  >
                    <div
                      className={PILL_AREA_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
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
                      className="shrink-0 text-sm text-neutral-900 placeholder:text-neutral-400"
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
                    <span className="text-sm text-neutral-600">
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
              {fieldErrors.frameworks ? (
                <p
                  id="framework-selection-error"
                  className={FIELD_ERROR_TEXT_CLASS}
                  role="alert"
                >
                  {fieldErrors.frameworks}
                </p>
              ) : null}
            </div>

            <div className={DIALOG_FIELD_CLASS}>
              <Label className={DIALOG_LABEL_CLASS}>Clause selection</Label>
              <Popover
                modal
                open={clauseOpen}
                onOpenChange={handleClauseOpenChange}
              >
                <PopoverTrigger asChild>
                  <FieldComboboxTrigger
                    open={clauseOpen}
                    onOpenChange={handleClauseOpenChange}
                    aria-invalid={Boolean(fieldErrors.clauses)}
                    aria-describedby={
                      fieldErrors.clauses
                        ? "clause-selection-error"
                        : undefined
                    }
                    className={
                      fieldErrors.clauses ? FIELD_INVALID_CLASS : undefined
                    }
                  >
                    <div
                      className={PILL_AREA_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
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
                      className="shrink-0 text-sm text-neutral-900 placeholder:text-neutral-400"
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
                    <span className="text-sm text-neutral-600">
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
              {fieldErrors.clauses ? (
                <p
                  id="clause-selection-error"
                  className={FIELD_ERROR_TEXT_CLASS}
                  role="alert"
                >
                  {fieldErrors.clauses}
                </p>
              ) : null}
            </div>

            <div className={DIALOG_FIELD_CLASS}>
              <Label className={DIALOG_LABEL_CLASS}>Target documentation</Label>
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
                  {...POPOVER_POSITION_PROPS}
                  className={POPOVER_CLASS}
                >
                  <div className="p-2">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-50"
                      onClick={handleBrowseClick}
                    >
                      <Upload className="size-4 shrink-0 text-neutral-500" aria-hidden />
                      <span className="min-w-0 flex-1">
                        Upload {assessmentLabel} PDF or documents…
                      </span>
                    </button>
                    <p className="m-0 px-3 pb-2 pt-1 text-sm text-neutral-500">
                      Or drag files onto the field above. Multiple files
                      supported.
                    </p>
                  </div>
                  <div className={DROPDOWN_FOOTER_CLASS}>
                    <span className="text-sm text-neutral-600">
                      {docCount} selected
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 px-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900"
                      onClick={() => setDocsOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {isFirAudit ? (
              <div className={DIALOG_FIELD_CLASS}>
                <Label className={DIALOG_LABEL_CLASS}>Field evidence and scans</Label>
                <p className="m-0 text-sm text-muted-foreground">
                  Capture or upload equipment photos, asset tags, and physical
                  inspection logs.
                </p>
                <input
                  ref={evidenceInputRef}
                  type="file"
                  multiple
                  accept="image/*,.heic,.HEIC"
                  className="sr-only"
                  onChange={handleEvidenceInputChange}
                  aria-hidden
                  tabIndex={-1}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={handleEvidenceInputChange}
                  aria-hidden
                  tabIndex={-1}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload field evidence images"
                    onClick={handleEvidenceBrowseClick}
                    onDragOver={handleEvidenceDropZoneDragOver}
                    onDrop={handleEvidenceDropZoneDrop}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleEvidenceBrowseClick();
                      }
                    }}
                    className={cn(
                      FIELD_SURFACE_CLASS,
                      "min-h-[5.5rem] flex-1 flex-col items-start justify-center gap-1 border-dashed",
                    )}
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-black">
                      <Upload
                        className="size-4 shrink-0 text-zinc-500"
                        aria-hidden
                      />
                      Drop images or scans here
                    </span>
                    <span className="text-sm text-muted-foreground">
                      PNG, JPG, WEBP, or HEIC — multiple files supported
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto min-h-14 shrink-0 gap-2 rounded-lg border-border/60 px-4 py-3 text-sm font-medium text-black sm:w-52"
                    onClick={handleOpenCameraClick}
                  >
                    <Camera className="size-4 shrink-0" aria-hidden />
                    <span className="text-balance text-left leading-snug">
                      Open Camera / Scan Asset
                    </span>
                  </Button>
                </div>
                {evidenceFiles.length > 0 ? (
                  <div
                    className={cn(PILL_AREA_CLASS, "mt-3 max-h-32")}
                    onWheel={(event) => event.stopPropagation()}
                  >
                    {evidenceFiles.map((item) => {
                      const size = formatFileSize(item.sizeBytes);
                      return (
                        <SelectionPill
                          key={item.id}
                          label={size ? `${item.name} · ${size}` : item.name}
                          removeLabel={`Remove ${item.name}`}
                          onRemove={() => removeEvidenceFile(item.id)}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}

            {isBatchMode ? (
              <section className="rounded-lg border border-border/60 bg-zinc-50 px-4 py-3">
                <h3 className="m-0 text-sm font-medium text-neutral-900">
                  Batch mapping summary
                </h3>
                <p className="m-0 mt-1 text-sm text-neutral-600">
                  {frameworks.length} framework
                  {frameworks.length === 1 ? "" : "s"} × {docCount}{" "}
                  {assessmentLabel}
                  {docCount === 1 ? "" : "s"} →{" "}
                  {frameworks.length * Math.max(docCount, 1)} analysis path
                  {frameworks.length * Math.max(docCount, 1) === 1 ? "" : "s"}
                </p>
                <ul className="m-0 mt-2 space-y-1 p-0 text-sm text-neutral-700">
                  {selectedFrameworkItems.map((item) => (
                    <li key={item.value} className="flex gap-2">
                      <span className="shrink-0 text-neutral-400">•</span>
                      <span className="min-w-0">
                        <span className="font-medium text-neutral-900">
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

          {initError ? (
            <p
              className="m-0 shrink-0 px-4 pt-3 text-sm text-neutral-900"
              role="alert"
            >
              {initError}
            </p>
          ) : null}
          <DialogFooter className={DIALOG_FOOTER_CLASS}>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
              disabled={isInitializing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="black"
              onClick={() => {
                void handleInitialize();
              }}
              disabled={isInitializing}
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
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
