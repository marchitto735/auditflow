"use client";

import { useMemo, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Phone, ShieldAlert } from "lucide-react";
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
  TablePaginationBar,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  CARD_BODY_CLASS,
  CARD_SECTION_EYEBROW_CLASS,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_GAP_CLASS,
} from "@/lib/page-layout";
import {
  HELP_SUPPORT_TICKETS,
  TICKET_CATEGORIES,
  TICKET_SEVERITIES,
  formatHelpTimestamp,
  type SupportTicket,
  type TicketCategory,
  type TicketSeverity,
} from "@/lib/help";
import { cn } from "@/lib/utils";

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

const TICKET_DEFAULT_PAGE_SIZE = 10;

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
              <p className={cn(CARD_BODY_CLASS, "mt-2")}>{description}</p>
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

function CriticalEscalationBanner() {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-lg border border-neutral-900/15 bg-neutral-50 px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <ShieldAlert
            className="size-4 shrink-0 text-neutral-900"
            aria-hidden
          />
          <p className="m-0 text-sm font-medium text-neutral-900">
            Critical severity — escalate before submitting
          </p>
        </div>
        <p className="m-0 mt-1.5 text-sm leading-snug text-neutral-600">
          Preserve session diagnostics and report IDs. Contact the on-call
          compliance officer (Naomi Park · +1 (212) 555-0148) before altering
          production data or running destructive remediations.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-9! min-h-9! shrink-0 rounded-md px-3 text-sm"
        onClick={() =>
          toast.message("Escalation hotline", {
            description: "+1 (212) 555-0148 · on-call until 08:00 UTC",
          })
        }
      >
        <Phone className="size-4" aria-hidden />
        Call on-call
      </Button>
    </div>
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

        {severity === "Critical" ? <CriticalEscalationBanner /> : null}

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

  const totalCount = HELP_SUPPORT_TICKETS.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return HELP_SUPPORT_TICKETS.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

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
                <TableCell className="h-12 px-4 py-0 font-mono">
                  {ticket.id}
                </TableCell>
                <TableCell className="h-12 max-w-0 px-4 py-0">
                  <span className="block truncate">{ticket.subject}</span>
                </TableCell>
                <TableCell className="h-12 px-4 py-0">
                  {ticket.severity}
                </TableCell>
                <TableCell className="h-12 px-4 py-0">
                  <Badge variant={ticketStatusBadgeVariant(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell className="h-12 max-w-0 px-4 py-0">
                  <span className="block truncate">{ticket.assignee}</span>
                </TableCell>
                <TableCell className="h-12 px-4 py-0">{ticket.sla}</TableCell>
                <TableCell className="h-12 px-4 py-0 font-mono tabular-nums">
                  {formatHelpTimestamp(ticket.openedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePaginationBar
        className="min-w-[44rem]"
        pageRowsCount={pageRows.length}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        paginationLabel="Active tickets pagination"
      />
    </CardShell>
  );
}

export default function HelpWorkspace() {
  return (
    <div className={cn("flex w-full flex-col", DASHBOARD_GAP_CLASS)}>
      <TicketForm />
      <ActiveTicketsTable />
    </div>
  );
}
