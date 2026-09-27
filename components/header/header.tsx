"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
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

/**
 * Minimal chrome — mobile menu only.
 * Breadcrumbs and top utility nav were removed; account/utilities live on the sidebar profile.
 */
export default function Header() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  const [desktopRail, setDesktopRail] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_SIDEBAR_MQ);
    const sync = () => {
      setDesktopRail(mq.matches);
      if (mq.matches) setMobileOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [setMobileOpen]);

  return (
    <>
      {/* Desktop: no top bar — page titles live in content. Mobile: slim menu chrome. */}
      {!desktopRail ? (
        <>
          <header
            className={cn(
              APP_TOPBAR_HEIGHT_CLASS,
              "fixed top-0 right-0 left-0 z-30 flex w-auto items-center bg-[#F7F7F7]/95 backdrop-blur dark:bg-background/95 color:bg-background/95",
            )}
          >
            <div
              className={cn(PAGE_GUTTER_CLASS, "flex h-full w-full items-center")}
            >
              <div
                className={cn(
                  PAGE_INNER_CLASS,
                  "flex h-full min-w-0 w-full items-center",
                )}
              >
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(NAV_UTILITY_BUTTON_CLASS, "-ml-2")}
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="size-5 shrink-0 text-foreground" />
                </Button>
              </div>
            </div>
          </header>
          <div
            className={cn(APP_TOPBAR_HEIGHT_CLASS, "shrink-0")}
            aria-hidden
          />
        </>
      ) : null}

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          id="mobile-menu-sheet"
          side="left"
          showCloseButton={false}
          className="mobile-menu-sheet flex h-full w-[min(100%,280px)] max-w-[280px] flex-col border-border border-r-0 bg-white p-0 text-sidebar-foreground dark:bg-sidebar color:bg-sidebar xl:hidden"
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
