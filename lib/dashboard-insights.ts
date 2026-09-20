export type AuditLogRow = {
  id: string;
  document: string;
  type: "SOP" | "BPR" | "FIR";
  date: string;
  score: number;
  auditor: string;
  status: "Compliant" | "Partial" | "Critical";
};

export type FindingSeverity = "Critical" | "High" | "Medium" | "Low";
export type FindingStatus = "Open" | "In Remediation" | "Pending Verification";

export type FindingRow = {
  id: string;
  title: string;
  document: string;
  severity: FindingSeverity;
  citation: string;
  owner: string;
  status: FindingStatus;
};

export const AUDIT_LOG: AuditLogRow[] = [
  {
    id: "al-1",
    document: "SOP-QA-001 Cleaning",
    type: "SOP",
    date: "Sep 14, 2026",
    score: 92,
    auditor: "J. Alvarez",
    status: "Partial",
  },
  {
    id: "al-2",
    document: "BPR-LOT-88421",
    type: "BPR",
    date: "Sep 13, 2026",
    score: 100,
    auditor: "M. Chen",
    status: "Compliant",
  },
  {
    id: "al-3",
    document: "FIR-2024-019",
    type: "FIR",
    date: "Mar 12, 2026",
    score: 61,
    auditor: "R. Patel",
    status: "Critical",
  },
  {
    id: "al-4",
    document: "SOP-QA-014 Labeling",
    type: "SOP",
    date: "Mar 11, 2026",
    score: 88,
    auditor: "J. Alvarez",
    status: "Partial",
  },
  {
    id: "al-5",
    document: "BPR-LOT-88418",
    type: "BPR",
    date: "Mar 10, 2026",
    score: 96,
    auditor: "S. Okonkwo",
    status: "Compliant",
  },
  {
    id: "al-6",
    document: "FIR-2024-018",
    type: "FIR",
    date: "Mar 9, 2026",
    score: 74,
    auditor: "R. Patel",
    status: "Partial",
  },
  {
    id: "al-7",
    document: "SOP-PR-022 Weighing",
    type: "SOP",
    date: "Mar 8, 2026",
    score: 100,
    auditor: "M. Chen",
    status: "Compliant",
  },
  {
    id: "al-8",
    document: "BPR-LOT-88391",
    type: "BPR",
    date: "Mar 7, 2026",
    score: 81,
    auditor: "S. Okonkwo",
    status: "Partial",
  },
  {
    id: "al-9",
    document: "FIR-2024-017",
    type: "FIR",
    date: "Mar 6, 2026",
    score: 55,
    auditor: "J. Alvarez",
    status: "Critical",
  },
  {
    id: "al-10",
    document: "SOP-QA-008 Deviation",
    type: "SOP",
    date: "Mar 5, 2026",
    score: 90,
    auditor: "M. Chen",
    status: "Compliant",
  },
  {
    id: "al-11",
    document: "BPR-LOT-88370",
    type: "BPR",
    date: "Mar 4, 2026",
    score: 99,
    auditor: "R. Patel",
    status: "Compliant",
  },
  {
    id: "al-12",
    document: "SOP-TR-003 Training",
    type: "SOP",
    date: "Mar 2, 2026",
    score: 84,
    auditor: "S. Okonkwo",
    status: "Partial",
  },
];

export const OPEN_FINDINGS: FindingRow[] = [
  {
    id: "f-1",
    title: "Part 11 citation uses incorrect CFR title",
    document: "SOP-QA-001 Cleaning",
    severity: "High",
    citation: "21 CFR Part 11.10(b)",
    owner: "Unassigned",
    status: "Open",
  },
  {
    id: "f-2",
    title: "Missing prohibition on correction fluid",
    document: "SOP-QA-001 Cleaning",
    severity: "Medium",
    citation: "21 CFR 211.180(c)",
    owner: "Unassigned",
    status: "Open",
  },
  {
    id: "f-3",
    title: "Batch yield calculation not independently verified",
    document: "BPR-LOT-88391",
    severity: "Critical",
    citation: "21 CFR 211.103",
    owner: "M. Chen",
    status: "In Remediation",
  },
  {
    id: "f-4",
    title: "Gowning log gap in Grade C airlock",
    document: "FIR-2024-019",
    severity: "Critical",
    citation: "21 CFR 211.28(a)",
    owner: "R. Patel",
    status: "Open",
  },
  {
    id: "f-5",
    title: "Label reconciliation incomplete for lot 88418",
    document: "SOP-QA-014 Labeling",
    severity: "High",
    citation: "21 CFR 211.122(c)",
    owner: "J. Alvarez",
    status: "In Remediation",
  },
  {
    id: "f-6",
    title: "Training record lacks effectiveness check",
    document: "SOP-TR-003 Training",
    severity: "Medium",
    citation: "21 CFR 211.25(a)",
    owner: "S. Okonkwo",
    status: "Pending Verification",
  },
  {
    id: "f-7",
    title: "Equipment ID missing on weighing printout",
    document: "SOP-PR-022 Weighing",
    severity: "High",
    citation: "21 CFR 211.68(b)",
    owner: "Unassigned",
    status: "Open",
  },
  {
    id: "f-8",
    title: "Pest-control trend review overdue",
    document: "FIR-2024-018",
    severity: "Low",
    citation: "21 CFR 211.56(c)",
    owner: "R. Patel",
    status: "Pending Verification",
  },
];

export const SCORE_CATEGORIES = [
  { name: "Standard Operating Procedure", score: 94 },
  { name: "Batch Record Integrity", score: 82 },
  { name: "Facility Sanitation", score: 88 },
  { name: "Data Integrity (Part 11)", score: 79 },
  { name: "Training Effectiveness", score: 91 },
] as const;

export const GMP_THRESHOLD = 85;

export const SCORE_TRENDS = {
  30: [
    { label: "W1", score: 84 },
    { label: "W2", score: 85 },
    { label: "W3", score: 86 },
    { label: "W4", score: 88 },
  ],
  90: [
    { label: "Jun", score: 81 },
    { label: "Jul", score: 83 },
    { label: "Aug", score: 86 },
    { label: "Sep", score: 88 },
  ],
  365: [
    { label: "Q4", score: 78 },
    { label: "Q1", score: 82 },
    { label: "Q2", score: 85 },
    { label: "Q3", score: 88 },
  ],
} as const;
