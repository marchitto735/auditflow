"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

export const SIDEBAR_WIDTH_EXPANDED = 256; // Tailwind w-64
export const SIDEBAR_WIDTH_COLLAPSED = 64;

/** Shared rail / spacer / header sync — keep in lockstep. */
export const SIDEBAR_WIDTH_TRANSITION_MS = 300;
export const SIDEBAR_WIDTH_TRANSITION_CLASS =
  "duration-300 ease-in-out";

type SidebarContextValue = {
  /** Desktop: expanded vs icon-only rail. Never fully hides on xl+. */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  /** Mobile sheet open state only. */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  width: number;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const toggleCollapsed = React.useCallback(
    () => setCollapsed((value) => !value),
    [],
  );
  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
  const value = React.useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed,
      mobileOpen,
      setMobileOpen,
      width,
    }),
    [collapsed, toggleCollapsed, mobileOpen, width],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function Sidebar({ className, children, style, ...props }, ref) {
  const { collapsed, width } = useSidebar();

  return (
    <aside
      ref={ref}
      data-sidebar="rail"
      data-collapsed={collapsed ? "" : undefined}
      style={{
        ...style,
        width,
        ["--sidebar-width" as string]: `${width}px`,
      }}
      className={cn(
        "fixed inset-y-0 left-0 z-50 box-border hidden h-screen min-w-16 shrink-0 flex-col justify-between bg-white text-sidebar-foreground transition-[width] duration-300 ease-in-out dark:bg-sidebar-background color:bg-sidebar-background xl:flex",
        className,
      )}
      {...props}
    >
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col justify-between">
        {children}
      </div>
    </aside>
  );
});

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function SidebarHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex shrink-0 flex-col", className)}
      {...props}
    />
  );
});

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function SidebarContent({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
});

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function SidebarFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex shrink-0 flex-col", className)}
      {...props}
    />
  );
});

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function SidebarGroup({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("flex w-full min-w-0 flex-col", className)}
      {...props}
    />
  );
});

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /**
     * When false, label text fades out but the row keeps its height so
     * menu icons stay on the same vertical baseline when the rail collapses.
     */
    visible?: boolean;
  }
>(function SidebarGroupLabel(
  { className, visible = true, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-sidebar="group-label"
      aria-hidden={!visible}
      className={cn(
        // Fixed slot: never collapse max-height/padding/margin on hide —
        // only opacity — so nav item Y positions are identical expanded/collapsed.
        "mb-1 flex h-8 shrink-0 items-center overflow-hidden text-subtitle2 whitespace-nowrap text-foreground transition-opacity duration-100 ease-out",
        visible
          ? "opacity-100"
          : "pointer-events-none select-none opacity-0",
        className,
      )}
      {...props}
    />
  );
});

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(function SidebarMenu({ className, ...props }, ref) {
  return (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={cn("m-0 flex list-none flex-col p-0", className)}
      {...props}
    />
  );
});

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(function SidebarMenuItem({ className, ...props }, ref) {
  return (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn("w-full list-none", className)}
      {...props}
    />
  );
});

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    variant?: "default" | "text";
    isActive?: boolean;
    /** Icon-only rail; defaults to sidebar collapsed state. */
    compact?: boolean;
  }
>(function SidebarMenuButton(
  {
    className,
    asChild = false,
    variant = "default",
    isActive = false,
    compact: compactProp,
    children,
    ...props
  },
  ref,
) {
  const { collapsed } = useSidebar();
  const compact = compactProp ?? collapsed;
  const baseClasses = cn(
    "flex h-9 min-h-9 w-full min-w-0 items-center gap-2.5 rounded-md border-0 bg-transparent px-2.5 py-0 text-sm font-medium text-left no-underline outline-none ring-neutral-900/30 transition-[background-color,color] duration-300 ease-in-out hover:bg-[#F7F7F7] hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 whitespace-nowrap [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-current hover:[&_svg]:text-sidebar-accent-foreground [&_svg]:transition-colors dark:hover:bg-zinc-700/40 color:hover:bg-[oklch(100%_0_0_/0.09)]",
    // Collapsed: fixed square hit target, centered in the rail
    compact &&
      "mx-auto size-9! w-9! min-w-9! max-w-9! shrink-0 justify-center gap-0 overflow-hidden p-0!",
    isActive &&
      "border-0 bg-[#F1F1F1] text-neutral-900 shadow-none hover:bg-[#F1F1F1] hover:text-neutral-900 dark:bg-zinc-700/60 dark:text-neutral-100 dark:hover:bg-zinc-700/60 dark:hover:text-neutral-100 color:bg-[oklch(100%_0_0_/0.14)] color:text-[oklch(96%_0_0)] color:hover:bg-[oklch(100%_0_0_/0.14)] color:hover:text-[oklch(96%_0_0)]",
  );

  if (asChild) {
    return (
      <Slot.Root
        ref={ref as React.Ref<HTMLButtonElement>}
        data-sidebar="menu-button"
        data-active={isActive ? "" : undefined}
        data-compact={compact ? "" : undefined}
        className={cn(baseClasses, className)}
        {...props}
      >
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      data-sidebar="menu-button"
      data-active={isActive ? "" : undefined}
      data-compact={compact ? "" : undefined}
      type="button"
      className={cn(baseClasses, className)}
      {...props}
    >
      {children}
    </button>
  );
});

/** Nav / brand label — nowrap + opacity only; parent overflow clips (no max-width squeeze). */
export function SidebarLabel({
  show,
  children,
  className,
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "overflow-hidden whitespace-nowrap transition-opacity duration-100 ease-out",
        show
          ? "min-w-0 opacity-100"
          : "pointer-events-none w-0 min-w-0 max-w-0 shrink-0 opacity-0",
        className,
      )}
      aria-hidden={!show}
    >
      {children}
    </span>
  );
}
export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(function SidebarTrigger({ className, asChild = false, ...props }, ref) {
  const { toggleCollapsed } = useSidebar();
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      data-sidebar="trigger"
      aria-label="Toggle sidebar"
      onClick={toggleCollapsed}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    />
  );
});
