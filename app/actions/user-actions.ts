"use server";

import {
  AUDITFLOW_ROLES,
  type AuditFlowRole,
} from "@/lib/users";
import { createSupabaseAdmin, readSupabaseServerConfig } from "@/lib/supabase/admin";

export type UserActionResult = {
  ok: boolean;
  message: string;
};

function hasAdminConfig() {
  const { serviceRoleKey } = readSupabaseServerConfig();
  return Boolean(serviceRoleKey);
}

function isRole(value: string): value is AuditFlowRole {
  return (AUDITFLOW_ROLES as readonly string[]).includes(value);
}

/** Invite a user via Supabase Auth Admin (email invite). */
export async function inviteDirectoryUser(input: {
  email: string;
  role: string;
  expiresAt?: string | null;
}): Promise<UserActionResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, message: "Enter a valid email address." };
  }
  if (!isRole(input.role)) {
    return { ok: false, message: "Select a valid AuditFlow role." };
  }

  if (!hasAdminConfig()) {
    return {
      ok: true,
      message: `Invite queued for ${email} as ${input.role} (demo — configure SUPABASE_SERVICE_ROLE_KEY to send email).`,
    };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        role: input.role,
        temporary_expires_at: input.expiresAt ?? null,
      },
    });
    if (error) {
      return { ok: false, message: error.message };
    }
    return {
      ok: true,
      message: `Invitation sent to ${email}.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message };
  }
}

/** Update assigned RBAC role on profiles (when table exists). */
export async function updateDirectoryUserRole(input: {
  userId: string;
  role: string;
}): Promise<UserActionResult> {
  if (!input.userId) {
    return { ok: false, message: "Missing user id." };
  }
  if (!isRole(input.role)) {
    return { ok: false, message: "Select a valid AuditFlow role." };
  }

  if (!hasAdminConfig()) {
    return {
      ok: true,
      message: `Role updated to ${input.role} (demo).`,
    };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from("profiles")
      .update({ role: input.role })
      .eq("id", input.userId);
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, message: `Role updated to ${input.role}.` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message };
  }
}

/** Terminate all active sessions for a user (security review). */
export async function revokeDirectoryUserSessions(
  userId: string,
): Promise<UserActionResult> {
  if (!userId) {
    return { ok: false, message: "Missing user id." };
  }

  if (!hasAdminConfig()) {
    return {
      ok: true,
      message: "Sessions revoked (demo).",
    };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.auth.admin.signOut(userId, "global");
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, message: "All active sessions terminated." };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message };
  }
}

/** Soft-deactivate: set status Suspended on profiles. */
export async function deactivateDirectoryUser(
  userId: string,
): Promise<UserActionResult> {
  if (!userId) {
    return { ok: false, message: "Missing user id." };
  }

  if (!hasAdminConfig()) {
    return {
      ok: true,
      message: "User deactivated (demo).",
    };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from("profiles")
      .update({ status: "Suspended" })
      .eq("id", userId);
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, message: "User deactivated." };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message };
  }
}

/** Trigger password recovery email / recovery link. */
export async function resetDirectoryUserPassword(
  email: string,
): Promise<UserActionResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { ok: false, message: "Missing email." };
  }

  if (!hasAdminConfig()) {
    return {
      ok: true,
      message: `Password reset link queued for ${trimmed} (demo).`,
    };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: trimmed,
    });
    if (error) {
      return { ok: false, message: error.message };
    }
    return {
      ok: true,
      message: `Password reset initiated for ${trimmed}.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message };
  }
}
