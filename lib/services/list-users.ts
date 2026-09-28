import "server-only";

import {
  DEMO_DIRECTORY_USERS,
  mapProfileRow,
  type DirectoryUser,
} from "@/lib/users";
import { createSupabaseAdmin, readSupabaseServerConfig } from "@/lib/supabase/admin";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Load org users from `profiles` when available; otherwise demo directory.
 * Never throws — UI always has a usable list.
 */
export async function listDirectoryUsers(): Promise<DirectoryUser[]> {
  try {
    const { serviceRoleKey } = readSupabaseServerConfig();
    if (!serviceRoleKey) {
      return DEMO_DIRECTORY_USERS;
    }

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, name, email, role, status, mfa_enabled, last_active_at, last_sign_in_at, updated_at, avatar_url",
      )
      .order("full_name", { ascending: true })
      .limit(200);

    if (error) {
      console.warn(`[User directory] profiles: ${error.message}`);
      return DEMO_DIRECTORY_USERS;
    }

    const mapped = (data ?? [])
      .filter(isRecord)
      .map(mapProfileRow)
      .filter((user): user is DirectoryUser => user != null);

    return mapped.length > 0 ? mapped : DEMO_DIRECTORY_USERS;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[User directory] ${message}`);
    return DEMO_DIRECTORY_USERS;
  }
}
