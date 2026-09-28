import { type NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_POST_LOGIN_PATH,
  isAuthPublicPath,
  LOGIN_PATH,
} from "@/lib/auth/routes";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { response, user, configured } = await updateSession(request);

  // Without public Supabase env, skip enforcement so local/portfolio routes
  // still render; login will surface a configuration error instead.
  if (!configured) {
    return response;
  }

  const isPublic = isAuthPublicPath(pathname);

  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.search = "";
    const next =
      pathname === "/"
        ? DEFAULT_POST_LOGIN_PATH
        : `${pathname}${search}`;
    if (next && next !== LOGIN_PATH) {
      loginUrl.searchParams.set("next", next);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`))) {
    const redirectUrl = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next");
    redirectUrl.pathname =
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : DEFAULT_POST_LOGIN_PATH;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image optimization.
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
