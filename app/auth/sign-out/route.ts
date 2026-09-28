import { NextResponse } from "next/server";
import { LOGIN_PATH } from "@/lib/auth/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readSupabasePublicEnv } from "@/lib/supabase/env";

/** Clears the Auth session cookies and sends the user to login. */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const loginUrl = new URL(LOGIN_PATH, origin);

  if (readSupabasePublicEnv().configured) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // Still bounce to login even if sign-out fails.
    }
  }

  const response = NextResponse.redirect(loginUrl);
  return response;
}
