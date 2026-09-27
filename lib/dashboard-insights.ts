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

export type DepartmentScoreRow = {
  id: string;
  department: string;
  audits: number;
  avgScore: number;
  delta: string;
  belowGmp: number;
  status: "On Track" | "Watch" | "At Risk";
};

/** Department-level distribution for Compliance Analytics deep-dive. */
export const DEPARTMENT_SCORES: DepartmentScoreRow[] = [
  {
    id: "dept-qa",
    department: "Quality Assurance",
    audits: 38,
    avgScore: 91,
    delta: "+2.1",
    belowGmp: 2,
    status: "On Track",
  },
  {
    id: "dept-mfg",
    department: "Manufacturing",
    audits: 52,
    avgScore: 86,
    delta: "+0.8",
    belowGmp: 5,
    status: "On Track",
  },
  {
    id: "dept-pkg",
    department: "Packaging",
    audits: 24,
    avgScore: 83,
    delta: "-1.4",
    belowGmp: 4,
    status: "Watch",
  },
  {
    id: "dept-lab",
    department: "QC Laboratory",
    audits: 18,
    avgScore: 89,
    delta: "+1.0",
    belowGmp: 1,
    status: "On Track",
  },
  {
    id: "dept-wh",
    department: "Warehouse",
    audits: 10,
    avgScore: 78,
    delta: "-3.2",
    belowGmp: 3,
    status: "At Risk",
  },
];

export type VarianceLogRow = {
  id: string;
  date: string;
  signal: string;
  domain: string;
  variance: string;
  severity: "Critical" | "High" | "Medium" | "Low";
};

/** Historical variance / anomaly signals for Compliance Analytics. */
export const VARIANCE_LOG: VarianceLogRow[] = [
  {
    id: "var-1",
    date: "Sep 22, 2026",
    signal: "Batch yield variance exceeded 2σ on BPR-204",
    domain: "Batch Record Integrity",
    variance: "-4.8 pts",
    severity: "High",
  },
  {
    id: "var-2",
    date: "Sep 18, 2026",
    signal: "Part 11 audit trail gap on SOP-QA-001 revision",
    domain: "Data Integrity (Part 11)",
    variance: "-6.1 pts",
    severity: "Critical",
  },
  {
    id: "var-3",
    date: "Sep 12, 2026",
    signal: "Facility sanitation score rebound after CAPA close",
    domain: "Facility Sanitation",
    variance: "+3.4 pts",
    severity: "Low",
  },
  {
    id: "var-4",
    date: "Sep 5, 2026",
    signal: "Training effectiveness dip in Packaging cohort",
    domain: "Training Effectiveness",
    variance: "-2.2 pts",
    severity: "Medium",
  },
  {
    id: "var-5",
    date: "Aug 28, 2026",
    signal: "SOP coverage lag vs scheduled policy cycle",
    domain: "Standard Operating Procedure",
    variance: "-1.7 pts",
    severity: "Medium",
  },
  {
    id: "var-6",
    date: "Aug 21, 2026",
    signal: "Warehouse temperature excursion trend week-over-week",
    domain: "Facility Sanitation",
    variance: "-2.9 pts",
    severity: "High",
  },
  {
    id: "var-7",
    date: "Aug 14, 2026",
    signal: "Label reconciliation cycle time above target",
    domain: "Batch Record Integrity",
    variance: "-1.1 pts",
    severity: "Low",
  },
  {
    id: "var-8",
    date: "Aug 7, 2026",
    signal: "QC lab OOS rate spike on assay suite B",
    domain: "Data Integrity (Part 11)",
    variance: "-3.6 pts",
    severity: "Critical",
  },
];
