"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CircleUser, Menu } from "lucide-react";
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
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import SmartHeader from "@/components/header/smart-header";
import { PAGE_GUTTER_CLASS, PAGE_INNER_CLASS, NAV_UTILITY_BUTTON_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

console.log("🔥 MODULE LOAD:", "header");

function MobileMenuMark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      aria-label="Home"
    >
      <img
        src="/images/auditflow-logo.svg"
        alt="AuditFlow"
        className="h-5 w-auto shrink-0 dark:[filter:invert(1)] color:[filter:invert(1)]"
        width={20}
        height={20}
      />
    </Link>
  );
}

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
              <BreadcrumbPage className="font-semibold">{drillDown}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">{current}</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

let Header: React.FC;
try {
  Header = function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
      const mq = window.matchMedia("(min-width: 1024px)");
      let wasDesktop = mq.matches;
      const onMediaChange = () => {
        const isDesktop = mq.matches;
        if (!wasDesktop && isDesktop) setMobileMenuOpen(false);
        wasDesktop = isDesktop;
      };
      mq.addEventListener("change", onMediaChange);
      return () => mq.removeEventListener("change", onMediaChange);
    }, []);

    console.log("🔥 COMPONENT RENDER:", "Header");
    console.log("MOUNT:", "Header");
    return (
      <>
      <SmartHeader
        className="bg-background pt-6 text-foreground"
        locked={mobileMenuOpen}
        resetKey={pathname}
      >
        <div className={PAGE_GUTTER_CLASS}>
          <div className={PAGE_INNER_CLASS}>
            <div className="flex h-12 min-w-0 items-center py-0">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(NAV_UTILITY_BUTTON_CLASS, "-ml-2")}
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="size-5 shrink-0 text-foreground" />
                </Button>
                <div className="min-w-0 flex-1">
                  <HeaderBreadcrumbs pathname={pathname} />
                </div>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-3">
                <CartTrigger />
                <Button
                  type="button"
                  variant="ghost"
                  className={NAV_UTILITY_BUTTON_CLASS}
                  aria-label="Open profile"
                >
                  <CircleUser className="size-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SmartHeader>
      <div className="h-[4.5rem] shrink-0" aria-hidden />
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          id="mobile-menu-sheet"
          side="left"
          className="mobile-menu-sheet w-full max-w-full sm:max-w-full lg:max-w-[240px] border-r-0 bg-sidebar border-border text-sidebar-foreground"
          closeButtonClassName="top-6 right-[10px] h-9 min-h-9 w-9 min-w-9 p-0 rounded-md border-0 bg-transparent shadow-none outline-none ring-0 ring-offset-0 hover:bg-[var(--sidebar-hover)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(40%_0.035_165)] text-foreground hover:text-sidebar-accent-foreground !data-[state=open]:bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors flex items-center justify-center [&_svg]:text-current [&_svg]:transition-colors hover:[&_svg]:text-sidebar-accent-foreground"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex flex-col items-start px-2 pt-6 pb-4">
                      <div className="ps-sidebar-crown-row mb-6 flex h-12 items-center">
                        <MobileMenuMark onNavigate={() => setMobileMenuOpen(false)} />
                      </div>
                      <SidebarGroup>
                        <SidebarMenu
                          className="mobile-menu-connect-nav gap-0 items-start w-full pl-0 min-w-0"
                          aria-label="Main"
                        >
                          <SidebarMenuItem className="w-full">
                            <SidebarMenuButton asChild>
                              <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="no-underline w-full"
                              >
                                Dashboard
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem className="w-full">
                            <SidebarMenuButton asChild>
                              <Link
                                href="/reports"
                                onClick={() => setMobileMenuOpen(false)}
                                className="no-underline w-full"
                              >
                                Reports
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem className="w-full">
                            <SidebarMenuButton asChild>
                              <Link
                                href="/help"
                                onClick={() => setMobileMenuOpen(false)}
                                className="no-underline w-full"
                              >
                                Help
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem className="w-full">
                            <SidebarMenuButton asChild>
                              <a
                                href="mailto:mikemarchitto@gmail.com?subject=AuditFlow%20support"
                                onClick={() => setMobileMenuOpen(false)}
                                className="no-underline w-full"
                              >
                                Support
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroup>
          </div>
        </SheetContent>
      </Sheet>
      </>
    );
  };
} catch (err) {
  console.error("🔥 MODULE ERROR in header:", err);
  throw err;
}

export default Header;