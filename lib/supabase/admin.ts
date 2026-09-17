import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readServerEnv } from "@/lib/server-env-local";

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
  const url = firstEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const serviceRoleKey = firstEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_KEY",
  );
  return { url, serviceRoleKey };
}

export function createSupabaseAdmin(): SupabaseClient {
  const { url, serviceRoleKey } = readSupabaseServerConfig();
  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length) {
    throw new Error(
      `Missing ${missing.join(" and ")}. Add ${missing.join(" and ")} to .env.local and restart npm run dev. SUPABASE_SERVICE_ROLE_KEY is the service_role secret from Supabase → Project Settings → API (server-only; do not prefix with NEXT_PUBLIC_).`,
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
