"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Layers,
  Percent,
  Search,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePaginationBar,
  TableRow,
} from "@/components/ui/table";
import {
  CARD_HEADER_STACK_CLASS,
  CARD_METRIC_CLASS,
  CARD_SECTION_EYEBROW_CLASS,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_GAP_CLASS,
  DASHBOARD_TRIPLE_CARD_GRID_CLASS,
  TABLE_TOOLBAR_ACTIONS_CLASS,
  TABLE_TOOLBAR_FILTERS_CLASS,
  TABLE_TOOLBAR_FILTER_TRIGGER_CLASS,
  TABLE_TOOLBAR_ROW_CLASS,
  TABLE_TOOLBAR_SEARCH_ICON_CLASS,
  TABLE_TOOLBAR_SEARCH_INPUT_CLASS,
  TABLE_TOOLBAR_SEARCH_WRAP_CLASS,
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

const DEFAULT_PAGE_SIZE = 3;
const TABLE_MIN_WIDTH_CLASS = "min-w-[52rem]";

const INITIAL_FILTERS: FrameworkFilters = {
  search: "",
  frameworkId: "all",
  version: "all",
  status: "all",
};

function mappingBadgeVariant(status: MappingStatus) {
  switch (status) {
    case "Mapped":
      return "success" as const;
    case "Partial":
      return "warning" as const;
    case "Review":
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

function FrameworkKpiHeader({
  frameworks,
}: {
  frameworks: FrameworkOverview[];
}) {
  const cards = useMemo(() => {
    const total = frameworks.length;
    const avgCoverage =
      total === 0
        ? 0
        : Math.round(
            frameworks.reduce((sum, fw) => sum + fw.coveragePercent, 0) / total,
          );
    const needsReview = frameworks.filter(
      (fw) => fw.status === "Partial" || fw.status === "Review",
    ).length;
    const mappedCount = frameworks.filter((fw) => fw.status === "Mapped").length;

    return [
      {
        eyebrow: "Active Frameworks",
        value: String(total),
        meta: `${mappedCount} fully mapped`,
        icon: Layers,
      },
      {
        eyebrow: "Avg Coverage",
        value: `${avgCoverage}%`,
        meta: "Mean clause mapping across packs",
        icon: Percent,
      },
      {
        eyebrow: "Needs Review",
        value: String(needsReview),
        meta:
          needsReview > 0
            ? "Partial or review status"
            : "All frameworks mapped",
        icon: AlertTriangle,
      },
    ] as const;
  }, [frameworks]);

  return (
    <div className={DASHBOARD_TRIPLE_CARD_GRID_CLASS}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.eyebrow}
            className={cn("overflow-hidden", DASHBOARD_CARD_CLASS)}
          >
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className={cn(CARD_HEADER_STACK_CLASS, "min-w-0")}>
                  <p className={CARD_SECTION_EYEBROW_CLASS}>{card.eyebrow}</p>
                  <p
                    className={cn(
                      CARD_METRIC_CLASS,
                      "m-0 tabular-nums text-neutral-900",
                    )}
                  >
                    {card.value}
                  </p>
                </div>
                <Icon className="size-4 shrink-0 text-zinc-400" aria-hidden />
              </div>
              <p className="m-0 truncate text-xs text-neutral-500">{card.meta}</p>
            </CardContent>
          </Card>
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

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value));
    setPage(1);
  }

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
            <p className="m-0 mt-2 text-base font-normal text-neutral-600">
              Regulatory articles mapped to internal SOP / BPR / FIR controls.
            </p>
          </div>
          <div className="absolute top-3 right-3">
            <CardActionsMenu
              label="Clause Mapping"
              actions={TABLE_CARD_MENU_ACTIONS}
            />
          </div>

          <div
            className={TABLE_TOOLBAR_ROW_CLASS}
            role="search"
            aria-label="Search and filter clauses"
          >
            <div className={TABLE_TOOLBAR_SEARCH_WRAP_CLASS}>
              <Search
                className={TABLE_TOOLBAR_SEARCH_ICON_CLASS}
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Search article, description, or SOP"
                value={filters.search}
                onChange={(event) =>
                  onFiltersChange({ search: event.target.value })
                }
                className={TABLE_TOOLBAR_SEARCH_INPUT_CLASS}
              />
            </div>
            <div className={TABLE_TOOLBAR_FILTERS_CLASS}>
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
            <div className={TABLE_TOOLBAR_ACTIONS_CLASS}>
              <Button
                type="button"
                variant="black"
                className="h-9! min-h-9! shrink-0 gap-1.5 rounded-md px-3 text-sm"
                onClick={onOpenSync}
              >
                Sync framework
              </Button>
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
                    className="border-0 bg-white hover:bg-neutral-50"
                  >
                    <TableCell className="h-12 px-4 py-0 font-mono">
                      {row.article}
                    </TableCell>
                    <TableCell className="h-12 max-w-0 px-4 py-0">
                      <span className="block truncate">
                        {row.frameworkName}
                      </span>
                    </TableCell>
                    <TableCell className="h-12 max-w-0 px-4 py-0">
                      <span className="block truncate">
                        {row.description}
                      </span>
                    </TableCell>
                    <TableCell className="h-12 max-w-0 px-4 py-0">
                      <span className="block truncate">
                        {row.mappedSop}
                      </span>
                    </TableCell>
                    <TableCell className="h-12 px-4 py-0">
                      <Badge variant={mappingBadgeVariant(row.status)}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="h-12 px-4 py-0 font-mono tabular-nums">
                      {formatFrameworkTimestamp(row.lastVerifiedAt)}
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
              paginationLabel="Framework clauses pagination"
            />
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
      <FrameworkKpiHeader frameworks={frameworks} />
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
