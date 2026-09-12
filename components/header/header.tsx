"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

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

let Header: React.FC;
try {
  Header = function Header() {
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
      <header
        className="fixed top-0 left-0 right-0 z-50 w-full min-w-0 bg-transparent pointer-events-none pt-6 text-foreground"
      >
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="max-w-[1328px] mx-auto">
            <div className="flex h-12 min-w-0 items-center py-0">
              <Button
                type="button"
                variant="ghost"
                className="nav-button pointer-events-auto hidden h-12 min-h-12 w-12 min-w-12 px-0 bg-transparent border-0 shadow-none hover:bg-[var(--sidebar-hover)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(40%_0.035_165)] lg:inline-flex"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <img
                  src="/images/panel-left.svg"
                  alt=""
                  className="h-5 w-5 dark:[filter:invert(1)] color:[filter:invert(1)]"
                />
              </Button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="hamburger-trigger pointer-events-auto inline-flex h-12 min-h-12 w-12 min-w-12 items-center justify-start rounded-none border-0 bg-transparent p-0 shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6 shrink-0 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          id="mobile-menu-sheet"
          side="left"
          className="mobile-menu-sheet w-full max-w-full sm:max-w-full lg:max-w-[240px] border-r-0 bg-sidebar border-border text-sidebar-foreground"
          closeButtonClassName="top-6 right-[10px] h-8 w-8 min-h-8 min-w-8 p-0 rounded-md border-0 bg-transparent hover:bg-[var(--sidebar-hover)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(40%_0.035_165)] text-foreground hover:text-sidebar-accent-foreground !data-[state=open]:bg-transparent transition-colors flex items-center justify-center [&_svg]:text-current [&_svg]:transition-colors hover:[&_svg]:text-sidebar-accent-foreground"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex flex-col items-start px-2 pt-6 pb-4">
                      <div className="ps-sidebar-crown-row mb-6 flex h-8 items-center">
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
                                Clauses
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