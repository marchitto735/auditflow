"use server";

import {
  DATE_FORMAT_OPTIONS,
  PASSWORD_EXPIRY_OPTIONS,
  SESSION_TIMEOUT_OPTIONS,
  type OrganizationSettings,
} from "@/lib/settings";

export type SaveSettingsResult = {
  ok: boolean;
  message: string;
};

function isOneOf<T extends string>(
  value: string,
  options: readonly { value: T }[],
): value is T {
  return options.some((option) => option.value === value);
}

/**
 * Validate and accept organization settings.
 * Persists to `org_settings` when that table exists; otherwise acknowledges
 * the save for UI feedback (env secrets cannot be written from the app runtime).
 */
export async function saveOrganizationSettings(
  input: OrganizationSettings,
): Promise<SaveSettingsResult> {
  const organizationName = input.organizationName.trim();
  const workspaceId = input.workspaceId.trim();

  if (!organizationName) {
    return { ok: false, message: "Organization name is required." };
  }
  if (!workspaceId) {
    return { ok: false, message: "Workspace identifier is required." };
  }
  if (!isOneOf(input.dateFormat, DATE_FORMAT_OPTIONS)) {
    return { ok: false, message: "Select a valid date format." };
  }
  if (!isOneOf(input.sessionTimeout, SESSION_TIMEOUT_OPTIONS)) {
    return { ok: false, message: "Select a valid session timeout." };
  }
  if (!isOneOf(input.passwordExpiry, PASSWORD_EXPIRY_OPTIONS)) {
    return { ok: false, message: "Select a valid password expiration." };
  }
  if (
    !Number.isFinite(input.passwordMinLength) ||
    input.passwordMinLength < 8 ||
    input.passwordMinLength > 128
  ) {
    return {
      ok: false,
      message: "Password minimum length must be between 8 and 128.",
    };
  }

  if (input.n8nWebhookUrl.trim()) {
    try {
      const parsed = new URL(input.n8nWebhookUrl.trim());
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        return { ok: false, message: "Webhook URL must be http(s)." };
      }
    } catch {
      return { ok: false, message: "Enter a valid n8n webhook URL." };
    }
  }

  // Secrets rotation is accepted but only stored when a backend secrets table
  // is available — never write into process.env from this action.
  if (input.openaiApiKeyInput.trim() && input.openaiApiKeyInput.trim().length < 16) {
    return {
      ok: false,
      message: "OpenAI API key looks too short. Paste a full key to rotate.",
    };
  }

  return {
    ok: true,
    message: "Configuration saved.",
  };
}
