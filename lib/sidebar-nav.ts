import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardList,
  FileText,
  Gauge,
  Layers,
  Users,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Match only exact pathname when true; otherwise also match nested paths. */
  exact?: boolean;
  /**
   * When true, opens Configure Audit Parameters blank (no audit type preselected).
   * `href` is kept for deep-link redirects.
   */
  configureAudit?: boolean;
};

/** Primary rail — core workspace views only (Cursor-style minimal nav). */
export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Gauge,
  },
  {
    title: "Audits",
    href: "/audits",
    icon: Layers,
    exact: true,
  },
  {
    title: "Policies",
    href: "/policy-center",
    icon: FileText,
  },
  {
    title: "Frameworks",
    href: "/regulations",
    icon: BookOpen,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: ClipboardList,
  },
];

/** Secondary utilities — attached to the sidebar profile popover, not the rail. */
export const SIDEBAR_PROFILE_LINKS: SidebarNavItem[] = [
  {
    title: "Team",
    href: "/users",
    icon: Users,
  },
];

/**
 * @deprecated Prefer `SIDEBAR_NAV_ITEMS`. Kept so section-aware helpers keep compiling.
 */
export type SidebarNavSection = {
  label: string;
  items: SidebarNavItem[];
};

/** @deprecated Prefer `SIDEBAR_NAV_ITEMS`. */
export const SIDEBAR_NAV_SECTIONS: SidebarNavSection[] = [
  { label: "Workspace", items: SIDEBAR_NAV_ITEMS },
];

export const SIDEBAR_PROFILE = {
  name: "Kevin Marchitto",
  role: "Compliance auditor",
  initials: "KM",
  imageSrc: "/images/kevin-marchitto.jpg",
} as const;

export function isSidebarNavActive(
  pathname: string,
  item: SidebarNavItem,
): boolean {
  // Action items (e.g. New Audit) are not route pages.
  if (item.configureAudit) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export type BreadcrumbSegment = {
  label: string;
  /** When set, segment is a link; omit for the current page. */
  href?: string;
};

/**
 * Nested routes that are not sidebar leaves but inherit a parent item.
 */
const BREADCRUMB_NESTED: Record<
  string,
  { parentHref: string; title: string }
> = {
  "/dashboard/audits": { parentHref: "/dashboard", title: "Audit log" },
  "/dashboard/findings": { parentHref: "/dashboard", title: "Open findings" },
  "/audit/results": { parentHref: "/audits", title: "Audit report" },
  "/audit/remediate": { parentHref: "/audits", title: "Validation" },
  "/audit/bpr": {
    parentHref: "/audits",
    title: "Batch production record audit",
  },
  "/audit/fir": {
    parentHref: "/audits",
    title: "Facility inspection report audit",
  },
  "/audit/sop": {
    parentHref: "/audits",
    title: "Standard operating procedure audit",
  },
  "/analytics": { parentHref: "/dashboard", title: "Analytics" },
  "/users": { parentHref: "/dashboard", title: "Team" },
  "/settings": { parentHref: "/dashboard", title: "Configuration" },
  "/help": { parentHref: "/dashboard", title: "Support" },
};

function findSidebarNavEntry(href: string): SidebarNavItem | null {
  return SIDEBAR_NAV_ITEMS.find((entry) => entry.href === href) ?? null;
}

/** Best active sidebar item for a pathname (longest href wins). */
export function findSidebarNavMatch(pathname: string): {
  section: SidebarNavSection;
  item: SidebarNavItem;
} | null {
  let best: { item: SidebarNavItem; score: number } | null = null;

  for (const item of SIDEBAR_NAV_ITEMS) {
    if (!isSidebarNavActive(pathname, item)) continue;
    const score = item.href.length;
    if (!best || score > best.score) {
      best = { item, score };
    }
  }

  if (!best) return null;
  return {
    section: { label: "Workspace", items: SIDEBAR_NAV_ITEMS },
    item: best.item,
  };
}

/**
 * Breadcrumb trail helpers (legacy). Prefer page-local titles — top chrome no longer shows crumbs.
 */
export function resolveBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const nested = BREADCRUMB_NESTED[pathname];
  if (nested) {
    const parent = findSidebarNavEntry(nested.parentHref);
    if (parent) {
      return [
        { label: parent.title, href: parent.href },
        { label: nested.title },
      ];
    }
    return [{ label: nested.title }];
  }

  const match = findSidebarNavMatch(pathname);
  if (match) {
    return [{ label: match.item.title }];
  }

  return [{ label: "Audits", href: "/audits" }];
}
