import { NextResponse } from "next/server";
import { ingestFirDocument } from "@/lib/services/fir-ingestion";

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
        { error: "A PDF or image file is required." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File must be 20 MB or smaller." },
        { status: 400 },
      );
    }

    const clauseRaw = incoming.get("clause_id");
    const clauseId =
      typeof clauseRaw === "string" && clauseRaw.trim()
        ? clauseRaw.trim()
        : null;

    const result = await ingestFirDocument({
      bytes: new Uint8Array(await file.arrayBuffer()),
      fileName: file.name,
      mimeType: file.type,
      clauseId,
    });

    return NextResponse.json({
      ok: true,
      fir_id: result.fir_id,
      clause_id: result.clause_id,
      title: result.title,
      ingestion_id: result.ingestion_id,
    });
  } catch (error) {
    console.warn("[Ingest FIR]", errorText(error));
    return NextResponse.json({ error: errorText(error) }, { status: 500 });
  }
}
