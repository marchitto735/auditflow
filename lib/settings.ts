export const SESSION_TIMEOUT_OPTIONS = [
  { value: "15m", label: "15 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "4h", label: "4 hours" },
] as const;

export type SessionTimeout = (typeof SESSION_TIMEOUT_OPTIONS)[number]["value"];

export const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Berlin", label: "Berlin" },
] as const;

export const DATE_FORMAT_OPTIONS = [
  { value: "MM/dd/yyyy", label: "MM/DD/YYYY" },
  { value: "dd/MM/yyyy", label: "DD/MM/YYYY" },
  { value: "yyyy-MM-dd", label: "YYYY-MM-DD" },
] as const;

export type DateFormat = (typeof DATE_FORMAT_OPTIONS)[number]["value"];

export const PASSWORD_EXPIRY_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "90d", label: "Every 90 days" },
  { value: "180d", label: "Every 180 days" },
  { value: "365d", label: "Every year" },
] as const;

export type PasswordExpiry = (typeof PASSWORD_EXPIRY_OPTIONS)[number]["value"];

export type OrganizationSettings = {
  organizationName: string;
  workspaceId: string;
  timezone: string;
  dateFormat: DateFormat;
  enforceMfa: boolean;
  sessionTimeout: SessionTimeout;
  passwordMinLength: number;
  requireSpecialChars: boolean;
  passwordExpiry: PasswordExpiry;
  n8nWebhookUrl: string;
  openaiApiKeyMasked: string;
  /** Empty unless the user enters a new key to rotate. */
  openaiApiKeyInput: string;
  notifyCriticalFailures: boolean;
  notifyFrameworkUpdates: boolean;
  notifyPolicyDeadlines: boolean;
};

export type IntegrationsSnapshot = {
  supabaseConnected: boolean;
  supabaseEndpoint: string;
  openaiConfigured: boolean;
  openaiKeyHint: string;
  n8nWebhookConfigured: boolean;
  n8nWebhookHint: string;
};

export const DEFAULT_ORGANIZATION_SETTINGS: OrganizationSettings = {
  organizationName: "AuditFlow",
  workspaceId: "ws_auditflow_prod",
  timezone: "America/New_York",
  dateFormat: "MM/dd/yyyy",
  enforceMfa: true,
  sessionTimeout: "30m",
  passwordMinLength: 12,
  requireSpecialChars: true,
  passwordExpiry: "90d",
  n8nWebhookUrl: "",
  openaiApiKeyMasked: "",
  openaiApiKeyInput: "",
  notifyCriticalFailures: true,
  notifyFrameworkUpdates: true,
  notifyPolicyDeadlines: false,
};

export function maskSecret(value: string, visible = 4): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= visible) return "•".repeat(trimmed.length);
  return `${"•".repeat(Math.min(24, trimmed.length - visible))}${trimmed.slice(-visible)}`;
}
