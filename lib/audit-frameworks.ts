import type { GmpClause } from "@/lib/gmp-clauses";
import { GMP_CLAUSES } from "@/lib/gmp-clauses";

export type AuditFramework = {
  value: string;
  label: string;
  /** Extra search tokens (standard numbers, aliases). */
  keywords: string[];
  /**
   * Returns true when a master clause belongs to this framework.
   * Uses section / description signals from the NSF GMP corpus.
   */
  matches: (clause: GmpClause) => boolean;
};

function sectionIncludes(clause: GmpClause, needles: string[]) {
  const section = clause.section.toLowerCase();
  return needles.some((needle) => section.includes(needle.toLowerCase()));
}

function textIncludes(clause: GmpClause, needles: string[]) {
  const haystack = `${clause.description} ${clause.section} ${clause.shortName}`.toLowerCase();
  return needles.some((needle) => haystack.includes(needle.toLowerCase()));
}

export const AUDIT_FRAMEWORKS: AuditFramework[] = [
  {
    value: "iso-9001-2015",
    label: "ISO 9001: 2015 (Standard)",
    keywords: ["iso", "9001", "2015", "qms", "quality"],
    matches: (clause) =>
      sectionIncludes(clause, [
        "Quality Management",
        "Corrective and Preventive",
        "Supplier Qualification",
        "Administration and Regulatory",
        "GMP Certification",
      ]) || textIncludes(clause, ["quality", "management review", "capa"]),
  },
  {
    value: "iso-13485-2016",
    label: "ISO 13485: 2016",
    keywords: ["iso", "13485", "2016", "medical", "device"],
    matches: (clause) =>
      sectionIncludes(clause, [
        "Quality Management",
        "Corrective and Preventive",
        "Supplier Qualification",
        "Laboratory Controls",
        "Production and Process Controls",
      ]) || textIncludes(clause, ["device", "steril", "validation", "design"]),
  },
  {
    value: "fda-21-cfr-11",
    label: "FDA 21 CFR Part 11",
    keywords: ["fda", "21", "cfr", "part 11", "electronic", "records"],
    matches: (clause) =>
          textIncludes(clause, [
        "21cfr11",
        "21 cfr 11",
        "electronic",
        "computer system",
        "audit trail",
        "electronic signature",
      ]),
  },
  {
    value: "fda-21-cfr-820",
    label: "FDA 21 CFR Part 820",
    keywords: ["fda", "21", "cfr", "part 820", "qsr", "device"],
    matches: (clause) =>
      sectionIncludes(clause, [
        "Production and Process Controls",
        "Laboratory Controls",
        "Corrective and Preventive",
        "Quality Management",
        "Warehouse and Distribution",
      ]) || textIncludes(clause, ["820", "device", "production", "process control"]),
  },
  {
    value: "eu-gmp-annex-1",
    label: "EU GMP Annex 1",
    keywords: ["eu", "gmp", "annex 1", "sterile", "cleanroom"],
    matches: (clause) =>
      sectionIncludes(clause, [
        "Facilities",
        "Product Safety",
        "Production and Process Controls",
        "Laboratory Controls",
      ]) ||
      textIncludes(clause, [
        "steril",
        "clean",
        "contamination",
        "environmental",
        "air",
        "hygien",
      ]),
  },
  {
    value: "ich-q10",
    label: "ICH Q10",
    keywords: ["ich", "q10", "pharmaceutical", "quality system"],
    matches: (clause) =>
      sectionIncludes(clause, [
        "Quality Management",
        "Corrective and Preventive",
        "Supplier Qualification",
        "GMP Certification",
      ]) || textIncludes(clause, ["pharmaceutical", "product quality", "lifecycle"]),
  },
  {
    value: "nist-sp-800-53",
    label: "NIST SP 800-53",
    keywords: ["nist", "800-53", "800 53", "security", "controls"],
    matches: (clause) =>
      sectionIncludes(clause, [
        "Administration and Regulatory",
        "Quality Management",
      ]) ||
      textIncludes(clause, [
        "electronic",
        "computer",
        "access",
        "security",
        "record",
        "21cfr11",
        "data",
      ]),
  },
  {
    value: "soc-2-type-ii",
    label: "SOC 2 Type II",
    keywords: ["soc", "soc2", "type ii", "trust", "security"],
    matches: (clause) =>
      sectionIncludes(clause, [
        "Administration and Regulatory",
        "Quality Management",
        "Corrective and Preventive",
        "Supplier Qualification",
      ]) ||
      textIncludes(clause, [
        "security",
        "access",
        "electronic",
        "record",
        "complaint",
        "vendor",
        "supplier",
      ]),
  },
];

export function getAuditFramework(value: string | null | undefined) {
  if (!value) return undefined;
  return AUDIT_FRAMEWORKS.find((framework) => framework.value === value);
}

export function getClausesForFramework(frameworkValue: string): GmpClause[] {
  const framework = getAuditFramework(frameworkValue);
  if (!framework) return GMP_CLAUSES;
  const matched = GMP_CLAUSES.filter((clause) => framework.matches(clause));
  // Fallback so the checklist never goes empty for sparse keyword matches.
  return matched.length > 0 ? matched : GMP_CLAUSES;
}

export function frameworkSearchValue(framework: AuditFramework) {
  return framework.label;
}

export function frameworkSearchKeywords(framework: AuditFramework) {
  return [framework.value, ...framework.keywords];
}
