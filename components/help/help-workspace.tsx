"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Phone,
  Search,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { submitSupportTicket } from "@/app/actions/help-actions";
import {
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
  DASHBOARD_MENU_ITEM_SELECTED_CLASS,
} from "@/components/dashboard/card-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  CARD_SECTION_EYEBROW_CLASS,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_GAP_CLASS,
} from "@/lib/page-layout";
import {
  HELP_DIAGNOSTICS,
  HELP_KNOWLEDGE_ARTICLES,
  HELP_SUPPORT_TICKETS,
  HELP_SYSTEM_STATUS,
  TICKET_CATEGORIES,
  TICKET_SEVERITIES,
  filterKnowledgeArticles,
  formatHelpTimestamp,
  type SupportTicket,
  type SystemServiceStatus,
  type TicketCategory,
  type TicketSeverity,
} from "@/lib/help";
import { cn } from "@/lib/utils";

function serviceStatusBadgeVariant(
  status: SystemServiceStatus["status"],
) {
  switch (status) {
    case "Operational":
      return "success" as const;
    case "Degraded":
      return "warning" as const;
    case "Outage":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function ticketStatusBadgeVariant(status: SupportTicket["status"]) {
  switch (status) {
    case "Resolved":
      return "success" as const;
    case "Waiting":
      return "warning" as const;
    case "In Progress":
      return "success" as const;
    case "Open":
    default:
      return "outline" as const;
  }
}

const TICKET_PAGE_SIZE_OPTIONS = [3, 5, 10, 25, 50] as const;
const TICKET_DEFAULT_PAGE_SIZE = 10;

function buildTicketPageItems(currentPage: number, totalPages: number) {
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

function TicketPageSizeSelector({
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
      className="inline-flex h-8 w-[4.5rem] items-center justify-between gap-1 rounded-md border border-neutral-200 bg-white px-2 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:border-neutral-400 hover:bg-neutral-50 data-[state=open]:border-neutral-400 data-[state=open]:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span>{pageSize}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-neutral-900" aria-hidden />
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
            {TICKET_PAGE_SIZE_OPTIONS.map((size) => {
              const isSelected = size === pageSize;
              return (
                <DropdownMenuItem
                  key={size}
                  className={cn(
                    DASHBOARD_MENU_ITEM_CLASS,
                    isSelected && DASHBOARD_MENU_ITEM_SELECTED_CLASS,
                  )}
                  onSelect={() => {
                    releaseTriggerFocus();
                    onChange(String(size));
                  }}
                >
                  {size}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        trigger
      )}
    </div>
  );
}

function TicketPaginationNav({
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
      aria-label="Active tickets pagination"
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
                : "text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900",
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

function CardShell({
  eyebrow,
  description,
  children,
  className,
  headerAction,
}: {
  eyebrow: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}) {
  return (
    <Card className={cn("overflow-hidden", DASHBOARD_CARD_CLASS, className)}>
      <CardContent className="flex flex-col p-0">
        <div className="relative shrink-0 border-b border-neutral-200 px-4 pt-[16px] pb-3">
          <div className={cn("min-w-0", headerAction && "pr-28")}>
            <p className={CARD_SECTION_EYEBROW_CLASS}>{eyebrow}</p>
            {description ? (
              <p className="text-body1 m-0 mt-1 text-neutral-600">
                {description}
              </p>
            ) : null}
          </div>
          {headerAction ? (
            <div className="absolute top-3 right-3">{headerAction}</div>
          ) : null}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function SystemStatusStrip() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function copyValue(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(label);
      toast.success(`${label} copied`);
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      toast.error("Unable to copy to clipboard");
    }
  }

  return (
    <CardShell
      eyebrow="System Status"
      description="Live infrastructure health and tenant diagnostics for support escalations."
    >
      <div className="grid gap-0 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ul className="m-0 grid list-none gap-0 border-b border-neutral-200 p-0 md:border-b-0 md:border-r">
          {HELP_SYSTEM_STATUS.map((service) => (
            <li
              key={service.id}
              className="flex items-start justify-between gap-4 border-b border-neutral-200 px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="m-0 text-sm font-medium text-neutral-900">
                  {service.label}
                </p>
                <p className="m-0 mt-0.5 text-xs text-neutral-500">
                  {service.detail}
                </p>
              </div>
              <Badge
                variant={serviceStatusBadgeVariant(service.status)}
                className="shrink-0"
              >
                {service.status}
              </Badge>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Diagnostic metadata
          </p>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {HELP_DIAGNOSTICS.map((item) => {
              const copied = copiedKey === item.label;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => copyValue(item.label, item.value)}
                    className="flex w-full items-center justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
                  >
                    <span className="min-w-0">
                      <span className="block text-xs text-neutral-500">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-sm text-neutral-900">
                        {item.value}
                      </span>
                    </span>
                    {copied ? (
                      <Check className="size-4 shrink-0 text-neutral-900" />
                    ) : (
                      <Copy className="size-4 shrink-0 text-neutral-500" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </CardShell>
  );
}

function KnowledgeBase() {
  const [query, setQuery] = useState("");
  const articles = useMemo(
    () => filterKnowledgeArticles(HELP_KNOWLEDGE_ARTICLES, query),
    [query],
  );

  return (
    <CardShell
      eyebrow="Knowledge Base"
      description="CFR Part 11, ISO frameworks, and AuditFlow ingestion playbooks."
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-900"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search SOP docs and frameworks"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 pl-9"
          />
        </div>

        {articles.length === 0 ? (
          <p className="m-0 text-sm text-muted-foreground">
            No articles match “{query}”.
          </p>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <li key={article.id}>
                <a
                  href={article.href}
                  className="flex h-full flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4 no-underline transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline">{article.category}</Badge>
                    <BookOpen
                      className="size-4 shrink-0 text-neutral-500"
                      aria-hidden
                    />
                  </div>
                  <p className="m-0 text-sm font-medium text-neutral-900">
                    {article.title}
                  </p>
                  <p className="m-0 flex-1 text-sm leading-snug text-neutral-600">
                    {article.summary}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-900">
                    Open article
                    <ExternalLink className="size-3" aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CardShell>
  );
}

function TicketForm() {
  const [subject, setSubject] = useState("");
  const [severity, setSeverity] = useState<TicketSeverity>("Medium");
  const [category, setCategory] = useState<TicketCategory>("Audit pipeline");
  const [description, setDescription] = useState("");
  const [attachSessionLog, setAttachSessionLog] = useState(true);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await submitSupportTicket({
        subject,
        severity,
        category,
        description,
        attachSessionLog,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setSubject("");
      setDescription("");
      setSeverity("Medium");
      setCategory("Audit pipeline");
      setAttachSessionLog(true);
    });
  }

  return (
    <CardShell
      eyebrow="Submit Ticket"
      description="Log a support request with severity and compliance categorization."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ticket-subject">Subject</Label>
          <Input
            id="ticket-subject"
            required
            placeholder="Brief summary of the issue"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ticket-severity">Severity</Label>
            <Select
              value={severity}
              onValueChange={(value) => setSeverity(value as TicketSeverity)}
            >
              <SelectTrigger id="ticket-severity" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_SEVERITIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ticket-category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as TicketCategory)}
            >
              <SelectTrigger id="ticket-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_CATEGORIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ticket-description">Description</Label>
          <Textarea
            id="ticket-description"
            required
            rows={4}
            placeholder="Steps to reproduce, audit workflow, and expected outcome…"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-900">
          <Checkbox
            checked={attachSessionLog}
            onCheckedChange={(checked) =>
              setAttachSessionLog(checked === true)
            }
          />
          Attach current session diagnostics
        </label>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="black"
            className="h-9! min-h-9! rounded-md px-4 text-sm"
            disabled={pending}
          >
            {pending ? "Submitting…" : "Submit ticket"}
          </Button>
        </div>
      </form>
    </CardShell>
  );
}

function ActiveTicketsTable() {
  const [pageSize, setPageSize] = useState(TICKET_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [menusMounted, setMenusMounted] = useState(false);

  useEffect(() => {
    setMenusMounted(true);
  }, []);

  const totalCount = HELP_SUPPORT_TICKETS.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return HELP_SUPPORT_TICKETS.slice(start, start + pageSize);
  }, [currentPage, pageSize]);
  const pageItems = buildTicketPageItems(currentPage, totalPages);

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value));
    setPage(1);
  }

  return (
    <CardShell
      eyebrow="Active Tickets"
      description="Open and recent support cases with assignee and SLA windows."
    >
      <div className="overflow-x-auto">
        <Table className="w-full min-w-[44rem] table-fixed border-separate border-spacing-0">
          <TableHeader className="bg-white shadow-[0_1px_0_0_var(--border)]">
            <TableRow className="border-0 hover:bg-transparent">
              {(
                [
                  ["Ticket", "w-[12%]"],
                  ["Subject", "w-[28%]"],
                  ["Severity", "w-[10%]"],
                  ["Status", "w-[14%]"],
                  ["Assignee", "w-[14%]"],
                  ["SLA", "w-[12%]"],
                  ["Opened", "w-[10%]"],
                ] as const
              ).map(([label, width]) => (
                <TableHead
                  key={label}
                  className={cn(
                    "h-10 px-4 text-left text-sm font-medium text-neutral-900",
                    width,
                  )}
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border [&>tr:not(:first-child)>td]:border-t [&>tr:not(:first-child)>td]:border-border">
            {pageRows.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="border-0 bg-white hover:bg-neutral-50"
              >
                <TableCell className="h-12 px-4 py-0 font-mono text-sm text-neutral-900">
                  {ticket.id}
                </TableCell>
                <TableCell className="h-12 max-w-0 px-4 py-0">
                  <span className="block truncate text-neutral-900">
                    {ticket.subject}
                  </span>
                </TableCell>
                <TableCell className="h-12 px-4 py-0 text-sm text-neutral-700">
                  {ticket.severity}
                </TableCell>
                <TableCell className="h-12 px-4 py-0">
                  <Badge variant={ticketStatusBadgeVariant(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell className="h-12 max-w-0 px-4 py-0">
                  <span className="block truncate text-sm text-neutral-700">
                    {ticket.assignee}
                  </span>
                </TableCell>
                <TableCell className="h-12 px-4 py-0 text-sm text-neutral-700">
                  {ticket.sla}
                </TableCell>
                <TableCell className="h-12 px-4 py-0 font-mono text-xs tabular-nums text-neutral-600">
                  {formatHelpTimestamp(ticket.openedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="relative z-20 shrink-0 border-t-0 bg-white py-3 shadow-[0_-1px_0_0_var(--border)]">
        <div className="flex flex-col gap-3 px-4 md:hidden">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="m-0 min-w-0 text-sm text-muted-foreground">
              Showing {pageRows.length} of {totalCount} results
            </p>
            <TicketPageSizeSelector
              pageSize={pageSize}
              menusMounted={menusMounted}
              onChange={handlePageSizeChange}
            />
          </div>
          <TicketPaginationNav
            pageItems={pageItems}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            className="justify-center"
          />
        </div>

        <div className="hidden w-full min-w-[44rem] items-center justify-between gap-4 md:flex">
          <p className="m-0 px-4 text-sm text-muted-foreground">
            Showing {pageRows.length} of {totalCount} results
          </p>
          <div className="flex min-w-0 items-center justify-end gap-4 px-4">
            <TicketPageSizeSelector
              pageSize={pageSize}
              menusMounted={menusMounted}
              onChange={handlePageSizeChange}
            />
            <TicketPaginationNav
              pageItems={pageItems}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              className="shrink-0 justify-end"
            />
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function EmergencyEscalation() {
  return (
    <Card
      className={cn(
        "overflow-hidden border-l-4 border-l-neutral-900",
        DASHBOARD_CARD_CLASS,
      )}
    >
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between md:p-5">
        <div className="min-w-0 max-w-2xl">
          <div className="flex items-center gap-2">
            <ShieldAlert
              className="size-5 shrink-0 text-neutral-900"
              aria-hidden
            />
            <p className={cn(CARD_SECTION_EYEBROW_CLASS, "tracking-wider")}>
              Emergency Escalation
            </p>
          </div>
          <h3 className="m-0 mt-2 text-lg font-medium tracking-tight text-neutral-900">
            Active audit incident protocol
          </h3>
          <p className="m-0 mt-2 text-sm leading-relaxed text-neutral-600">
            For critical pipeline failures during a live inspection or third-party
            audit, contact the on-call compliance officer before altering production
            data. Do not re-run destructive remediations without dual control.
          </p>
          <ul className="m-0 mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            <li>Preserve session diagnostics and report IDs</li>
            <li>Escalate Critical tickets with severity Critical</li>
            <li>Compliance officer: Naomi Park · +1 (212) 555-0148</li>
          </ul>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button
            type="button"
            variant="black"
            className="h-9! min-h-9! rounded-md px-4 text-sm"
            onClick={() =>
              toast.message("Escalation hotline", {
                description: "+1 (212) 555-0148 · on-call until 08:00 UTC",
              })
            }
          >
            <Phone className="size-4" aria-hidden />
            Call compliance officer
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9! min-h-9! rounded-md px-4 text-sm"
            onClick={async () => {
              const checklist = [
                "1. Preserve session diagnostics and report IDs",
                "2. Open Critical ticket (severity Critical)",
                "3. Contact compliance officer: Naomi Park · +1 (212) 555-0148",
                "4. Do not run destructive remediations without dual control",
              ].join("\n");
              try {
                await navigator.clipboard.writeText(checklist);
                toast.success("Escalation checklist copied");
              } catch {
                toast.error("Unable to copy checklist");
              }
            }}
          >
            <Copy className="size-4" aria-hidden />
            Copy protocol checklist
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HelpWorkspace() {
  return (
    <div className={cn("flex w-full flex-col", DASHBOARD_GAP_CLASS)}>
      <SystemStatusStrip />
      <KnowledgeBase />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <TicketForm />
        <EmergencyEscalation />
      </div>
      <ActiveTicketsTable />
    </div>
  );
}
