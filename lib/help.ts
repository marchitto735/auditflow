export const TICKET_SEVERITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
] as const;

export type TicketSeverity = (typeof TICKET_SEVERITIES)[number];

export const TICKET_CATEGORIES = [
  "Audit pipeline",
  "Ingestion / n8n",
  "Access & MFA",
  "Reports & analytics",
  "Other",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_STATUSES = [
  "Open",
  "In progress",
  "Waiting",
  "Resolved",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export type SystemServiceStatus = {
  id: string;
  label: string;
  status: "Operational" | "Degraded" | "Outage";
  detail: string;
};

export type DiagnosticMeta = {
  label: string;
  value: string;
};

export type KnowledgeArticle = {
  id: string;
  title: string;
  summary: string;
  category: string;
  href: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  severity: TicketSeverity;
  category: TicketCategory;
  status: TicketStatus;
  assignee: string;
  sla: string;
  openedAt: string;
};

export const HELP_SYSTEM_STATUS: SystemServiceStatus[] = [
  {
    id: "supabase",
    label: "Database sync",
    status: "Operational",
    detail: "Supabase primary · us-east-1",
  },
  {
    id: "n8n",
    label: "n8n pipelines",
    status: "Operational",
    detail: "SOP / BPR / FIR webhooks healthy",
  },
  {
    id: "openai",
    label: "OpenAI gateway",
    status: "Operational",
    detail: "Embeddings + gap analysis ready",
  },
];

export const HELP_DIAGNOSTICS: DiagnosticMeta[] = [
  { label: "Tenant", value: "ws_auditflow_prod" },
  { label: "Environment", value: "production" },
  { label: "Region", value: "us-east-1" },
  { label: "Build", value: "auditflow@2026.09.26" },
];

export const HELP_KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "kb-cfr11",
    title: "21 CFR Part 11 — Electronic records",
    summary:
      "Controls for electronic signatures, audit trails, and system validation in regulated workflows.",
    category: "Regulation",
    href: "#cfr-part-11",
  },
  {
    id: "kb-iso",
    title: "ISO 13485 / ISO 9001 mapping",
    summary:
      "How AuditFlow clause packs align to quality management system frameworks.",
    category: "Framework",
    href: "#iso-frameworks",
  },
  {
    id: "kb-ingest",
    title: "Automated ingestion playbook",
    summary:
      "n8n webhook setup, chunking strategy, and retry policy for SOP / BPR / FIR uploads.",
    category: "Pipeline",
    href: "#ingestion-playbook",
  },
  {
    id: "kb-mfa",
    title: "MFA enrollment for auditors",
    summary:
      "Step-by-step enrollment and recovery for organization-wide MFA enforcement.",
    category: "Security",
    href: "#mfa-enrollment",
  },
  {
    id: "kb-remediation",
    title: "Remediation workspace guide",
    summary:
      "Flagging non-compliant findings, exporting certified SOPs, and closing gaps.",
    category: "Product",
    href: "#remediation",
  },
  {
    id: "kb-roles",
    title: "RBAC role matrix",
    summary:
      "Permissions for Compliance administrator, Lead auditor, Auditor, and Viewer.",
    category: "Access",
    href: "#rbac",
  },
];

export const HELP_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "TKT-1042",
    subject: "FIR image ingest timeout on large scans",
    severity: "High",
    category: "Ingestion / n8n",
    status: "In progress",
    assignee: "Priya Shah",
    sla: "4h remaining",
    openedAt: "2026-09-26T14:20:00.000Z",
  },
  {
    id: "TKT-1038",
    subject: "MFA reset for suspended contractor account",
    severity: "Medium",
    category: "Access & MFA",
    status: "Waiting",
    assignee: "Marcus Chen",
    sla: "1d remaining",
    openedAt: "2026-09-25T18:05:00.000Z",
  },
  {
    id: "TKT-1031",
    subject: "Score analysis export missing severity column",
    severity: "Low",
    category: "Reports & analytics",
    status: "Open",
    assignee: "Unassigned",
    sla: "3d remaining",
    openedAt: "2026-09-24T11:40:00.000Z",
  },
  {
    id: "TKT-1024",
    subject: "Critical: SOP run failed mid-pipeline",
    severity: "Critical",
    category: "Audit pipeline",
    status: "Resolved",
    assignee: "Naomi Park",
    sla: "Met",
    openedAt: "2026-09-22T09:15:00.000Z",
  },
];

export function formatHelpTimestamp(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(parsed));
}

export function filterKnowledgeArticles(
  articles: KnowledgeArticle[],
  query: string,
) {
  const q = query.trim().toLowerCase();
  if (!q) return articles;
  return articles.filter(
    (article) =>
      article.title.toLowerCase().includes(q) ||
      article.summary.toLowerCase().includes(q) ||
      article.category.toLowerCase().includes(q),
  );
}
