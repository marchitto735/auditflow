import { createBrowserClient } from "@supabase/ssr";
import { readSupabasePublicEnv } from "@/lib/supabase/env";

/** Browser Supabase client for client components (login, logout helpers). */
export function createSupabaseBrowserClient() {
  const { url, anonKey, configured } = readSupabasePublicEnv();
  if (!configured) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return createBrowserClient(url, anonKey);
}
