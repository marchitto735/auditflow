"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { ChevronDown, Search } from "lucide-react";
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
  FIELD_ERROR_TEXT_CLASS,
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
import SectionHeader from "@/components/section-header/section-header";

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
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setFrameworkId(frameworks[0]?.id ?? "");
    setFieldError(null);
  }, [open, frameworks]);

  function handleOpenChange(next: boolean) {
    if (!next) setFieldError(null);
    onOpenChange(next);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;

    if (!frameworkId) {
      setFieldError("Select a framework to sync.");
      return;
    }

    const selected = frameworks.find((fw) => fw.id === frameworkId);
    setFieldError(null);
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(
        selected
          ? `Sync queued for ${selected.name}.`
          : "Framework sync queued.",
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
              Import / sync framework
            </DialogTitle>
            <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
              Pull the latest clause pack and refresh policy mapping coverage.
            </DialogDescription>
          </DialogHeader>
          <div className={DIALOG_BODY_CLASS}>
            <div className={DIALOG_FIELD_CLASS}>
              <Label htmlFor="sync-framework" className={DIALOG_LABEL_CLASS}>
                Framework
              </Label>
              <Select
                value={frameworkId || undefined}
                onValueChange={(value) => {
                  setFrameworkId(value);
                  setFieldError(null);
                }}
              >
                <SelectTrigger
                  id="sync-framework"
                  className="w-full"
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={
                    fieldError ? "sync-framework-error" : undefined
                  }
                >
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
              {fieldError ? (
                <p
                  id="sync-framework-error"
                  className={FIELD_ERROR_TEXT_CLASS}
                  role="alert"
                >
                  {fieldError}
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
              {pending ? "Syncing…" : "Start sync"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function needsFrameworkReview(status: FrameworkOverview["status"]) {
  return status === "Partial" || status === "Review";
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
    const needsReview = frameworks.filter((fw) =>
      needsFrameworkReview(fw.status),
    ).length;
    const mappedCount = frameworks.filter((fw) => fw.status === "Mapped").length;

    let coverageSum = 0;
    let reviewCount = 0;
    const countTrend = frameworks.map((_, index) => index + 1);
    const coverageTrend = frameworks.map((fw, index) => {
      coverageSum += fw.coveragePercent;
      return Math.round(coverageSum / (index + 1));
    });
    const reviewTrend = frameworks.map((fw) => {
      if (needsFrameworkReview(fw.status)) reviewCount += 1;
      return reviewCount;
    });

    return [
      {
        title: "Active frameworks",
        value: String(total),
        description: `${mappedCount} fully mapped`,
        code: "ALL",
        trend: countTrend.length > 0 ? countTrend : [0],
        status: "Synced",
      },
      {
        title: "Avg coverage",
        value: `${avgCoverage}%`,
        description: "Mean clause mapping across packs",
        code: "AVG",
        trend: coverageTrend.length > 0 ? coverageTrend : [0],
        status: avgCoverage >= 85 ? "Verified" : avgCoverage >= 70 ? "Pending" : "Flagged",
      },
      {
        title: "Needs review",
        value: String(needsReview),
        description:
          needsReview > 0 ? "Partial or review status" : "All frameworks mapped",
        code: "REV",
        trend: reviewTrend.length > 0 ? reviewTrend : [0],
        status: needsReview > 0 ? "Pending" : "Verified",
      },
    ];
  }, [frameworks]);

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

function FrameworkRowActions({
  row,
  menusMounted,
}: {
  row: FrameworkClauseRow;
  menusMounted: boolean;
}) {
  return (
    <TableRowActionsMenu
      label={`Actions for ${row.article}`}
      menusMounted={menusMounted}
    >
      <DropdownMenuItem
        className={DASHBOARD_MENU_ITEM_CLASS}
        onSelect={() => {
          toast.message("Article details", {
            description: `${row.article} · ${row.frameworkName}`,
          });
        }}
      >
        View article details
      </DropdownMenuItem>
      <DropdownMenuItem
        className={DASHBOARD_MENU_ITEM_CLASS}
        onSelect={() => {
          toast.message("Map control", {
            description: row.mappedSop || "No SOP mapped yet",
          });
        }}
      >
        Map control
      </DropdownMenuItem>
      <DropdownMenuItem
        className={DASHBOARD_MENU_ITEM_CLASS}
        onSelect={() => {
          toast.success("Status override queued", {
            description: `${row.article} · ${row.status}`,
          });
        }}
      >
        Override status
      </DropdownMenuItem>
    </TableRowActionsMenu>
  );
}

function MappingTable({
  rows,
  frameworks,
  filters,
  onFiltersChange,
  menusMounted,
}: {
  rows: FrameworkClauseRow[];
  frameworks: FrameworkOverview[];
  filters: FrameworkFilters;
  onFiltersChange: (partial: Partial<FrameworkFilters>) => void;
  menusMounted: boolean;
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
        <div className={TABLE_CARD_HEADER_CLASS}>
          <div className="min-w-0 pr-10">
            <p className={CARD_SECTION_EYEBROW_CLASS}>Clause mapping</p>
            <p className={SECTION_DESCRIPTION_CLASS}>
              Regulatory articles mapped to internal SOP / BPR / FIR controls.
            </p>
          </div>
          <div className="absolute top-3 right-3">
            <CardActionsMenu
              label="Clause mapping"
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
          </div>
        </div>

        {totalCount === 0 ? (
          <p className="text-body1 m-0 px-4 py-4 text-muted-foreground">
            No clauses match the current search and filters.
          </p>
        ) : (
          <div className="flex shrink-0 flex-col" style={{ overflowAnchor: "none" }}>
            <Table
              className={TABLE_MIN_WIDTH_CLASS}
              containerClassName="overflow-x-auto"
            >
              <TableHeader className={TABLE_STICKY_HEADER_CLASS}>
                <TableRow>
                  <TableHead className="w-[12%]">Article</TableHead>
                  <TableHead className="w-[14%]">Framework</TableHead>
                  <TableHead className="w-[28%]">Description</TableHead>
                  <TableHead className="w-[16%]">Mapped SOP</TableHead>
                  <TableHead className="w-[12%]">Verified</TableHead>
                  <TableHead className="w-[12%]">Status</TableHead>
                  <TableHead className={TABLE_ROW_ACTIONS_HEAD_CLASS}>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((row) => (
                  <TableRow key={row.id} className="bg-white">
                    <TableCell className="font-mono">{row.article}</TableCell>
                    <TableCell>
                      <span className="block truncate">
                        {row.frameworkName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="block truncate">
                        {row.description}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="block truncate">
                        {row.mappedSop}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {formatFrameworkTimestamp(row.lastVerifiedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={mappingBadgeVariant(row.status)}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className={TABLE_ROW_ACTIONS_CELL_CLASS}>
                      <FrameworkRowActions
                        row={row}
                        menusMounted={menusMounted}
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
    <div className="flex w-full flex-col">
      <SectionHeader
        title="Frameworks"
        description="Regulatory standards, clause coverage, and mapped internal SOP controls."
        actions={
          <Button
            type="button"
            variant="black"
            className={PAGE_HEADER_PRIMARY_BUTTON_CLASS}
            onClick={() => setSyncOpen(true)}
          >
            Sync framework
          </Button>
        }
      />
      <div className={cn("flex w-full flex-col", DASHBOARD_GAP_CLASS)}>
      <FrameworkKpiHeader frameworks={frameworks} />
      <MappingTable
        rows={clauses}
        frameworks={frameworks}
        filters={filters}
        onFiltersChange={patchFilters}
        menusMounted={menusMounted}
      />
      <SyncFrameworkDialog
        open={syncOpen}
        onOpenChange={setSyncOpen}
        frameworks={frameworks}
      />
      </div>
    </div>
  );
}
