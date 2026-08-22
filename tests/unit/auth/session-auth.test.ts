import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  DEMO_ACCOUNTS,
  getDemoAccounts,
  getStoredUser,
  setStoredUser,
  switchUserRole,
  STORAGE_KEY_USER,
  COOKIE_NAME_ROLE,
} from "@/lib/auth/session";
import {
  hasPermission,
  canAccessRoute,
  getRoleHierarchy,
  isValidRole,
  getRoleLabel,
  getRoleBadgeVariant,
  getRolePermissionsMatrix,
  ROLE_PERMISSIONS,
} from "@/lib/auth/rbac";

describe("Phase 8 Unit: Session Management & RBAC Security Suite", () => {
  beforeEach(() => {
    localStorage.clear();
    // Clear cookies simulation
    document.cookie = `${COOKIE_NAME_ROLE}=; max-age=0`;
  });

  it("provides 3 pre-configured demo accounts for Attendee, Organizer, and Admin personas", () => {
    const demos = getDemoAccounts();
    expect(demos.length).toBe(3);

    const attendee = DEMO_ACCOUNTS.ATTENDEE;
    expect(attendee.role).toBe("ATTENDEE");
    expect(attendee.email).toBe("alex@xpo.com");

    const organizer = DEMO_ACCOUNTS.ORGANIZER;
    expect(organizer.role).toBe("ORGANIZER");
    expect(organizer.email).toBe("organizer@xpo.com");

    const admin = DEMO_ACCOUNTS.ADMIN;
    expect(admin.role).toBe("ADMIN");
    expect(admin.email).toBe("admin@xpo.com");
  });

  it("persists and reads session user across localStorage and cookies synchronously", () => {
    expect(getStoredUser()).toBeDefined();

    setStoredUser(DEMO_ACCOUNTS.ADMIN);
    const stored = getStoredUser();
    expect(stored).not.toBeNull();
    expect(stored?.role).toBe("ADMIN");
    expect(stored?.email).toBe("admin@xpo.com");

    // Switching role
    const switched = switchUserRole("ORGANIZER");
    expect(switched.role).toBe("ORGANIZER");
    expect(getStoredUser()?.role).toBe("ORGANIZER");
  });

  it("correctly validates and type-guards valid vs invalid role strings", () => {
    expect(isValidRole("ATTENDEE")).toBe(true);
    expect(isValidRole("ORGANIZER")).toBe(true);
    expect(isValidRole("ADMIN")).toBe(true);

    expect(isValidRole("GUEST")).toBe(false);
    expect(isValidRole("SUPERUSER")).toBe(false);
    expect(isValidRole(null)).toBe(false);
    expect(isValidRole(undefined)).toBe(false);
  });

  it("resolves role labels and UI badge variants accurately", () => {
    expect(getRoleLabel("ATTENDEE")).toBe("Attendee & Buyer");
    expect(getRoleLabel("ORGANIZER")).toBe("Event Organizer");
    expect(getRoleLabel("ADMIN")).toBe("Platform Admin");
    expect(getRoleLabel("UNKNOWN")).toBe("Guest User");

    expect(getRoleBadgeVariant("ATTENDEE")).toBe("success");
    expect(getRoleBadgeVariant("ORGANIZER")).toBe("archetype");
    expect(getRoleBadgeVariant("ADMIN")).toBe("destructive");
  });

  it("enforces least-privilege permission matrix across all 10 capability keys", () => {
    const matrix = getRolePermissionsMatrix();
    expect(matrix.length).toBe(10);

    const eventsCreate = matrix.find((m) => m.permission === "events:create");
    expect(eventsCreate?.attendee).toBe(false);
    expect(eventsCreate?.organizer).toBe(true);
    expect(eventsCreate?.admin).toBe(true);

    const crawlerRun = matrix.find((m) => m.permission === "crawler:run");
    expect(crawlerRun?.attendee).toBe(false);
    expect(crawlerRun?.organizer).toBe(false);
    expect(crawlerRun?.admin).toBe(true);

    const venuesManage = matrix.find((m) => m.permission === "venues:manage");
    expect(venuesManage?.attendee).toBe(false);
    expect(venuesManage?.organizer).toBe(false);
    expect(venuesManage?.admin).toBe(true);
  });

  it("evaluates route authorization rules with route groups and subpaths", () => {
    // Admin routes
    expect(canAccessRoute("ADMIN", "/en/admin/venues")).toBe(true);
    expect(canAccessRoute("ORGANIZER", "/en/admin/venues")).toBe(false);
    expect(canAccessRoute("ATTENDEE", "/en/admin/venues")).toBe(false);

    // Organizer dashboard & tools
    expect(canAccessRoute("ADMIN", "/id/dashboard")).toBe(true);
    expect(canAccessRoute("ORGANIZER", "/id/dashboard")).toBe(true);
    expect(canAccessRoute("ATTENDEE", "/id/dashboard")).toBe(false);

    // Customizer & scanner routes
    expect(canAccessRoute("ORGANIZER", "/en/scanner")).toBe(true);
    expect(canAccessRoute("ORGANIZER", "/en/booths")).toBe(true);
    expect(canAccessRoute("ORGANIZER", "/en/events/new")).toBe(true);
    expect(canAccessRoute("ATTENDEE", "/en/scanner")).toBe(false);

    // Public explore routes
    expect(canAccessRoute("ATTENDEE", "/id/events")).toBe(true);
    expect(canAccessRoute("ATTENDEE", "/id/venues")).toBe(true);
    expect(canAccessRoute("ATTENDEE", "/id/settings")).toBe(true);
  });

  it("enforces numeric role hierarchy ordering", () => {
    expect(getRoleHierarchy("ADMIN")).toBe(3);
    expect(getRoleHierarchy("ORGANIZER")).toBe(2);
    expect(getRoleHierarchy("ATTENDEE")).toBe(1);
    expect(getRoleHierarchy("UNKNOWN")).toBe(0);
  });
});
