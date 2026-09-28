/** Paths that do not require an authenticated AuditFlow session. */
export const AUTH_PUBLIC_PREFIXES = [
  "/login",
  "/auth",
  "/projects",
] as const;

export function isAuthPublicPath(pathname: string): boolean {
  return AUTH_PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Shell chrome (sidebar + header) is omitted on these routes. */
export function isAuthShellExcludedPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/auth/")
  );
}

export const DEFAULT_POST_LOGIN_PATH = "/dashboard";
export const LOGIN_PATH = "/login";
