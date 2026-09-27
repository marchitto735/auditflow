"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { ChevronDown, RefreshCw, Search } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CARD_SECTION_EYEBROW_CLASS,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_GAP_CLASS,
} from "@/lib/page-layout";
import {
  DEMO_FRAMEWORK_CLAUSES,
  DEMO_FRAMEWORK_OVERVIEWS,
  MAPPING_STATUSES,
  filterFrameworkClauses,
  formatFrameworkTimestamp,
  type FrameworkClauseRow,
  type FrameworkFilters,
  type FrameworkOverview,
  type MappingStatus,
} from "@/lib/frameworks";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;
const TABLE_MIN_WIDTH_CLASS = "min-w-[52rem]";

const INITIAL_FILTERS: FrameworkFilters = {
  search: "",
  frameworkId: "all",
  version: "all",
  status: "all",
};

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);
  return items;
}

function mappingStatusClass(status: MappingStatus) {
  switch (status) {
    case "Fully Mapped":
      return "border-emerald-600 bg-status-success text-status-success-foreground";
    case "Partial Gap":
      return "border-amber-200 bg-status-warning-muted text-amber-900";
    case "Under Review":
      return "border-neutral-300 bg-neutral-50 text-neutral-600";
    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-700";
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
      className="inline-flex h-9 min-w-[8rem] items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
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
        className={cn(DASHBOARD_MENU_CONTENT_CLASS, "min-w-[12rem]")}
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

function PageSizeSelector({
  pageSize,
  menusMounted,
  onChange,
}: {
  pageSize: number;
  menusMounted: boolean;
  onChange: (value: string) => void;
}) {
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
      aria-label="Rows per page"
      className="inline-flex h-8 w-[4.5rem] items-center justify-between gap-1 rounded-md border border-neutral-200 bg-sidebar-muted/40 px-2 text-sm font-medium text-neutral-900"
    >
      <span>{pageSize}</span>
      <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
    </button>
  );

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="text-sm text-muted-foreground">Rows per page:</span>
      {menusMounted ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className={DASHBOARD_MENU_CONTENT_CLASS}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              releaseTriggerFocus();
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <DropdownMenuItem
                key={size}
                className={cn(
                  DASHBOARD_MENU_ITEM_CLASS,
                  size === pageSize && DASHBOARD_MENU_ITEM_SELECTED_CLASS,
                )}
                onSelect={() => {
                  releaseTriggerFocus();
                  onChange(String(size));
                }}
              >
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        trigger
      )}
    </div>
  );
}

function FrameworksPaginationNav({
  pageItems,
  currentPage,
  totalPages,
  onPageChange,
  className,
}: {
  pageItems: Array<number | "ellipsis">;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  return (
    <nav
      className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      aria-label="Framework clauses pagination"
    >
      <Button
        type="button"
        variant="ghost"
        className="h-8! min-h-8! rounded-md px-2 text-sm font-medium text-neutral-500 shadow-none hover:bg-neutral-100 hover:text-neutral-900"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        Previous
      </Button>
      {pageItems.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-8 items-center px-1 text-sm text-neutral-900"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant="ghost"
            className={cn(
              "h-8! min-h-8! w-8! rounded-md p-0! text-sm font-medium",
              item === currentPage
                ? "bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] hover:text-primary-foreground"
                : "text-neutral-900 hover:bg-neutral-100",
            )}
            aria-current={item === currentPage ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        type="button"
        variant="ghost"
        className="h-8! min-h-8! rounded-md px-2 text-sm font-medium text-neutral-500 shadow-none hover:bg-neutral-100 hover:text-neutral-900"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </Button>
    </nav>
  );
}

function SyncFrameworkDialog({
  open,
  onOpenChange,
  frameworks,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frameworks: FrameworkOverview[];
}) {
  const [frameworkId, setFrameworkId] = useState(frameworks[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const selected = frameworks.find((fw) => fw.id === frameworkId);
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(
        selected
          ? `Sync queued for ${selected.name}.`
          : "Framework sync queued.",
      );
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 md:max-w-md" showCloseButton>
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-neutral-200 p-4 text-left">
            <DialogTitle className="m-0 text-lg font-medium text-neutral-900">
              Import / sync framework
            </DialogTitle>
            <DialogDescription className="m-0 mt-1 text-sm text-muted-foreground">
              Pull the latest clause pack and refresh policy mapping coverage.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sync-framework">Framework</Label>
              <Select value={frameworkId} onValueChange={setFrameworkId}>
                <SelectTrigger id="sync-framework" className="w-full">
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  {frameworks.map((fw) => (
                    <SelectItem key={fw.id} value={fw.id}>
                      {fw.name} ({fw.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 border-t border-neutral-200 p-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="black" disabled={pending}>
              {pending ? "Syncing…" : "Start sync"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FrameworkOverviewCards({
  frameworks,
  selectedId,
  onSelect,
}: {
  frameworks: FrameworkOverview[];
  selectedId: string | "all";
  onSelect: (id: string | "all") => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {frameworks.map((fw) => {
        const active = selectedId === fw.id;
        return (
          <button
            key={fw.id}
            type="button"
            onClick={() => onSelect(active ? "all" : fw.id)}
            className={cn(
              "rounded-2xl border bg-white p-4 text-left shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30",
              active
                ? "border-neutral-800"
                : "border-neutral-200 hover:border-neutral-300",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="m-0 text-[13px] font-medium uppercase tracking-wider text-neutral-500">
                  {fw.shortName}
                </p>
                <p className="m-0 mt-1 truncate text-sm font-medium text-neutral-900">
                  {fw.name}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn("shrink-0 font-medium", mappingStatusClass(fw.status))}
              >
                {fw.status}
              </Badge>
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
              <div>
                <p className="m-0 text-2xl font-bold tabular-nums tracking-tight text-neutral-900">
                  {fw.coveragePercent}%
                </p>
                <p className="m-0 text-xs text-neutral-500">coverage</p>
              </div>
              <div className="text-right text-xs text-neutral-600">
                <p className="m-0 tabular-nums">
                  {fw.mappedPolicies}/{fw.totalClauses} clauses
                </p>
                <p className="m-0 mt-0.5">v{fw.version}</p>
              </div>
            </div>
            <Progress
              value={fw.coveragePercent}
              className="mt-3 h-1.5 bg-neutral-100"
              indicatorClassName="bg-primary"
            />
          </button>
        );
      })}
    </div>
  );
}

function MappingTable({
  rows,
  frameworks,
  filters,
  onFiltersChange,
  menusMounted,
  onOpenSync,
}: {
  rows: FrameworkClauseRow[];
  frameworks: FrameworkOverview[];
  filters: FrameworkFilters;
  onFiltersChange: (partial: Partial<FrameworkFilters>) => void;
  menusMounted: boolean;
  onOpenSync: () => void;
}) {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => filterFrameworkClauses(rows, filters),
    [rows, filters],
  );

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(pageStart, pageStart + pageSize);
  const pageItems = buildPageItems(currentPage, totalPages);

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  const frameworkOptions = [
    { value: "all" as const, label: "All frameworks" },
    ...frameworks.map((fw) => ({ value: fw.id, label: fw.shortName })),
  ];
  const versionOptions = [
    { value: "all" as const, label: "All versions" },
    ...Array.from(new Set(frameworks.map((fw) => fw.version))).map(
      (version) => ({ value: version, label: version }),
    ),
  ];
  const statusOptions = [
    { value: "all" as const, label: "All status" },
    ...MAPPING_STATUSES.map((status) => ({ value: status, label: status })),
  ];

  return (
    <Card className={cn("overflow-hidden", DASHBOARD_CARD_CLASS)}>
      <CardContent className="flex flex-col p-0">
        <div className="relative flex shrink-0 flex-col gap-3 border-b border-neutral-200 px-4 pt-[16px] pb-3">
          <div className="min-w-0 pr-10">
            <p className={CARD_SECTION_EYEBROW_CLASS}>Clause Mapping</p>
            <p className="text-body1 m-0 mt-1 text-neutral-600">
              Regulatory articles mapped to internal SOP / BPR / FIR controls.
            </p>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <Button
              type="button"
              variant="black"
              className="h-9! min-h-9! gap-1.5 rounded-md px-3 text-sm"
              onClick={onOpenSync}
            >
              <RefreshCw className="size-4" aria-hidden />
              Sync framework
            </Button>
            <CardActionsMenu
              label="Clause Mapping"
              actions={TABLE_CARD_MENU_ACTIONS}
            />
          </div>

          <div
            className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4"
            role="search"
            aria-label="Search and filter clauses"
          >
            <div className="relative min-w-0 w-full md:max-w-md md:flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-900"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Search article, description, or SOP"
                value={filters.search}
                onChange={(event) =>
                  onFiltersChange({ search: event.target.value })
                }
                className="h-9 pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                label="Framework"
                value={filters.frameworkId}
                options={frameworkOptions}
                menusMounted={menusMounted}
                onChange={(frameworkId) => onFiltersChange({ frameworkId })}
              />
              <FilterSelect
                label="Version"
                value={filters.version}
                options={versionOptions}
                menusMounted={menusMounted}
                onChange={(version) => onFiltersChange({ version })}
              />
              <FilterSelect
                label="Status"
                value={filters.status}
                options={statusOptions}
                menusMounted={menusMounted}
                onChange={(status) => onFiltersChange({ status })}
              />
            </div>
          </div>
        </div>

        {totalCount === 0 ? (
          <p className="text-body1 m-0 px-4 py-4 text-muted-foreground">
            No clauses match the current search and filters.
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
                  <TableHead className="h-10 w-[12%] px-4 text-left text-sm font-medium text-neutral-900">
                    Article
                  </TableHead>
                  <TableHead className="h-10 w-[14%] px-4 text-left text-sm font-medium text-neutral-900">
                    Framework
                  </TableHead>
                  <TableHead className="h-10 w-[32%] px-4 text-left text-sm font-medium text-neutral-900">
                    Description
                  </TableHead>
                  <TableHead className="h-10 w-[18%] px-4 text-left text-sm font-medium text-neutral-900">
                    Mapped SOP
                  </TableHead>
                  <TableHead className="h-10 w-[12%] px-4 text-left text-sm font-medium text-neutral-900">
                    Status
                  </TableHead>
                  <TableHead className="h-10 w-[12%] px-4 text-left text-sm font-medium text-neutral-900">
                    Verified
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border border-b-0 [&>tr:not(:first-child)>td]:border-t [&>tr:not(:first-child)>td]:border-border">
                {pageRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-0 bg-white hover:bg-transparent"
                  >
                    <TableCell className="h-12 px-4 py-0 font-mono text-sm text-neutral-900">
                      {row.article}
                    </TableCell>
                    <TableCell className="h-12 max-w-0 px-4 py-0">
                      <span className="block truncate text-sm text-neutral-700">
                        {row.frameworkName}
                      </span>
                    </TableCell>
                    <TableCell className="h-12 max-w-0 px-4 py-0">
                      <span className="block truncate text-sm text-neutral-900">
                        {row.description}
                      </span>
                    </TableCell>
                    <TableCell className="h-12 max-w-0 px-4 py-0">
                      <span className="block truncate text-sm text-neutral-700">
                        {row.mappedSop}
                      </span>
                    </TableCell>
                    <TableCell className="h-12 px-4 py-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium",
                          mappingStatusClass(row.status),
                        )}
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="h-12 px-4 py-0 font-mono text-xs tabular-nums text-neutral-600">
                      {formatFrameworkTimestamp(row.lastVerifiedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="relative z-20 shrink-0 border-t-0 bg-white py-3 shadow-[0_-1px_0_0_var(--border)]">
              <div className="flex flex-col gap-3 px-4 md:hidden">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <p className="m-0 min-w-0 text-sm text-muted-foreground">
                    Showing {pageRows.length} of {totalCount} results
                  </p>
                  <PageSizeSelector
                    pageSize={pageSize}
                    menusMounted={menusMounted}
                    onChange={(value) => {
                      setPageSize(Number(value));
                      setPage(1);
                    }}
                  />
                </div>
                <FrameworksPaginationNav
                  pageItems={pageItems}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  className="justify-center"
                />
              </div>
              <div
                className={cn(
                  "hidden w-full items-center justify-between gap-4 md:flex",
                  TABLE_MIN_WIDTH_CLASS,
                )}
              >
                <p className="m-0 px-4 text-sm text-muted-foreground">
                  Showing {pageRows.length} of {totalCount} results
                </p>
                <div className="flex min-w-0 items-center justify-end gap-4 px-4">
                  <PageSizeSelector
                    pageSize={pageSize}
                    menusMounted={menusMounted}
                    onChange={(value) => {
                      setPageSize(Number(value));
                      setPage(1);
                    }}
                  />
                  <FrameworksPaginationNav
                    pageItems={pageItems}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    className="shrink-0 justify-end"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FrameworksWorkspace({
  frameworks = DEMO_FRAMEWORK_OVERVIEWS,
  clauses = DEMO_FRAMEWORK_CLAUSES,
}: {
  frameworks?: FrameworkOverview[];
  clauses?: FrameworkClauseRow[];
}) {
  const [filters, setFilters] = useState<FrameworkFilters>(INITIAL_FILTERS);
  const [menusMounted, setMenusMounted] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);

  useEffect(() => {
    setMenusMounted(true);
  }, []);

  function patchFilters(partial: Partial<FrameworkFilters>) {
    setFilters((current) => ({ ...current, ...partial }));
  }

  return (
    <div className={cn("flex w-full flex-col", DASHBOARD_GAP_CLASS)}>
      <FrameworkOverviewCards
        frameworks={frameworks}
        selectedId={filters.frameworkId}
        onSelect={(frameworkId) => patchFilters({ frameworkId })}
      />
      <MappingTable
        rows={clauses}
        frameworks={frameworks}
        filters={filters}
        onFiltersChange={patchFilters}
        menusMounted={menusMounted}
        onOpenSync={() => setSyncOpen(true)}
      />
      <SyncFrameworkDialog
        open={syncOpen}
        onOpenChange={setSyncOpen}
        frameworks={frameworks}
      />
    </div>
  );
}
