import { NextResponse } from "next/server";
import { GOOGLE_OAUTH_DISABLED_ERROR } from "@/lib/auth/google-oauth";
import { LOGIN_PATH } from "@/lib/auth/routes";
import { readSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Probes the Supabase authorize URL server-side before sending the browser to
 * Google. When Google is not enabled, Supabase returns JSON 400 instead of a
 * redirect — catch that and bounce back to /login with a polished error.
 *
 * Query: `?to=<supabase authorize url>`
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const loginUrl = new URL(LOGIN_PATH, origin);
  loginUrl.searchParams.set("error", GOOGLE_OAUTH_DISABLED_ERROR);

  const authorizeUrl = requestUrl.searchParams.get("to");
  const { url: supabaseUrl, configured } = readSupabasePublicEnv();

  if (!configured || !authorizeUrl) {
    console.error("[AuditFlow] Google OAuth start missing config or authorize URL", {
      configured,
      authorizeUrl,
    });
    return NextResponse.redirect(loginUrl);
  }

  let parsedAuthorize: URL;
  try {
    parsedAuthorize = new URL(authorizeUrl);
  } catch (error) {
    console.error("[AuditFlow] Google OAuth authorize URL parse failed:", error);
    return NextResponse.redirect(loginUrl);
  }

  const allowedOrigin = new URL(supabaseUrl).origin;
  if (parsedAuthorize.origin !== allowedOrigin) {
    console.error("[AuditFlow] Google OAuth authorize URL host mismatch:", {
      authorizeOrigin: parsedAuthorize.origin,
      allowedOrigin,
    });
    return NextResponse.redirect(loginUrl);
  }

  if (!parsedAuthorize.pathname.startsWith("/auth/v1/authorize")) {
    console.error(
      "[AuditFlow] Google OAuth authorize path rejected:",
      parsedAuthorize.pathname,
    );
    return NextResponse.redirect(loginUrl);
  }

  try {
    const response = await fetch(parsedAuthorize.toString(), {
      method: "GET",
      redirect: "manual",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    // Successful OAuth start → Supabase redirects to Google.
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        return NextResponse.redirect(location);
      }
    }

    let body: unknown = null;
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => "");
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text || null;
      }
    }

    console.error("[AuditFlow] Google OAuth authorize rejected:", {
      status: response.status,
      body,
    });

    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("[AuditFlow] Google OAuth authorize probe failed:", error);
    return NextResponse.redirect(loginUrl);
  }
}
