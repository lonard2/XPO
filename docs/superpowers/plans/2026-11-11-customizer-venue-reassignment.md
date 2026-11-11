# Customizer Venue Reassignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an organizer move an existing event to another venue and reallocate its spaces from the customizer, with the event's region following the venue.

**Architecture:** A dedicated `PUT /api/organizer/events/[id]/venue` route validates ownership, venue existence, and space membership, then writes venue, region, and allocation in one update. A client card in the customizer loads the venue list, resets spaces on venue change, warns about stale booth and agenda text, and saves through a confirmation dialog.

**Tech Stack:** Next.js App Router route handlers, Prisma, React 19 client component, next-intl, Vitest with jsdom and a seeded test database.

**Spec:** `docs/superpowers/specs/2026-11-11-customizer-venue-reassignment-design.md`

## Global Constraints

- Ownership gate is `resolveEventCaller(request)` plus `canWriteEvent(caller, event.organizerId)`.
- `Event.regionId` follows `venue.regionId` on every reassignment.
- `Event.venueHallIds` is a JSON string; `Event.venueHallId` is the first valid space.
- At least one space from the selected venue is required.
- No emojis, no em dashes; icons come from `lucide-react`.
- Every user-visible string goes through `next-intl` in all six locales: `en`, `id`, `ja`, `zh-CN`, `de`, `es`.
- Audit action is exactly `event.venue`.
- Branding, title, page size, visibility, booths, agenda, and tickets are never touched by this route.

## Review Focus

- A hall ID from the previous venue sent with the new venue: expect `400` and no database write.
- A venue with zero spaces: expect `400` and no database write.
- A cross-region move: expect `regionId` to follow the venue and the edition move named in the confirmation.
- Booths or agenda entries still naming an old hall: expect a warning with the affected count and no automatic rewrite.
- A caller who does not own the event: expect `403` and no database write.

---

### Task 1: Venue reassignment route

**Files:**
- Create: `src/app/api/organizer/events/[id]/venue/route.ts`
- Test: `tests/integration/venue-reassignment.test.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db`, `resolveEventCaller` and `canWriteEvent` from `@/lib/auth/eventOwnership`, `audit` from `@/lib/observability/audit`, `apiError` from `@/lib/api/envelope`, `idOrSlugWhere` from `@/lib/api/request`.
- Produces: `export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse>` accepting `{ venueId: string, venueHallIds: string[] }` and returning `{ success: true, event }` where `event` includes `venue.halls` and `venueHall`.

- [ ] **Step 1: Write the failing integration test**

Create `tests/integration/venue-reassignment.test.ts`. Follow the request helper in `tests/integration/organizer-event-updates.test.ts` (`xpo_role` cookie plus `x-xpo-user-id` header). Seed the subject from the database, and restore the original venue fields after each test so the suite stays order-independent.

```ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { PUT as reassignVenue } from "@/app/api/organizer/events/[id]/venue/route";

function req(url: string, body: unknown, role?: string, userId?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (role) headers.Cookie = `xpo_role=${role}`;
  if (userId) {
    headers["x-xpo-user-role"] = role ?? "ORGANIZER";
    headers["x-xpo-user-id"] = userId;
  }
  return new NextRequest(url, { method: "PUT", headers, body: JSON.stringify(body) });
}

describe("Organizer API: venue reassignment", () => {
  let eventId: string;
  let organizerId: string;
  let original: {
    venueId: string;
    regionId: string;
    venueHallId: string | null;
    venueHallIds: string | null;
  };
  let targetVenue: { id: string; regionId: string; halls: Array<{ id: string }> };
  let emptyVenueId: string;
  let originalHallIds: string[];

  beforeAll(async () => {
    const event = await db.event.findFirst({
      where: { organizerId: { not: null } },
      include: { venue: { include: { halls: true } } },
    });
    if (!event?.organizerId) throw new Error("owned seeded event required");

    eventId = event.id;
    organizerId = event.organizerId;
    original = {
      venueId: event.venueId,
      regionId: event.regionId,
      venueHallId: event.venueHallId,
      venueHallIds: event.venueHallIds,
    };
    originalHallIds = event.venue.halls.map((h) => h.id);

    const venue = await db.venue.findFirst({
      where: {
        regionId: { not: event.regionId },
        halls: { some: {} },
      },
      include: { halls: true },
    });
    if (!venue) throw new Error("seeded venue in another region with halls required");
    targetVenue = { id: venue.id, regionId: venue.regionId, halls: venue.halls };

    const emptyVenue = await db.venue.create({
      data: {
        regionId: event.regionId,
        name: "Reassignment Empty Venue",
        slug: `reassignment-empty-${Date.now()}`,
        city: "Jakarta",
        address: "Test address",
        transitInfo: "Test transit",
        type: "COMMUNITY_HALL",
      },
      select: { id: true },
    });
    emptyVenueId = emptyVenue.id;
  });

  afterEach(async () => {
    await db.event.update({ where: { id: eventId }, data: original });
  });

  afterAll(async () => {
    await db.event.update({ where: { id: eventId }, data: original });
    await db.venue.delete({ where: { id: emptyVenueId } });
    await db.$disconnect();
  });

  it("moves the event to another region's venue and keeps the allocation inside it", async () => {
    const requested = targetVenue.halls.slice(0, 2).map((h) => h.id);
    const res = await reassignVenue(
      req(`http://localhost:3000/api/organizer/events/${eventId}/venue`, {
        venueId: targetVenue.id,
        venueHallIds: requested,
      }, "ORGANIZER", organizerId),
      { params: Promise.resolve({ id: eventId }) }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.event.venueId).toBe(targetVenue.id);
    expect(body.event.regionId).toBe(targetVenue.regionId);
    expect(body.event.venueHallId).toBe(requested[0]);
    expect(JSON.parse(body.event.venueHallIds)).toEqual(requested);
    expect(body.event.venue.halls.length).toBe(targetVenue.halls.length);

    const log = await db.auditLog.findFirst({
      where: { action: "event.venue", entityId: eventId },
      orderBy: { createdAt: "desc" },
    });
    expect(log?.metadata ?? "").toContain(original.venueId);
  });

  it("rejects an allocation made only of the previous venue's spaces", async () => {
    const res = await reassignVenue(
      req(`http://localhost:3000/api/organizer/events/${eventId}/venue`, {
        venueId: targetVenue.id,
        venueHallIds: originalHallIds,
      }, "ORGANIZER", organizerId),
      { params: Promise.resolve({ id: eventId }) }
    );

    expect(res.status).toBe(400);
    const after = await db.event.findUnique({ where: { id: eventId } });
    expect(after?.venueId).toBe(original.venueId);
  });

  it("rejects an unknown venue without writing", async () => {
    const res = await reassignVenue(
      req(`http://localhost:3000/api/organizer/events/${eventId}/venue`, {
        venueId: "does-not-exist",
        venueHallIds: originalHallIds,
      }, "ORGANIZER", organizerId),
      { params: Promise.resolve({ id: eventId }) }
    );

    expect(res.status).toBe(400);
    const after = await db.event.findUnique({ where: { id: eventId } });
    expect(after?.venueId).toBe(original.venueId);
  });

  it("denies a caller who does not own the event", async () => {
    const res = await reassignVenue(
      req(`http://localhost:3000/api/organizer/events/${eventId}/venue`, {
        venueId: targetVenue.id,
        venueHallIds: [targetVenue.halls[0].id],
      }, "ORGANIZER", "someone-else"),
      { params: Promise.resolve({ id: eventId }) }
    );

    expect(res.status).toBe(403);
    const after = await db.event.findUnique({ where: { id: eventId } });
    expect(after?.venueId).toBe(original.venueId);
  });

  it("rejects a venue with no spaces", async () => {
    const res = await reassignVenue(
      req(`http://localhost:3000/api/organizer/events/${eventId}/venue`, {
        venueId: emptyVenueId,
        venueHallIds: originalHallIds,
      }, "ORGANIZER", organizerId),
      { params: Promise.resolve({ id: eventId }) }
    );

    expect(res.status).toBe(400);
    const after = await db.event.findUnique({ where: { id: eventId } });
    expect(after?.venueId).toBe(original.venueId);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/integration/venue-reassignment.test.ts`
Expected: FAIL, the route module cannot be resolved.

- [ ] **Step 3: Implement the route**

Create `src/app/api/organizer/events/[id]/venue/route.ts`. Order matters: resolve the event, authorize, validate the venue, filter the spaces, then one update.

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveEventCaller, canWriteEvent } from "@/lib/auth/eventOwnership";
import { audit } from "@/lib/observability/audit";
import { apiError } from "@/lib/api/envelope";
import { idOrSlugWhere } from "@/lib/api/request";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const venueId = typeof body?.venueId === "string" ? body.venueId.trim() : "";
    const requestedHallIds: string[] = Array.isArray(body?.venueHallIds)
      ? [
          ...new Set(
            body.venueHallIds.filter(
              (hallId: unknown): hallId is string =>
                typeof hallId === "string" && hallId.trim().length > 0
            )
          ),
        ]
      : [];

    const existing = await db.event.findFirst({
      where: idOrSlugWhere(id),
      select: { id: true, venueId: true, regionId: true, organizerId: true },
    });
    if (!existing) {
      return apiError(`Event not found for ID: ${id}`, 404);
    }

    const caller = await resolveEventCaller(request);
    if (!canWriteEvent(caller, existing.organizerId)) {
      return apiError(
        "Forbidden: Only the owning organizer or a platform administrator can reassign this event's venue.",
        403
      );
    }

    if (!venueId) {
      return apiError("Bad Request: venueId is required.", 400);
    }

    const venue = await db.venue.findUnique({
      where: { id: venueId },
      select: {
        id: true,
        regionId: true,
        halls: { select: { id: true } },
      },
    });
    if (!venue) {
      return apiError("Bad Request: venue not found.", 400);
    }

    const validHallIds = new Set(venue.halls.map((hall) => hall.id));
    const allocated = requestedHallIds.filter((hallId) => validHallIds.has(hallId));
    if (allocated.length === 0) {
      return apiError(
        "Bad Request: at least one space from the selected venue is required.",
        400
      );
    }

    const updated = await db.event.update({
      where: { id: existing.id },
      data: {
        venueId: venue.id,
        regionId: venue.regionId,
        venueHallId: allocated[0],
        venueHallIds: JSON.stringify(allocated),
      },
      include: {
        venue: { include: { halls: true } },
        venueHall: true,
      },
    });

    await audit(request, {
      action: "event.venue",
      entity: "event",
      entityId: updated.id,
      metadata: {
        fromVenueId: existing.venueId,
        toVenueId: venue.id,
        fromRegionId: existing.regionId,
        toRegionId: venue.regionId,
        allocated,
      },
    });

    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    return apiError(`Failed to reassign venue: ${(error as Error).message}`, 500);
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/integration/venue-reassignment.test.ts`
Expected: PASS, five tests.

- [ ] **Step 5: Typecheck and lint the route**

Run: `npx tsc --noEmit` and `npx eslint "src/app/api/organizer/events/[id]/venue/route.ts" tests/integration/venue-reassignment.test.ts`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add "src/app/api/organizer/events/[id]/venue/route.ts" tests/integration/venue-reassignment.test.ts
git commit -m "feat(organizer): add venue reassignment endpoint"
```

---

### Task 2: Customizer venue card

**Files:**
- Create: `src/components/organizer/VenueReassignmentCard.tsx`
- Modify: `src/app/[locale]/(organizer)/events/[slug]/customizer/page.tsx` (import near line 24, mount after the hero media card that ends at line 605, and merge the saved venue into `eventData`)
- Modify: `src/messages/en.json`, `src/messages/id.json`, `src/messages/ja.json`, `src/messages/zh-CN.json`, `src/messages/de.json`, `src/messages/es.json`
- Test: `tests/unit/organizer/VenueReassignmentCard.test.tsx`
- Test: `tests/unit/a11y/customizer-venue-card.test.ts`

**Interfaces:**
- Consumes: `PUT /api/organizer/events/[id]/venue` from Task 1; `GET /api/organizer/venues?take=500` returning `{ success, venues }` where each venue has `id`, `name`, `city`, `regionId`, `type`, `size`, and `halls: Array<{ id, name, kind, capacity }>`.
- Produces: `export function VenueReassignmentCard(props: VenueReassignmentCardProps): JSX.Element` with props `{ eventId: string; locale: string; eventSlug: string; currentVenue: { id: string; name: string; regionId: string; type?: string | null }; currentHallIds: string[]; booths?: Array<{ hallName?: string | null }>; agendaItems?: Array<{ location?: string | null }>; currentPageSize?: string | null; onSaved?: (saved: { venue: { id: string; name: string }; venueHall: { id: string; name: string } | null; regionId: string; venueHallIds: string | null }) => void }`.

- [ ] **Step 1: Write the failing component test**

Create `tests/unit/organizer/VenueReassignmentCard.test.tsx`. Mock `fetch` with `vi.stubGlobal`, following `tests/unit/organizer/ShowcaseEditor.test.tsx`. The venue fixture has `v1` in region `id` with halls `h1` (`Hall A1`, kind `HALL`) and `h2`, and `v2` in region `jp` with halls `h3` (`Hall B1`, kind `HALL`) and `h4`.

```tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { VenueReassignmentCard } from "@/components/organizer/VenueReassignmentCard";

const venues = [
  {
    id: "v1", name: "JIExpo Kemayoran", city: "Jakarta", regionId: "id",
    type: "CONVENTION_CENTER", size: "LARGE",
    halls: [
      { id: "h1", name: "Hall A1", kind: "HALL", capacity: 5000 },
      { id: "h2", name: "Hall A2", kind: "HALL", capacity: 4000 },
    ],
  },
  {
    id: "v2", name: "Tokyo Big Sight", city: "Tokyo", regionId: "jp",
    type: "EXHIBITION_CENTER", size: "MEDIUM",
    halls: [
      { id: "h3", name: "Hall B1", kind: "HALL", capacity: 3000 },
      { id: "h4", name: "Hall B2", kind: "HALL", capacity: 2500 },
    ],
  },
];

const props = {
  eventId: "evt-1",
  locale: "en",
  eventSlug: "indonesia-green-energy-2027",
  currentVenue: { id: "v1", name: "JIExpo Kemayoran", regionId: "id", type: "CONVENTION_CENTER" },
  currentHallIds: ["h1"],
};

function mockFetch(putBody: unknown[] = []) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") {
      putBody.push(JSON.parse(String(init.body)));
      return {
        ok: true,
        json: async () => ({
          success: true,
          event: {
            venue: { id: "v2", name: "Tokyo Big Sight" },
            venueHall: { id: "h3", name: "Hall B1" },
            regionId: "jp",
            venueHallIds: JSON.stringify(["h3"]),
          },
        }),
      };
    }
    return { ok: true, json: async () => ({ success: true, venues }) };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("VenueReassignmentCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("resets spaces to the new venue and names the edition move", async () => {
    mockFetch();
    render(<VenueReassignmentCard {...props} />);

    const select = await screen.findByLabelText(/^venue$/i);
    fireEvent.change(select, { target: { value: "v2" } });

    expect(screen.getByText(/Indonesia edition to the Japan edition/i)).toBeInTheDocument();
    expect((screen.getByLabelText(/Hall B1/) as HTMLInputElement).checked).toBe(true);
    expect(screen.queryByLabelText(/Hall A1/)).toBeNull();
  });

  it("saves the venue and its spaces through the venue endpoint", async () => {
    const bodies: unknown[] = [];
    mockFetch(bodies);
    const onSaved = vi.fn();
    render(<VenueReassignmentCard {...props} onSaved={onSaved} />);

    fireEvent.change(await screen.findByLabelText(/^venue$/i), { target: { value: "v2" } });
    fireEvent.click(screen.getByRole("button", { name: /save venue/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /reassign venue/i }));
    });

    expect(bodies).toEqual([{ venueId: "v2", venueHallIds: ["h3"] }]);
    expect(onSaved).toHaveBeenCalled();
    expect(await screen.findByText(/venue updated/i)).toBeInTheDocument();
  });

  it("keeps saving disabled until something changes", async () => {
    mockFetch();
    render(<VenueReassignmentCard {...props} />);

    await screen.findByLabelText(/^venue$/i);
    expect(screen.getByRole("button", { name: /save venue/i })).toBeDisabled();
  });

  it("warns with a count when booth or agenda text names the previous venue", async () => {
    mockFetch();
    render(
      <VenueReassignmentCard
        {...props}
        booths={[{ hallName: "Hall A1" }]}
        agendaItems={[{ location: "Main Stage - Hall A1" }]}
      />
    );

    fireEvent.change(await screen.findByLabelText(/^venue$/i), { target: { value: "v2" } });

    expect(screen.getByText(/space names may be stale/i)).toBeInTheDocument();
    expect(screen.getByTestId("stale-hall-count")).toHaveTextContent("2");
  });

  it("refuses to save with no space selected", async () => {
    mockFetch();
    render(<VenueReassignmentCard {...props} />);

    fireEvent.change(await screen.findByLabelText(/^venue$/i), { target: { value: "v2" } });
    fireEvent.click(screen.getByLabelText(/Hall B1/));

    expect(screen.getByRole("button", { name: /save venue/i })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/organizer/VenueReassignmentCard.test.tsx`
Expected: FAIL, the component module cannot be resolved.

- [ ] **Step 3: Add the message keys to all six locales**

Add a top-level `venueReassignment` namespace. English values, exactly:

```json
{
  "venueReassignment": {
    "title": "Venue & Allocated Spaces",
    "subtitle": "Move this event to another venue and reallocate its spaces. Branding is saved separately.",
    "currentVenue": "Current venue",
    "venueLabel": "Venue",
    "spacesLabel": "Allocated spaces",
    "spacesHint": "Choose at least one space in the selected venue.",
    "save": "Save venue",
    "saving": "Saving venue",
    "saved": "Venue updated.",
    "confirmTitle": "Reassign this event?",
    "confirmBody": "The event will move to {venue} and its spaces will be reallocated.",
    "confirmRegion": "This also moves the event from the {from} edition to the {to} edition.",
    "confirm": "Reassign venue",
    "cancel": "Cancel",
    "regionNotice": "This moves the event from the {from} edition to the {to} edition.",
    "suggestedSize": "This venue suggests the {size} page size. Your choice stays as it is.",
    "staleTitle": "Space names may be stale",
    "staleBody": "Booth or agenda entries still name a space from the previous venue. Update them after saving.",
    "staleBoothsLink": "Open the booth manager",
    "staleAgendaLink": "Open event updates",
    "error": "Could not update the venue.",
    "loading": "Loading venues"
  }
}
```

Translate the same keys naturally in `id`, `ja`, `zh-CN`, `de`, and `es`. Keep `{venue}`, `{from}`, `{to}`, and `{size}` placeholders intact in every locale.

- [ ] **Step 4: Implement the card**

Create `src/components/organizer/VenueReassignmentCard.tsx` with `"use client"`. Required behavior:

- On mount, fetch `/api/organizer/venues?take=500` and keep the venue list in state. Show the `loading` string while it resolves and the `error` string on failure.
- The venue select has `id="customizer-venue-select"` and a visible label from `venueLabel`. Options read `{name} · {city}` and carry `data-region`.
- Region labels come from `useTranslations("regions")` using `` `${code}.name` ``, normalizing `gl` to `global` and defaulting to `global`.
- Render a summary line above the select: `currentVenue`, the current venue name, its region label, and the count of currently allocated spaces.
- On venue change, set `selectedHallIds` to the new venue's first hall ID and clear any saved state.
- Render one checkbox per space of the selected venue, labeled with the space name followed by its kind from `useTranslations("spaceKinds")`, with the capacity when present. Each checkbox has `min-h-[44px]`. Tests match the label by regex because the kind is part of the accessible name.
- Compute `changed` as `selectedVenueId !== currentVenue.id || JSON.stringify(sortedSelected) !== JSON.stringify(sortedCurrent)`. The save button is `disabled={!changed || selectedHallIds.length === 0 || isSaving}`.
- Show `regionNotice` when the selected venue's region differs from `currentVenue.regionId`.
- Show `suggestedSize` when the selected venue's `size` differs from `currentPageSize` and `currentPageSize` is provided.
- Compute stale entries as booths whose `hallName` and agenda items whose `location` contain any hall name of the current venue and no hall name of the selected venue. When the count is above zero, render `staleTitle`, `staleBody`, `<span data-testid="stale-hall-count">{count}</span>`, and two links: `/${locale}/booths` labeled `staleBoothsLink`, and `/${locale}/events/${eventSlug}/updates` labeled `staleAgendaLink`.
- The save button opens the existing `Modal` with `confirmTitle`, `confirmBody` with the selected venue name, and `confirmRegion` when the region differs. The confirm button uses `confirm`, the cancel button uses `cancel`.
- On confirm, `PUT` to `/api/organizer/events/${eventId}/venue` with `{ venueId, venueHallIds }`. On success, update the baseline state, show `saved`, and call `onSaved` with the returned venue fields. On failure, show the `error` string and the server message.
- Use `MapPin`, `Layers`, and `Save` from `lucide-react`. No emojis, no em dashes.

- [ ] **Step 5: Mount the card in the customizer**

In `src/app/[locale]/(organizer)/events/[slug]/customizer/page.tsx`:

- Import the card next to `ShowcaseEditor`.
- Add a memoized hall list near the state declarations so a malformed JSON value cannot throw during render:

```tsx
const currentHallIds = React.useMemo(() => {
  const raw = eventData?.venueHallIds;
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string" && raw.length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((id) => typeof id === "string");
    } catch {
      // Fall through to the primary hall relation.
    }
  }
  return eventData?.venueHall?.id ? [eventData.venueHall.id] : [];
}, [eventData?.venueHallIds, eventData?.venueHall?.id]);
```

- After the hero media card (the `Card` ending at line 605), render it only when the loaded event has a real venue:

```tsx
{eventData?.id && eventData?.venue?.id && (
  <VenueReassignmentCard
    eventId={eventData.id}
    locale={locale}
    eventSlug={eventData.slug}
    currentVenue={{
      id: eventData.venue.id,
      name: eventData.venue.name,
      regionId: eventData.venue.regionId || eventData.regionId || "id",
      type: eventData.venue.type,
    }}
    currentHallIds={currentHallIds}
    booths={eventData.booths}
    agendaItems={eventData.agendaItems}
    currentPageSize={pageSize}
    onSaved={(saved) =>
      setEventData((prev: any) => ({
        ...prev,
        venue: { ...prev.venue, id: saved.venue.id, name: saved.venue.name },
        venueHall: saved.venueHall,
        venueHallIds: saved.venueHallIds,
        regionId: saved.regionId,
      }))
    }
  />
)}
```

- [ ] **Step 6: Run the component test to verify it passes**

Run: `npx vitest run tests/unit/organizer/VenueReassignmentCard.test.tsx`
Expected: PASS, five tests.

- [ ] **Step 7: Write the source test for the mount and the copy rules**

Create `tests/unit/a11y/customizer-venue-card.test.ts` that reads the customizer page and the card source:

```ts
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const PAGE = path.resolve(
  __dirname,
  "../../../src/app/[locale]/(organizer)/events/[slug]/customizer/page.tsx"
);
const CARD = path.resolve(
  __dirname,
  "../../../src/components/organizer/VenueReassignmentCard.tsx"
);

describe("Quality Gate: customizer venue reassignment", () => {
  it("mounts the card only for an event with a real venue", () => {
    const page = fs.readFileSync(PAGE, "utf8");
    expect(page).toContain("VenueReassignmentCard");
    expect(page).toContain("eventData?.venue?.id &&");
  });

  it("keeps the card free of emojis and em dashes", () => {
    const card = fs.readFileSync(CARD, "utf8");
    expect(card).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(card).not.toContain("\u2014");
  });
});
```

- [ ] **Step 8: Run the message parity, component, and source tests**

Run: `npx vitest run tests/unit/i18n/message-parity.test.ts tests/unit/organizer/VenueReassignmentCard.test.tsx tests/unit/a11y/customizer-venue-card.test.ts`
Expected: PASS.

- [ ] **Step 9: Typecheck and lint**

Run: `npx tsc --noEmit` and `npx eslint src/components/organizer/VenueReassignmentCard.tsx "src/app/[locale]/(organizer)/events/[slug]/customizer/page.tsx"`
Expected: no errors. The customizer may keep its existing `exhaustive-deps` warning.

- [ ] **Step 10: Commit**

```bash
git add src/components/organizer/VenueReassignmentCard.tsx "src/app/[locale]/(organizer)/events/[slug]/customizer/page.tsx" src/messages tests/unit/organizer/VenueReassignmentCard.test.tsx tests/unit/a11y/customizer-venue-card.test.ts
git commit -m "feat(organizer): reassign venue and spaces in the customizer"
```

---

### Task 3: Guide and repository references

**Files:**
- Create: `docs/guides/venue-reassignment.md`
- Modify: `README.md` (near the venue types reference at line 81)
- Modify: `CHECKLIST.md` (append a dated entry under the latest phase section)

**Interfaces:**
- Consumes: the route contract and card behavior from Tasks 1 and 2.
- Produces: documentation only.

- [ ] **Step 1: Write the guide**

Create `docs/guides/venue-reassignment.md` covering:

- Why the customizer could not reassign a venue before.
- The route contract: method, path, body, validation order, and the single update.
- The region rule and why the event follows the venue.
- The allocation rule: spaces must belong to the new venue, the first valid ID becomes primary, and at least one is required.
- The stale text warning: booths and agenda store hall names as text, so the card counts affected entries and never rewrites them.
- Why page size never changes automatically.
- Verification commands: the route test, the card test, the parity test, the full suite, and the build.

- [ ] **Step 2: Reference it from the README**

Next to the venue types reference, add one line:

```markdown
* See `docs/guides/venue-reassignment.md` for moving an event between venues and reallocating its spaces.
```

- [ ] **Step 3: Record the work in the checklist**

Append a short dated entry to `CHECKLIST.md` with the route, the card, the region rule, and the test receipts.

- [ ] **Step 4: Run the full suite and the build**

Run:

```bash
docker rm -f xpo-test-db > /dev/null 2>&1
docker run -d --name xpo-test-db -e POSTGRES_USER=xpo -e POSTGRES_PASSWORD=xpo_dev_password -e POSTGRES_DB=xpo -p 5434:5432 postgres:16-alpine
export DATABASE_URL="postgresql://xpo:xpo_dev_password@localhost:5434/xpo"
npx prisma migrate deploy
npm run db:seed
npx vitest run
npm run build
```

Expected: every test file passes and the build exits `0`.

- [ ] **Step 5: Commit**

```bash
git add docs/guides/venue-reassignment.md README.md CHECKLIST.md
git commit -m "docs(organizer): document venue reassignment"
```
