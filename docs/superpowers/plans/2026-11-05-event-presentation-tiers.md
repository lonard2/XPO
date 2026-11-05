# Event Presentation Tiers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One event shell in three explicit human-chosen sizes plus three visibility tiers with leak-proof enforcement and discreet occupancy stubs.

**Architecture:** Three columns, a pure tier and visibility library, shell branching by resolved size, a central visibility helper consumed by every public read path, and role-split editing (organizers set size, admins set visibility).

**Tech Stack:** Next.js 15 App Router, React 19, Prisma 7, Zod, next-intl, Tailwind.

**Spec:** `docs/superpowers/specs/2026-11-05-event-presentation-tiers-design.md`

**Execution status:** Tasks 1 to 6 shipped (`ca930c6`, `df3f1c3`, `9b0ad63`, `5b67a0a`, `3d264a8`, `b53e8c8`, `acc0b69`, plus review fixes in `cb80e34`). Open follow-ups at the end are real and tracked.

## Global Constraints

- Institutional tone, zero emojis, `lucide-react` icons only, no em dashes.
- Migrations additive-only. `Event.visibility` defaults `PUBLIC`, `Venue.size` defaults `LARGE` so nothing regresses on migrate, `Event.pageSize` is nullable because no human has chosen yet.
- A tier is an explicit human choice. The venue only prefills a suggestion, and a suggestion the editor never confirms does not save. This is enforced in step validation and again at the submit handler.
- Visibility is ADMIN-only. Organizers may set `pageSize` on events they own and can never write `visibility`.
- Auth deny-by-default, `apiError` envelope, `common.discreetEventLabel` and `common.discreetEventDesc` in all six locales plus a usage guard.
- **Inventory before enforcement.** Every public read path is enumerated in Task 0. A visibility plan that lists surfaces from memory ships a leak, which is exactly what happened before this rewrite.
- Discreet identity is projected away at the Prisma `select` level, not selected and then deleted in memory.
- Serial vitest. Dev DB is compose `xpo-db-1:5433`. Test runs use throwaway `xpo-test-db:5434` with exported `DATABASE_URL`, `migrate deploy`, `db:seed`.
- Each task ships as its own commit pushed to `origin/main`, verified by tests, `tsc --noEmit`, and eslint. Revert `next-env.d.ts` churn.

## Review Focus

- Discreet title, organizer, and image never leave the server, including JSON-LD, metadata, and the public event JSON API.
- Hidden events are absent from the sitemap yet resolvable by direct URL with `noindex`.
- Explicit per-event tier beats venue size, and an unconfirmed prefill blocks submit.
- Discreet direct URLs 404; owners and admins still see their own rows.
- SMALL hides the floor-map tab, meeting drawers, and both channel surfaces while keeping alerts.
- Calendar and venue schedules show discreet occupancy, and exports never include stubs.

---

### Task 0: Read-path inventory (do this first)

**Files:** none. Output is a list appended to this plan.

**Why:** the previous version of this plan missed `GET /api/events/[id]`, which served discreet titles, organizer emails, and tiers to anyone. Enumerate first, then write enforcement tasks against the list.

**Steps:**

- [x] **Step 1:** Grep every `db.event.find*` call under `src/app` and `src/lib`, then classify public, authenticated, and admin.

Public, unauthenticated, must be filtered:

1. `src/app/[locale]/(attendee)/page.tsx` (hero banner, featured grid, venue rails)
2. `src/app/[locale]/(attendee)/events/page.tsx`
3. `src/app/[locale]/(attendee)/events/[slug]/page.tsx` (detail, metadata, static params)
4. `src/app/[locale]/(attendee)/calendar/page.tsx`
5. `src/app/[locale]/(attendee)/venues/[slug]/page.tsx` (schedule)
6. `src/app/sitemap.ts`
7. `src/app/api/events/[id]/route.ts` (public event JSON; the miss)
8. `src/app/api/profile/suggestions/route.ts` (authenticated attendee)

Checked and safe as written: `api/events/[id]/waitlist` selects only ids and tier capacity, `api/tickets/verify` reads by booking hash, meetings and organizer routes are authenticated, admin routes are role-gated.

- [x] **Step 2:** Write one leak test per public surface in Task 3. A surface without a test is an unfinished task.

### Task 1: Schema and the tier/visibility library

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/discovery/presentation.ts`
- Test: `tests/unit/discovery/presentation.test.ts`

**Interfaces:**
- Produces: `PAGE_SIZES`, `VISIBILITY`, `resolvePageSize({ eventTier, venueSize })`, `resolveDetailVisibility(visibility)` returning `render | notFound | unlisted`, `listingWhere()`, `scheduleWhere()`, `DiscreetStub`, `stripDiscreetFields`, `ScheduleStub`, `isScheduleStub`, `toScheduleRows`.

**Steps:**

- [x] **Step 1:** Failing tests: explicit tier beats venue, null inherits venue, null/null resolves LARGE, exact filter objects, strip drops identity and keeps hall plus dates, `toScheduleRows` passes public through, stubs discreet, drops hidden.
- [x] **Step 2:** Confirm module-not-found.
- [x] **Step 3:** Add `Venue.size`, `Event.pageSize`, `Event.visibility`; migrate as `presentation_tiers`.
- [x] **Step 4:** Implement the library.
- [x] **Step 5:** Tests plus `tsc` clean.
- [x] **Step 6:** Commit `feat(tiers): size and visibility model with resolvers` (`ca930c6`).

### Task 2: Sized shell

**Files:**
- Modify: `src/components/themed/EventPageShell.tsx`
- Modify exactly the six archetype views with a meeting or channel surface:
  `IndustrialB2BView` (RFQ drawer), `HospitalityTourismView` (buyer appointments),
  `GovernmentDiplomaticView` (bilateral slots), `FinanceInvestorView` (deal suite),
  `FaithPilgrimageCongressView` (interpretation channels), `TechDevSummitView` (livestream).
- Test: `tests/unit/a11y/event-detail-motion.test.tsx` plus `tests/unit/theming/archetypes.test.tsx`

**Interfaces:**
- Consumes: `resolvePageSize`.
- Produces: `pageSize` prop on the shell and on `ArchetypeViewProps`; SMALL hides the floor-map tab, meeting drawers, and channel surfaces, keeps alerts. MEDIUM keeps every section with tighter spacing.

**Steps:**

- [x] **Step 1:** Failing tests: floor-map label absent on SMALL and present by default; buyer-appointment trigger absent on SMALL; channels absent on SMALL; livestream absent on SMALL. Assert on visible text, not `role="tab"`, because those controls are plain buttons.
- [x] **Step 2:** Confirm failure.
- [x] **Step 3:** Implement shell branching and the six prop gates. Resolve the tier on the detail page from the event choice, then the venue suggestion, then LARGE.
- [x] **Step 4:** Tests plus `tsc`/eslint clean.
- [x] **Step 5:** Commit `feat(tiers): sized event shell` (`df3f1c3`).

### Task 3: Visibility enforcement and leak tests

**Files:**
- Modify the eight public surfaces from Task 0.
- Modify `src/app/api/events/[id]/route.ts` to gate non-public rows behind `canWriteEvent`.
- Test: `tests/integration/tiers-visibility.test.ts`

**Interfaces:**
- Consumes: Task 1 helpers.
- Produces: every public surface filtered; discreet detail URLs 404; hidden detail URLs render `noindex` without JSON-LD or OpenGraph; public JSON returns 404 for non-public rows to strangers.

**Steps:**

- [x] **Step 1:** Failing tests: discreet and hidden slugs absent from the sitemap; suggestions exclude both; public event JSON 404s for both; public events still serve; an owner still receives their own hidden event; `listingWhere` is wired into every listed surface.
- [x] **Step 2:** Confirm failure. The public JSON test fails first, which is the point.
- [ ] **Step 3 (open):** Replace the venue-schedule select-then-strip with a Prisma `select` that returns only stub fields for discreet rows, so the type system cannot hand a caller a field it must not render. Today the mapper is correct but the query still loads identity.
- [x] **Step 4:** Apply `listingWhere` to homepage, events index, sitemap, suggestions, and `generateStaticParams`. Apply `scheduleWhere` plus `toScheduleRows` to the venue schedule and the calendar. Gate detail routing and metadata by `resolveDetailVisibility`.
- [x] **Step 5:** Tests plus `tsc`/eslint clean.
- [x] **Step 6:** Commit `feat(tiers): visibility enforcement with leak tests` (`9b0ad63`).

### Task 4: Discreet occupancy stubs

**Files:**
- Modify `src/messages/{en,id,ja,zh-CN,de,es}.json`
- Modify `src/components/discovery/VenueScheduleTable.tsx`
- Modify `src/components/discovery/CalendarInteractiveView.tsx` and `src/components/discovery/EventCalendarWidget.tsx`
- Modify `src/app/[locale]/(attendee)/calendar/page.tsx`
- Test: `tests/unit/components/discovery/DiscreetStubs.test.tsx`, `tests/unit/components/discovery/CalendarInteractiveView.test.tsx`

**Interfaces:**
- Consumes: `ScheduleStub`, `isScheduleStub`, `toScheduleRows`.
- Produces: hall plus generic label, dates, no link, no title. Occupancy shows in the venue schedule, the calendar month grid, and the calendar day list. Exports, "jump to" links, and headline picks use full rows only.

**Steps:**

- [x] **Step 1:** Failing tests: schedule stub renders hall plus label with no anchor and no title; calendar month grid renders the stub; calendar day list renders the stub; iCal export excludes the stub id.
- [x] **Step 2:** Confirm failure.
- [x] **Step 3:** Add the two `common` keys in six locales, implement the stub branches, widen the calendar and schedule queries to `scheduleWhere`, and filter stubs out of `exportableEvents`, `nextUpcomingEvent`, and venue-pill counts.
- [x] **Step 4:** Tests plus `tsc`/eslint/parity clean.
- [x] **Step 5:** Commit `feat(tiers): discreet occupancy stubs` (`5b67a0a`, calendar in `cb80e34`).

### Task 5: Role-split tier and visibility editing

**Files:**
- Modify `src/app/[locale]/(organizer)/events/new/page.tsx`
- Modify `src/app/[locale]/(organizer)/events/[slug]/customizer/page.tsx`
- Modify `src/app/api/organizer/events/route.ts` and `src/app/api/organizer/events/[id]/branding/route.ts`
- Create `src/app/api/admin/events/[id]/presentation/route.ts`
- Modify `src/components/admin/AdminEventsConsoleClient.tsx` and `src/components/admin/VenueDirectoryManagerClient.tsx`
- Modify `src/app/api/admin/venues/[id]/route.ts` and `src/app/api/organizer/venues/route.ts`
- Test: `tests/integration/tiers-editing.test.ts`, `tests/unit/organizer/event-wizard-admin.test.ts`

**Interfaces:**
- Consumes: Task 1 constants for enums.
- Produces: creation requires `pageSize`; organizers patch size and are refused visibility; admins set both; venue `size` travels the admin venue path.

**Steps:**

- [x] **Step 1:** Failing tests: creation without a tier 400; creation stores the chosen tier; organizer visibility write 400 with visibility unchanged and a following size write 200; admin sets both, organizer 403 on the admin route; venue size persists through the admin path and no organizer venue writer exists.
- [x] **Step 2:** Confirm failure.
- [x] **Step 3:** Implement the wizard select with venue prefill, the customizer select, the admin presentation route, the console selects, the venue size field, and the organizer venue `size` read.
- [ ] **Step 4 (open):** Enforce confirmation at the submit handler as well as in step validation. The plan called for this; the first implementation only rejected an empty value, so an untouched prefill saved silently until the review caught it. The shipped code now tracks `pageSizeTouched` and blocks both in `validateStep` and `handleSubmitEvent`; keep the handler guard in future edits.
- [x] **Step 5:** Tests plus `tsc`/eslint clean.
- [x] **Step 6:** Commit `feat(tiers): role-split tier and visibility editing` (`3d264a8`, `acc0b69`).

### Task 6: Small-venue seeds and full verification

**Files:**
- Modify `prisma/seed.ts` (one SMALL venue per region: mall atrium, park events ground, riverside plaza)
- Update hall-inventory assertions in `tests/integration/db.test.ts`

**Steps:**

- [x] **Step 1:** Seed three SMALL venues with one hall each; update the per-region hall count maps.
- [x] **Step 2:** Fresh-DB suite. The first run surfaced six fallout failures (venue maps, curation POST bodies missing `pageSize`, em-dash parity). Fix them, rerun to green.
- [x] **Step 3:** Axe serious+ gate 3/3 light and 3/3 dark; live SMALL page without the floor-map tab; discreet URL 404; venue schedule and calendar show stubs with zero title leak; zero `MISSING_MESSAGE`; probe rows cleaned.
- [x] **Step 4:** Commit `feat(tiers): small venue seeds and suite fallout` (`b53e8c8`).

## Open follow-ups

1. Select-level discreet projection in the venue schedule (Task 3, Step 3).
2. `resolveDetailVisibility` returns `render` for null while its comment says discovery defaults to hiding. The column is non-nullable today, so it is unreachable, but the code and the comment should agree.
3. The admin venue `PUT` has no role gate of its own. Organizers have no venue write route, so the hole is architectural rather than reachable, but adding `requireRole` there would break the existing adversarial suite and needs its own task.

## Self-Review

1. **Spec coverage:** goals 1 and 2 map to Tasks 1, 2, and 5; goal 3 to Tasks 1 and 3; goal 4 to Tasks 1 and 6; goal 5 to Tasks 3 and 4.
2. **Step scan:** every enforcement step names its surface; every test step names its assertion; open steps are marked rather than implied done.
3. **Type consistency:** `pageSize`, `size`, and `visibility` are Strings; `ScheduleStub` and `isScheduleStub` are used identically across Tasks 1, 3, and 4.
4. **Review Focus:** each line has an owning task, and the inventory in Task 0 is what makes the leak claim credible.
5. **Proportion:** the plan stays shorter than the code surface and carries no transcripts.
