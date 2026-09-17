import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readServerEnv } from "@/lib/server-env-local";
import { parseSupabaseProjectUrl } from "@/lib/supabase/url";

function env(name: string) {
  return readServerEnv(name) || process.env[name]?.trim() || "";
}

function firstEnv(...names: string[]) {
  for (const name of names) {
    const value = env(name);
    if (value) return value;
  }
  return "";
}

export function readSupabaseServerConfig() {
  const url = parseSupabaseProjectUrl(
    firstEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"),
  ).origin;
  const serviceRoleKey = firstEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_KEY",
  );
  return { url, serviceRoleKey };
}

export function createSupabaseAdmin(): SupabaseClient {
  const { url, serviceRoleKey } = readSupabaseServerConfig();

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set the service_role or sb_secret key on this host (Vercel env or .env.local). Do not prefix with NEXT_PUBLIC_.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
