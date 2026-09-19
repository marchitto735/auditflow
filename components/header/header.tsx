"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, CircleHelp, CircleUser, Menu } from "lucide-react";
import CartTrigger from "@/components/cart/cart-trigger";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppSidebarNav } from "@/components/sidebar-layout/app-sidebar-nav";
import { useSidebar } from "@/components/ui/sidebar";
import {
  NAV_UTILITY_BUTTON_CLASS,
  PAGE_GUTTER_CLASS,
  PAGE_INNER_CLASS,
  APP_TOPBAR_HEIGHT_CLASS,
} from "@/lib/page-layout";
import { cn } from "@/lib/utils";

/** Persistent sidebar from xl up; drawer for tablet + mobile. */
const DESKTOP_SIDEBAR_MQ = "(min-width: 1280px)";

function HeaderBreadcrumbs({ pathname }: { pathname: string }) {
  const drillDown =
    pathname === "/dashboard/audits"
      ? "Audit Log"
      : pathname === "/dashboard/findings"
        ? "Open Findings"
        : pathname === "/dashboard/score-analysis"
          ? "Score Breakdown"
          : null;

  const current =
    drillDown ??
    (pathname === "/reports"
      ? "Reports"
      : pathname === "/help"
        ? "Help"
        : pathname === "/audit/results"
          ? "Audit Report"
          : pathname === "/audit/sop"
            ? "SOP Audit"
            : pathname === "/audit/bpr"
              ? "BPR Audit"
              : pathname === "/audit/fir"
                ? "FIR Audit"
                : "Dashboard");

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-body2">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Audits</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        {drillDown ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">{drillDown}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{current}</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** Radix menu IDs differ across SSR/CSR — mount after hydrate with a matching placeholder. */
function ProfileMenu() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        className={NAV_UTILITY_BUTTON_CLASS}
        aria-label="Open profile menu"
      >
        <CircleUser className="size-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={NAV_UTILITY_BUTTON_CLASS}
          aria-label="Open profile menu"
        >
          <CircleUser className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen } = useSidebar();

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_SIDEBAR_MQ);
    const sync = () => {
      if (mq.matches) setMobileOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [setMobileOpen]);

  return (
    <>
      <header
        className={cn(
          APP_TOPBAR_HEIGHT_CLASS,
          // `fixed` — sticky is broken by html/body overflow-x:hidden in globals.css
          "fixed top-0 right-0 left-0 z-30 flex w-auto items-center border-b border-border bg-background/95 backdrop-blur xl:left-[var(--sidebar-width,16rem)]",
        )}
      >
        <div className={cn(PAGE_GUTTER_CLASS, "flex h-full w-full items-center")}>
          <div
            className={cn(
              PAGE_INNER_CLASS,
              "flex h-full min-w-0 w-full items-center justify-between gap-4",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {/* Tablet/mobile only — opens sidebar drawer; not page nav */}
              <Button
                type="button"
                variant="ghost"
                className={cn(NAV_UTILITY_BUTTON_CLASS, "xl:hidden")}
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="size-5 shrink-0 text-foreground" />
              </Button>
              <div className="min-w-0">
                <HeaderBreadcrumbs pathname={pathname} />
              </div>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
              <Button
                type="button"
                variant="ghost"
                className={NAV_UTILITY_BUTTON_CLASS}
                aria-label="Notifications"
              >
                <Bell className="size-5" />
              </Button>
              <Link
                href="/help"
                className={cn(NAV_UTILITY_BUTTON_CLASS, "text-foreground")}
                aria-label="Help"
              >
                <CircleHelp className="size-5" />
              </Link>
              <CartTrigger />
              <ProfileMenu />
            </div>
          </div>
        </div>
      </header>
      {/* Reserves vertical space for the fixed navbar */}
      <div className={cn(APP_TOPBAR_HEIGHT_CLASS, "shrink-0")} aria-hidden />

      {/* Always mounted so Radix useId tree matches SSR; closed automatically on xl+ */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          id="mobile-menu-sheet"
          side="left"
          showCloseButton={false}
          className="mobile-menu-sheet flex h-full w-[min(100%,280px)] max-w-[280px] flex-col border-border border-r-0 bg-sidebar p-0 text-sidebar-foreground xl:hidden"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <AppSidebarNav
            forceExpanded
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
