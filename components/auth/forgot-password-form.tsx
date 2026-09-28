"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { readSupabasePublicEnv } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!readSupabasePublicEnv().configured) {
      setFormError(
        "Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    if (!email.trim()) {
      setEmailError("Work email is required.");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("Enter a valid work email.");
      return;
    }
    setEmailError(null);

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const redirectTo = new URL(
          "/auth/callback",
          window.location.origin,
        ).toString();
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo },
        );
        if (error) {
          setFormError(error.message || "Unable to send reset email.");
          return;
        }
        toast.success("Reset link sent", {
          description: `Check ${email.trim()} for a password reset link.`,
        });
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "Unable to send reset email.",
        );
      }
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="reset-email" className="text-neutral-950">
          Work email
        </Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          disabled={pending}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "reset-email-error" : undefined}
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
          <p id="reset-email-error" className="m-0 text-xs text-rose-600">
            {emailError}
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
        disabled={pending}
      >
        {pending ? "Sending…" : "Send reset link"}
      </Button>

      <p className="m-0 text-center text-sm text-neutral-500">
        <Link
          href="/login"
          className="text-neutral-700 no-underline transition-colors hover:text-neutral-950"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
