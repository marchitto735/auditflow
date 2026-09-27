import SectionHeader from "@/components/section-header/section-header";
import UsersTableCard from "@/components/users/users-table-card";
import {
  PAGE_CONTENT_TOP_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_INNER_CLASS,
} from "@/lib/page-layout";
import { listDirectoryUsers } from "@/lib/services/list-users";
import { cn } from "@/lib/utils";

export default async function UsersPage() {
  const users = await listDirectoryUsers();

  return (
    <div className="min-h-0 min-w-0 w-full flex-1 pb-0 md:pb-4">
      <section className={cn(PAGE_GUTTER_CLASS, PAGE_CONTENT_TOP_CLASS, "pb-4")}>
        <div className={cn(PAGE_INNER_CLASS, "flex w-full flex-col")}>
          <SectionHeader
            title="User Management"
            description="Invite teammates, assign AuditFlow roles, and monitor MFA and account status."
          />
          <UsersTableCard users={users} />
        </div>
      </section>
    </div>
  );
}
