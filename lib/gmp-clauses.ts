import auditClauses from "@/lib/audit-clauses.json";

export type GmpClause = {
  id: string;
  label: string;
  shortName: string;
  section: string;
  description: string;
};

export const GMP_CLAUSES: GmpClause[] = auditClauses;

export function getGmpClause(id: string | null | undefined) {
  if (!id) return undefined;
  return GMP_CLAUSES.find((clause) => clause.id === id);
}

export function clauseSearchValue(clause: GmpClause) {
  return clause.label;
}

export function clauseSearchKeywords(clause: GmpClause) {
  return [clause.id, clause.shortName, clause.section, clause.description];
}

/** Rank matches for cmdk: all words must appear; number/label hits rank higher. */
export function clauseSearchFilter(
  value: string,
  search: string,
  keywords?: string[],
) {
  const query = search.trim().toLowerCase();
  if (!query) return 1;

  const haystack = [value, ...(keywords ?? [])].join(" ").toLowerCase();
  const words = query.split(/\s+/).filter(Boolean);
  if (!words.every((word) => haystack.includes(word))) return 0;

  const first = words[0] ?? "";
  if (
    value.toLowerCase() === `clause ${first}` ||
    value.toLowerCase().startsWith(`clause ${first}`)
  ) {
    return 1;
  }
  return 0.5;
}
