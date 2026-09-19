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
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
