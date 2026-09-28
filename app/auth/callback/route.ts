import { NextResponse } from "next/server";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/auth/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_POST_LOGIN_PATH;
  }
  return next;
}

/** OAuth / magic-link callback — exchanges `code` for a session cookie. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // Fall through to login with error.
    }
  }

  const login = new URL("/login", origin);
  login.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(login);
}
