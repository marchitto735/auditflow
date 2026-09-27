export const FRAMEWORK_VERSIONS = [
  "2024",
  "2015",
  "Type II",
  "Current",
] as const;

export const MAPPING_STATUSES = [
  "Fully Mapped",
  "Partial Gap",
  "Under Review",
] as const;

export type MappingStatus = (typeof MAPPING_STATUSES)[number];

export type FrameworkOverview = {
  id: string;
  name: string;
  shortName: string;
  version: string;
  totalClauses: number;
  mappedPolicies: number;
  coveragePercent: number;
  status: MappingStatus;
};

export type FrameworkClauseRow = {
  id: string;
  frameworkId: string;
  frameworkName: string;
  article: string;
  description: string;
  mappedSop: string;
  status: MappingStatus;
  lastVerifiedAt: string;
};

export type FrameworkFilters = {
  search: string;
  frameworkId: "all" | string;
  version: "all" | string;
  status: "all" | MappingStatus;
};

export const DEMO_FRAMEWORK_OVERVIEWS: FrameworkOverview[] = [
  {
    id: "fw-cfr11",
    name: "21 CFR Part 11",
    shortName: "CFR Part 11",
    version: "Current",
    totalClauses: 42,
    mappedPolicies: 38,
    coveragePercent: 90,
    status: "Fully Mapped",
  },
  {
    id: "fw-iso9001",
    name: "ISO 9001:2015",
    shortName: "ISO 9001",
    version: "2015",
    totalClauses: 56,
    mappedPolicies: 41,
    coveragePercent: 73,
    status: "Partial Gap",
  },
  {
    id: "fw-soc2",
    name: "SOC 2 Type II",
    shortName: "SOC 2",
    version: "Type II",
    totalClauses: 64,
    mappedPolicies: 48,
    coveragePercent: 75,
    status: "Under Review",
  },
  {
    id: "fw-iso13485",
    name: "ISO 13485:2016",
    shortName: "ISO 13485",
    version: "2016",
    totalClauses: 51,
    mappedPolicies: 44,
    coveragePercent: 86,
    status: "Fully Mapped",
  },
];

export const DEMO_FRAMEWORK_CLAUSES: FrameworkClauseRow[] = [
  {
    id: "cl-001",
    frameworkId: "fw-cfr11",
    frameworkName: "21 CFR Part 11",
    article: "§11.10(a)",
    description: "Validation of systems to ensure accuracy, reliability, and consistent intended performance.",
    mappedSop: "SOP-1001 Document Control",
    status: "Fully Mapped",
    lastVerifiedAt: "2026-09-26T10:00:00.000Z",
  },
  {
    id: "cl-002",
    frameworkId: "fw-cfr11",
    frameworkName: "21 CFR Part 11",
    article: "§11.10(e)",
    description: "Use of secure, computer-generated, time-stamped audit trails.",
    mappedSop: "SOP-4410 Electronic Signatures",
    status: "Fully Mapped",
    lastVerifiedAt: "2026-09-25T16:20:00.000Z",
  },
  {
    id: "cl-003",
    frameworkId: "fw-cfr11",
    frameworkName: "21 CFR Part 11",
    article: "§11.50",
    description: "Signature manifestations linked to respective electronic records.",
    mappedSop: "SOP-4410 Electronic Signatures",
    status: "Under Review",
    lastVerifiedAt: "2026-09-24T09:12:00.000Z",
  },
  {
    id: "cl-004",
    frameworkId: "fw-iso9001",
    frameworkName: "ISO 9001:2015",
    article: "7.5.3",
    description: "Control of documented information — distribution, access, retrieval, and use.",
    mappedSop: "SOP-1001 Document Control",
    status: "Fully Mapped",
    lastVerifiedAt: "2026-09-23T14:40:00.000Z",
  },
  {
    id: "cl-005",
    frameworkId: "fw-iso9001",
    frameworkName: "ISO 9001:2015",
    article: "8.5.1",
    description: "Control of production and service provision.",
    mappedSop: "BPR-2204 Batch Record Review",
    status: "Partial Gap",
    lastVerifiedAt: "2026-09-22T11:05:00.000Z",
  },
  {
    id: "cl-006",
    frameworkId: "fw-iso9001",
    frameworkName: "ISO 9001:2015",
    article: "10.2",
    description: "Nonconformity and corrective action.",
    mappedSop: "SOP-7720 Complaint Handling",
    status: "Partial Gap",
    lastVerifiedAt: "2026-09-21T08:30:00.000Z",
  },
  {
    id: "cl-007",
    frameworkId: "fw-soc2",
    frameworkName: "SOC 2 Type II",
    article: "CC6.1",
    description: "Logical and physical access controls restrict access to protected information.",
    mappedSop: "FIR-3301 Cleanroom Access",
    status: "Under Review",
    lastVerifiedAt: "2026-09-20T17:55:00.000Z",
  },
  {
    id: "cl-008",
    frameworkId: "fw-soc2",
    frameworkName: "SOC 2 Type II",
    article: "CC7.2",
    description: "System monitoring to detect anomalies and security events.",
    mappedSop: "— Unmapped —",
    status: "Partial Gap",
    lastVerifiedAt: "2026-09-19T12:00:00.000Z",
  },
  {
    id: "cl-009",
    frameworkId: "fw-iso13485",
    frameworkName: "ISO 13485:2016",
    article: "7.5.1",
    description: "Control of production and service provision for medical devices.",
    mappedSop: "BPR-5509 Packaging Clearance",
    status: "Fully Mapped",
    lastVerifiedAt: "2026-09-18T15:22:00.000Z",
  },
  {
    id: "cl-010",
    frameworkId: "fw-iso13485",
    frameworkName: "ISO 13485:2016",
    article: "8.2.2",
    description: "Complaint handling.",
    mappedSop: "SOP-7720 Complaint Handling",
    status: "Fully Mapped",
    lastVerifiedAt: "2026-09-17T09:48:00.000Z",
  },
  {
    id: "cl-011",
    frameworkId: "fw-cfr11",
    frameworkName: "21 CFR Part 11",
    article: "§11.100",
    description: "General requirements for electronic signatures uniqueness and verification.",
    mappedSop: "SOP-4410 Electronic Signatures",
    status: "Fully Mapped",
    lastVerifiedAt: "2026-09-16T13:10:00.000Z",
  },
  {
    id: "cl-012",
    frameworkId: "fw-soc2",
    frameworkName: "SOC 2 Type II",
    article: "A1.2",
    description: "Environmental protections against environmental threats.",
    mappedSop: "FIR-9912 Environmental Monitoring",
    status: "Under Review",
    lastVerifiedAt: "2026-09-15T10:00:00.000Z",
  },
];

export function formatFrameworkTimestamp(value: string) {
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

export function filterFrameworkClauses(
  rows: FrameworkClauseRow[],
  filters: FrameworkFilters,
): FrameworkClauseRow[] {
  const query = filters.search.trim().toLowerCase();
  return rows.filter((row) => {
    if (filters.frameworkId !== "all" && row.frameworkId !== filters.frameworkId)
      return false;
    if (filters.status !== "all" && row.status !== filters.status) return false;
    if (filters.version !== "all") {
      const overview = DEMO_FRAMEWORK_OVERVIEWS.find(
        (fw) => fw.id === row.frameworkId,
      );
      if (!overview || overview.version !== filters.version) return false;
    }
    if (!query) return true;
    const haystack = [
      row.article,
      row.description,
      row.mappedSop,
      row.frameworkName,
      row.status,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
