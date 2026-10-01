"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { saveOrganizationSettings } from "@/app/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import SystemHealthPanel from "@/components/settings/system-health-panel";
import {
  CARD_SECTION_EYEBROW_CLASS,
  SECTION_DESCRIPTION_CLASS,
  DASHBOARD_CARD_CLASS,
  TABLE_CARD_TITLE_HEADER_CLASS,
} from "@/lib/page-layout";
import {
  DATE_FORMAT_OPTIONS,
  PASSWORD_EXPIRY_OPTIONS,
  SESSION_TIMEOUT_OPTIONS,
  TIMEZONE_OPTIONS,
  type DateFormat,
  type OrganizationSettings,
  type PasswordExpiry,
  type SessionTimeout,
} from "@/lib/settings";
import { cn } from "@/lib/utils";

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="min-w-0">
        <h3 className="m-0 text-sm font-medium text-neutral-900">{title}</h3>
        <p className="m-0 mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function FieldRow({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:items-start sm:gap-6">
      <div className="min-w-0 pt-2">
        <Label htmlFor={htmlFor} className="text-neutral-900">
          {label}
        </Label>
        {hint ? (
          <p className="m-0 mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 py-3">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium text-neutral-900">
          {label}
        </Label>
        <p className="m-0 mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5"
      />
    </div>
  );
}

export default function SettingsWorkspace({
  initialSettings,
}: {
  initialSettings: OrganizationSettings;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [pending, startTransition] = useTransition();

  function patch(partial: Partial<OrganizationSettings>) {
    setSettings((current) => ({ ...current, ...partial }));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveOrganizationSettings(settings);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  }

  return (
    <Card className={cn("overflow-hidden", DASHBOARD_CARD_CLASS)}>
      <CardContent className="flex flex-col p-0">
        <div className={TABLE_CARD_TITLE_HEADER_CLASS}>
          <p className={CARD_SECTION_EYEBROW_CLASS}>Organization settings</p>
          <p className={SECTION_DESCRIPTION_CLASS}>
            Organization defaults, security posture, and alert preferences.
          </p>
        </div>

        <Tabs defaultValue="general" className="flex flex-col">
          <div className="border-b border-zinc-200 px-4 py-3">
            <TabsList
              className="h-auto w-full justify-start gap-1 rounded-lg bg-neutral-100 p-1"
              noBg
            >
              {(
                [
                  ["general", "General"],
                  ["security", "Security"],
                  ["notifications", "Notifications"],
                  ["system-health", "System health"],
                ] as const
              ).map(([value, label]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm text-neutral-600 shadow-none",
                    "data-[state=active]:bg-primary data-[state=active]:font-semibold data-[state=active]:text-primary-foreground",
                    "data-[state=inactive]:hover:bg-neutral-50 data-[state=inactive]:hover:text-neutral-900",
                  )}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="general" className="m-0 space-y-4 p-4 md:p-6">
            <Card className={cn(DASHBOARD_CARD_CLASS)}>
              <CardContent className="flex flex-col gap-4 p-4 md:p-5">
                <SettingsSection
                  title="Workspace settings"
                  description="Organization identity used on reports and invitations."
                >
                  <div className="flex flex-col gap-5">
                    <FieldRow
                      label="Organization name"
                      htmlFor="org-name"
                      hint="Displayed on reports and invitations."
                    >
                      <Input
                        id="org-name"
                        className="text-sm"
                        value={settings.organizationName}
                        onChange={(event) =>
                          patch({ organizationName: event.target.value })
                        }
                      />
                    </FieldRow>
                    <FieldRow
                      label="Workspace ID"
                      htmlFor="workspace-id"
                      hint="Stable identifier used in API traces."
                    >
                      <Input
                        id="workspace-id"
                        className="font-mono text-sm"
                        value={settings.workspaceId}
                        onChange={(event) =>
                          patch({ workspaceId: event.target.value })
                        }
                      />
                    </FieldRow>
                  </div>
                </SettingsSection>
              </CardContent>
            </Card>

            <Card className={cn(DASHBOARD_CARD_CLASS)}>
              <CardContent className="flex flex-col gap-4 p-4 md:p-5">
                <SettingsSection
                  title="Display preferences"
                  description="Timezone and date format for audit timestamps."
                >
                  <div className="flex flex-col gap-5">
                    <FieldRow label="Timezone" htmlFor="timezone">
                      <Select
                        value={settings.timezone}
                        onValueChange={(value) => patch({ timezone: value })}
                      >
                        <SelectTrigger id="timezone" className="w-full max-w-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldRow>
                    <FieldRow
                      label="Date format"
                      htmlFor="date-format"
                      hint="Applied to audit trail timestamps."
                    >
                      <Select
                        value={settings.dateFormat}
                        onValueChange={(value) =>
                          patch({ dateFormat: value as DateFormat })
                        }
                      >
                        <SelectTrigger
                          id="date-format"
                          className="w-full max-w-md"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DATE_FORMAT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldRow>
                  </div>
                </SettingsSection>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="m-0 p-4 md:p-6">
            <SettingsSection
              title="Security and access control"
              description="MFA enforcement, session lifetime, and password policy."
            >
              <div className="flex flex-col gap-5">
                <ToggleRow
                  id="enforce-mfa"
                  label="Require MFA for all users"
                  description="Block sign-in until organization members enroll multi-factor authentication."
                  checked={settings.enforceMfa}
                  onCheckedChange={(checked) => patch({ enforceMfa: checked })}
                />
                <FieldRow label="Session timeout" htmlFor="session-timeout">
                  <Select
                    value={settings.sessionTimeout}
                    onValueChange={(value) =>
                      patch({ sessionTimeout: value as SessionTimeout })
                    }
                  >
                    <SelectTrigger
                      id="session-timeout"
                      className="w-full max-w-md"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_TIMEOUT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
                <Separator className="bg-neutral-200" />
                <FieldRow
                  label="Minimum password length"
                  htmlFor="password-min"
                >
                  <Input
                    id="password-min"
                    type="number"
                    min={8}
                    max={128}
                    className="max-w-[8rem] text-sm"
                    value={settings.passwordMinLength}
                    onChange={(event) =>
                      patch({
                        passwordMinLength: Number(event.target.value) || 8,
                      })
                    }
                  />
                </FieldRow>
                <ToggleRow
                  id="require-special"
                  label="Require special characters"
                  description="Passwords must include at least one non-alphanumeric character."
                  checked={settings.requireSpecialChars}
                  onCheckedChange={(checked) =>
                    patch({ requireSpecialChars: checked })
                  }
                />
                <FieldRow
                  label="Password expiration"
                  htmlFor="password-expiry"
                >
                  <Select
                    value={settings.passwordExpiry}
                    onValueChange={(value) =>
                      patch({ passwordExpiry: value as PasswordExpiry })
                    }
                  >
                    <SelectTrigger
                      id="password-expiry"
                      className="w-full max-w-md"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PASSWORD_EXPIRY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
              </div>
            </SettingsSection>
          </TabsContent>

          <TabsContent value="notifications" className="m-0 p-4 md:p-6">
            <SettingsSection
              title="Notifications"
              description="Email alerts for critical compliance events."
            >
              <div className="flex flex-col gap-3">
                <ToggleRow
                  id="notify-critical"
                  label="Critical audit failures"
                  description="Email when an SOP, BPR, or FIR run fails or scores below threshold."
                  checked={settings.notifyCriticalFailures}
                  onCheckedChange={(checked) =>
                    patch({ notifyCriticalFailures: checked })
                  }
                />
                <ToggleRow
                  id="notify-frameworks"
                  label="New framework updates"
                  description="Alert when regulatory frameworks or clause packs are published."
                  checked={settings.notifyFrameworkUpdates}
                  onCheckedChange={(checked) =>
                    patch({ notifyFrameworkUpdates: checked })
                  }
                />
                <ToggleRow
                  id="notify-policy"
                  label="Policy review deadlines"
                  description="Remind owners ahead of scheduled policy review dates."
                  checked={settings.notifyPolicyDeadlines}
                  onCheckedChange={(checked) =>
                    patch({ notifyPolicyDeadlines: checked })
                  }
                />
              </div>
            </SettingsSection>
          </TabsContent>

          <TabsContent value="system-health" className="m-0 p-4 md:p-6">
            <SettingsSection
              title="System health"
              description="Live infrastructure checks and tenant diagnostics for admin and engineering reference."
            >
              <SystemHealthPanel />
            </SettingsSection>
          </TabsContent>
        </Tabs>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-zinc-200 bg-white px-4 py-3">
          <Button
            type="button"
            variant="black"
            className="h-9! min-h-9! rounded-md px-4 text-sm"
            disabled={pending}
            onClick={handleSave}
          >
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
