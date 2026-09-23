export type LineRole = "part" | "heading" | "clause" | "body" | "blank";

export type DocumentLine = {
  number: number;
  text: string;
  role: LineRole;
};

export type ChunkKind = "metadata" | "heading" | "clause";

export type DocumentChunk = {
  id: string;
  kind: ChunkKind;
  title: string;
  clause: string | null;
  lines: DocumentLine[];
  text: string;
};

export type ChunkAssessment = {
  status: "compliant" | "non-compliant";
  analysis: string;
  changeRequired: string;
};

const GAP_RULES: { test: RegExp; analysis: string; change: string }[] = [
  {
    test: /pencil|felt-tip/i,
    analysis: "Allowed writing tools include pencil and felt-tip marker.",
    change: "Strictly prohibit pencil and felt-tip marker.",
  },
  {
    test: /end of the shift/i,
    analysis:
      "Entries may be completed at the end of the shift, which is not contemporaneous recording.",
    change: "Record each entry at the time the activity is performed.",
  },
  {
    test: /erased or scribbl/i,
    analysis: "Allows eraser or scribbling out of errors.",
    change: "Single lineout with initial and date.",
  },
  {
    test: /left blank/i,
    analysis: "Unused fields may be left blank for later completion.",
    change: "Mark unused fields N/A, then initial and date the mark.",
  },
  {
    test: /personal drives|controlled stamp/i,
    analysis: "Working copies may be printed without a controlled-copy stamp.",
    change: "Issue only stamped, controlled copies to the point of use.",
  },
  {
    test: /remain at the point of use/i,
    analysis: "Superseded procedures remain at the point of use until the next review.",
    change: "Remove and reconcile obsolete copies on the effective date.",
  },
  {
    test: /shared login/i,
    analysis: "A shared login may stand in for the primary operator.",
    change: "Require a unique electronic signature attributable to one person.",
  },
  {
    test: /taped into the record|tape may cover/i,
    analysis: "Tape used to attach printouts may cover adjacent entries.",
    change: "Attach printouts so every original entry remains visible.",
  },
  {
    test: /general waste|held for one year/i,
    analysis: "Completed records are discarded after one year with general waste.",
    change: "Retain batch records for the product's required retention period.",
  },
  {
    test: /overwrite the prior value|change history is not retained/i,
    analysis: "Electronic changes overwrite the prior value with no change history.",
    change:
      "Retain a secure, time-stamped audit trail of create, modify, and delete actions.",
  },
];

/** Full controlled-document text. Every line is parsed; none are optional. */
export const SOURCE_SOP_TEXT = [
  "FDA 21 CFR PART 11",
  "Electronic Records — Documentation Controls",
  "",
  "Procedure — General Requirements",
  "8.0  General Requirements",
  "Allowed writing tools include pencil and felt-tip marker.",
  "Entries may be completed at the end of the shift when the operator is available.",
  "",
  "Procedure — Correcting Errors",
  "9.0  Correcting Errors",
  "Errors may be erased or scribbled out so the original entry is no longer legible.",
  "10.0  Correcting Errors",
  "Draw a single line through the error, enter the correction, and initial and date the change.",
  "11.0  Correcting Errors",
  "Do not obscure the original entry. Record the reason for the correction beside the line-out.",
  "",
  "Procedure — Contemporaneous Entry",
  "12.0  Contemporaneous Entry",
  "Record data when the activity is performed. Backdating is not permitted.",
  "13.0  Blank Fields",
  "Unused fields may be left blank if the operator intends to complete them later.",
  "",
  "Procedure — Document Control",
  "14.0  Document Control",
  "Working copies may be printed from personal drives without a controlled stamp.",
  "15.0  Obsolete Copies",
  "Superseded procedures remain at the point of use until the next scheduled review.",
  "",
  "Procedure — Signatures and Review",
  "16.0  Signatures",
  "A shared login may be used when the primary operator is unavailable.",
  "17.0  Second-Person Review",
  "Critical calculations are reviewed by a second person before the batch proceeds.",
  "18.0  Attachments",
  "Printouts are taped into the record. Tape may cover adjacent entries.",
  "",
  "Procedure — Retention",
  "19.0  Retention",
  "Completed records are held for one year, then discarded with general waste.",
  "20.0  Audit Trail",
  "Electronic changes overwrite the prior value. A change history is not retained.",
].join("\n");

export function normalizeDocumentText(raw: string) {
  return String(raw).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function classifyLine(text: string): LineRole {
  if (!text.trim()) return "blank";
  if (/^procedure\b/i.test(text.trim())) return "heading";
  if (/^\d+(?:\.\d+)*\s+\S/.test(text.trim())) return "clause";
  if (/^fda\b/i.test(text.trim())) return "part";
  return "body";
}

function clauseLabel(text: string) {
  const match = text.trim().match(/^(\d+(?:\.\d+)*)\s+(.+)$/);
  if (!match) return { clause: null, title: text.trim() };
  return { clause: match[1], title: match[2].trim() };
}

function kindForLine(role: LineRole): ChunkKind {
  if (role === "heading") return "heading";
  if (role === "clause") return "clause";
  return "metadata";
}

function meaningfulLines(raw: string) {
  return normalizeDocumentText(raw)
    .split("\n")
    .map((text) => text.trim())
    .filter((text) => text.length > 0);
}

/**
 * One chunk per meaningful block, in order. Titles, headings, clauses, and
 * paragraphs are numbered from 1. Blank lines and carriage returns are omitted.
 */
export function parseDocumentChunks(raw: string): {
  lines: DocumentLine[];
  chunks: DocumentChunk[];
} {
  const lines: DocumentLine[] = meaningfulLines(raw).map((text, index) => ({
    number: index + 1,
    text,
    role: classifyLine(text),
  }));

  const chunks: DocumentChunk[] = lines.map((line) => {
    const kind = kindForLine(line.role);
    return {
      id: `block-${line.number}`,
      kind,
      title: line.text,
      clause: kind === "clause" ? clauseLabel(line.text).clause : null,
      lines: [line],
      text: line.text,
    };
  });

  return { lines, chunks };
}

export function reconstructDocument(chunks: DocumentChunk[]) {
  return chunks.flatMap((chunk) => chunk.lines.map((line) => line.text)).join("\n");
}

export function documentIsFullyCovered(raw: string, chunks: DocumentChunk[]) {
  return reconstructDocument(chunks) === meaningfulLines(raw).join("\n");
}

function stripIngestionTags(text: string) {
  return text.replace(/\s*\[[^\]]*from [^\]]+\]/gi, "").trim();
}

export function assessChunk(chunk: DocumentChunk): ChunkAssessment {
  const hits = GAP_RULES.filter((rule) => rule.test.test(chunk.text));
  if (hits.length === 0) {
    const summary =
      chunk.lines.find((line) => line.role === "body")?.text.trim() ||
      chunk.title;
    return {
      status: "compliant",
      analysis: stripIngestionTags(summary),
      changeRequired: "",
    };
  }

  return {
    status: "non-compliant",
    analysis: stripIngestionTags(hits.map((hit) => hit.analysis).join(" ")),
    changeRequired: stripIngestionTags(hits.map((hit) => hit.change).join(" ")),
  };
}

export type ChunkReview = {
  decision: "pending" | "accepted" | "declined";
  revision: string;
};

/** Rebuild the SOP in original order, swapping in accepted revisions. */
export function buildGoldStandard(
  chunks: DocumentChunk[],
  reviews: Record<string, ChunkReview>,
) {
  return chunks
    .map((chunk) => {
      const review = reviews[chunk.id];
      if (review?.decision === "accepted" && review.revision.trim()) {
        return review.revision.trim();
      }
      return chunk.lines.map((line) => line.text).join("\n");
    })
    .join("\n");
}
