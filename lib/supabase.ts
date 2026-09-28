import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/** @deprecated Prefer `createSupabaseBrowserClient` from `@/lib/supabase/browser`. */
export function createClient() {
  return createSupabaseBrowserClient();
}
