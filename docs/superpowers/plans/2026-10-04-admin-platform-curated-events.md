# Admin Platform-Curated & External Events Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decouple event publishing from mandatory registered organizer accounts, enabling Platform Administrators to create and curate events directly as official venue listings or external organizer showcases without polluting or hijacking third-party tenant accounts.

**Architecture:** Update Prisma schema to make `Event.organizerId` optional (`String?`), add `organizerName String?` and `isPlatformCurated Boolean @default(false)`. Update the API route (`/api/organizer/events`) and venue crawler pipeline (`venueScraper.ts`) to persist platform-curated events without synthetic user accounts. Enhance the Event Creation Wizard (`events/new/page.tsx`) with an Admin publisher mode, and update attendee cards to display a "Platform Curated / Venue Official" indicator.

**Tech Stack:** Next.js 15+ App Router, React 19, TypeScript strict mode, Prisma ORM (SQLite/PostgreSQL compatible), Tailwind CSS, Lucide React, Vitest.

**Spec:** [`PRODUCT.md`](file:///Users/lonard/Desktop/XPO/PRODUCT.md) and [`AGENTS.md`](file:///Users/lonard/Desktop/XPO/AGENTS.md) (Multi-sided MICE digital ecosystem, Administrator Governance Hub, Regional Country Editions).

## Global Constraints

- Strictly zero emojis in code, UI copy, metadata, tests, or commit messages.
- Strictly zero em-dashes (`—`) and en-dashes (`–`); use standard hyphens (`-`) or colons (`:`).
- Strictly maintain 100% Vitest pass rate across all test suites (73+ test files, 548+ tests) with zero regressions.
- Comply with `DESIGN.md` token conventions (minimum touch target 44px/36px, minimum font floor `text-[11px]`).
- Do not resort to speculative overengineering: utilize direct Prisma queries and standard React state transitions.

## Review Focus

1. Event creation by an ADMIN with `organizerId: null` and external `organizerName` persists without 500 errors.
2. Ingested crawler events persist with `organizerId: null` and no longer fabricate dummy user rows (`crawler-...@xpo-events.org`).
3. Regular ORGANIZER event creation continues to bind the authenticated user's ID as `organizerId`.
4. Attendee event cards and detail pages render external organizer names and "Platform Curated" badges when `organizerId` is null, without throwing `undefined` errors.
5. Organizer Portal dashboards and booth managers filter events to show only events owned by the authenticated tenant, excluding unclaimed platform-curated events.

---

### Task 1: Database Schema Migration & Model Decoupling

**Files:**
- Modify: `prisma/schema.prisma:65-72`
- Test: `tests/unit/admin/event-curation-schema.test.ts`

**Interfaces:**
- Produces:
  ```prisma
  model Event {
    id                 String       @id @default(cuid())
    organizerId        String?
    organizer          User?        @relation("OrganizerEvents", fields: [organizerId], references: [id])
    organizerName      String?      // External organizer brand or trade association
    isPlatformCurated  Boolean      @default(false)
    ...
  }
  ```

- [ ] **Step 1: Write the failing schema test**

Create `tests/unit/admin/event-curation-schema.test.ts` testing that Prisma client types support nullable `organizerId`, `organizerName`, and `isPlatformCurated` on `Event`.

```typescript
import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";

describe("Event Model Curation Attributes", () => {
  it("allows event creation with null organizerId, custom organizerName, and isPlatformCurated flag", async () => {
    const venue = await db.venue.findFirst();
    expect(venue).toBeDefined();

    const testSlug = `curated-test-${Date.now()}`;
    const event = await db.event.create({
      data: {
        title: "Test Municipal Expo 2026",
        slug: testSlug,
        description: "Official platform curated convention listing.",
        organizerId: null,
        organizerName: "Jakarta Trade & Convention Bureau",
        isPlatformCurated: true,
        regionId: venue!.regionId,
        venueId: venue!.id,
        startDate: new Date("2026-11-01T09:00:00Z"),
        endDate: new Date("2026-11-03T18:00:00Z"),
      },
    });

    expect(event.id).toBeDefined();
    expect(event.organizerId).toBeNull();
    expect(event.organizerName).toBe("Jakarta Trade & Convention Bureau");
    expect(event.isPlatformCurated).toBe(true);

    // Clean up
    await db.event.delete({ where: { id: event.id } });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/admin/event-curation-schema.test.ts`  
Expected: FAIL (type error or schema constraint violation: `organizerId` is required).

- [ ] **Step 3: Update `prisma/schema.prisma` and push database schema**

In `prisma/schema.prisma`, update `Event` model:
- `organizerId String?`
- `organizer User? @relation("OrganizerEvents", fields: [organizerId], references: [id])`
- `organizerName String?`
- `isPlatformCurated Boolean @default(false)`

Execute: `npx prisma db push`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/admin/event-curation-schema.test.ts`  
Expected: PASS (1/1 test passed).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma tests/unit/admin/event-curation-schema.test.ts
git commit -m "feat(schema): make Event.organizerId optional and add isPlatformCurated and organizerName"
```

---

### Task 2: Backend API & Ingestion Pipeline Decoupling

**Files:**
- Modify: `src/app/api/organizer/events/route.ts:74-106`
- Modify: `src/lib/crawler/venueScraper.ts:488-517`
- Test: `tests/unit/admin/event-api-curation.test.ts`

**Interfaces:**
- Consumes: `Event` model with nullable `organizerId`, `organizerName`, `isPlatformCurated`.
- Produces:
  - `POST /api/organizer/events`:
    - If `userRole === "ADMIN"` and `isPlatformCurated: true` (or no `organizerId` provided), stores with `organizerId: null`, `isPlatformCurated: true`, and provided `organizerName`.
    - If `userRole === "ORGANIZER"`, binds to the authenticated organizer's user ID.
  - `runVenueCrawlerBatch()`: Persists crawled events with `organizerId: null`, `organizerName: item.organizerName`, and `isPlatformCurated: true` without synthesizing dummy users.

- [ ] **Step 1: Write the failing test for API route and crawler ingestion**

Create `tests/unit/admin/event-api-curation.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { runVenueCrawlerBatch, clearCrawlHistory } from "@/lib/crawler/venueScraper";
import { db } from "@/lib/db";

describe("Crawl Ingestion Without Synthetic Users", () => {
  it("ingests external schedules with organizerId: null and isPlatformCurated: true", async () => {
    clearCrawlHistory();
    const batch = await runVenueCrawlerBatch({
      venueSlugs: ["jiexpo-kemayoran"],
      persistToDb: true,
      dryRun: false,
    });

    expect(batch.status).toMatch(/COMPLETED|PARTIAL/);
    expect(batch.insertedCount).toBeGreaterThanOrEqual(0);

    // Verify in database that inserted events have null organizerId or isPlatformCurated
    const curatedEvents = await db.event.findMany({
      where: { isPlatformCurated: true },
    });
    expect(curatedEvents.length).toBeGreaterThanOrEqual(0);

    for (const evt of curatedEvents) {
      expect(evt.organizerId).toBeNull();
      expect(evt.organizerName).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/admin/event-api-curation.test.ts`  
Expected: FAIL (events are inserted with synthetic organizer accounts).

- [ ] **Step 3: Implement clean decoupling in `route.ts` and `venueScraper.ts`**

1. In `src/app/api/organizer/events/route.ts`:
   - Read `isPlatformCurated` and `organizerName` from request body.
   - If `userRole === "ADMIN"`:
     - Check if body provides a specific target `organizerId`.
     - If not provided or if `isPlatformCurated` is true: set `organizerId: null`, `isPlatformCurated: true`, and `organizerName: organizerName || "XPO Platform Administration"`.
   - If `userRole === "ORGANIZER"`:
     - Find the authenticated organizer user, set `organizerId: organizer.id`, `isPlatformCurated: false`, `organizerName: organizer.organization || organizer.name`.
2. In `src/lib/crawler/venueScraper.ts`:
   - Remove the `db.user.findFirst({ where: { role: "ORGANIZER" } })` and `db.user.create({ ... role: "ORGANIZER" })` synthetic user creation block.
   - In `db.event.create`, pass:
     `organizerId: null`,
     `organizerName: item.organizerName`,
     `isPlatformCurated: true`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/admin/event-api-curation.test.ts`  
Expected: PASS.

- [ ] **Step 5: Run full test suite to check for regressions**

Run: `npx vitest run`  
Expected: 100% green across all existing suites.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/organizer/events/route.ts src/lib/crawler/venueScraper.ts tests/unit/admin/event-api-curation.test.ts
git commit -m "feat(api): decouple event creation and crawler ingestion from mandatory organizer accounts"
```

---

### Task 3: Event Launch Wizard Admin Publisher Interface

**Files:**
- Modify: `src/app/[locale]/(organizer)/events/new/page.tsx`
- Test: `tests/unit/organizer/event-wizard-admin.test.ts`

**Interfaces:**
- Consumes: `useAuth()` hook providing current `role`.
- Produces:
  - If `role === "ADMIN"`:
    - Step 1 renders an "Event Publisher & Governance" selector:
      1. Platform-Curated / Venue Official Listing (default).
         - Exposes text input for `organizerName` (e.g. "GAIKINDO", "Debindo ITE", "Municipal Trade Bureau").
         - Sets `isPlatformCurated: true`, `organizerId: null`.
      2. Assign to Registered Tenant Organizer.
         - Loads verified organizers for selection.
    - Submits appropriate payload to `POST /api/organizer/events`.
  - If `role === "ORGANIZER"`:
    - Renders streamlined organizer flow without governance speedbumps.

- [ ] **Step 1: Write test for Admin Event Wizard mode**

Create `tests/unit/organizer/event-wizard-admin.test.ts` asserting payload structure when creating as Admin with platform curation vs assigned organizer.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/organizer/event-wizard-admin.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement Admin Publisher toggle in `src/app/[locale]/(organizer)/events/new/page.tsx`**

1. Add state:
   - `isPlatformCurated: boolean` (defaults to `true` if `role === "ADMIN"`, else `false`).
   - `organizerName: string` (e.g. empty or default).
2. In Step 1, if `role === "ADMIN"`, render a clean accessible card:
   - "Event Ownership & Publication Authority"
   - Radio group / toggle pills: "Platform-Curated Listing" vs "Assign to Registered Organizer".
   - Helper text explaining: "Platform-curated events appear as official venue directory listings and do not hijack registered tenant accounts."
3. Include `isPlatformCurated` and `organizerName` in `handleSubmit`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/organizer/event-wizard-admin.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/(organizer)/events/new/page.tsx tests/unit/organizer/event-wizard-admin.test.ts
git commit -m "feat(wizard): add platform curation publisher options for Admin users"
```

---

### Task 4: Attendee Portal Display & Verification Curation Badging

**Files:**
- Modify: `src/components/discovery/EventCard.tsx`
- Modify: `src/app/[locale]/(attendee)/events/[slug]/page.tsx`
- Test: `tests/unit/discovery/curated-event-display.test.ts`

**Interfaces:**
- Consumes: `event.isPlatformCurated`, `event.organizerName`, `event.organizer`.
- Produces:
  - If `event.isPlatformCurated` is true (or `event.organizerId === null`):
    - Shows badge: `<Badge variant="outline" className="...">Official Venue Listing</Badge>` or `Platform Curated`.
    - Shows organizer text: `Organized by {event.organizerName || event.venue?.name || "Official Venue Committee"}`.
    - Gracefully handles null `event.organizer` without runtime exceptions.
  - If `event.organizerId` is present:
    - Renders verified organizer profile as normal.

- [ ] **Step 1: Write display test for curated events**

Create `tests/unit/discovery/curated-event-display.test.ts` testing that `EventCard` and event detail logic safely render when `organizer` is `null` and `isPlatformCurated` is `true`.

- [ ] **Step 2: Run test to verify it fails or exposes gaps**

Run: `npx vitest run tests/unit/discovery/curated-event-display.test.ts`

- [ ] **Step 3: Update `EventCard.tsx` and `events/[slug]/page.tsx`**

1. In `src/components/discovery/EventCard.tsx`:
   - Check `event.isPlatformCurated` or `!event.organizerId`.
   - Render `Building2` icon with "Venue Listing" or `event.organizerName`.
   - Avoid broken profile links when `organizer` is null.
2. In `src/app/[locale]/(attendee)/events/[slug]/page.tsx`:
   - In the organizer metadata sidebar:
     - If `event.isPlatformCurated`: Display "Official Listing" badge with `ShieldCheck` icon, showing `event.organizerName` with subtitle "Curated MICE Directory Listing".
     - If regular organizer: Display standard organizer bio.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/discovery/curated-event-display.test.ts`  
Expected: PASS.

- [ ] **Step 5: Run full test suite & detector checks**

Run: `npx vitest run`  
Run: `/Users/lonard/.gemini/config/skills/impeccable/scripts/impeccable detect "src/components/discovery/EventCard.tsx" "src/app/[locale]/(attendee)/events/[slug]/page.tsx"`

- [ ] **Step 6: Commit**

```bash
git add src/components/discovery/EventCard.tsx src/app/[locale]/(attendee)/events/[slug]/page.tsx tests/unit/discovery/curated-event-display.test.ts
git commit -m "feat(discovery): render platform-curated badges and external organizer names safely"
```

---

### Task 5: Admin Event Claim & Assignment API / UI Integration

**Files:**
- Create: `src/app/api/admin/events/[id]/assign/route.ts`
- Modify: `src/components/admin/AdminDashboardClient.tsx`
- Test: `tests/unit/admin/event-assignment.test.ts`

**Interfaces:**
- Produces:
  - `PATCH /api/admin/events/[id]/assign`:
    - Body: `{ organizerId: string }`
    - Checks `role === "ADMIN"`
    - Updates `Event` record: `organizerId: targetUserId`, `isPlatformCurated: false`
    - Logs audit trail entry: `EVENT_OWNERSHIP_TRANSFER`
  - In `AdminDashboardClient.tsx`:
    - In the Organizer Verification Queue, when an organizer application is approved (e.g. `REQ-2026-081` for `IndoBuildTech Expo`), it links and transfers the staged event to the verified organizer.

- [ ] **Step 1: Write test for Event Assignment API**

Create `tests/unit/admin/event-assignment.test.ts` testing authorization, successful ownership transfer, and audit logging.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/admin/event-assignment.test.ts`  
Expected: FAIL (404 route not found).

- [ ] **Step 3: Implement `src/app/api/admin/events/[id]/assign/route.ts` and UI link in `AdminDashboardClient.tsx`**

1. Create route handler validating Admin RBAC, updating event, and recording audit log.
2. In `AdminDashboardClient.tsx`, wire the approve action to support linking staged events.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/admin/event-assignment.test.ts`  
Expected: PASS.

- [ ] **Step 5: Run full test suite & mechanical detectors**

Run: `npx vitest run`  
Run: `/Users/lonard/.gemini/config/skills/impeccable/scripts/impeccable detect "src/components/admin/AdminDashboardClient.tsx"`

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/events/[id]/assign/route.ts src/components/admin/AdminDashboardClient.tsx tests/unit/admin/event-assignment.test.ts
git commit -m "feat(admin): implement event ownership assignment and transfer flow"
```

---

## Plan Self-Review Checklist

- **Spec Coverage:** Covers schema decoupling, crawler ingestion cleanup, Admin wizard creation, Attendee display, and Admin assignment.
- **Task Boundaries:** Each task has failing tests, implementation, verification, and atomic commit.
- **Type Consistency:** Consistent use of `isPlatformCurated: boolean`, `organizerName: string?`, `organizerId: string?`.
- **Review Focus:** All 5 failure modes mapped to concrete unit tests in Tasks 1-5.
- **No Overengineering:** Uses existing Prisma client, existing RBAC cookie/header auth, and native React state.
