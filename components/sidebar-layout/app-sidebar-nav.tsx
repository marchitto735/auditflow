"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  SIDEBAR_NAV_SECTIONS,
  SIDEBAR_PROFILE,
  isSidebarNavActive,
} from "@/lib/sidebar-nav";
import { useConfigureAudit } from "@/components/configure-audit-modal/configure-audit-context";
import {
  DASHBOARD_MENU_CONTENT_CLASS,
  DASHBOARD_MENU_ITEM_CLASS,
} from "@/components/dashboard/card-actions-menu";
import {
  APP_TOPBAR_HEIGHT_CLASS,
  NAV_UTILITY_BUTTON_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type AppSidebarNavProps = {
  /** Mobile sheet: close after navigate. */
  onNavigate?: () => void;
  /** Force expanded labels (mobile sheet). */
  forceExpanded?: boolean;
  className?: string;
};

/** Radix menu IDs differ across SSR/CSR — mount after hydrate with a matching placeholder. */
function SidebarProfileCard({ compact }: { compact: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const trigger = (
    <button
      type="button"
      aria-label="Open profile menu"
      className={cn(
        "flex w-full min-w-0 items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-muted/40 px-2.5 py-2 text-left transition-[gap,padding,background-color,border-color] duration-300 ease-in-out hover:border-primary/40 hover:bg-[var(--interactive-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-neutral-900/30 data-[state=open]:border-primary/40 data-[state=open]:bg-[var(--interactive-hover)]",
        compact &&
          "mx-auto size-9 justify-center gap-0 rounded-md border-0 bg-transparent p-0 hover:border-transparent hover:bg-[var(--interactive-hover)] data-[state=open]:border-transparent data-[state=open]:bg-[var(--interactive-hover)]",
      )}
    >
      <Avatar className={cn("size-9 shrink-0", compact && "size-9")}>
        <AvatarImage
          src={SIDEBAR_PROFILE.imageSrc}
          alt={SIDEBAR_PROFILE.name}
        />
        <AvatarFallback>{SIDEBAR_PROFILE.initials}</AvatarFallback>
      </Avatar>
      <SidebarLabel show={!compact} className="min-w-0 flex-1">
        <span className="block">
          <span className="text-button m-0 block truncate font-medium text-sidebar-foreground">
            {SIDEBAR_PROFILE.name}
          </span>
          <span className="text-caption m-0 block truncate text-neutral-900">
            {SIDEBAR_PROFILE.role}
          </span>
        </span>
      </SidebarLabel>
    </button>
  );

  if (!mounted) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        side={compact ? "right" : "top"}
        align={compact ? "end" : "start"}
        sideOffset={8}
        className={cn(DASHBOARD_MENU_CONTENT_CLASS, "w-52")}
      >
        <DropdownMenuItem className={DASHBOARD_MENU_ITEM_CLASS}>
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuItem className={DASHBOARD_MENU_ITEM_CLASS}>
          Preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator className="mx-1 bg-zinc-200" />
        <DropdownMenuItem className={DASHBOARD_MENU_ITEM_CLASS}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppSidebarNav({
  onNavigate,
  forceExpanded = false,
  className,
}: AppSidebarNavProps) {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useSidebar();
  const { open, openConfigureAudit } = useConfigureAudit();
  const compact = collapsed && !forceExpanded;
  const showLabels = !compact;

  function handleNavigate() {
    onNavigate?.();
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full min-w-0 flex-col",
        className,
      )}
    >
        {/* Full-bleed brand bar — matches main sticky header height & top edge */}
        <SidebarHeader
          className={cn(
            APP_TOPBAR_HEIGHT_CLASS,
            "shrink-0",
            compact ? "px-2" : "pr-2 pl-3",
          )}
        >
          <div
            className={cn(
              "flex h-full w-full min-w-0 items-center",
              compact ? "justify-center" : "justify-between gap-2",
            )}
          >
            <SidebarLabel
              show={showLabels}
              className={cn(
                "min-w-0",
                showLabels && "max-w-none! flex-1",
              )}
            >
              <Link
                href="/dashboard"
                onClick={handleNavigate}
                tabIndex={showLabels ? undefined : -1}
                className="m-0 block truncate pl-1 text-xl font-bold tracking-tight text-neutral-900 no-underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 rounded-lg dark:text-neutral-100 color:text-sidebar-foreground"
              >
                AuditFlow
              </Link>
            </SidebarLabel>

            {onNavigate ? (
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  NAV_UTILITY_BUTTON_CLASS,
                  "h-9! w-9! min-h-9! min-w-9! shrink-0 rounded-md text-sidebar-foreground [&_svg]:size-4 hover:bg-[var(--interactive-hover)]",
                )}
                aria-label="Close menu"
                onClick={onNavigate}
              >
                <X className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  NAV_UTILITY_BUTTON_CLASS,
                  "h-9! w-9! min-h-9! min-w-9! shrink-0 rounded-md text-sidebar-foreground [&_svg]:size-4 hover:bg-[var(--interactive-hover)]",
                  !compact && "ml-auto",
                )}
                aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
                aria-pressed={compact}
                onClick={toggleCollapsed}
              >
                {compact ? (
                  <PanelLeft className="size-4" />
                ) : (
                  <PanelLeftClose className="size-4" />
                )}
              </Button>
            )}
          </div>
        </SidebarHeader>

        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col justify-between px-2 pb-8">
          <SidebarContent
            className={cn(
              "min-h-0 flex-1 gap-4 overflow-y-auto pt-0 pb-1 mt-0.5",
              compact && "items-center",
            )}
          >
            {SIDEBAR_NAV_SECTIONS.map((section) => (
              <SidebarGroup
                key={section.label}
                className={cn("gap-1", compact && "w-full items-center")}
              >
                <SidebarGroupLabel
                  visible={showLabels}
                  className="overflow-hidden px-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 whitespace-nowrap"
                >
                  {section.label}
                </SidebarGroupLabel>
                <SidebarMenu
                  className={cn("gap-0.5", compact && "w-full items-center")}
                >
                  {section.items.map((item) => {
                    const isConfigureAction = Boolean(item.configureAudit);
                    const active = isConfigureAction
                      ? open
                      : isSidebarNavActive(pathname, item);
                    const Icon = item.icon;

                    const control = isConfigureAction ? (
                      <SidebarMenuButton
                        type="button"
                        isActive={active}
                        compact={compact}
                        className="rounded-md"
                        aria-current={active ? "true" : undefined}
                        aria-label={item.title}
                        onClick={() => {
                          openConfigureAudit(null);
                          handleNavigate();
                        }}
                      >
                        <Icon className="h-4 w-4 shrink-0" size={16} aria-hidden />
                        <SidebarLabel
                          show={showLabels}
                          className={cn(
                            "text-left leading-snug",
                            showLabels && "min-w-0 flex-1",
                          )}
                        >
                          {item.title}
                        </SidebarLabel>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        compact={compact}
                        className="rounded-md"
                      >
                        <Link
                          href={item.href}
                          onClick={handleNavigate}
                          className="no-underline"
                          aria-current={active ? "page" : undefined}
                          aria-label={item.title}
                        >
                          <Icon className="h-4 w-4 shrink-0" size={16} aria-hidden />
                          <SidebarLabel
                            show={showLabels}
                            className={cn(
                              "text-left leading-snug",
                              showLabels && "min-w-0 flex-1",
                            )}
                          >
                            {item.title}
                          </SidebarLabel>
                        </Link>
                      </SidebarMenuButton>
                    );

                    return (
                      <SidebarMenuItem
                        key={item.href}
                        className={cn(compact && "flex justify-center")}
                      >
                        {compact ? (
                          <Tooltip>
                            <TooltipTrigger asChild>{control}</TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          control
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter
            className={cn(
              "mt-auto shrink-0 pt-3",
              compact && "flex items-center",
            )}
          >
            <SidebarProfileCard compact={compact} />
          </SidebarFooter>
        </div>
      </div>
  );
}
