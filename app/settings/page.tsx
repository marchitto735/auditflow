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
    <div className="min-h-0 min-w-0 w-full flex-1 pb-0 md:pb-4">
      <section className={cn(PAGE_GUTTER_CLASS, PAGE_CONTENT_TOP_CLASS, "pb-4")}>
        <div className={cn(PAGE_INNER_CLASS, "flex w-full flex-col")}>
          <SectionHeader
            title="Configuration"
            description="Organization defaults, security controls, and notification preferences."
          />
          <SettingsWorkspace initialSettings={settings} />
        </div>
      </section>
    </div>
  );
}
