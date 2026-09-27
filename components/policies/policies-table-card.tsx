"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import {
  ChevronDown,
  FileUp,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
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
  DASHBOARD_CARD_CLASS,
} from "@/lib/page-layout";
import {
  POLICY_DOC_TYPES,
  POLICY_STATUSES,
  filterMasterPolicies,
  formatPolicyTimestamp,
  uniquePolicyVersions,
  type MasterPolicy,
  type PolicyDocType,
  type PolicyFilters,
  type PolicyStatus,
} from "@/lib/policies";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 10;
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
      className="inline-flex h-9 min-w-[8rem] items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-400 hover:bg-neutral-50 data-[state=open]:border-neutral-400 data-[state=open]:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
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
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle("");
    setType("SOP");
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Enter a policy title.");
      return;
    }
    if (!fileName) {
      toast.error("Choose a master document to upload.");
      return;
    }
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      toast.success(`Queued ${type} ingest for “${title.trim()}”.`);
      handleOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 md:max-w-md" showCloseButton>
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-neutral-200 p-4 text-left">
            <DialogTitle className="m-0 text-lg font-medium text-neutral-900">
              Upload master document
            </DialogTitle>
            <DialogDescription className="m-0 mt-1 text-sm text-muted-foreground">
              Register a new SOP, BPR, or FIR for n8n parsing and clause extraction.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="policy-title">Policy title</Label>
              <Input
                id="policy-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Document Control & Change Management"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="policy-type">Document type</Label>
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="policy-file">Master file</Label>
              <input
                ref={fileRef}
                id="policy-file"
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={(event) =>
                  setFileName(event.target.files?.[0]?.name ?? null)
                }
              />
              <Button
                type="button"
                variant="outline"
                className="h-9! min-h-9! justify-start gap-2 rounded-lg px-3 text-sm font-normal"
                onClick={() => fileRef.current?.click()}
              >
                <FileUp className="size-4 shrink-0" aria-hidden />
                <span className="truncate">
                  {fileName ?? "Choose PDF or Word document"}
                </span>
              </Button>
            </div>
          </div>
          <DialogFooter className="gap-2 border-t border-neutral-200 p-4 sm:justify-end">
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
              <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
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
              <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
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
      <Card
        className={cn(
          "flex shrink-0 flex-col overflow-hidden",
          DASHBOARD_CARD_CLASS,
          className,
        )}
      >
        <CardContent className="flex flex-col p-0">
          <div className="relative flex shrink-0 flex-col gap-3 border-b border-neutral-200 px-4 pt-[16px] pb-3">
            <div className="min-w-0 pr-10">
              <p className={CARD_SECTION_EYEBROW_CLASS}>Master Policy Library</p>
              <p className="m-0 mt-1 text-base font-normal text-neutral-600">
                Controlled SOP, BPR, and FIR documents with parse status and
                framework coverage.
              </p>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <Button
                type="button"
                variant="black"
                className="h-9! min-h-9! gap-1.5 rounded-md px-3 text-sm"
                onClick={() => setUploadOpen(true)}
              >
                <FileUp className="size-4" aria-hidden />
                Upload document
              </Button>
              <CardActionsMenu
                label="Master Policy Library"
                actions={TABLE_CARD_MENU_ACTIONS}
              />
            </div>

            <div
              className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4"
              role="search"
              aria-label="Search and filter policies"
            >
              <div className="relative min-w-0 w-full md:max-w-md md:flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-900"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder="Search title, document ID, or type"
                  value={filters.search}
                  onChange={(event) =>
                    patchFilters({ search: event.target.value })
                  }
                  className="h-9 pl-9"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
                className={cn(
                  "w-full table-fixed border-separate border-spacing-0",
                  TABLE_MIN_WIDTH_CLASS,
                )}
                containerClassName="overflow-x-auto"
              >
                <TableHeader className="sticky top-0 z-20 bg-white shadow-[0_1px_0_0_var(--border)]">
                  <TableRow className="border-0 bg-white hover:bg-transparent">
                    <TableHead className="h-10 w-[22%] px-4 text-left text-sm font-medium text-neutral-900">
                      Title
                    </TableHead>
                    <TableHead className="h-10 w-[14%] px-4 text-left text-sm font-medium text-neutral-900">
                      Document ID
                    </TableHead>
                    <TableHead className="h-10 w-[8%] px-4 text-left text-sm font-medium text-neutral-900">
                      Type
                    </TableHead>
                    <TableHead className="h-10 w-[8%] px-4 text-left text-sm font-medium text-neutral-900">
                      Version
                    </TableHead>
                    <TableHead className="h-10 w-[12%] px-4 text-left text-sm font-medium text-neutral-900">
                      Status
                    </TableHead>
                    <TableHead className="h-10 w-[14%] px-4 text-left text-sm font-medium text-neutral-900">
                      Last parsed
                    </TableHead>
                    <TableHead className="h-10 w-[8%] px-4 text-left text-sm font-medium text-neutral-900">
                      Chunks
                    </TableHead>
                    <TableHead className="h-10 w-[14%] px-4 text-left text-sm font-medium text-neutral-900">
                      Frameworks
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border border-b-0 [&>tr:not(:first-child)>td]:border-t [&>tr:not(:first-child)>td]:border-border">
                  {pageRows.map((policy) => (
                    <TableRow
                      key={policy.id}
                      className="cursor-pointer border-0 bg-white hover:bg-neutral-50"
                      onClick={() => setSelected(policy)}
                    >
                      <TableCell className="h-12 max-w-0 px-4 py-0 align-middle">
                        <span className="block truncate">
                          {policy.title}
                        </span>
                      </TableCell>
                      <TableCell className="h-12 max-w-0 px-4 py-0 align-middle">
                        <span className="block truncate font-mono">
                          {policy.documentId}
                        </span>
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 align-middle">
                        {policy.type}
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 align-middle font-mono">
                        v{policy.version}
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 align-middle">
                        <Badge variant={statusBadgeVariant(policy.status)}>
                          {policy.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 align-middle font-mono tabular-nums">
                        {formatPolicyTimestamp(policy.lastParsedAt)}
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 align-middle font-mono">
                        {policy.chunkCount}
                      </TableCell>
                      <TableCell className="h-12 max-w-0 px-4 py-0 align-middle">
                        <span className="block truncate">
                          {policy.frameworks.join(" · ")}
                        </span>
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
