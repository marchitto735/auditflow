"use client";

import React from "react";
import {
  Sidebar,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebarNav } from "@/components/sidebar-layout/app-sidebar-nav";
import Header from "@/components/header/header";

function SidebarShell({ children }: { children: React.ReactNode }) {
  const { width } = useSidebar();

  return (
    <div
      className="flex min-h-svh w-full min-w-0"
      style={{ "--sidebar-width": `${width}px` } as React.CSSProperties}
    >
      {/* Persistent desktop rail (xl+) — fixed flush to viewport top */}
      <Sidebar>
        <AppSidebarNav />
      </Sidebar>
      {/* Reserves horizontal space for the fixed rail */}
      <div
        className="hidden shrink-0 xl:block"
        style={{ width }}
        aria-hidden
      />

      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <Header />
        <div className="flex min-w-0 w-full flex-1 flex-col overflow-x-clip">
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
      <SidebarShell>{children}</SidebarShell>
    </SidebarProvider>
  );
}
