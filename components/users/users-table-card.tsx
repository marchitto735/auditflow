"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  ShieldOff,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CARD_SECTION_EYEBROW_CLASS,
  DASHBOARD_CARD_CLASS,
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

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;
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

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);
  return items;
}

function statusDotClass(status: UserStatus) {
  switch (status) {
    case "Active":
      return "bg-status-success";
    case "Pending":
      return "bg-status-warning";
    case "Suspended":
      return "bg-status-critical";
    default:
      return "bg-neutral-400";
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
      className="inline-flex h-9 min-w-[8.5rem] items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-colors hover:border-primary/40 hover:bg-[var(--interactive-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
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

function PageSizeSelector({
  pageSize,
  menusMounted,
  onChange,
}: {
  pageSize: number;
  menusMounted: boolean;
  onChange: (value: string) => void;
}) {
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
      aria-label="Rows per page"
      className="inline-flex h-8 w-[4.5rem] items-center justify-between gap-1 rounded-md border border-zinc-200 bg-sidebar-muted/40 px-2 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:border-primary/40 hover:bg-[var(--interactive-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span>{pageSize}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-neutral-900" aria-hidden />
    </button>
  );

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="text-sm text-muted-foreground">Rows per page:</span>
      {menusMounted ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className={DASHBOARD_MENU_CONTENT_CLASS}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              releaseTriggerFocus();
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => {
              const isSelected = size === pageSize;
              return (
                <DropdownMenuItem
                  key={size}
                  className={cn(
                    DASHBOARD_MENU_ITEM_CLASS,
                    isSelected && DASHBOARD_MENU_ITEM_SELECTED_CLASS,
                  )}
                  onSelect={() => {
                    releaseTriggerFocus();
                    onChange(String(size));
                  }}
                >
                  {size}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        trigger
      )}
    </div>
  );
}

function UsersPaginationNav({
  pageItems,
  currentPage,
  totalPages,
  onPageChange,
  className,
}: {
  pageItems: Array<number | "ellipsis">;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  return (
    <nav
      className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      aria-label="User directory pagination"
    >
      <Button
        type="button"
        variant="ghost"
        className="h-8! min-h-8! rounded-md px-2 text-sm font-medium text-neutral-500 shadow-none hover:bg-[var(--interactive-hover)] hover:text-primary"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        Previous
      </Button>
      {pageItems.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-8 items-center px-1 text-sm text-neutral-900"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant="ghost"
            className={cn(
              "h-8! min-h-8! w-8! rounded-md p-0! text-sm font-medium",
              item === currentPage
                ? "bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] hover:text-primary-foreground"
                : "text-neutral-900 hover:bg-[var(--interactive-hover)] hover:text-primary",
            )}
            aria-current={item === currentPage ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        type="button"
        variant="ghost"
        className="h-8! min-h-8! rounded-md px-2 text-sm font-medium text-neutral-500 shadow-none hover:bg-[var(--interactive-hover)] hover:text-primary"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </Button>
    </nav>
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
          Edit Role
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
          Reset Password
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
          Revoke Sessions
        </DropdownMenuItem>
        <DropdownMenuSeparator className="mx-1 bg-zinc-200" />
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
          Deactivate User
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
  const pageItems = buildPageItems(currentPage, totalPages);

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
      <Card
        className={cn(
          "flex shrink-0 flex-col overflow-hidden",
          DASHBOARD_CARD_CLASS,
          className,
        )}
      >
        <CardContent className="flex flex-col p-0">
          <div className="relative flex shrink-0 flex-col gap-3 border-b border-zinc-200 px-4 pt-[16px] pb-3">
            <div className="min-w-0 pr-10">
              <p className={CARD_SECTION_EYEBROW_CLASS}>User Directory</p>
              <p className="text-body1 m-0 mt-1 text-neutral-600">
                Organization members, RBAC roles, MFA posture, and session
                controls.
              </p>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <Button
                type="button"
                variant="black"
                className="h-9! min-h-9! gap-1.5 rounded-md px-3 text-sm"
                onClick={() => setInviteOpen(true)}
              >
                <Plus className="size-4" aria-hidden />
                Invite User
              </Button>
              <CardActionsMenu
                label="User Directory"
                actions={TABLE_CARD_MENU_ACTIONS}
              />
            </div>

            <div
              className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4"
              role="search"
              aria-label="Search and filter users"
            >
              <div className="relative min-w-0 w-full md:max-w-md md:flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-900"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder="Search name or email"
                  value={filters.search}
                  onChange={(event) =>
                    patchFilters({ search: event.target.value })
                  }
                  className="h-9 pl-9"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
                className={cn(
                  "w-full table-fixed border-separate border-spacing-0",
                  TABLE_MIN_WIDTH_CLASS,
                )}
                containerClassName="overflow-x-auto"
              >
                <TableHeader className="sticky top-0 z-20 bg-white shadow-[0_1px_0_0_var(--border)]">
                  <TableRow className="border-0 bg-white hover:bg-transparent">
                    <TableHead className="h-10 w-[22%] px-4 text-left text-sm font-medium text-neutral-900">
                      Name
                    </TableHead>
                    <TableHead className="h-10 w-[20%] px-4 text-left text-sm font-medium text-neutral-900">
                      Email
                    </TableHead>
                    <TableHead className="h-10 w-[18%] px-4 text-left text-sm font-medium text-neutral-900">
                      Assigned Role
                    </TableHead>
                    <TableHead className="h-10 w-[12%] px-4 text-left text-sm font-medium text-neutral-900">
                      MFA
                    </TableHead>
                    <TableHead className="h-10 w-[12%] px-4 text-left text-sm font-medium text-neutral-900">
                      Status
                    </TableHead>
                    <TableHead className="h-10 w-[12%] px-4 text-left text-sm font-medium text-neutral-900">
                      Last Active
                    </TableHead>
                    <TableHead className="h-10 w-[4%] px-2 text-right text-sm font-medium text-neutral-900">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border border-b-0 [&>tr:not(:first-child)>td]:border-t [&>tr:not(:first-child)>td]:border-border">
                  {pageRows.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-0 bg-white hover:bg-[var(--interactive-hover)]"
                    >
                      <TableCell className="h-12 max-w-0 px-4 py-0 align-middle">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="size-8">
                            {user.avatarUrl ? (
                              <AvatarImage
                                src={user.avatarUrl}
                                alt={user.name}
                              />
                            ) : null}
                            <AvatarFallback className="text-[11px]">
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="min-w-0 truncate font-medium text-neutral-900">
                            {user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="h-12 max-w-0 px-4 py-0 align-middle">
                        <span className="block truncate text-neutral-700">
                          {user.email}
                        </span>
                      </TableCell>
                      <TableCell className="h-12 max-w-0 px-4 py-0 align-middle">
                        <span className="block truncate text-neutral-900">
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 align-middle">
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1 border-neutral-200 bg-neutral-50 font-medium text-neutral-800",
                            !user.mfaEnabled && "text-neutral-500",
                          )}
                        >
                          {user.mfaEnabled ? (
                            <ShieldCheck className="size-3" aria-hidden />
                          ) : (
                            <ShieldOff className="size-3" aria-hidden />
                          )}
                          {user.mfaEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 align-middle">
                        <span className="inline-flex max-w-full min-w-0 items-center gap-2 text-neutral-900">
                          <span
                            className={cn(
                              "size-2.5 shrink-0 rounded-full",
                              statusDotClass(user.status),
                            )}
                            aria-hidden
                          />
                          <span className="truncate">{user.status}</span>
                        </span>
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 align-middle">
                        <span className="font-mono text-sm tabular-nums text-neutral-700">
                          {formatLastActive(user.lastActiveAt)}
                        </span>
                      </TableCell>
                      <TableCell className="h-12 px-2 py-0 text-right align-middle">
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

              <div className="relative z-20 shrink-0 border-t-0 bg-white py-3 shadow-[0_-1px_0_0_var(--border)]">
                <div className="flex flex-col gap-3 px-4 md:hidden">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <p className="m-0 min-w-0 text-sm text-muted-foreground">
                      Showing {pageRows.length} of {totalCount} results
                    </p>
                    <PageSizeSelector
                      pageSize={pageSize}
                      menusMounted={menusMounted}
                      onChange={handlePageSizeChange}
                    />
                  </div>
                  <UsersPaginationNav
                    pageItems={pageItems}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    className="justify-center"
                  />
                </div>

                <div
                  className={cn(
                    "hidden w-full items-center justify-between gap-4 md:flex",
                    TABLE_MIN_WIDTH_CLASS,
                  )}
                >
                  <p className="m-0 px-4 text-sm text-muted-foreground">
                    Showing {pageRows.length} of {totalCount} results
                  </p>
                  <div className="flex min-w-0 items-center justify-end gap-4 px-4">
                    <PageSizeSelector
                      pageSize={pageSize}
                      menusMounted={menusMounted}
                      onChange={handlePageSizeChange}
                    />
                    <UsersPaginationNav
                      pageItems={pageItems}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      className="shrink-0 justify-end"
                    />
                  </div>
                </div>
              </div>
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
