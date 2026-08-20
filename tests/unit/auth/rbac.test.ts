import { describe, it, expect } from "vitest";
import {
  hasPermission,
  canAccessRoute,
  getRoleHierarchy,
  ROLE_PERMISSIONS,
  type UserRole,
  type Permission,
} from "../../helpers/contracts";

describe("Phase 8 Unit: Multi-Role RBAC & Authorization Engine", () => {
  // ==========================================================================
  // TIER 1: FEATURE COVERAGE (>=5 tests)
  // ==========================================================================

  it("T1.1: verifies ATTENDEE has read & checkout permissions only", () => {
    expect(hasPermission("ATTENDEE", "events:view")).toBe(true);
    expect(hasPermission("ATTENDEE", "tickets:buy")).toBe(true);

    expect(hasPermission("ATTENDEE", "tickets:verify")).toBe(false);
    expect(hasPermission("ATTENDEE", "events:create")).toBe(false);
    expect(hasPermission("ATTENDEE", "booths:manage")).toBe(false);
    expect(hasPermission("ATTENDEE", "venues:manage")).toBe(false);
    expect(hasPermission("ATTENDEE", "crawler:run")).toBe(false);
  });

  it("T1.2: verifies ORGANIZER has event management, booth roster, scanner, and AI reports permissions", () => {
    expect(hasPermission("ORGANIZER", "events:view")).toBe(true);
    expect(hasPermission("ORGANIZER", "events:create")).toBe(true);
    expect(hasPermission("ORGANIZER", "events:edit")).toBe(true);
    expect(hasPermission("ORGANIZER", "tickets:verify")).toBe(true);
    expect(hasPermission("ORGANIZER", "booths:manage")).toBe(true);
    expect(hasPermission("ORGANIZER", "ai:reports")).toBe(true);

    expect(hasPermission("ORGANIZER", "venues:manage")).toBe(false);
    expect(hasPermission("ORGANIZER", "crawler:run")).toBe(false);
  });

  it("T1.3: verifies ADMIN holds all 10 platform governance permissions", () => {
    const allPermissions: Permission[] = [
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

    for (const perm of allPermissions) {
      expect(hasPermission("ADMIN", perm)).toBe(true);
    }
  });

  it("T1.4: authorizes route access by role for admin, organizer, and attendee trees", () => {
    // Admin routes
    expect(canAccessRoute("ADMIN", "/admin/dashboard")).toBe(true);
    expect(canAccessRoute("ADMIN", "/en/(admin)/venues")).toBe(true);
    expect(canAccessRoute("ORGANIZER", "/admin/dashboard")).toBe(false);
    expect(canAccessRoute("ATTENDEE", "/admin/dashboard")).toBe(false);

    // Organizer routes
    expect(canAccessRoute("ADMIN", "/organizer/dashboard")).toBe(true);
    expect(canAccessRoute("ORGANIZER", "/organizer/dashboard")).toBe(true);
    expect(canAccessRoute("ATTENDEE", "/organizer/dashboard")).toBe(false);

    // Public / Attendee routes
    expect(canAccessRoute("ATTENDEE", "/events")).toBe(true);
    expect(canAccessRoute("ORGANIZER", "/events")).toBe(true);
    expect(canAccessRoute("ADMIN", "/events")).toBe(true);
    expect(canAccessRoute("ATTENDEE", "/settings")).toBe(true);
  });

  it("T1.5: verifies role hierarchy levels (ADMIN > ORGANIZER > ATTENDEE)", () => {
    expect(getRoleHierarchy("ADMIN")).toBeGreaterThan(getRoleHierarchy("ORGANIZER"));
    expect(getRoleHierarchy("ORGANIZER")).toBeGreaterThan(getRoleHierarchy("ATTENDEE"));
    expect(getRoleHierarchy("ATTENDEE")).toBeGreaterThan(0);
  });

  // ==========================================================================
  // TIER 2: BOUNDARY & ADVERSARIAL EDGE CASES
  // ==========================================================================

  it("T2.1 (Boundary): rejects unrecognized role strings gracefully with 0 permissions", () => {
    const invalidRole = "GUEST_SUPERUSER" as UserRole;
    expect(hasPermission(invalidRole, "events:create")).toBe(false);
    expect(getRoleHierarchy(invalidRole)).toBe(0);
  });

  it("T2.2 (Security): verifies organizer cannot elevate privilege to trigger venue calendar crawler", () => {
    expect(hasPermission("ORGANIZER", "crawler:run")).toBe(false);
    expect(canAccessRoute("ORGANIZER", "/admin/crawler")).toBe(false);
  });
});
