"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Header from "@/components/header/header";

let SidebarLayout: React.FC<{ children: React.ReactNode }>;
try {
  const IMAGE_PATHS_TO_CHECK = [
    "/images/panel-left.svg",
    "/images/auditflow-logo.svg",
  ];

  function SidebarMark() {
    return (
      <Link
        href="/"
        className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-md"
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

  SidebarLayout = function SidebarLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    useEffect(() => {
      IMAGE_PATHS_TO_CHECK.forEach((path) => {
        const img = new Image();
        img.onerror = () => console.error("Missing image:", path);
        img.src = path;
      });
    }, []);

    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="px-2 pt-6 pb-4">
            <div className="ps-sidebar-crown-row mb-6 flex h-8 items-center">
              <SidebarMark />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4">
            <SidebarGroup>
              <SidebarMenu className="gap-0">
                <SidebarMenuItem>
                  <SidebarMenuButton variant="text" asChild>
                    <Link
                      href="/"
                      className="text-button text-foreground no-underline w-full"
                    >
                      Clauses
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton variant="text" asChild>
                    <Link
                      href="/reports"
                      className="text-button text-foreground no-underline w-full"
                    >
                      Reports
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton variant="text" asChild>
                    <Link
                      href="/help"
                      className="text-button text-foreground no-underline w-full"
                    >
                      Help
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton variant="text" asChild>
                    <a
                      href="mailto:mikemarchitto@gmail.com?subject=AuditFlow%20support"
                      className="text-button text-foreground no-underline w-full"
                    >
                      Support
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col w-full min-w-0 overflow-x-clip">
          <Header />
          <main className="min-h-screen min-w-0 w-full max-w-full overflow-x-clip flex-1 pt-16">
            {children}
          </main>
        </div>
      </SidebarProvider>
    );
  };
} catch (err) {
  console.error("🔥 MODULE ERROR in sidebar-layout:", err);
  throw err;
}

export default SidebarLayout;