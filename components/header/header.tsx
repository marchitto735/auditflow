"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

console.log("🔥 MODULE LOAD:", "header");

const headerNavButtonClass =
  "nav-button bg-transparent border border-[oklch(92%_0_0)] focus-visible:border-[oklch(92%_0_0)] dark:border-[oklch(30%_0.01_264)] color:border-[oklch(40%_0.035_165)] hover:bg-[var(--sidebar-hover)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(40%_0.035_165)]";

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

function NavItems({
  onItemClick,
  hideSidebarToggle,
}: {
  onItemClick?: () => void;
  hideSidebarToggle?: boolean;
}) {
  const { toggle } = useSidebar();
  return (
    <>
      {!hideSidebarToggle && (
        <Button
          className={headerNavButtonClass}
          variant="outline"
          size="icon"
          onClick={() => {
            toggle();
            onItemClick?.();
          }}
          aria-label="Toggle sidebar"
        >
          <img
            src="/images/panel-left.svg"
            alt=""
            className="h-5 w-5 dark:[filter:invert(1)] color:[filter:invert(1)]"
          />
        </Button>
      )}
      <Button
        className={headerNavButtonClass}
        variant="outline"
        size="lg"
        asChild
      >
        <Link href="/" className="text-button" onClick={onItemClick}>
          Clauses
        </Link>
      </Button>
      <Button
        className={headerNavButtonClass}
        variant="outline"
        size="lg"
        asChild
      >
        <Link href="/reports" className="text-button" onClick={onItemClick}>
          Reports
        </Link>
      </Button>
      <Button
        className={headerNavButtonClass}
        variant="outline"
        size="lg"
        asChild
      >
        <Link href="/help" className="text-button" onClick={onItemClick}>
          Help
        </Link>
      </Button>
      <Button
        className={headerNavButtonClass}
        variant="outline"
        size="lg"
        asChild
      >
        <a
          href="mailto:mikemarchitto@gmail.com?subject=AuditFlow%20support"
          className="text-button"
          onClick={onItemClick}
        >
          Support
        </a>
      </Button>
    </>
  );
}

let Header: React.FC;
try {
  Header = function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [headerHidden, setHeaderHidden] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    const lastScrollYRef = useRef(0);
    const headerHiddenRef = useRef(false);
    const mobileMenuOpenRef = useRef(false);
    const scrollRafRef = useRef(0);

    mobileMenuOpenRef.current = mobileMenuOpen;

    useEffect(() => {
      const TOP_REVEAL_PX = 80;

      const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
      const syncReduceMotion = () => setReduceMotion(mqReduce.matches);
      syncReduceMotion();
      mqReduce.addEventListener("change", syncReduceMotion);

      lastScrollYRef.current = window.scrollY;

      const runScrollFrame = () => {
        scrollRafRef.current = 0;

        if (mobileMenuOpenRef.current) {
          if (headerHiddenRef.current) {
            headerHiddenRef.current = false;
            setHeaderHidden(false);
          }
          lastScrollYRef.current = window.scrollY;
          return;
        }

        const y = window.scrollY;
        const prev = lastScrollYRef.current;
        lastScrollYRef.current = y;

        let nextHidden = headerHiddenRef.current;
        if (y <= TOP_REVEAL_PX) {
          nextHidden = false;
        } else if (y < prev) {
          nextHidden = false;
        } else if (y > prev) {
          nextHidden = true;
        }

        if (nextHidden !== headerHiddenRef.current) {
          headerHiddenRef.current = nextHidden;
          setHeaderHidden(nextHidden);
        }
      };

      const onScroll = () => {
        if (scrollRafRef.current) return;
        scrollRafRef.current = requestAnimationFrame(runScrollFrame);
      };

      runScrollFrame();
      window.addEventListener("scroll", onScroll, { passive: true });

      return () => {
        mqReduce.removeEventListener("change", syncReduceMotion);
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = 0;
      };
    }, []);

    useEffect(() => {
      if (!mobileMenuOpen) return;
      if (headerHiddenRef.current) {
        headerHiddenRef.current = false;
        setHeaderHidden(false);
      }
    }, [mobileMenuOpen]);

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
        className="site-header-scroll fixed top-0 left-0 right-0 z-50 w-full min-w-0 bg-background text-foreground will-change-transform"
        style={{
          transform: headerHidden ? "translateY(-100%)" : "translateY(0)",
          transition: reduceMotion ? "none" : "transform 200ms ease-out",
          pointerEvents: headerHidden ? "none" : "auto",
        }}
        aria-hidden={headerHidden}
      >
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="max-w-[1328px] mx-auto">
            <div className="w-full min-w-0 flex items-center justify-between gap-2 py-4 px-0 lg:px-16">
              <div className="hidden lg:flex min-w-0 flex-wrap items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="nav-button h-12 min-h-12 px-6 py-0 bg-transparent border border-[oklch(92%_0_0)] focus-visible:border-[oklch(92%_0_0)] dark:border-[oklch(30%_0.01_264)] color:border-[oklch(40%_0.035_165)] hover:bg-[var(--sidebar-hover)] dark:hover:bg-[oklch(30%_0.01_264)] color:hover:bg-[oklch(40%_0.035_165)]"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <img
                    src="/images/panel-left.svg"
                    alt=""
                    className="h-5 w-5 dark:[filter:invert(1)] color:[filter:invert(1)]"
                  />
                </Button>
                <NavItems hideSidebarToggle />
              </div>
              <div className="flex lg:hidden items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="hamburger-trigger inline-flex h-12 min-h-12 w-12 min-w-12 items-center justify-start rounded-none border-0 bg-transparent p-0 shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6 shrink-0 text-foreground" />
                </button>
              </div>
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