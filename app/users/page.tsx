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
    <div className="min-h-0 min-w-0 w-full flex-1">
      <section className={cn(PAGE_GUTTER_CLASS, PAGE_CONTENT_TOP_CLASS)}>
        <div className={cn(PAGE_INNER_CLASS, "flex w-full flex-col")}>
          <UsersTableCard users={users} />
        </div>
      </section>
    </div>
  );
}
