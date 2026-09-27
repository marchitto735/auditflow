import "server-only";

import {
  DEFAULT_ORGANIZATION_SETTINGS,
  type OrganizationSettings,
} from "@/lib/settings";

/**
 * Initial settings form values.
 * Org/security/notification defaults are in-memory until a `org_settings` table exists.
 */
export function getOrganizationSettingsDraft(): OrganizationSettings {
  return { ...DEFAULT_ORGANIZATION_SETTINGS };
}
