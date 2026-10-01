"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ChevronDown,
  MoreHorizontal,
  Search,
} from "lucide-react";
import {
  deactivateDirectoryUser,
  resetDirectoryUserPassword,
  revokeDirectoryUserSessions,
} from "@/app/actions/user-actions";
import {
  CardActionsMenu,
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
  DASHBOARD_MENU_ITEM_SELECTED_CLASS,
  TABLE_CARD_MENU_ACTIONS,
} from "@/components/dashboard/card-actions-menu";
import { EditRoleDialog } from "@/components/users/edit-role-dialog";
import { InviteUserDialog } from "@/components/users/invite-user-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePaginationBar,
  TableRow,
} from "@/components/ui/table";
import {
  CARD_SECTION_EYEBROW_CLASS,
  SECTION_DESCRIPTION_CLASS,
  DASHBOARD_CARD_CLASS,
  PAGE_HEADER_PRIMARY_BUTTON_CLASS,
  TABLE_CARD_HEADER_CLASS,
  TABLE_STICKY_HEADER_CLASS,
  TABLE_ROW_ACTIONS_CELL_CLASS,
  TABLE_ROW_ACTIONS_HEAD_CLASS,
  TABLE_TOOLBAR_FILTERS_CLASS,
  TABLE_TOOLBAR_FILTER_TRIGGER_CLASS,
  TABLE_TOOLBAR_ROW_CLASS,
  TABLE_TOOLBAR_SEARCH_ICON_CLASS,
  TABLE_TOOLBAR_SEARCH_INPUT_CLASS,
  TABLE_TOOLBAR_SEARCH_WRAP_CLASS,
} from "@/lib/page-layout";
import {
  AUDITFLOW_ROLES,
  USER_STATUSES,
  filterDirectoryUsers,
  formatLastActive,
  type DirectoryUser,
  type UserDirectoryFilters,
  type UserRoleFilter,
  type UserStatus,
  type UserStatusFilter,
} from "@/lib/users";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/section-header/section-header";

const DEFAULT_PAGE_SIZE = 3;
const TABLE_MIN_WIDTH_CLASS = "min-w-[56rem]";

const INITIAL_FILTERS: UserDirectoryFilters = {
  search: "",
  role: "all",
  status: "all",
};

const ROLE_OPTIONS: { value: UserRoleFilter; label: string }[] = [
  { value: "all", label: "All roles" },
  ...AUDITFLOW_ROLES.map((role) => ({ value: role, label: role })),
];

const STATUS_OPTIONS: { value: UserStatusFilter; label: string }[] = [
  { value: "all", label: "All status" },
  ...USER_STATUSES.map((status) => ({ value: status, label: status })),
];

function userStatusBadgeVariant(status: UserStatus) {
  switch (status) {
    case "Active":
      return "success" as const;
    case "Pending":
      return "warning" as const;
    case "Suspended":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  menusMounted,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  menusMounted: boolean;
  onChange: (value: T) => void;
}) {
  const selected =
    options.find((option) => option.value === value)?.label ?? label;
  const triggerRef = useRef<HTMLButtonElement>(null);

  function releaseTriggerFocus() {
    triggerRef.current?.blur();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      aria-label={label}
      className={cn(TABLE_TOOLBAR_FILTER_TRIGGER_CLASS, "min-w-[8.5rem]")}
    >
      <span className="truncate">{selected}</span>
      <ChevronDown className="size-4 shrink-0 text-neutral-900" aria-hidden />
    </button>
  );

  if (!menusMounted) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={cn(DASHBOARD_MENU_CONTENT_CLASS, "min-w-[12rem]")}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          releaseTriggerFocus();
        }}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <DropdownMenuItem
              key={option.value}
              className={cn(
                DASHBOARD_MENU_ITEM_CLASS,
                isSelected && DASHBOARD_MENU_ITEM_SELECTED_CLASS,
              )}
              onSelect={() => {
                releaseTriggerFocus();
                onChange(option.value);
              }}
            >
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserRowActions({
  user,
  menusMounted,
  onEditRole,
  onActionMessage,
  onDeactivated,
}: {
  user: DirectoryUser;
  menusMounted: boolean;
  onEditRole: (user: DirectoryUser) => void;
  onActionMessage: (message: string) => void;
  onDeactivated: (userId: string) => void;
}) {
  const [, startTransition] = useTransition();

  if (!menusMounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        className="h-8! w-8! min-h-8! min-w-8! rounded-md p-0!"
        aria-label={`Actions for ${user.name}`}
        disabled
      >
        <MoreHorizontal className="size-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-8! w-8! min-h-8! min-w-8! rounded-md p-0!"
          aria-label={`Actions for ${user.name}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className={cn(DASHBOARD_MENU_CONTENT_CLASS, "min-w-[11.5rem]")}
      >
        <DropdownMenuItem
          className={DASHBOARD_MENU_ITEM_CLASS}
          onSelect={() => onEditRole(user)}
        >
          Edit role
        </DropdownMenuItem>
        <DropdownMenuItem
          className={DASHBOARD_MENU_ITEM_CLASS}
          onSelect={() => {
            startTransition(async () => {
              const result = await resetDirectoryUserPassword(user.email);
              onActionMessage(result.message);
            });
          }}
        >
          Reset password
        </DropdownMenuItem>
        <DropdownMenuItem
          className={DASHBOARD_MENU_ITEM_CLASS}
          onSelect={() => {
            startTransition(async () => {
              const result = await revokeDirectoryUserSessions(user.id);
              onActionMessage(result.message);
            });
          }}
        >
          Revoke sessions
        </DropdownMenuItem>
        <DropdownMenuItem
          className={DASHBOARD_MENU_ITEM_CLASS}
          disabled={user.status === "Suspended"}
          onSelect={() => {
            startTransition(async () => {
              const result = await deactivateDirectoryUser(user.id);
              onActionMessage(result.message);
              if (result.ok) onDeactivated(user.id);
            });
          }}
        >
          Deactivate user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function UsersTableCard({
  users: initialUsers,
  className,
}: {
  users: DirectoryUser[];
  className?: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [filters, setFilters] = useState<UserDirectoryFilters>(INITIAL_FILTERS);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [menusMounted, setMenusMounted] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<DirectoryUser | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    setMenusMounted(true);
  }, []);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const filtered = useMemo(
    () => filterDirectoryUsers(users, filters),
    [users, filters],
  );

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  function patchFilters(partial: Partial<UserDirectoryFilters>) {
    setFilters((current) => ({ ...current, ...partial }));
  }

  function handlePageSizeChange(value: string) {
    const scrollY = window.scrollY;
    setPageSize(Number(value));
    setPage(1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    });
  }

  function showBanner(message: string) {
    setBanner(message);
    window.setTimeout(() => setBanner(null), 4000);
  }

  return (
    <>
      <SectionHeader
        title="Team"
        description="Invite teammates, assign AuditFlow roles, and monitor MFA and account status."
        actions={
          <Button
            type="button"
            variant="black"
            className={PAGE_HEADER_PRIMARY_BUTTON_CLASS}
            onClick={() => setInviteOpen(true)}
          >
            Invite user
          </Button>
        }
      />
      <Card
        className={cn(
          "flex shrink-0 flex-col overflow-hidden",
          DASHBOARD_CARD_CLASS,
          className,
        )}
      >
        <CardContent className="flex flex-col p-0">
          <div className={TABLE_CARD_HEADER_CLASS}>
            <div className="min-w-0 pr-10">
              <p className={CARD_SECTION_EYEBROW_CLASS}>User directory</p>
              <p className={SECTION_DESCRIPTION_CLASS}>
                Organization members, RBAC roles, MFA posture, and session
                controls.
              </p>
            </div>
            <div className="absolute top-3 right-3">
              <CardActionsMenu
                label="User directory"
                actions={TABLE_CARD_MENU_ACTIONS}
              />
            </div>

            <div
              className={TABLE_TOOLBAR_ROW_CLASS}
              role="search"
              aria-label="Search and filter users"
            >
              <div className={TABLE_TOOLBAR_SEARCH_WRAP_CLASS}>
                <Search
                  className={TABLE_TOOLBAR_SEARCH_ICON_CLASS}
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder="Search name or email"
                  value={filters.search}
                  onChange={(event) =>
                    patchFilters({ search: event.target.value })
                  }
                  className={TABLE_TOOLBAR_SEARCH_INPUT_CLASS}
                />
              </div>
              <div className={TABLE_TOOLBAR_FILTERS_CLASS}>
                <FilterSelect
                  label="Role"
                  value={filters.role}
                  options={ROLE_OPTIONS}
                  menusMounted={menusMounted}
                  onChange={(role) => patchFilters({ role })}
                />
                <FilterSelect
                  label="Status"
                  value={filters.status}
                  options={STATUS_OPTIONS}
                  menusMounted={menusMounted}
                  onChange={(status) => patchFilters({ status })}
                />
              </div>
            </div>

            {banner ? (
              <p
                className="m-0 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900"
                role="status"
              >
                {banner}
              </p>
            ) : null}
          </div>

          {totalCount === 0 ? (
            <p className="text-body1 m-0 px-4 py-4 text-muted-foreground">
              No users match the current search and filters.
            </p>
          ) : (
            <div
              className="flex shrink-0 flex-col"
              style={{ overflowAnchor: "none" }}
            >
              <Table
                className={TABLE_MIN_WIDTH_CLASS}
                containerClassName="overflow-x-auto"
              >
                <TableHeader className={TABLE_STICKY_HEADER_CLASS}>
                  <TableRow>
                    <TableHead className="w-[22%]">Name</TableHead>
                    <TableHead className="w-[20%]">Email</TableHead>
                    <TableHead className="w-[18%]">Assigned role</TableHead>
                    <TableHead className="w-[12%]">MFA</TableHead>
                    <TableHead className="w-[12%]">Status</TableHead>
                    <TableHead className="w-[12%]">Last active</TableHead>
                    <TableHead className={TABLE_ROW_ACTIONS_HEAD_CLASS}>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((user) => (
                    <TableRow key={user.id} className="bg-white">
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="size-8">
                            {user.avatarUrl ? (
                              <AvatarImage
                                src={user.avatarUrl}
                                alt={user.name}
                              />
                            ) : null}
                            <AvatarFallback className="text-sm">
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="min-w-0 truncate">
                            {user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="block truncate">
                          {user.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="block truncate">
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          tone={user.mfaEnabled ? "success" : "neutral"}
                        >
                          {user.mfaEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={userStatusBadgeVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono tabular-nums">
                          {formatLastActive(user.lastActiveAt)}
                        </span>
                      </TableCell>
                      <TableCell className={TABLE_ROW_ACTIONS_CELL_CLASS}>
                        <UserRowActions
                          user={user}
                          menusMounted={menusMounted}
                          onEditRole={setEditUser}
                          onActionMessage={showBanner}
                          onDeactivated={(userId) => {
                            setUsers((current) =>
                              current.map((entry) =>
                                entry.id === userId
                                  ? { ...entry, status: "Suspended" }
                                  : entry,
                              ),
                            );
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <TablePaginationBar
                className={TABLE_MIN_WIDTH_CLASS}
                pageRowsCount={pageRows.length}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                paginationLabel="User directory pagination"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={showBanner}
      />

      <EditRoleDialog
        user={editUser}
        open={Boolean(editUser)}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
        onUpdated={(userId, role, message) => {
          setUsers((current) =>
            current.map((entry) =>
              entry.id === userId ? { ...entry, role } : entry,
            ),
          );
          showBanner(message);
        }}
      />
    </>
  );
}
