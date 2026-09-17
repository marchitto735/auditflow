/** Shared URL cleanup for browser and server Supabase clients. */

export function normalizeSupabaseUrl(raw: string | undefined | null): string {
  return String(raw ?? "")
    .trim()
    .replace(/^["']/, "")
    .replace(/["']$/, "")
    .trim()
    .replace(/\/+$/, "");
}

export function parseSupabaseProjectUrl(raw: string | undefined | null): URL {
  const normalized = normalizeSupabaseUrl(raw);
  if (!normalized) {
    throw new Error(
      "Missing SUPABASE_URL. Set it to https://<project-ref>.supabase.co (no trailing slash).",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(
      `Invalid SUPABASE_URL "${normalized}". Use https://<project-ref>.supabase.co with no quotes or trailing slash.`,
    );
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(
      `SUPABASE_URL must be an http(s) URL, got "${parsed.protocol}".`,
    );
  }

  return parsed;
}

export function supabaseHostHint(raw: string | undefined | null): string {
  try {
    return parseSupabaseProjectUrl(raw).host;
  } catch {
    return "(invalid URL)";
  }
}

export function formatSupabaseReachError(
  action: string,
  message: string,
  url: string | undefined | null,
): string {
  const host = supabaseHostHint(url);
  return `${action}: ${message} (host: ${host}). Confirm SUPABASE_URL on this deployment matches Project Settings → API.`;
}
