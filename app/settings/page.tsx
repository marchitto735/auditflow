import SectionHeader from "@/components/section-header/section-header";
import SettingsWorkspace from "@/components/settings/settings-workspace";
import {
  PAGE_CONTENT_TOP_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_INNER_CLASS,
} from "@/lib/page-layout";
import { getOrganizationSettingsDraft } from "@/lib/services/get-settings-snapshot";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const settings = getOrganizationSettingsDraft();

  return (
    <div className="min-h-0 min-w-0 w-full flex-1">
      <section className={cn(PAGE_GUTTER_CLASS, PAGE_CONTENT_TOP_CLASS)}>
        <div className={cn(PAGE_INNER_CLASS, "flex w-full flex-col")}>
          <SectionHeader
            title="Settings"
            description="Organization defaults, security controls, notifications, and system health."
          />
          <SettingsWorkspace initialSettings={settings} />
        </div>
      </section>
    </div>
  );
}
