import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardList,
  CircleHelp,
  Crosshair,
  FileText,
  Gauge,
  Settings,
  TrendingUp,
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
   * `href` is kept for deep-link redirects and breadcrumb parent lookup.
   */
  configureAudit?: boolean;
};

export type SidebarNavSection = {
  label: string;
  items: SidebarNavItem[];
};

export const SIDEBAR_NAV_SECTIONS: SidebarNavSection[] = [
  {
    label: "Auditing",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: Gauge,
        exact: true,
      },
      {
        title: "Policies",
        href: "/policy-center",
        icon: FileText,
      },
      {
        title: "New Audit",
        href: "/audit/sop",
        icon: Crosshair,
        configureAudit: true,
      },
      {
        title: "Frameworks",
        href: "/regulations",
        icon: BookOpen,
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        title: "Audit Reports",
        href: "/reports",
        icon: ClipboardList,
      },
      {
        title: "Compliance Analytics",
        href: "/dashboard/score-analysis",
        icon: TrendingUp,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "User Management",
        href: "/users",
        icon: Users,
      },
      {
        title: "Configuration",
        href: "/settings",
        icon: Settings,
      },
      {
        title: "Help & Support",
        href: "/help",
        icon: CircleHelp,
      },
    ],
  },
];

export const SIDEBAR_PROFILE = {
  name: "Kevin Marchitto",
  role: "Compliance Auditor",
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
 * Nested routes that are not sidebar leaves but inherit a section + parent item.
 * Keep co-located with SIDEBAR_NAV_SECTIONS so labels stay consistent.
 */
const BREADCRUMB_NESTED: Record<
  string,
  { parentHref: string; title: string }
> = {
  "/dashboard/audits": { parentHref: "/", title: "Audit Log" },
  "/dashboard/findings": { parentHref: "/", title: "Open Findings" },
  "/audit/results": { parentHref: "/audit/sop", title: "Audit Report" },
  "/audit/remediate": { parentHref: "/", title: "Remediation" },
  "/audit/bpr": {
    parentHref: "/audit/sop",
    title: "Batch Production Record Audit",
  },
  "/audit/fir": {
    parentHref: "/audit/sop",
    title: "Facility Inspection Report Audit",
  },
};

function findSidebarNavEntry(href: string): {
  section: SidebarNavSection;
  item: SidebarNavItem;
} | null {
  for (const section of SIDEBAR_NAV_SECTIONS) {
    const item = section.items.find((entry) => entry.href === href);
    if (item) return { section, item };
  }
  return null;
}

/** Best active sidebar item for a pathname (longest href wins). */
export function findSidebarNavMatch(pathname: string): {
  section: SidebarNavSection;
  item: SidebarNavItem;
} | null {
  let best: {
    section: SidebarNavSection;
    item: SidebarNavItem;
    score: number;
  } | null = null;

  for (const section of SIDEBAR_NAV_SECTIONS) {
    for (const item of section.items) {
      if (!isSidebarNavActive(pathname, item)) continue;
      const score = item.href === "/" ? 1 : item.href.length;
      if (!best || score > best.score) {
        best = { section, item, score };
      }
    }
  }

  return best ? { section: best.section, item: best.item } : null;
}

function sectionHomeHref(section: SidebarNavSection) {
  return section.items[0]?.href ?? "/";
}

/**
 * Breadcrumb trail from the sidebar hierarchy:
 * section label → active nav item (→ optional nested page).
 */
export function resolveBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const nested = BREADCRUMB_NESTED[pathname];
  if (nested) {
    const parent = findSidebarNavEntry(nested.parentHref);
    if (parent) {
      return [
        {
          label: parent.section.label,
          href: sectionHomeHref(parent.section),
        },
        { label: parent.item.title, href: parent.item.href },
        { label: nested.title },
      ];
    }
  }

  const match = findSidebarNavMatch(pathname);
  if (match) {
    return [
      {
        label: match.section.label,
        href: sectionHomeHref(match.section),
      },
      { label: match.item.title },
    ];
  }

  const auditing = SIDEBAR_NAV_SECTIONS[0];
  return [
    {
      label: auditing?.label ?? "Auditing",
      href: auditing ? sectionHomeHref(auditing) : "/",
    },
    { label: "Dashboard" },
  ];
}
