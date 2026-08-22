import { describe, it, expect } from "vitest";
import {
  hasPermission,
  canAccessRoute,
  getRoleHierarchy,
  getRoleBadgeVariant,
  getRolePermissionsMatrix,
  type UserRole,
  type Permission,
} from "@/lib/auth/rbac";

describe("Phase 11 Unit: Admin Governance, Roles & Verification Queue", () => {
  it("G1.1: platform admin role possesses all platform permissions including crawler and venues", () => {
    const adminRole: UserRole = "ADMIN";
    const requiredPermissions: Permission[] = [
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
    ];

    for (const perm of requiredPermissions) {
      expect(hasPermission(adminRole, perm)).toBe(true);
    }
  });

  it("G1.2: non-admin roles are restricted from venue management and crawler runs", () => {
    expect(hasPermission("ATTENDEE", "venues:manage")).toBe(false);
    expect(hasPermission("ATTENDEE", "crawler:run")).toBe(false);
    expect(hasPermission("ATTENDEE", "audit:view")).toBe(false);

    expect(hasPermission("ORGANIZER", "venues:manage")).toBe(false);
    expect(hasPermission("ORGANIZER", "crawler:run")).toBe(false);
    expect(hasPermission("ORGANIZER", "audit:view")).toBe(false);
  });

  it("G1.3: enforces route protection for admin governance paths", () => {
    expect(canAccessRoute("ADMIN", "/en/admin/dashboard")).toBe(true);
    expect(canAccessRoute("ADMIN", "/en/admin/venues")).toBe(true);
    expect(canAccessRoute("ADMIN", "/en/admin/crawler")).toBe(true);
    expect(canAccessRoute("ADMIN", "/en/admin/audit")).toBe(true);

    expect(canAccessRoute("ORGANIZER", "/en/admin/dashboard")).toBe(false);
    expect(canAccessRoute("ATTENDEE", "/en/admin/dashboard")).toBe(false);
  });

  it("G1.4: verifies role hierarchy weights (ADMIN > ORGANIZER > ATTENDEE)", () => {
    expect(getRoleHierarchy("ADMIN")).toBe(3);
    expect(getRoleHierarchy("ORGANIZER")).toBe(2);
    expect(getRoleHierarchy("ATTENDEE")).toBe(1);
    expect(getRoleHierarchy("UNKNOWN")).toBe(0);
  });

  it("G1.5: verifies role badge styling variants", () => {
    expect(getRoleBadgeVariant("ADMIN")).toBe("destructive");
    expect(getRoleBadgeVariant("ORGANIZER")).toBe("archetype");
    expect(getRoleBadgeVariant("ATTENDEE")).toBe("success");
  });

  it("G1.6: returns comprehensive role permissions matrix for governance inspector", () => {
    const matrix = getRolePermissionsMatrix();
    expect(matrix.length).toBe(10);

    const crawlerPerm = matrix.find((p) => p.permission === "crawler:run");
    expect(crawlerPerm).toBeDefined();
    expect(crawlerPerm?.admin).toBe(true);
    expect(crawlerPerm?.organizer).toBe(false);
    expect(crawlerPerm?.attendee).toBe(false);

    const venuePerm = matrix.find((p) => p.permission === "venues:manage");
    expect(venuePerm).toBeDefined();
    expect(venuePerm?.admin).toBe(true);
    expect(venuePerm?.organizer).toBe(false);
  });
});
