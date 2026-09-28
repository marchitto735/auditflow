import { normalizeSupabaseUrl } from "@/lib/supabase/url";

/** Browser + middleware public Supabase credentials (empty when unset). */
export function readSupabasePublicEnv(): {
  url: string;
  anonKey: string;
  configured: boolean;
} {
  const url = normalizeSupabaseUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
  );
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  ).trim();
  return {
    url,
    anonKey,
    configured: Boolean(url && anonKey),
  };
}
