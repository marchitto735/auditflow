"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import {
  ChevronDown,
  FileUp,
  Search,
  ShieldCheck,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  CARD_SECTION_EYEBROW_CLASS,
  DIALOG_BODY_CLASS,
  DIALOG_CONTENT_CLASS,
  DIALOG_DESCRIPTION_CLASS,
  DIALOG_FIELD_CLASS,
  DIALOG_FILE_TRIGGER_CLASS,
  DIALOG_FOOTER_CLASS,
  DIALOG_HEADER_CLASS,
  DIALOG_LABEL_CLASS,
  DIALOG_TITLE_CLASS,
  FIELD_ERROR_TEXT_CLASS,
  FIELD_INVALID_CLASS,
  OVERLINE_LABEL_CLASS,
  PAGE_HEADER_PRIMARY_BUTTON_CLASS,
  SECTION_DESCRIPTION_CLASS,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_GAP_CLASS,
  DASHBOARD_TRIPLE_CARD_GRID_CLASS,
  TABLE_CARD_HEADER_CLASS,
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
            ? `${kpis.syncedCount} synced · ${kpis.failedCount} failed parse`
            : "SOP · BPR · FIR in the master library",
        code: "ALL",
        trend: runningCount(policies, () => true),
        status: "Synced",
      },
      {
        title: "Active / Ready",
        value: `${kpis.activeCount} / ${kpis.readyCount}`,
        description: `${kpis.activeCount + kpis.readyCount} production-ready policies`,
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
            : "Awaiting compliance sign-off",
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
  const [title, setTitle] = useState("");
  const [type, setType] = useState<PolicyDocType>("SOP");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    file?: string;
  }>({});
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle("");
    setType("SOP");
    setFileName(null);
    setFieldErrors({});
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;

    const nextErrors: { title?: string; file?: string } = {};
    if (!title.trim()) {
      nextErrors.title = "Enter a policy title.";
    }
    if (!fileName) {
      nextErrors.file = "Choose a master document to upload.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      toast.success(`Queued ${type} ingest for “${title.trim()}”.`);
      handleOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={DIALOG_CONTENT_CLASS} showCloseButton>
        <form onSubmit={handleSubmit}>
          <DialogHeader className={DIALOG_HEADER_CLASS}>
            <DialogTitle className={DIALOG_TITLE_CLASS}>
              Upload master document
            </DialogTitle>
            <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
              Register a new SOP, BPR, or FIR for n8n parsing and clause extraction.
            </DialogDescription>
          </DialogHeader>
          <div className={DIALOG_BODY_CLASS}>
            <div className={DIALOG_FIELD_CLASS}>
              <Label htmlFor="policy-title" className={DIALOG_LABEL_CLASS}>
                Policy title
              </Label>
              <Input
                id="policy-title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (event.target.value.trim()) {
                    setFieldErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                placeholder="e.g. Document control & change management"
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={
                  fieldErrors.title ? "policy-title-error" : undefined
                }
              />
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
              <Label htmlFor="policy-type" className={DIALOG_LABEL_CLASS}>
                Document type
              </Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as PolicyDocType)}
              >
                <SelectTrigger id="policy-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POLICY_DOC_TYPES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={DIALOG_FIELD_CLASS}>
              <Label htmlFor="policy-file" className={DIALOG_LABEL_CLASS}>
                Master file
              </Label>
              <input
                ref={fileRef}
                id="policy-file"
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={(event) => {
                  const nextName = event.target.files?.[0]?.name ?? null;
                  setFileName(nextName);
                  if (nextName) {
                    setFieldErrors((prev) => ({ ...prev, file: undefined }));
                  }
                }}
              />
              <button
                type="button"
                className={cn(
                  DIALOG_FILE_TRIGGER_CLASS,
                  fieldErrors.file && FIELD_INVALID_CLASS,
                  !fileName && "text-muted-foreground",
                )}
                onClick={() => fileRef.current?.click()}
                aria-invalid={Boolean(fieldErrors.file)}
                aria-describedby={
                  fieldErrors.file ? "policy-file-error" : undefined
                }
              >
                <FileUp className="size-4 shrink-0 text-neutral-900" aria-hidden />
                <span className="truncate">
                  {fileName ?? "Choose PDF or Word document"}
                </span>
              </button>
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
              {pending ? "Uploading…" : "Upload & queue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
                    <TableHead className="w-[22%]">Title</TableHead>
                    <TableHead className="w-[14%]">Document ID</TableHead>
                    <TableHead className="w-[8%]">Type</TableHead>
                    <TableHead className="w-[8%]">Version</TableHead>
                    <TableHead className="w-[14%]">Last parsed</TableHead>
                    <TableHead className="w-[8%]">Chunks</TableHead>
                    <TableHead className="w-[14%]">Frameworks</TableHead>
                    <TableHead className="w-[12%]">Status</TableHead>
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
