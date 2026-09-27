"use client";

import React from "react";
import {
  Sidebar,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebarNav } from "@/components/sidebar-layout/app-sidebar-nav";
import { ConfigureAuditProvider } from "@/components/configure-audit-modal/configure-audit-context";
import Header from "@/components/header/header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PAGE_CANVAS_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

function SidebarShell({ children }: { children: React.ReactNode }) {
  const { width } = useSidebar();

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "flex h-[100dvh] w-full min-w-0 overflow-hidden",
          PAGE_CANVAS_CLASS,
        )}
        style={{ "--sidebar-width": `${width}px` } as React.CSSProperties}
      >
        {/* Persistent desktop rail (xl+) — fixed flush to viewport top */}
        <Sidebar>
          <AppSidebarNav />
        </Sidebar>
        {/* Reserves the same box-border width as the fixed rail — width transitions in sync */}
        <div
          className="hidden shrink-0 transition-[width] duration-300 ease-in-out xl:block"
          style={{ width }}
          aria-hidden
        />

        <div
          className={cn(
            "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
            PAGE_CANVAS_CLASS,
          )}
        >
          <Header />
          <div
            className={cn(
              "flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-clip overflow-y-auto",
              PAGE_CANVAS_CLASS,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ConfigureAuditProvider>
        <SidebarShell>{children}</SidebarShell>
      </ConfigureAuditProvider>
    </SidebarProvider>
  );
}
