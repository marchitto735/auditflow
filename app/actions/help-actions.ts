"use server";

import {
  TICKET_CATEGORIES,
  TICKET_SEVERITIES,
  type TicketCategory,
  type TicketSeverity,
} from "@/lib/help";

export type SubmitSupportTicketInput = {
  subject: string;
  severity: string;
  category: string;
  description: string;
  attachSessionLog: boolean;
};

export type SubmitSupportTicketResult = {
  ok: boolean;
  message: string;
  ticketId?: string;
};

function isSeverity(value: string): value is TicketSeverity {
  return (TICKET_SEVERITIES as readonly string[]).includes(value);
}

function isCategory(value: string): value is TicketCategory {
  return (TICKET_CATEGORIES as readonly string[]).includes(value);
}

export async function submitSupportTicket(
  input: SubmitSupportTicketInput,
): Promise<SubmitSupportTicketResult> {
  const subject = input.subject.trim();
  const description = input.description.trim();

  if (!subject) {
    return { ok: false, message: "Subject is required." };
  }
  if (!isSeverity(input.severity)) {
    return { ok: false, message: "Select a valid severity." };
  }
  if (!isCategory(input.category)) {
    return { ok: false, message: "Select a valid category." };
  }
  if (description.length < 12) {
    return {
      ok: false,
      message: "Add a short description (at least 12 characters).",
    };
  }

  const ticketId = `TKT-${String(1000 + Math.floor(Math.random() * 900)).padStart(4, "0")}`;

  return {
    ok: true,
    ticketId,
    message: input.attachSessionLog
      ? `Ticket ${ticketId} opened with session diagnostics attached.`
      : `Ticket ${ticketId} opened. Our team will respond within the SLA window.`,
  };
}
