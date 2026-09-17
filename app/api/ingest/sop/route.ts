import { NextResponse } from "next/server";
import { ingestSopPdf } from "@/lib/services/ingestion";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_FILE_BYTES = 20 * 1024 * 1024;

function errorText(error: unknown) {
  if (error instanceof Error) {
    const cause =
      error.cause instanceof Error ? error.cause.message : undefined;
    return cause ? `${error.message}: ${cause}` : error.message;
  }
  return String(error);
}

export async function POST(request: Request) {
  try {
    const incoming = await request.formData();
    const file = incoming.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "A PDF file is required." },
        { status: 400 },
      );
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json(
        { error: "Only PDF files can be uploaded." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "PDF must be 20 MB or smaller." },
        { status: 400 },
      );
    }

    const clauseRaw = incoming.get("clause_id");
    const clauseId =
      typeof clauseRaw === "string" && clauseRaw.trim()
        ? clauseRaw.trim()
        : null;

    const result = await ingestSopPdf({
      pdfBytes: new Uint8Array(await file.arrayBuffer()),
      clauseId,
    });

    return NextResponse.json({
      ok: true,
      sop_id: result.sop_id,
      clause_id: result.clause_id,
      section_count: result.section_count,
      sections: result.sections.map((section) => ({
        section_number: section.section_number,
        title: section.title,
        keywords: section.keywords,
        content: section.content,
      })),
    });
  } catch (error) {
    console.warn("[Ingest SOP]", errorText(error));
    return NextResponse.json({ error: errorText(error) }, { status: 500 });
  }
}
