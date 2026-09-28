"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { GoogleMark } from "@/components/auth/google-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GOOGLE_OAUTH_DISABLED_ERROR,
  GOOGLE_OAUTH_DISABLED_MESSAGE,
} from "@/lib/auth/google-oauth";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/auth/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { readSupabasePublicEnv } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return DEFAULT_POST_LOGIN_PATH;
  }
  return raw;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: "Sign-in could not be completed. Try again.",
  [GOOGLE_OAUTH_DISABLED_ERROR]: GOOGLE_OAUTH_DISABLED_MESSAGE,
};

function resolveBootstrapNotice(errorCode: string | null): {
  formError: string | null;
  oauthNotice: string | null;
} {
  if (!errorCode) return { formError: null, oauthNotice: null };
  if (errorCode === GOOGLE_OAUTH_DISABLED_ERROR) {
    return { formError: null, oauthNotice: GOOGLE_OAUTH_DISABLED_MESSAGE };
  }
  return {
    formError:
      AUTH_ERROR_MESSAGES[errorCode] ??
      "Sign-in could not be completed. Try again.",
    oauthNotice: null,
  };
}

/** Logs the raw OAuth failure and returns the polished user-facing copy. */
function reportGoogleOAuthFailure(error: unknown) {
  console.error("[AuditFlow] Google OAuth sign-in failed:", error);

  toast.message("Google sign-in unavailable", {
    description: GOOGLE_OAUTH_DISABLED_MESSAGE,
    duration: 6000,
  });

  return GOOGLE_OAUTH_DISABLED_MESSAGE;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams],
  );
  const bootstrapError = searchParams.get("error");
  const bootstrap = useMemo(
    () => resolveBootstrapNotice(bootstrapError),
    [bootstrapError],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(bootstrap.formError);
  const [oauthNotice, setOauthNotice] = useState<string | null>(
    bootstrap.oauthNotice,
  );
  const [pending, startTransition] = useTransition();
  const [oauthPending, setOauthPending] = useState(false);

  const authConfigured = readSupabasePublicEnv().configured;

  useEffect(() => {
    if (bootstrap.oauthNotice) {
      toast.message("Google sign-in unavailable", {
        description: bootstrap.oauthNotice,
        duration: 6000,
      });
    }
  }, [bootstrap.oauthNotice]);

  function validate(): boolean {
    let ok = true;
    if (!email.trim()) {
      setEmailError("Work email is required.");
      ok = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Enter a valid work email.");
      ok = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError("Password is required.");
      ok = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      ok = false;
    } else {
      setPasswordError(null);
    }

    return ok;
  }

  function handleEmailSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setOauthNotice(null);

    if (!authConfigured) {
      setFormError(
        "Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    if (!validate()) return;

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setFormError(error.message || "Unable to sign in with that email.");
          return;
        }
        router.replace(nextPath);
        router.refresh();
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "Unable to sign in.",
        );
      }
    });
  }

  async function handleGoogleSignIn() {
    setFormError(null);
    setOauthNotice(null);

    if (!authConfigured) {
      setFormError(
        "Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    setOauthPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = new URL("/auth/callback", window.location.origin);
      redirectTo.searchParams.set("next", nextPath);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo.toString(),
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setOauthNotice(reportGoogleOAuthFailure({ ...error, data }));
        setOauthPending(false);
        return;
      }

      if (!data?.url) {
        setOauthNotice(
          reportGoogleOAuthFailure({
            message: "OAuth redirect URL missing (provider may be disabled).",
            data,
          }),
        );
        setOauthPending(false);
        return;
      }

      // Probe authorize URL on the server so a disabled provider never dumps
      // raw JSON into the browser tab.
      const probe = new URL("/auth/google", window.location.origin);
      probe.searchParams.set("to", data.url);
      window.location.assign(probe.toString());
    } catch (error) {
      setOauthNotice(reportGoogleOAuthFailure(error));
      setOauthPending(false);
    }
  }

  const busy = pending || oauthPending;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11! min-h-11! w-full rounded-lg border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-950 hover:border-neutral-400 hover:bg-neutral-50"
          disabled={busy}
          onClick={() => {
            void handleGoogleSignIn();
          }}
        >
          <GoogleMark />
          Continue with Google
        </Button>

        {oauthNotice ? (
          <p
            role="status"
            className="m-0 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm leading-relaxed text-neutral-600"
          >
            {oauthNotice}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3" role="separator">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="shrink-0 text-xs text-neutral-500">
          or continue with email
        </span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={handleEmailSignIn}
        noValidate
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="work-email" className="text-neutral-950">
            Work email
          </Label>
          <Input
            id="work-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@company.com"
            value={email}
            disabled={busy}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "work-email-error" : undefined}
            className={cn(
              emailError &&
                "border-rose-500 hover:border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20",
            )}
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailError) setEmailError(null);
            }}
          />
          {emailError ? (
            <p id="work-email-error" className="m-0 text-xs text-rose-600">
              {emailError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className="text-neutral-950">
              Password
            </Label>
            <Link
              href="/login/forgot-password"
              className="text-xs text-neutral-500 no-underline transition-colors hover:text-neutral-800"
              tabIndex={busy ? -1 : undefined}
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            disabled={busy}
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? "password-error" : undefined}
            className={cn(
              passwordError &&
                "border-rose-500 hover:border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20",
            )}
            onChange={(event) => {
              setPassword(event.target.value);
              if (passwordError) setPasswordError(null);
            }}
          />
          {passwordError ? (
            <p id="password-error" className="m-0 text-xs text-rose-600">
              {passwordError}
            </p>
          ) : null}
        </div>

        {formError ? (
          <p
            role="alert"
            className="m-0 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="black"
          className="h-11! min-h-11! w-full rounded-lg px-4 text-sm font-medium"
          disabled={busy}
        >
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
