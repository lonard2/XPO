import { describe, it, expect } from "vitest";
import {
  getEventCaller,
  getEventCallerFromCookies,
  canWriteEvent,
  partitionCurated,
} from "@/lib/auth/eventOwnership";

function reqWith(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/probe", { headers });
}

describe("eventOwnership helper", () => {
  it("resolves role and user from cookies", () => {
    const user = encodeURIComponent(JSON.stringify({ id: "org-1", email: "o@xpo.com" }));
    const caller = getEventCaller(
      reqWith({ cookie: `xpo_role=ORGANIZER; xpo_auth_user=${user}` })
    );
    expect(caller).toEqual({ role: "ORGANIZER", userId: "org-1", email: "o@xpo.com" });
  });

  it("falls back to headers and tolerates malformed cookies", () => {
    const caller = getEventCaller(
      reqWith({ cookie: "xpo_auth_user=%zz", "x-xpo-user-role": "ADMIN" })
    );
    expect(caller.role).toBe("ADMIN");
    expect(caller.userId).toBeNull();
  });

  it("enforces strict ownership on writes", () => {
    const admin = { role: "ADMIN", userId: "admin-1", email: null };
    const owner = { role: "ORGANIZER", userId: "org-1", email: null };
    const stranger = { role: "ORGANIZER", userId: "org-9", email: null };
    const anon = { role: null, userId: null, email: null };

    // Owned event: admin + owner allowed, others denied.
    expect(canWriteEvent(admin, "org-1")).toBe(true);
    expect(canWriteEvent(owner, "org-1")).toBe(true);
    expect(canWriteEvent(stranger, "org-1")).toBe(false);
    expect(canWriteEvent(anon, "org-1")).toBe(false);

    // Curated event (null organizer): admin only.
    expect(canWriteEvent(admin, null)).toBe(true);
    expect(canWriteEvent(owner, null)).toBe(false);
    expect(canWriteEvent(stranger, null)).toBe(false);
    expect(canWriteEvent({ role: "ATTENDEE", userId: "att-1", email: null }, null)).toBe(false);
  });

  it("partitions curated from owned events", () => {
    const events = [
      { id: "a", organizerId: "org-1" },
      { id: "b", organizerId: null },
      { id: "c" },
    ];
    const { curated, owned } = partitionCurated(events);
    expect(curated.map((e) => e.id)).toEqual(["b", "c"]);
    expect(owned.map((e) => e.id)).toEqual(["a"]);
  });

  it("resolves callers from a cookie jar", () => {
    const jar = {
      get: (name: string) =>
        name === "xpo_role"
          ? { value: "ORGANIZER" }
          : name === "xpo_auth_user"
            ? { value: encodeURIComponent(JSON.stringify({ id: "org-1" })) }
            : undefined,
    };
    expect(getEventCallerFromCookies(jar)).toEqual({
      role: "ORGANIZER",
      userId: "org-1",
      email: null,
    });
  });
});
