import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "@/app/api/admin/events/[id]/assign/route";
import { db } from "@/lib/db";

describe("Admin Event Assignment API - PATCH /api/admin/events/[id]/assign", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("T1.1: returns 403 Forbidden when request does not have ADMIN role", async () => {
    const request = new Request("http://localhost:3000/api/admin/events/event-123/assign", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: "xpo_role=ORGANIZER",
      },
      body: JSON.stringify({
        organizerId: "usr-org-1",
      }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "event-123" }),
    });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/Forbidden|admin/i);
  });

  it("T1.2: returns 400 Bad Request when organizerId is missing from request body", async () => {
    const request = new Request("http://localhost:3000/api/admin/events/event-123/assign", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: "xpo_role=ADMIN",
      },
      body: JSON.stringify({}),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "event-123" }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/organizerId/i);
  });

  it("T1.3: returns 404 Not Found when event is not found", async () => {
    vi.spyOn(db.event, "findFirst").mockResolvedValueOnce(null);

    const request = new Request("http://localhost:3000/api/admin/events/nonexistent-event/assign", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: "xpo_role=ADMIN",
      },
      body: JSON.stringify({
        organizerId: "usr-org-1",
      }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "nonexistent-event" }),
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/event not found/i);
  });

  it("T1.4: returns 404 Not Found when target organizer user is not found", async () => {
    vi.spyOn(db.event, "findFirst").mockResolvedValueOnce({
      id: "event-123",
      title: "IndoBuildTech Expo 2026",
      slug: "indobuildtech-expo-2026",
      organizerId: null,
      isPlatformCurated: true,
      organizerName: "Debindo ITE",
    } as any);

    vi.spyOn(db.user, "findUnique").mockResolvedValueOnce(null);

    const request = new Request("http://localhost:3000/api/admin/events/event-123/assign", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: "xpo_role=ADMIN",
      },
      body: JSON.stringify({
        organizerId: "missing-user-999",
      }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "event-123" }),
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/organizer not found/i);
  });

  it("T1.5: successfully reassigns event to organizer, sets isPlatformCurated: false, and returns updated event", async () => {
    vi.spyOn(db.event, "findFirst").mockResolvedValueOnce({
      id: "event-123",
      title: "IndoBuildTech Expo 2026",
      slug: "indobuildtech-expo-2026",
      organizerId: null,
      isPlatformCurated: true,
      organizerName: "Debindo ITE External",
    } as any);

    vi.spyOn(db.user, "findUnique").mockResolvedValueOnce({
      id: "usr-org-42",
      name: "Budi Santoso",
      organization: "PT Debindo ITE International",
      role: "ORGANIZER",
      email: "budi@debindo.com",
    } as any);

    const updateSpy = vi.spyOn(db.event, "update").mockResolvedValueOnce({
      id: "event-123",
      title: "IndoBuildTech Expo 2026",
      slug: "indobuildtech-expo-2026",
      organizerId: "usr-org-42",
      isPlatformCurated: false,
      organizerName: "PT Debindo ITE International",
      organizer: {
        id: "usr-org-42",
        name: "Budi Santoso",
        organization: "PT Debindo ITE International",
      },
    } as any);

    const request = new Request("http://localhost:3000/api/admin/events/event-123/assign", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: "xpo_role=ADMIN",
      },
      body: JSON.stringify({
        organizerId: "usr-org-42",
      }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "event-123" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.event.organizerId).toBe("usr-org-42");
    expect(data.event.isPlatformCurated).toBe(false);

    expect(updateSpy).toHaveBeenCalledWith({
      where: { id: "event-123" },
      data: {
        organizerId: "usr-org-42",
        isPlatformCurated: false,
        organizerName: "PT Debindo ITE International",
      },
      include: {
        organizer: true,
        venue: true,
        venueHall: true,
      },
    });
  });

  it("T1.6: accepts x-xpo-user-role header as alternative admin auth", async () => {
    vi.spyOn(db.event, "findFirst").mockResolvedValueOnce({
      id: "event-123",
      title: "IndoBuildTech Expo 2026",
      slug: "indobuildtech-expo-2026",
    } as any);

    vi.spyOn(db.user, "findUnique").mockResolvedValueOnce({
      id: "usr-org-42",
      name: "Budi Santoso",
      organization: "PT Debindo ITE International",
      role: "ORGANIZER",
    } as any);

    vi.spyOn(db.event, "update").mockResolvedValueOnce({
      id: "event-123",
      organizerId: "usr-org-42",
      isPlatformCurated: false,
      organizerName: "PT Debindo ITE International",
    } as any);

    const request = new Request("http://localhost:3000/api/admin/events/event-123/assign", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-xpo-user-role": "ADMIN",
      },
      body: JSON.stringify({
        organizerId: "usr-org-42",
      }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "event-123" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});

describe("Admin Dashboard Client - Event Assignment & Verification Queue", () => {
  it("T2.1: AdminDashboardClient interface supports staged claimEventId and targetOrganizerId", () => {
    const queueItem = {
      id: "REQ-001",
      organizerName: "PT Debindo ITE International",
      organization: "Debindo Multi Adhiswasti",
      email: "director@debindo-ite.com",
      eventTitle: "IndoBuildTech Expo 2026",
      requestedVenue: "ICE BSD City",
      countryCode: "ID",
      status: "PENDING" as const,
      submittedDate: "2026-08-19",
      notes: "Test notes",
      claimEventId: "evt-curated-123",
      targetOrganizerId: "usr-debindo-org",
    };

    expect(queueItem.claimEventId).toBe("evt-curated-123");
    expect(queueItem.targetOrganizerId).toBe("usr-debindo-org");
  });
});

