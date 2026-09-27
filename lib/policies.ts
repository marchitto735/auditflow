export const POLICY_DOC_TYPES = ["SOP", "BPR", "FIR"] as const;
export type PolicyDocType = (typeof POLICY_DOC_TYPES)[number];

export const POLICY_STATUSES = [
  "Active",
  "Ready",
  "Draft",
  "Pending",
] as const;
export type PolicyStatus = (typeof POLICY_STATUSES)[number];

export const POLICY_FRAMEWORKS = [
  "21 CFR Part 11",
  "ISO 9001",
  "ISO 13485",
  "ICH Q7",
] as const;
export type PolicyFramework = (typeof POLICY_FRAMEWORKS)[number];

export type PolicyClause = {
  id: string;
  title: string;
  excerpt: string;
  confidence: number;
  verified: boolean;
};

export type MasterPolicy = {
  id: string;
  title: string;
  documentId: string;
  type: PolicyDocType;
  version: string;
  status: PolicyStatus;
  lastParsedAt: string;
  chunkCount: number;
  frameworks: PolicyFramework[];
  n8nStatus: "Synced" | "Queued" | "Failed" | "Idle";
  clauses: PolicyClause[];
};

export type PolicyFilters = {
  search: string;
  type: "all" | PolicyDocType;
  status: "all" | PolicyStatus;
  version: "all" | string;
};

export function formatPolicyTimestamp(value: string) {
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

export function filterMasterPolicies(
  policies: MasterPolicy[],
  filters: PolicyFilters,
): MasterPolicy[] {
  const query = filters.search.trim().toLowerCase();
  return policies.filter((policy) => {
    if (filters.type !== "all" && policy.type !== filters.type) return false;
    if (filters.status !== "all" && policy.status !== filters.status)
      return false;
    if (filters.version !== "all" && policy.version !== filters.version)
      return false;
    if (!query) return true;
    const haystack = [
      policy.title,
      policy.documentId,
      policy.type,
      policy.version,
      ...policy.frameworks,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function uniquePolicyVersions(policies: MasterPolicy[]) {
  return Array.from(new Set(policies.map((policy) => policy.version))).sort(
    (a, b) => b.localeCompare(a, undefined, { numeric: true }),
  );
}

function clauses(
  prefix: string,
  titles: string[],
): PolicyClause[] {
  return titles.map((title, index) => ({
    id: `${prefix}-c${index + 1}`,
    title,
    excerpt: `Extracted requirement covering ${title.toLowerCase()} with automated n8n clause segmentation.`,
    confidence: 86 + ((index * 3) % 12),
    verified: index % 3 !== 2,
  }));
}

export const DEMO_MASTER_POLICIES: MasterPolicy[] = [
  {
    id: "pol-001",
    title: "Document Control & Change Management",
    documentId: "SOP-1001-Rev7",
    type: "SOP",
    version: "7.0",
    status: "Active",
    lastParsedAt: "2026-09-26T15:12:00.000Z",
    chunkCount: 148,
    frameworks: ["21 CFR Part 11", "ISO 9001"],
    n8nStatus: "Synced",
    clauses: clauses("pol-001", [
      "Document numbering scheme",
      "Change control approval matrix",
      "Obsolete document quarantine",
      "Electronic signature linkage",
    ]),
  },
  {
    id: "pol-002",
    title: "Batch Record Review Procedure",
    documentId: "BPR-2204-Rev3",
    type: "BPR",
    version: "3.2",
    status: "Ready",
    lastParsedAt: "2026-09-25T20:44:00.000Z",
    chunkCount: 96,
    frameworks: ["ICH Q7", "21 CFR Part 11"],
    n8nStatus: "Synced",
    clauses: clauses("pol-002", [
      "In-process checkpoints",
      "Deviation capture fields",
      "QA disposition criteria",
    ]),
  },
  {
    id: "pol-003",
    title: "Facility Hygiene Inspection Checklist",
    documentId: "FIR-8840-Rev2",
    type: "FIR",
    version: "2.1",
    status: "Pending",
    lastParsedAt: "2026-09-24T11:08:00.000Z",
    chunkCount: 64,
    frameworks: ["ISO 13485"],
    n8nStatus: "Queued",
    clauses: clauses("pol-003", [
      "Zone classification mapping",
      "Cleaning verification evidence",
      "Photo attachment requirements",
    ]),
  },
  {
    id: "pol-004",
    title: "Electronic Signature Authority Matrix",
    documentId: "SOP-4410-Rev5",
    type: "SOP",
    version: "5.0",
    status: "Active",
    lastParsedAt: "2026-09-23T09:30:00.000Z",
    chunkCount: 112,
    frameworks: ["21 CFR Part 11"],
    n8nStatus: "Synced",
    clauses: clauses("pol-004", [
      "Role-to-signature binding",
      "Re-authentication triggers",
      "Audit trail retention",
    ]),
  },
  {
    id: "pol-005",
    title: "Raw Material Release Criteria",
    documentId: "BPR-1102-Rev1",
    type: "BPR",
    version: "1.4",
    status: "Draft",
    lastParsedAt: "2026-09-21T16:55:00.000Z",
    chunkCount: 41,
    frameworks: ["ISO 9001", "ICH Q7"],
    n8nStatus: "Idle",
    clauses: clauses("pol-005", [
      "COA verification steps",
      "Quarantine hold rules",
    ]),
  },
  {
    id: "pol-006",
    title: "Cleanroom Gowning & Access Control",
    documentId: "FIR-3301-Rev4",
    type: "FIR",
    version: "4.0",
    status: "Active",
    lastParsedAt: "2026-09-20T13:22:00.000Z",
    chunkCount: 78,
    frameworks: ["ISO 13485", "21 CFR Part 11"],
    n8nStatus: "Synced",
    clauses: clauses("pol-006", [
      "Gowning sequence checklist",
      "Access badge validation",
      "Contamination event response",
    ]),
  },
  {
    id: "pol-007",
    title: "Complaint Handling & CAPA Intake",
    documentId: "SOP-7720-Rev2",
    type: "SOP",
    version: "2.3",
    status: "Ready",
    lastParsedAt: "2026-09-19T08:10:00.000Z",
    chunkCount: 133,
    frameworks: ["ISO 9001", "ISO 13485"],
    n8nStatus: "Synced",
    clauses: clauses("pol-007", [
      "Intake triage SLA",
      "CAPA linkage fields",
      "Customer notification windows",
    ]),
  },
  {
    id: "pol-008",
    title: "Packaging Line Clearance Protocol",
    documentId: "BPR-5509-Rev6",
    type: "BPR",
    version: "6.1",
    status: "Pending",
    lastParsedAt: "2026-09-18T22:01:00.000Z",
    chunkCount: 57,
    frameworks: ["ICH Q7"],
    n8nStatus: "Failed",
    clauses: clauses("pol-008", [
      "Line clearance evidence photos",
      "Label reconciliation",
    ]),
  },
  {
    id: "pol-009",
    title: "Environmental Monitoring Rounds",
    documentId: "FIR-9912-Rev1",
    type: "FIR",
    version: "1.0",
    status: "Draft",
    lastParsedAt: "2026-09-15T10:45:00.000Z",
    chunkCount: 29,
    frameworks: ["ISO 13485"],
    n8nStatus: "Idle",
    clauses: clauses("pol-009", [
      "Sample location map",
      "Alert / action limits",
    ]),
  },
  {
    id: "pol-010",
    title: "Training Records & Competency",
    documentId: "SOP-2055-Rev9",
    type: "SOP",
    version: "9.0",
    status: "Active",
    lastParsedAt: "2026-09-26T07:18:00.000Z",
    chunkCount: 161,
    frameworks: ["21 CFR Part 11", "ISO 9001"],
    n8nStatus: "Synced",
    clauses: clauses("pol-010", [
      "Role-based curriculum",
      "Effectiveness checks",
      "Electronic training attestation",
    ]),
  },
  {
    id: "pol-011",
    title: "Equipment Qualification Summary",
    documentId: "BPR-7800-Rev2",
    type: "BPR",
    version: "2.0",
    status: "Ready",
    lastParsedAt: "2026-09-14T19:27:00.000Z",
    chunkCount: 88,
    frameworks: ["ICH Q7", "ISO 9001"],
    n8nStatus: "Synced",
    clauses: clauses("pol-011", [
      "IQ / OQ / PQ evidence pack",
      "Change impact assessment",
    ]),
  },
  {
    id: "pol-012",
    title: "Warehouse Pest Control Log",
    documentId: "FIR-1208-Rev3",
    type: "FIR",
    version: "3.0",
    status: "Active",
    lastParsedAt: "2026-09-13T12:00:00.000Z",
    chunkCount: 52,
    frameworks: ["ISO 9001"],
    n8nStatus: "Synced",
    clauses: clauses("pol-012", [
      "Trap inspection cadence",
      "Escalation thresholds",
    ]),
  },
];
