"use client";

import { useMemo, useState, useTransition, type FormEvent, type ReactNode } from "react";
import {
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  Phone,
  Search,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { submitSupportTicket } from "@/app/actions/help-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

function statusDotClass(status: SystemServiceStatus["status"]) {
  switch (status) {
    case "Operational":
      return "bg-neutral-900";
    case "Degraded":
      return "bg-neutral-500";
    case "Outage":
      return "bg-neutral-400";
    default:
      return "bg-neutral-400";
  }
}

function ticketStatusDotClass(status: SupportTicket["status"]) {
  switch (status) {
    case "Resolved":
      return "bg-neutral-900";
    case "In Progress":
      return "bg-neutral-700";
    case "Waiting":
      return "bg-neutral-500";
    default:
      return "bg-neutral-400";
  }
}

function severityWeight(severity: TicketSeverity) {
  switch (severity) {
    case "Critical":
      return "font-semibold text-neutral-900";
    case "High":
      return "font-medium text-neutral-900";
    case "Medium":
      return "text-neutral-700";
    default:
      return "text-neutral-500";
  }
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
                variant="outline"
                className="shrink-0 border-neutral-200 bg-neutral-50 font-medium text-neutral-800"
              >
                <span
                  className={cn(
                    "mr-1.5 inline-block size-2 rounded-full",
                    statusDotClass(service.status),
                  )}
                  aria-hidden
                />
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
                    className="flex w-full items-center justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
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
                    <Badge
                      variant="outline"
                      className="border-neutral-200 bg-neutral-50 text-neutral-700"
                    >
                      {article.category}
                    </Badge>
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
            {HELP_SUPPORT_TICKETS.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="border-0 bg-white hover:bg-transparent"
              >
                <TableCell className="h-12 px-4 py-0 font-mono text-sm text-neutral-900">
                  {ticket.id}
                </TableCell>
                <TableCell className="h-12 max-w-0 px-4 py-0">
                  <span className="block truncate text-neutral-900">
                    {ticket.subject}
                  </span>
                </TableCell>
                <TableCell
                  className={cn(
                    "h-12 px-4 py-0 text-sm",
                    severityWeight(ticket.severity),
                  )}
                >
                  {ticket.severity}
                </TableCell>
                <TableCell className="h-12 px-4 py-0">
                  <span className="inline-flex items-center gap-2 text-sm text-neutral-900">
                    <span
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        ticketStatusDotClass(ticket.status),
                      )}
                      aria-hidden
                    />
                    {ticket.status}
                  </span>
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
      <div className="border-t-0 bg-white px-4 py-3 shadow-[0_-1px_0_0_var(--border)]">
        <p className="m-0 text-sm text-muted-foreground">
          Showing {HELP_SUPPORT_TICKETS.length} of {HELP_SUPPORT_TICKETS.length}{" "}
          results
        </p>
      </div>
    </CardShell>
  );
}

function EmergencyEscalation() {
  return (
    <Card
      className={cn(
        "overflow-hidden border-neutral-800 bg-neutral-900 text-white",
        "rounded-2xl shadow-none",
      )}
    >
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between md:p-5">
        <div className="min-w-0 max-w-2xl">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-5 shrink-0 text-white" aria-hidden />
            <p className="m-0 text-[13px] font-medium uppercase tracking-wider text-neutral-300">
              Emergency Escalation
            </p>
          </div>
          <h3 className="m-0 mt-2 text-lg font-medium tracking-tight text-white">
            Active audit incident protocol
          </h3>
          <p className="m-0 mt-2 text-sm leading-relaxed text-neutral-300">
            For critical pipeline failures during a live inspection or third-party
            audit, contact the on-call compliance officer before altering production
            data. Do not re-run destructive remediations without dual control.
          </p>
          <ul className="m-0 mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-300">
            <li>Preserve session diagnostics and report IDs</li>
            <li>Escalate Critical tickets with severity Critical</li>
            <li>Compliance officer: Naomi Park · +1 (212) 555-0148</li>
          </ul>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9! min-h-9! border-white bg-white text-neutral-900 hover:bg-neutral-100"
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
            variant="ghost"
            className="h-9! min-h-9! text-white hover:bg-white/10 hover:text-white"
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
