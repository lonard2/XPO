/**
 * XPO Multi-Role Role-Based Access Control (RBAC) Engine
 *
 * Defines user roles, permission matrices, route access rules, and role hierarchy.
 */

export type UserRole = "ATTENDEE" | "ORGANIZER" | "ADMIN";

export type Permission =
  | "events:view"
  | "tickets:buy"
  | "tickets:verify"
  | "events:create"
  | "events:edit"
  | "booths:manage"
  | "ai:reports"
  | "venues:manage"
  | "crawler:run"
  | "audit:view";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ATTENDEE: [
    "events:view",
    "tickets:buy",
  ],
  ORGANIZER: [
    "events:view",
    "tickets:buy",
    "tickets:verify",
    "events:create",
    "events:edit",
    "booths:manage",
    "ai:reports",
  ],
  ADMIN: [
    "events:view",
    "tickets:buy",
    "tickets:verify",
    "events:create",
    "events:edit",
    "booths:manage",
    "ai:reports",
    "venues:manage",
    "crawler:run",
    "audit:view",
  ],
};

export const PERMISSION_DESCRIPTIONS: Record<Permission, { title: string; description: string; category: string }> = {
  "events:view": {
    title: "View & Explore Events",
    description: "Browse scheduled exhibitions, hall agendas, speaker line-ups, and booth rosters.",
    category: "Attendee & Discovery",
  },
  "tickets:buy": {
    title: "Reserve & Buy Passes",
    description: "Purchase event passes, generate HMAC-signed QR tickets, and unlock perks.",
    category: "Attendee & Discovery",
  },
  "tickets:verify": {
    title: "Door Staff QR Validation",
    description: "Scan attendee QR codes, verify cryptographic signatures, and track check-in velocity.",
    category: "Organizer Tools",
  },
  "events:create": {
    title: "Create MICE Events",
    description: "Launch new conventions with multi-step wizard, archetype selection, and hall booking.",
    category: "Organizer Tools",
  },
  "events:edit": {
    title: "Live Branding Customizer",
    description: "Customize theme tokens, hero banners, section visibility, and live preview frame.",
    category: "Organizer Tools",
  },
  "booths:manage": {
    title: "Booth & Tenant Allocation",
    description: "Assign exhibitors to floor halls, manage booth reservations, and track occupancy.",
    category: "Organizer Tools",
  },
  "ai:reports": {
    title: "Multi-Model AI Intelligence",
    description: "Generate executive digests, foot-traffic synthesis, and attendee sentiment reports.",
    category: "Organizer Tools",
  },
  "venues:manage": {
    title: "Global Venue & Hall Directory",
    description: "Create, index, and manage world-class exhibition venues, halls, and coordinates.",
    category: "Platform Governance",
  },
  "crawler:run": {
    title: "Automated Venue Scraper Pipeline",
    description: "Trigger venue crawler, normalize schedules, deduplicate fingerprints, and batch ingest.",
    category: "Platform Governance",
  },
  "audit:view": {
    title: "Audit & Security Logs",
    description: "Inspect platform security events, role switches, pass validations, and system health.",
    category: "Platform Governance",
  },
};

/**
 * Checks whether a given role has a specific permission.
 */
export function hasPermission(role: UserRole | string, permission: Permission): boolean {
  if (!isValidRole(role)) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Evaluates whether a role is authorized to access a given URL pathname.
 */
export function canAccessRoute(role: UserRole | string, pathname: string): boolean {
  if (!isValidRole(role)) return false;
  if (!pathname || typeof pathname !== "string") return false;

  const cleanPath = pathname.split("?")[0].split("#")[0].trim();

  // Admin routes require ADMIN role
  if (
    cleanPath === "/admin" ||
    cleanPath.startsWith("/admin/") ||
    cleanPath.endsWith("/admin") ||
    cleanPath.includes("/(admin)") ||
    cleanPath.includes("/admin/") ||
    /\/(admin)($|\/)/.test(cleanPath)
  ) {
    return role === "ADMIN";
  }

  // Organizer routes require ORGANIZER or ADMIN role
  if (
    cleanPath === "/organizer" ||
    cleanPath.startsWith("/organizer/") ||
    cleanPath.endsWith("/organizer") ||
    cleanPath.includes("/(organizer)") ||
    cleanPath.includes("/organizer/") ||
    /\/(organizer)($|\/)/.test(cleanPath) ||
    cleanPath.includes("/dashboard") ||
    cleanPath.includes("/events/new") ||
    cleanPath.includes("/customizer") ||
    cleanPath.includes("/booths") ||
    cleanPath.includes("/scanner")
  ) {
    return role === "ORGANIZER" || role === "ADMIN";
  }

  // Public attendee routes and settings accessible by all valid roles
  return true;
}

/**
 * Returns numeric hierarchy weight for privilege comparison (ADMIN: 3, ORGANIZER: 2, ATTENDEE: 1, 0 for unknown).
 */
export function getRoleHierarchy(role: UserRole | string): number {
  switch (role) {
    case "ADMIN":
      return 3;
    case "ORGANIZER":
      return 2;
    case "ATTENDEE":
      return 1;
    default:
      return 0;
  }
}

/**
 * Type guard for UserRole.
 */
export function isValidRole(role: unknown): role is UserRole {
  return typeof role === "string" && (role === "ATTENDEE" || role === "ORGANIZER" || role === "ADMIN");
}

/**
 * Returns human-readable label for a role.
 */
export function getRoleLabel(role: UserRole | string): string {
  switch (role) {
    case "ADMIN":
      return "Platform Admin";
    case "ORGANIZER":
      return "Event Organizer";
    case "ATTENDEE":
      return "Attendee & Buyer";
    default:
      return "Guest User";
  }
}

/**
 * Returns badge variant styling for a role.
 */
export function getRoleBadgeVariant(role: UserRole | string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "neutral" | "archetype" {
  switch (role) {
    case "ADMIN":
      return "destructive";
    case "ORGANIZER":
      return "archetype";
    case "ATTENDEE":
      return "success";
    default:
      return "outline";
  }
}

/**
 * Generates an annotated matrix of all platform permissions for documentation and UI dialogs.
 */
export function getRolePermissionsMatrix(): {
  permission: Permission;
  title: string;
  description: string;
  category: string;
  attendee: boolean;
  organizer: boolean;
  admin: boolean;
}[] {
  const allPermissions = Object.keys(PERMISSION_DESCRIPTIONS) as Permission[];

  return allPermissions.map((perm) => ({
    permission: perm,
    title: PERMISSION_DESCRIPTIONS[perm].title,
    description: PERMISSION_DESCRIPTIONS[perm].description,
    category: PERMISSION_DESCRIPTIONS[perm].category,
    attendee: ROLE_PERMISSIONS.ATTENDEE.includes(perm),
    organizer: ROLE_PERMISSIONS.ORGANIZER.includes(perm),
    admin: ROLE_PERMISSIONS.ADMIN.includes(perm),
  }));
}
