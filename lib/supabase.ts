import { createBrowserClient } from "@supabase/ssr";
import { parseSupabaseProjectUrl } from "@/lib/supabase/url";

export function createClient() {
  const url = parseSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  if (!anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createBrowserClient(url, anonKey);
}
