import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Cookie-backed Supabase client for Server Components, Route Handlers, and
 * Server Actions. Prefer `getUser()` over `getSession()` for auth checks.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey, configured } = readSupabasePublicEnv();
  if (!configured) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — middleware will refresh the session.
        }
      },
    },
  });
}
