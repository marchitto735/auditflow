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
import { PAGE_CANVAS_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

function SidebarShell({ children }: { children: React.ReactNode }) {
  const { width } = useSidebar();

  return (
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
      {/* Reserves the same box-border width as the fixed rail */}
      <div
        className="hidden w-[var(--sidebar-width,16rem)] shrink-0 xl:block"
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
