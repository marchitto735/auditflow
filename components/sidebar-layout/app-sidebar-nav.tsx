"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
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
import {
  APP_TOPBAR_HEIGHT_CLASS,
  NAV_UTILITY_BUTTON_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type AppSidebarNavProps = {
  /** Mobile sheet: close after navigate. */
  onNavigate?: () => void;
  /** Force expanded labels (mobile sheet). */
  forceExpanded?: boolean;
  className?: string;
};

export function AppSidebarNav({
  onNavigate,
  forceExpanded = false,
  className,
}: AppSidebarNavProps) {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useSidebar();
  const compact = collapsed && !forceExpanded;
  const railPad = compact ? "px-2" : "px-4";

  function handleNavigate() {
    onNavigate?.();
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "flex h-full min-h-0 w-full flex-col",
          className,
        )}
      >
        {/* Full-bleed brand bar — matches main sticky header height & top edge */}
        <SidebarHeader
          className={cn(
            APP_TOPBAR_HEIGHT_CLASS,
            "shrink-0",
            railPad,
          )}
        >
          <div
            className={cn(
              "flex h-full items-center gap-2",
              compact ? "justify-center" : "justify-between px-3",
            )}
          >
            {!compact ? (
              <Link
                href="/"
                onClick={handleNavigate}
                  className="m-0 min-w-0 flex-1 truncate text-xl font-bold tracking-tight text-black no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-lg dark:text-neutral-100 color:text-sidebar-foreground"
              >
                AuditFlow
              </Link>
            ) : null}

            {onNavigate ? (
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  NAV_UTILITY_BUTTON_CLASS,
                  "text-sidebar-foreground",
                )}
                aria-label="Close menu"
                onClick={onNavigate}
              >
                <X className="size-5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  NAV_UTILITY_BUTTON_CLASS,
                  "text-sidebar-foreground",
                )}
                aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
                aria-pressed={compact}
                onClick={toggleCollapsed}
              >
                {compact ? (
                  <PanelLeft className="size-5" />
                ) : (
                  <PanelLeftClose className="size-5" />
                )}
              </Button>
            )}
          </div>
        </SidebarHeader>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col justify-between pb-4",
            railPad,
          )}
        >
          <SidebarContent className="min-h-0 flex-1 gap-4 overflow-y-auto overflow-x-hidden pt-1 pb-1">
            {SIDEBAR_NAV_SECTIONS.map((section) => (
              <SidebarGroup key={section.label} className="gap-1">
                {!compact ? (
                  <SidebarGroupLabel className="mb-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-black">
                    {section.label}
                  </SidebarGroupLabel>
                ) : null}
                <SidebarMenu className="gap-0.5">
                  {section.items.map((item) => {
                    const active = isSidebarNavActive(pathname, item);
                    const Icon = item.icon;
                    const link = (
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className="rounded-lg"
                      >
                        <Link
                          href={item.href}
                          onClick={handleNavigate}
                          className="no-underline"
                          aria-current={active ? "page" : undefined}
                          aria-label={compact ? item.title : undefined}
                        >
                          <Icon aria-hidden />
                          {!compact ? (
                            <span className="min-w-0 flex-1 truncate text-left leading-snug">
                              {item.title}
                            </span>
                          ) : (
                            <span className="sr-only">{item.title}</span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    );

                    return (
                      <SidebarMenuItem key={item.href}>
                        {compact ? (
                          <Tooltip>
                            <TooltipTrigger asChild>{link}</TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          link
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="mt-auto shrink-0 pt-3">
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-muted/40 px-2.5 py-2",
                compact && "justify-center border-0 bg-transparent px-0",
              )}
            >
              <Avatar className="size-9 shrink-0">
                <AvatarImage
                  src={SIDEBAR_PROFILE.imageSrc}
                  alt={SIDEBAR_PROFILE.name}
                />
                <AvatarFallback>{SIDEBAR_PROFILE.initials}</AvatarFallback>
              </Avatar>
              {!compact ? (
                <div className="min-w-0 flex-1">
                  <p className="text-button m-0 truncate font-medium text-sidebar-foreground">
                    {SIDEBAR_PROFILE.name}
                  </p>
                  <p className="text-caption m-0 truncate text-black">
                    {SIDEBAR_PROFILE.role}
                  </p>
                </div>
              ) : null}
            </div>
          </SidebarFooter>
        </div>
      </div>
    </TooltipProvider>
  );
}
