import "server-only";

import {
  DEFAULT_ORGANIZATION_SETTINGS,
  maskSecret,
  type IntegrationsSnapshot,
  type OrganizationSettings,
} from "@/lib/settings";
import { readServerEnv } from "@/lib/server-env-local";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

function env(name: string) {
  return readServerEnv(name) || process.env[name]?.trim() || "";
}

/**
 * Read-only integration status derived from server env.
 * Never returns raw secrets — only host / masked hints.
 */
export function getIntegrationsSnapshot(): IntegrationsSnapshot {
  const supabaseUrl = normalizeSupabaseUrl(
    env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL"),
  );
  const serviceRole = env("SUPABASE_SERVICE_ROLE_KEY");
  const openaiKey =
    env("OPENAI_API_KEY") || env("LLM_API_KEY");
  const n8nWebhook =
    env("N8N_SOP_WEBHOOK_URL") || env("N8N_WEBHOOK_URL");

  let supabaseEndpoint = "Not configured";
  try {
    if (supabaseUrl) {
      supabaseEndpoint = new URL(supabaseUrl).origin;
    }
  } catch {
    supabaseEndpoint = "Invalid SUPABASE_URL";
  }

  return {
    supabaseConnected: Boolean(supabaseUrl && serviceRole),
    supabaseEndpoint,
    openaiConfigured: Boolean(openaiKey),
    openaiKeyHint: openaiKey ? maskSecret(openaiKey) : "Not configured",
    n8nWebhookConfigured: Boolean(n8nWebhook),
    n8nWebhookHint: n8nWebhook ? maskSecret(n8nWebhook, 8) : "",
  };
}

/**
 * Initial settings form values. Prefers env hints for integrations fields;
 * org/security defaults are in-memory until a `org_settings` table exists.
 */
export function getOrganizationSettingsDraft(): OrganizationSettings {
  const integrations = getIntegrationsSnapshot();
  const n8nWebhook =
    env("N8N_SOP_WEBHOOK_URL") || env("N8N_WEBHOOK_URL");

  return {
    ...DEFAULT_ORGANIZATION_SETTINGS,
    n8nWebhookUrl: n8nWebhook,
    openaiApiKeyMasked: integrations.openaiKeyHint,
  };
}
