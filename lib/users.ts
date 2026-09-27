export const AUDITFLOW_ROLES = [
  "Compliance Administrator",
  "Lead Auditor",
  "Auditor",
  "Viewer",
] as const;

export type AuditFlowRole = (typeof AUDITFLOW_ROLES)[number];

export const USER_STATUSES = ["Active", "Pending", "Suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  role: AuditFlowRole;
  mfaEnabled: boolean;
  status: UserStatus;
  /** ISO timestamp or display-ready string */
  lastActiveAt: string;
  avatarUrl?: string | null;
  initials: string;
};

export type UserRoleFilter = "all" | AuditFlowRole;
export type UserStatusFilter = "all" | UserStatus;

export type UserDirectoryFilters = {
  search: string;
  role: UserRoleFilter;
  status: UserStatusFilter;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function formatLastActive(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(parsed));
}

export function filterDirectoryUsers(
  users: DirectoryUser[],
  filters: UserDirectoryFilters,
): DirectoryUser[] {
  const query = filters.search.trim().toLowerCase();
  return users.filter((user) => {
    if (filters.role !== "all" && user.role !== filters.role) return false;
    if (filters.status !== "all" && user.status !== filters.status) return false;
    if (!query) return true;
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });
}

/** Demo directory when Supabase profiles are unavailable. */
export const DEMO_DIRECTORY_USERS: DirectoryUser[] = [
  {
    id: "usr-001",
    name: "Kevin Marchitto",
    email: "kevin@auditflow.io",
    role: "Compliance Administrator",
    mfaEnabled: true,
    status: "Active",
    lastActiveAt: "2026-09-26T15:42:00.000Z",
    avatarUrl: "/images/kevin-marchitto.jpg",
    initials: "KM",
  },
  {
    id: "usr-002",
    name: "Priya Shah",
    email: "priya.shah@auditflow.io",
    role: "Lead Auditor",
    mfaEnabled: true,
    status: "Active",
    lastActiveAt: "2026-09-26T14:18:00.000Z",
    initials: "PS",
  },
  {
    id: "usr-003",
    name: "Marcus Chen",
    email: "marcus.chen@auditflow.io",
    role: "Auditor",
    mfaEnabled: false,
    status: "Active",
    lastActiveAt: "2026-09-25T21:05:00.000Z",
    initials: "MC",
  },
  {
    id: "usr-004",
    name: "Elena Vargas",
    email: "elena.vargas@auditflow.io",
    role: "Auditor",
    mfaEnabled: true,
    status: "Pending",
    lastActiveAt: "2026-09-24T11:30:00.000Z",
    initials: "EV",
  },
  {
    id: "usr-005",
    name: "Jordan Lee",
    email: "jordan.lee@partner.co",
    role: "Viewer",
    mfaEnabled: false,
    status: "Active",
    lastActiveAt: "2026-09-23T16:44:00.000Z",
    initials: "JL",
  },
  {
    id: "usr-006",
    name: "Sam Okonkwo",
    email: "sam.okonkwo@auditflow.io",
    role: "Lead Auditor",
    mfaEnabled: true,
    status: "Suspended",
    lastActiveAt: "2026-09-12T09:12:00.000Z",
    initials: "SO",
  },
  {
    id: "usr-007",
    name: "Amelia Brooks",
    email: "amelia.brooks@auditflow.io",
    role: "Viewer",
    mfaEnabled: true,
    status: "Active",
    lastActiveAt: "2026-09-26T08:55:00.000Z",
    initials: "AB",
  },
  {
    id: "usr-008",
    name: "Diego Alvarez",
    email: "diego.alvarez@auditflow.io",
    role: "Auditor",
    mfaEnabled: false,
    status: "Pending",
    lastActiveAt: "2026-09-20T13:20:00.000Z",
    initials: "DA",
  },
  {
    id: "usr-009",
    name: "Naomi Park",
    email: "naomi.park@auditflow.io",
    role: "Compliance Administrator",
    mfaEnabled: true,
    status: "Active",
    lastActiveAt: "2026-09-26T17:01:00.000Z",
    initials: "NP",
  },
  {
    id: "usr-010",
    name: "Theo Brandt",
    email: "theo.brandt@contractor.io",
    role: "Viewer",
    mfaEnabled: false,
    status: "Suspended",
    lastActiveAt: "2026-08-30T10:00:00.000Z",
    initials: "TB",
  },
  {
    id: "usr-011",
    name: "Hannah Cole",
    email: "hannah.cole@auditflow.io",
    role: "Auditor",
    mfaEnabled: true,
    status: "Active",
    lastActiveAt: "2026-09-25T19:33:00.000Z",
    initials: "HC",
  },
  {
    id: "usr-012",
    name: "Owen Fitzgerald",
    email: "owen.fitzgerald@auditflow.io",
    role: "Lead Auditor",
    mfaEnabled: true,
    status: "Active",
    lastActiveAt: "2026-09-26T12:10:00.000Z",
    initials: "OF",
  },
];

export function mapProfileRow(row: Record<string, unknown>): DirectoryUser | null {
  const id = row.id == null ? null : String(row.id);
  const email = row.email == null ? "" : String(row.email);
  const name =
    row.full_name == null
      ? row.name == null
        ? email || "Unknown"
        : String(row.name)
      : String(row.full_name);
  if (!id) return null;

  const roleRaw = String(row.role ?? "Viewer");
  const role = (AUDITFLOW_ROLES as readonly string[]).includes(roleRaw)
    ? (roleRaw as AuditFlowRole)
    : "Viewer";

  const statusRaw = String(row.status ?? "Active");
  const status = (USER_STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as UserStatus)
    : "Active";

  const lastActiveAt = String(
    row.last_active_at ?? row.last_sign_in_at ?? row.updated_at ?? "—",
  );

  return {
    id,
    name,
    email,
    role,
    mfaEnabled: Boolean(row.mfa_enabled ?? row.mfaEnabled),
    status,
    lastActiveAt,
    avatarUrl:
      row.avatar_url == null ? null : String(row.avatar_url),
    initials: initialsFromName(name),
  };
}
