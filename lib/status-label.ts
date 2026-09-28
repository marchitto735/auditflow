/**
 * Strict sentence case for status / lifecycle labels:
 * first character uppercase, remaining characters lowercase.
 * Preserves internal punctuation (hyphens, spaces).
 *
 * Examples: "Pending Verification" → "Pending verification", "Non-Compliant" → "Non-compliant"
 */
export function toSentenceCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Canonical display overrides for shortened status labels. */
const STATUS_DISPLAY_ALIASES: Record<string, string> = {
  "in remediation": "Remediation",
};

/** Display helper for status badges — empty → em dash. */
export function formatStatusLabel(status: string | null | undefined): string {
  const raw = (status ?? "").trim();
  if (!raw) return "—";
  const alias = STATUS_DISPLAY_ALIASES[raw.toLowerCase()];
  if (alias) return alias;
  return toSentenceCase(raw);
}

/** Known uppercase tokens preserved inside document / policy titles. */
const TITLE_ACRONYMS = new Set([
  "sop",
  "bpr",
  "fir",
  "capa",
  "hvac",
  "mfa",
  "rbac",
  "qa",
  "qc",
  "coa",
  "bms",
  "ipc",
  "em",
  "sla",
  "iq",
  "oq",
  "pq",
  "cfr",
  "iso",
  "oos",
  "gmp",
  "pdf",
  "docx",
  "xlsx",
  "csv",
  "api",
  "id",
  "fda",
  "ich",
  "soc",
  "n8n",
  "rev",
]);

function isProtectedTitleToken(token: string): boolean {
  if (!token) return true;
  // File extension (.pdf)
  if (/^\.[a-z0-9]+$/i.test(token)) return true;
  // Section / article refs (§11.10, 7.5.3)
  if (/^§/.test(token) || /^\d+(\.\d+)+$/.test(token)) return true;
  // Version tokens (v4.2, 7.0)
  if (/^v?\d+(\.\d+)+$/i.test(token)) return true;
  // System IDs / doc codes with digits (SOP-QA-001, BPR-LOT-88391, FIR-2024-019)
  if (/[A-Za-z]/.test(token) && /\d/.test(token) && /[-_/]/.test(token)) {
    return true;
  }
  // Bare all-caps acronyms (SOP, CAPA, HVAC)
  if (/^[A-Z]{2,6}$/.test(token)) return true;
  if (TITLE_ACRONYMS.has(token.toLowerCase())) return true;
  return false;
}

/**
 * Sentence-case document / policy / finding titles while preserving
 * system IDs, regulatory codes, file extensions, and acronyms.
 *
 * "Document Control & Change Management" → "Document control & change management"
 * "SOP-1042 · Document Control" → "SOP-1042 · Document control"
 * "BPR-LOT-88391" → "BPR-LOT-88391"
 */
export function toDocumentTitleCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  let ordinaryWordCapitalized = false;
  return trimmed.replace(/[^\s·]+|\s+|·/g, (part) => {
    if (/^\s+$/.test(part) || part === "·") return part;

    if (isProtectedTitleToken(part)) {
      const lower = part.toLowerCase();
      if (
        TITLE_ACRONYMS.has(lower) &&
        !/\d/.test(part) &&
        !/[-_/]/.test(part)
      ) {
        if (lower === "n8n") return "n8n";
        if (lower === "rev") return "Rev";
        return part.toUpperCase();
      }
      return part;
    }

    const lower = part.toLowerCase();
    if (!ordinaryWordCapitalized) {
      ordinaryWordCapitalized = true;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
    return lower;
  });
}
