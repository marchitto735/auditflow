"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type ComponentProps,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  Check,
  ChevronDown,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { MetricCard } from "@/components/dashboard/kpi-cards";
import {
  CardActionsMenu,
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
  DASHBOARD_MENU_ITEM_SELECTED_CLASS,
  TABLE_CARD_MENU_ACTIONS,
} from "@/components/dashboard/card-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePaginationBar,
  TableRow,
} from "@/components/ui/table";
import { TableRowActionsMenu } from "@/components/ui/table-row-actions";
import {
  CARD_SECTION_EYEBROW_CLASS,
  DIALOG_BODY_CLASS,
  DIALOG_CONTENT_CLASS,
  DIALOG_DESCRIPTION_CLASS,
  DIALOG_FIELD_CLASS,
  DIALOG_FOOTER_CLASS,
  DIALOG_HEADER_CLASS,
  DIALOG_LABEL_CLASS,
  DIALOG_TITLE_CLASS,
  DROPDOWN_TRIGGER_CLASS,
  FIELD_ERROR_TEXT_CLASS,
  FIELD_INVALID_CLASS,
  OVERLINE_LABEL_CLASS,
  PAGE_HEADER_PRIMARY_BUTTON_CLASS,
  SECTION_DESCRIPTION_CLASS,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_GAP_CLASS,
  DASHBOARD_TRIPLE_CARD_GRID_CLASS,
  TABLE_CARD_HEADER_CLASS,
  TABLE_ROW_ACTIONS_CELL_CLASS,
  TABLE_ROW_ACTIONS_HEAD_CLASS,
  TABLE_STICKY_HEADER_CLASS,
  TABLE_TOOLBAR_FILTERS_CLASS,
  TABLE_TOOLBAR_FILTER_TRIGGER_CLASS,
  TABLE_TOOLBAR_ROW_CLASS,
  TABLE_TOOLBAR_SEARCH_ICON_CLASS,
  TABLE_TOOLBAR_SEARCH_INPUT_CLASS,
  TABLE_TOOLBAR_SEARCH_WRAP_CLASS,
} from "@/lib/page-layout";
import {
  POLICY_DOC_TYPES,
  POLICY_STATUSES,
  computePolicyKpis,
  filterMasterPolicies,
  formatPolicyTimestamp,
  uniquePolicyVersions,
  type MasterPolicy,
  type PolicyDocType,
  type PolicyFilters,
  type PolicyStatus,
} from "@/lib/policies";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/section-header/section-header";

const DEFAULT_PAGE_SIZE = 3;
const TABLE_MIN_WIDTH_CLASS = "min-w-[56rem]";

const INITIAL_FILTERS: PolicyFilters = {
  search: "",
  type: "all",
  status: "all",
  version: "all",
};

/** Matches New audit “Audit type” option richness for searchable combobox. */
const DOCUMENT_TYPE_OPTIONS: {
  value: PolicyDocType;
  label: string;
  keywords: string[];
}[] = [
  {
    value: "SOP",
    label: "Standard operating procedure (SOP)",
    keywords: ["sop", "standard", "operating", "procedure"],
  },
  {
    value: "BPR",
    label: "Batch production record (BPR)",
    keywords: ["bpr", "batch", "production", "record"],
  },
  {
    value: "FIR",
    label: "Facility inspection report (FIR)",
    keywords: ["fir", "facility", "inspection", "report"],
  },
];

/** Searchable policy title catalog — same combobox pattern as Document type. */
const POLICY_TITLE_OPTIONS: {
  value: string;
  label: string;
  keywords: string[];
}[] = [
  {
    value: "Document control & change management",
    label: "Document control & change management",
    keywords: ["document", "control", "change", "management", "sop"],
  },
  {
    value: "Batch record review procedure",
    label: "Batch record review procedure",
    keywords: ["batch", "record", "review", "bpr"],
  },
  {
    value: "Facility hygiene inspection checklist",
    label: "Facility hygiene inspection checklist",
    keywords: ["facility", "hygiene", "inspection", "fir"],
  },
  {
    value: "Electronic signature authority matrix",
    label: "Electronic signature authority matrix",
    keywords: ["electronic", "signature", "authority", "part 11"],
  },
  {
    value: "Raw material release criteria",
    label: "Raw material release criteria",
    keywords: ["raw", "material", "release"],
  },
  {
    value: "Cleanroom gowning & access control",
    label: "Cleanroom gowning & access control",
    keywords: ["cleanroom", "gowning", "access"],
  },
  {
    value: "Complaint handling & CAPA intake",
    label: "Complaint handling & CAPA intake",
    keywords: ["complaint", "capa", "intake"],
  },
  {
    value: "Packaging line clearance protocol",
    label: "Packaging line clearance protocol",
    keywords: ["packaging", "line", "clearance"],
  },
  {
    value: "Environmental monitoring rounds",
    label: "Environmental monitoring rounds",
    keywords: ["environmental", "monitoring"],
  },
  {
    value: "Training records & competency",
    label: "Training records & competency",
    keywords: ["training", "records", "competency"],
  },
  {
    value: "Equipment qualification summary",
    label: "Equipment qualification summary",
    keywords: ["equipment", "qualification"],
  },
  {
    value: "Warehouse pest control log",
    label: "Warehouse pest control log",
    keywords: ["warehouse", "pest", "control"],
  },
];

const FIELD_SURFACE_CLASS = cn(
  DROPDOWN_TRIGGER_CLASS,
  "relative flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-neutral-900",
);

const FIELD_SURFACE_OPEN_CLASS = "border-border bg-zinc-50 shadow-sm";

/** Selected pills scroll inside the field — same token as New audit. */
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

const POPOVER_POSITION_PROPS = {
  side: "bottom" as const,
  align: "start" as const,
  sideOffset: 6,
  avoidCollisions: false,
};

const DROPDOWN_FOOTER_CLASS =
  "flex shrink-0 items-center justify-between border-t border-border/60 bg-white px-3 py-2";

const COMMAND_SHELL_CLASS =
  "flex h-auto max-h-full min-h-0 flex-1 flex-col overflow-hidden bg-white text-neutral-900 [&_[cmdk-list]]:max-h-60 [&_[cmdk-list]]:min-h-0 [&_[cmdk-list]]:overflow-y-auto [&_[cmdk-list]]:overscroll-contain";

const COMMAND_LIST_CLASS =
  "max-h-60 min-h-0 overflow-y-auto overscroll-contain";

const COMMAND_ITEM_CLASS =
  "cursor-pointer gap-2 rounded-md text-sm text-neutral-900 data-[selected=true]:bg-zinc-100 data-[selected=true]:text-neutral-900";

const DONE_BUTTON_CLASS =
  "h-8 px-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900";

function comboboxFilter(
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

function ComboboxCheck({ checked }: { checked: boolean }) {
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

type StagedFile = {
  id: string;
  name: string;
  sizeBytes: number | null;
  file: File | null;
};

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

/** Non-button combobox shell — identical to New audit “Audit type”. */
function FieldComboboxTrigger({
  open,
  onOpenChange,
  className,
  children,
  onKeyDown,
  ...props
}: ComponentProps<"div"> & {
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

function statusBadgeVariant(status: PolicyStatus) {
  switch (status) {
    case "Active":
    case "Ready":
      return "success" as const;
    case "Pending":
      return "warning" as const;
    case "Draft":
    default:
      return "outline" as const;
  }
}

function runningCount(
  policies: MasterPolicy[],
  match: (policy: MasterPolicy) => boolean,
): number[] {
  const sorted = [...policies].sort(
    (a, b) => Date.parse(a.lastParsedAt) - Date.parse(b.lastParsedAt),
  );
  let count = 0;
  const series = sorted.map((policy) => {
    if (match(policy)) count += 1;
    return count;
  });
  return series.length > 0 ? series : [0];
}

function PoliciesKpiHeader({ policies }: { policies: MasterPolicy[] }) {
  const kpis = useMemo(() => computePolicyKpis(policies), [policies]);
  const cards = useMemo(
    () => [
      {
        title: "Total documents",
        value: String(kpis.totalDocuments),
        description:
          kpis.failedCount > 0
            ? `${kpis.syncedCount} synced · ${kpis.failedCount} failed`
            : "SOP · BPR · FIR library",
        code: "ALL",
        trend: runningCount(policies, () => true),
        status: "Synced",
      },
      {
        title: "Active / Ready",
        value: `${kpis.activeCount} / ${kpis.readyCount}`,
        description: `${kpis.activeCount + kpis.readyCount} production-ready`,
        code: "RDY",
        trend: runningCount(
          policies,
          (policy) => policy.status === "Active" || policy.status === "Ready",
        ),
        status: "Verified",
      },
      {
        title: "Pending reviews",
        value: String(kpis.pendingCount),
        description:
          kpis.draftCount > 0
            ? `${kpis.draftCount} still in draft`
            : "Awaiting sign-off",
        code: "REV",
        trend: runningCount(policies, (policy) => policy.status === "Pending"),
        status: kpis.pendingCount > 0 ? "Pending" : "Verified",
      },
    ],
    [kpis, policies],
  );

  return (
    <div className={DASHBOARD_TRIPLE_CARD_GRID_CLASS}>
      {cards.map((card) => (
        <MetricCard
          key={card.title}
          title={card.title}
          value={card.value}
          description={card.description}
          trend={card.trend}
          code={card.code}
          status={card.status}
        />
      ))}
    </div>
  );
}

function n8nBadgeVariant(status: MasterPolicy["n8nStatus"]) {
  switch (status) {
    case "Synced":
      return "success" as const;
    case "Queued":
      return "warning" as const;
    case "Failed":
      return "destructive" as const;
    case "Idle":
    default:
      return "outline" as const;
  }
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  menusMounted,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  menusMounted: boolean;
  onChange: (value: T) => void;
}) {
  const selected =
    options.find((option) => option.value === value)?.label ?? label;
  const triggerRef = useRef<HTMLButtonElement>(null);

  function releaseTriggerFocus() {
    triggerRef.current?.blur();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      aria-label={label}
      className={cn(TABLE_TOOLBAR_FILTER_TRIGGER_CLASS, "min-w-[8rem]")}
    >
      <span className="truncate">{selected}</span>
      <ChevronDown className="size-4 shrink-0" aria-hidden />
    </button>
  );

  if (!menusMounted) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={cn(DASHBOARD_MENU_CONTENT_CLASS, "min-w-[11rem]")}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          releaseTriggerFocus();
        }}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <DropdownMenuItem
              key={option.value}
              className={cn(
                DASHBOARD_MENU_ITEM_CLASS,
                isSelected && DASHBOARD_MENU_ITEM_SELECTED_CLASS,
              )}
              onSelect={() => {
                releaseTriggerFocus();
                onChange(option.value);
              }}
            >
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UploadPolicyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [type, setType] = useState<PolicyDocType | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);
  const [title, setTitle] = useState<string | null>(null);
  const [titleOpen, setTitleOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<StagedFile[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{
    type?: string;
    title?: string;
    file?: string;
  }>({});
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedTypeOption = DOCUMENT_TYPE_OPTIONS.find(
    (item) => item.value === type,
  );
  const selectedTitleOption = POLICY_TITLE_OPTIONS.find(
    (item) => item.value === title,
  );
  const docCount = attachedFiles.length;

  function reset() {
    setType(null);
    setTypeOpen(false);
    setTitle(null);
    setTitleOpen(false);
    setDocsOpen(false);
    setAttachedFiles([]);
    setFieldErrors({});
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function selectDocumentType(value: PolicyDocType) {
    setType(value);
    setTypeOpen(false);
    setFieldErrors((prev) => ({ ...prev, type: undefined }));
  }

  function selectPolicyTitle(value: string) {
    setTitle(value);
    setTitleOpen(false);
    setFieldErrors((prev) => ({ ...prev, title: undefined }));
  }

  function addFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files).map(createStagedFile);
    setAttachedFiles((prev) => {
      const names = new Set(prev.map((item) => item.name));
      const unique = incoming.filter((item) => !names.has(item.name));
      return [...prev, ...unique];
    });
    if (fileRef.current) fileRef.current.value = "";
    setDocsOpen(false);
    setFieldErrors((prev) => ({ ...prev, file: undefined }));
  }

  function removeFile(id: string) {
    setAttachedFiles((prev) => prev.filter((item) => item.id !== id));
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleBrowseClick() {
    fileRef.current?.click();
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files);
  }

  function handleDropZoneDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDropZoneDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    addFiles(event.dataTransfer.files);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;

    const nextErrors: { type?: string; title?: string; file?: string } = {};
    if (!type) {
      nextErrors.type = "Select a document type.";
    }
    if (!title) {
      nextErrors.title = "Select a policy title.";
    }
    if (attachedFiles.length === 0) {
      nextErrors.file = "Upload at least one master document.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      toast.success(
        docCount > 1
          ? `Registered ${type} policy “${title}” with ${docCount} files.`
          : `Registered ${type} policy “${title}”.`,
      );
      handleOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={DIALOG_CONTENT_CLASS} showCloseButton>
        <form onSubmit={handleSubmit}>
          <DialogHeader className={DIALOG_HEADER_CLASS}>
            <DialogTitle className={DIALOG_TITLE_CLASS}>
              New policy
            </DialogTitle>
            <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
              Register a new policy for n8n parsing and clause extraction.
            </DialogDescription>
          </DialogHeader>
          <div className={DIALOG_BODY_CLASS}>
            <div className={DIALOG_FIELD_CLASS}>
              <Label className={DIALOG_LABEL_CLASS}>Document type</Label>
              <Popover modal open={typeOpen} onOpenChange={setTypeOpen}>
                <PopoverTrigger asChild>
                  <FieldComboboxTrigger
                    open={typeOpen}
                    onOpenChange={setTypeOpen}
                    aria-invalid={Boolean(fieldErrors.type)}
                    aria-describedby={
                      fieldErrors.type ? "policy-type-error" : undefined
                    }
                    className={
                      fieldErrors.type ? FIELD_INVALID_CLASS : undefined
                    }
                  >
                    <div
                      className={PILL_AREA_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      {selectedTypeOption ? (
                        <span className="min-w-0 flex-1 truncate text-sm text-neutral-900">
                          {selectedTypeOption.label}
                        </span>
                      ) : (
                        <span className={PLACEHOLDER_CLASS}>
                          Select document type…
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
                    filter={comboboxFilter}
                    className={COMMAND_SHELL_CLASS}
                  >
                    <CommandInput
                      placeholder="Search document types (SOP, BPR, FIR…)"
                      className="shrink-0 text-sm text-neutral-900 placeholder:text-neutral-400"
                    />
                    <CommandList
                      className={COMMAND_LIST_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      <CommandEmpty>No document type found.</CommandEmpty>
                      <CommandGroup>
                        {DOCUMENT_TYPE_OPTIONS.map((item) => {
                          const isSelected = type === item.value;
                          return (
                            <CommandItem
                              key={item.value}
                              value={item.label}
                              keywords={item.keywords}
                              onSelect={() => selectDocumentType(item.value)}
                              className={cn(
                                COMMAND_ITEM_CLASS,
                                isSelected && "bg-zinc-100",
                              )}
                            >
                              <ComboboxCheck checked={isSelected} />
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
                      {type ? "1 selected" : "0 selected"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className={DONE_BUTTON_CLASS}
                      onClick={() => setTypeOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              {fieldErrors.type ? (
                <p
                  id="policy-type-error"
                  className={FIELD_ERROR_TEXT_CLASS}
                  role="alert"
                >
                  {fieldErrors.type}
                </p>
              ) : null}
            </div>
            <div className={DIALOG_FIELD_CLASS}>
              <Label className={DIALOG_LABEL_CLASS}>Policy title</Label>
              <Popover modal open={titleOpen} onOpenChange={setTitleOpen}>
                <PopoverTrigger asChild>
                  <FieldComboboxTrigger
                    open={titleOpen}
                    onOpenChange={setTitleOpen}
                    aria-invalid={Boolean(fieldErrors.title)}
                    aria-describedby={
                      fieldErrors.title ? "policy-title-error" : undefined
                    }
                    className={
                      fieldErrors.title ? FIELD_INVALID_CLASS : undefined
                    }
                  >
                    <div
                      className={PILL_AREA_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      {selectedTitleOption ? (
                        <span className="min-w-0 flex-1 truncate text-sm text-neutral-900">
                          {selectedTitleOption.label}
                        </span>
                      ) : (
                        <span className={PLACEHOLDER_CLASS}>
                          Select policy title…
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
                    filter={comboboxFilter}
                    className={COMMAND_SHELL_CLASS}
                  >
                    <CommandInput
                      placeholder="Search policy titles…"
                      className="shrink-0 text-sm text-neutral-900 placeholder:text-neutral-400"
                    />
                    <CommandList
                      className={COMMAND_LIST_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      <CommandEmpty>No policy title found.</CommandEmpty>
                      <CommandGroup>
                        {POLICY_TITLE_OPTIONS.map((item) => {
                          const isSelected = title === item.value;
                          return (
                            <CommandItem
                              key={item.value}
                              value={item.label}
                              keywords={item.keywords}
                              onSelect={() => selectPolicyTitle(item.value)}
                              className={cn(
                                COMMAND_ITEM_CLASS,
                                isSelected && "bg-zinc-100",
                              )}
                            >
                              <ComboboxCheck checked={isSelected} />
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
                      {title ? "1 selected" : "0 selected"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className={DONE_BUTTON_CLASS}
                      onClick={() => setTitleOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              {fieldErrors.title ? (
                <p
                  id="policy-title-error"
                  className={FIELD_ERROR_TEXT_CLASS}
                  role="alert"
                >
                  {fieldErrors.title}
                </p>
              ) : null}
            </div>
            <div className={DIALOG_FIELD_CLASS}>
              <Label className={DIALOG_LABEL_CLASS}>Master document</Label>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                    aria-invalid={Boolean(fieldErrors.file)}
                    aria-describedby={
                      fieldErrors.file ? "policy-file-error" : undefined
                    }
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
                      fieldErrors.file && FIELD_INVALID_CLASS,
                    )}
                  >
                    <div
                      className={PILL_AREA_CLASS}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      {attachedFiles.length === 0 ? (
                        <span className={PLACEHOLDER_CLASS}>
                          Drag & drop master document PDFs…
                        </span>
                      ) : (
                        attachedFiles.map((item) => {
                          const size = formatFileSize(item.sizeBytes);
                          return (
                            <SelectionPill
                              key={item.id}
                              label={
                                size ? `${item.name} · ${size}` : item.name
                              }
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
                      <Upload
                        className="size-4 shrink-0 text-neutral-500"
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        Upload master document PDF or documents…
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
                      className={DONE_BUTTON_CLASS}
                      onClick={() => setDocsOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              {fieldErrors.file ? (
                <p
                  id="policy-file-error"
                  className={FIELD_ERROR_TEXT_CLASS}
                  role="alert"
                >
                  {fieldErrors.file}
                </p>
              ) : null}
            </div>
          </div>
          <DialogFooter className={DIALOG_FOOTER_CLASS}>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="black" disabled={pending}>
              {pending ? "Creating…" : "Create policy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PolicyRowActions({
  policy,
  menusMounted,
  onView,
}: {
  policy: MasterPolicy;
  menusMounted: boolean;
  onView: (policy: MasterPolicy) => void;
}) {
  return (
    <TableRowActionsMenu
      label={`Actions for ${policy.title}`}
      menusMounted={menusMounted}
    >
      <DropdownMenuItem
        className={DASHBOARD_MENU_ITEM_CLASS}
        onSelect={() => onView(policy)}
      >
        View policy
      </DropdownMenuItem>
      <DropdownMenuItem
        className={DASHBOARD_MENU_ITEM_CLASS}
        onSelect={() => {
          toast.message("Edit metadata", {
            description: policy.documentId,
          });
        }}
      >
        Edit metadata
      </DropdownMenuItem>
      <DropdownMenuItem
        className={DASHBOARD_MENU_ITEM_CLASS}
        onSelect={() => {
          toast.success("Re-parse queued", {
            description: policy.documentId,
          });
        }}
      >
        Re-parse document
      </DropdownMenuItem>
      <DropdownMenuItem
        className={DASHBOARD_MENU_ITEM_CLASS}
        onSelect={() => {
          toast.success("Download started", {
            description: policy.title,
          });
        }}
      >
        Download
      </DropdownMenuItem>
    </TableRowActionsMenu>
  );
}

function PolicyInspectSheet({
  policy,
  open,
  onOpenChange,
}: {
  policy: MasterPolicy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-neutral-200 bg-white p-0 sm:max-w-lg"
      >
        <SheetHeader className="shrink-0 border-b border-neutral-200 px-4 py-4 text-left">
          <SheetTitle className="m-0 text-base font-medium text-neutral-900">
            {policy?.title ?? "Policy inspect"}
          </SheetTitle>
          <SheetDescription className="m-0 mt-1 font-mono text-xs text-neutral-500">
            {policy
              ? `${policy.documentId} · v${policy.version}`
              : "Select a policy row to inspect clauses."}
          </SheetDescription>
        </SheetHeader>

        {policy ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="m-0 text-xs text-neutral-500">Ingestion</p>
                <div className="mt-1.5">
                  <Badge variant={n8nBadgeVariant(policy.n8nStatus)}>
                    {policy.n8nStatus}
                  </Badge>
                </div>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="m-0 text-xs text-neutral-500">Chunks</p>
                <p className="m-0 mt-1 font-mono text-sm font-medium text-neutral-900">
                  {policy.chunkCount}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="m-0 text-xs text-neutral-500">Last parsed</p>
                <p className="m-0 mt-1 font-mono text-xs text-neutral-900">
                  {formatPolicyTimestamp(policy.lastParsedAt)}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="m-0 text-xs text-neutral-500">Verified clauses</p>
                <p className="m-0 mt-1 text-sm font-medium text-neutral-900">
                  {policy.clauses.filter((clause) => clause.verified).length}/
                  {policy.clauses.length}
                </p>
              </div>
            </div>

            <div>
              <p className={cn(OVERLINE_LABEL_CLASS, "mb-2")}>
                Frameworks
              </p>
              <div className="flex flex-wrap gap-1.5">
                {policy.frameworks.map((framework) => (
                  <Badge key={framework} variant="outline">
                    {framework}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className={cn(OVERLINE_LABEL_CLASS, "mb-2")}>
                Parsed clauses
              </p>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {policy.clauses.map((clause) => (
                  <li
                    key={clause.id}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="m-0 text-sm font-medium text-neutral-900">
                        {clause.title}
                      </p>
                      {clause.verified ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-neutral-700">
                          <ShieldCheck className="size-3.5" aria-hidden />
                          Verified
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs text-neutral-500">
                          Review
                        </span>
                      )}
                    </div>
                    <p className="m-0 mt-1 text-sm leading-snug text-neutral-600">
                      {clause.excerpt}
                    </p>
                    <p className="m-0 mt-2 font-mono text-xs text-neutral-500">
                      Confidence {clause.confidence}%
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export default function PoliciesTableCard({
  policies,
  className,
}: {
  policies: MasterPolicy[];
  className?: string;
}) {
  const [filters, setFilters] = useState<PolicyFilters>(INITIAL_FILTERS);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [menusMounted, setMenusMounted] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selected, setSelected] = useState<MasterPolicy | null>(null);

  useEffect(() => {
    setMenusMounted(true);
  }, []);

  const versions = useMemo(() => uniquePolicyVersions(policies), [policies]);

  const filtered = useMemo(
    () => filterMasterPolicies(policies, filters),
    [policies, filters],
  );

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  function patchFilters(partial: Partial<PolicyFilters>) {
    setFilters((current) => ({ ...current, ...partial }));
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value));
    setPage(1);
  }

  const typeOptions = [
    { value: "all" as const, label: "All types" },
    ...POLICY_DOC_TYPES.map((type) => ({ value: type, label: type })),
  ];
  const statusOptions = [
    { value: "all" as const, label: "All status" },
    ...POLICY_STATUSES.map((status) => ({ value: status, label: status })),
  ];
  const versionOptions = [
    { value: "all" as const, label: "All versions" },
    ...versions.map((version) => ({ value: version, label: `v${version}` })),
  ];

  return (
    <>
      <SectionHeader
        title="Policies"
        description="Master document library with parse status, chunk counts, and framework coverage."
        actions={
          <Button
            type="button"
            variant="black"
            className={PAGE_HEADER_PRIMARY_BUTTON_CLASS}
            onClick={() => setUploadOpen(true)}
          >
            New policy
          </Button>
        }
      />
      <div className={cn("flex w-full flex-col", DASHBOARD_GAP_CLASS, className)}>
        <PoliciesKpiHeader policies={policies} />

        <Card
          className={cn(
            "flex shrink-0 flex-col overflow-hidden",
            DASHBOARD_CARD_CLASS,
          )}
        >
        <CardContent className="flex flex-col p-0">
          <div className={TABLE_CARD_HEADER_CLASS}>
            <div className="min-w-0 pr-10">
              <p className={CARD_SECTION_EYEBROW_CLASS}>Master policy library</p>
              <p className={SECTION_DESCRIPTION_CLASS}>
                Controlled SOP, BPR, and FIR documents with parse status and
                framework coverage.
              </p>
            </div>
            <div className="absolute top-3 right-3">
              <CardActionsMenu
                label="Master policy library"
                actions={TABLE_CARD_MENU_ACTIONS}
              />
            </div>

            <div
              className={TABLE_TOOLBAR_ROW_CLASS}
              role="search"
              aria-label="Search and filter policies"
            >
              <div className={TABLE_TOOLBAR_SEARCH_WRAP_CLASS}>
                <Search
                  className={TABLE_TOOLBAR_SEARCH_ICON_CLASS}
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder="Search title, document ID, or type"
                  value={filters.search}
                  onChange={(event) =>
                    patchFilters({ search: event.target.value })
                  }
                  className={TABLE_TOOLBAR_SEARCH_INPUT_CLASS}
                />
              </div>
              <div className={TABLE_TOOLBAR_FILTERS_CLASS}>
                <FilterSelect
                  label="Type"
                  value={filters.type}
                  options={typeOptions}
                  menusMounted={menusMounted}
                  onChange={(type) => patchFilters({ type })}
                />
                <FilterSelect
                  label="Status"
                  value={filters.status}
                  options={statusOptions}
                  menusMounted={menusMounted}
                  onChange={(status) => patchFilters({ status })}
                />
                <FilterSelect
                  label="Version"
                  value={filters.version}
                  options={versionOptions}
                  menusMounted={menusMounted}
                  onChange={(version) => patchFilters({ version })}
                />
              </div>
            </div>
          </div>

          {totalCount === 0 ? (
            <p className="text-body1 m-0 px-4 py-4 text-muted-foreground">
              No policies match the current search and filters.
            </p>
          ) : (
            <div className="flex shrink-0 flex-col" style={{ overflowAnchor: "none" }}>
              <Table
                className={TABLE_MIN_WIDTH_CLASS}
                containerClassName="overflow-x-auto"
              >
                <TableHeader className={TABLE_STICKY_HEADER_CLASS}>
                  <TableRow>
                    <TableHead className="w-[20%]">Title</TableHead>
                    <TableHead className="w-[12%]">Document ID</TableHead>
                    <TableHead className="w-[8%]">Type</TableHead>
                    <TableHead className="w-[8%]">Version</TableHead>
                    <TableHead className="w-[12%]">Last parsed</TableHead>
                    <TableHead className="w-[8%]">Chunks</TableHead>
                    <TableHead className="w-[12%]">Frameworks</TableHead>
                    <TableHead className="w-[12%]">Status</TableHead>
                    <TableHead className={TABLE_ROW_ACTIONS_HEAD_CLASS}>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((policy) => (
                    <TableRow
                      key={policy.id}
                      className="cursor-pointer bg-white"
                      onClick={() => setSelected(policy)}
                    >
                      <TableCell>
                        <span className="block truncate">
                          {policy.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="block truncate font-mono">
                          {policy.documentId}
                        </span>
                      </TableCell>
                      <TableCell>{policy.type}</TableCell>
                      <TableCell className="font-mono">
                        v{policy.version}
                      </TableCell>
                      <TableCell className="font-mono tabular-nums">
                        {formatPolicyTimestamp(policy.lastParsedAt)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {policy.chunkCount}
                      </TableCell>
                      <TableCell>
                        <span className="block truncate">
                          {policy.frameworks.join(" · ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(policy.status)}>
                          {policy.status}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={TABLE_ROW_ACTIONS_CELL_CLASS}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <PolicyRowActions
                          policy={policy}
                          menusMounted={menusMounted}
                          onView={setSelected}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <TablePaginationBar
                className={TABLE_MIN_WIDTH_CLASS}
                pageRowsCount={pageRows.length}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                paginationLabel="Policies pagination"
              />
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      <UploadPolicyDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <PolicyInspectSheet
        policy={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}
