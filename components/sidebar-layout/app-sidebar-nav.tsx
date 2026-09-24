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
        "flex w-full items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-muted/40 px-2.5 py-2 text-left transition-colors duration-200 hover:border-zinc-400 hover:bg-zinc-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-sidebar-ring data-[state=open]:border-zinc-400 data-[state=open]:bg-zinc-50/50",
        compact &&
          "justify-center border-0 bg-transparent px-0 hover:border-transparent hover:bg-zinc-100/80 data-[state=open]:border-transparent data-[state=open]:bg-zinc-100/80",
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
              "flex h-full w-full items-center gap-2",
              compact ? "justify-center" : "justify-between",
            )}
          >
            {!compact ? (
              <Link
                href="/"
                onClick={handleNavigate}
                  className="m-0 min-w-0 flex-1 truncate pl-3 text-xl font-bold tracking-tight text-black no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-lg dark:text-neutral-100 color:text-sidebar-foreground"
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
                  "h-8! w-8! min-h-8! min-w-8! text-sidebar-foreground [&_svg]:size-4 hover:bg-[#F7F7F7]!",
                  !compact && "-mr-1",
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
                  "h-8! w-8! min-h-8! min-w-8! text-sidebar-foreground [&_svg]:size-4 hover:bg-[#F7F7F7]!",
                  !compact && "-mr-1",
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

        <div
          className={cn(
            "flex min-h-0 w-full min-w-0 flex-1 flex-col justify-between pb-8",
            railPad,
          )}
        >
          <SidebarContent className="min-h-0 flex-1 gap-4 overflow-y-auto overflow-x-hidden pt-0 pb-1 mt-0.5">
            {SIDEBAR_NAV_SECTIONS.map((section) => (
              <SidebarGroup key={section.label} className="gap-1">
                {!compact ? (
                  <SidebarGroupLabel className="mb-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-black">
                    {section.label}
                  </SidebarGroupLabel>
                ) : null}
                <SidebarMenu className="gap-0.5">
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
                        className="rounded-[6px]"
                        aria-current={active ? "true" : undefined}
                        aria-label={compact ? item.title : undefined}
                        onClick={() => {
                          openConfigureAudit(null);
                          handleNavigate();
                        }}
                      >
                        <Icon className="h-4 w-4 shrink-0" size={16} aria-hidden />
                        {!compact ? (
                          <span className="min-w-0 flex-1 truncate text-left leading-snug">
                            {item.title}
                          </span>
                        ) : (
                          <span className="sr-only">{item.title}</span>
                        )}
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        compact={compact}
                        className="rounded-[6px]"
                      >
                        <Link
                          href={item.href}
                          onClick={handleNavigate}
                          className="no-underline"
                          aria-current={active ? "page" : undefined}
                          aria-label={compact ? item.title : undefined}
                        >
                          <Icon className="h-4 w-4 shrink-0" size={16} aria-hidden />
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

          <SidebarFooter className="mt-auto shrink-0 pt-3">
            <SidebarProfileCard compact={compact} />
          </SidebarFooter>
        </div>
      </div>
    </TooltipProvider>
  );
}
