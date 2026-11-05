# Event News & Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Organizer-authored event updates with editorial approval, a hand-ordered per-region homepage rail, and an approved-only timeline on event detail pages.

**Architecture:** Two models (`EventUpdate` state machine, `HomepageNewsSlot` ordering), organizer CRUD scoped by event ownership, admin review/approve/slot endpoints, a `news` message namespace, and two read surfaces fed by approved-only queries. Slot consequences are one invariant, not per-route logic.

**Tech Stack:** Next.js 15 App Router, React 19, Prisma 7, Zod, next-intl, Tailwind.

**Spec:** `docs/superpowers/specs/2026-11-05-event-news-design.md`

**Execution status:** Tasks 1 to 6 shipped (`75fa18a`, `f0dd79c`, `7026a6f`, `7c7d1aa`, `45cc937`, `6f3caef`, `518cf0b`). Open follow-ups at the end are real and tracked.

## Global Constraints

- Institutional tone, zero emojis, `lucide-react` icons only, no em dashes.
- Migrations additive-only; `EventUpdate.status` is a String (`DRAFT`/`APPROVED`), matching the repo's String-status convention.
- Auth deny-by-default. Organizer writes use `resolveEventCaller` + `canWriteEvent`; admin writes use `requireRole(request, ["ADMIN"])`. The organizer page is a client component and its gate is the API, never a server-render check that does not exist.
- One `{success:false, error, code}` envelope via `apiError`.
- `news` keys in all six locales (`en`, `id`, `ja`, `zh-CN`, `de`, `es`) plus a usage guard that scans the components for `tNews('...')` literals.
- Bodies render as plain text with preserved line breaks (`whitespace-pre-line`). No markdown, no linkification.
- Public surfaces read `status: "APPROVED"` and attendable events only. That predicate is tested at the query layer, not through components that receive pre-filtered props.
- Slot invariant: any transition out of `APPROVED` (organizer revert, admin unapprove) and any delete evicts the row's slot through one helper. No route re-implements it.
- Serial vitest. Dev DB is compose `xpo-db-1:5433`. Test runs use throwaway `xpo-test-db:5434` with exported `DATABASE_URL`, `migrate deploy`, `db:seed`.
- Each task ships as its own commit pushed to `origin/main`, verified by tests, `tsc --noEmit`, and eslint. Revert `next-env.d.ts` churn before committing.

## Review Focus

- Unapproved or draft updates never surface on public pages. Query-layer test.
- Editing approved copy reverts to DRAFT and evicts its slot.
- Deleting an update evicts its slot.
- Organizer A cannot touch organizer B's updates (403).
- Slotted update on a past or non-public event never renders.
- `zh-CN` round-trips through the PATCH allowlist.

---

### Task 1: Models, migration, validation

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/news/validation.ts`
- Test: `tests/unit/news/validation.test.ts`

**Interfaces:**
- Produces: `EDITORIAL_LOCALES`-style region list `NEWS_REGIONS = ["id","jp","global"]`; `EventUpdateInput`, `NewsSlotInput`; `UPDATE_TITLE_MAX = 120`, `UPDATE_BODY_MAX = 500`, `NEWS_SLOTS_MAX = 6`; `updateAnchor(id): string` returning `#update-<id>`.

**Steps:**

- [x] **Step 1:** Failing test: 121-char title, 501-char body, empty title/body, negative position, region outside `id`/`jp`/`global`, anchor shape.
- [x] **Step 2:** Run `npx vitest run tests/unit/news/validation.test.ts`, confirm module-not-found.
- [x] **Step 3:** Add `EventUpdate` (cascade from Event) and `HomepageNewsSlot` (`updateId` unique, cascade, `@@unique([regionId, position])`, index on `regionId`). Migrate as `event_news`.
- [x] **Step 4:** Implement validation with the exact exports above.
- [x] **Step 5:** Tests plus `tsc` clean.
- [x] **Step 6:** Commit `feat(news): update and slot models with validation` (`75fa18a`).

### Task 2: Organizer updates API and the slot invariant

**Files:**
- Create: `src/app/api/organizer/events/[id]/updates/route.ts` (GET own, POST)
- Create: `src/app/api/organizer/events/[id]/updates/[updateId]/route.ts` (PATCH, DELETE)
- Create: `src/lib/news/slots.ts` with `evictSlotsForUpdate(tx, updateId)`
- Test: `tests/integration/organizer-event-updates.test.ts`

**Interfaces:**
- Consumes: Task 1 schemas; `resolveEventCaller`/`canWriteEvent`.
- Produces: CRUD honoring ownership; `evictSlotsForUpdate` reused by Task 4.

**Steps:**

- [x] **Step 1:** Failing tests: POST without ownership 403; POST valid 200 DRAFT; PATCH on APPROVED reverts to DRAFT with null `approvedAt`; PATCH by another organizer 403; DELETE removes the row and its slot; GET lists own drafts and never other events' rows.
- [x] **Step 2:** Confirm failure.
- [x] **Step 3:** Implement both routes mirroring the showcase ownership lines. PATCH forces DRAFT and clears approval stamps on copy edits; approval toggles from organizers are 400. DELETE by owner or ADMIN.
- [ ] **Step 4 (open):** Route the revert path through `evictSlotsForUpdate` inside the same transaction as the status change, then extend the revert test to assert the slot count drops. Admin unapprove already evicts; the organizer path currently leaves a stale slot.
- [x] **Step 5:** Tests plus `tsc`/eslint clean.
- [x] **Step 6:** Commit `feat(news): organizer updates API` (`f0dd79c`).

### Task 3: Organizer updates page and editor

**Files:**
- Create: `src/app/[locale]/(organizer)/events/[slug]/updates/page.tsx` (client page, API-gated)
- Create: `src/components/organizer/EventUpdatesEditor.tsx`
- Test: `tests/unit/components/EventUpdatesEditor.test.tsx`

**Interfaces:**
- Consumes: Task 2 endpoints. The `[slug]` segment is passed straight to the API, which resolves id or slug through `idOrSlugWhere`.

**Steps:**

- [x] **Step 1:** Failing tests: lists drafts with status badges; create POSTs `{ title, body }`; edit PATCHes; delete confirms then DELETEs; approved rows show read-only copy with the re-approval note.
- [x] **Step 2:** Confirm failure.
- [x] **Step 3:** Implement the page and editor with `Button`, `Input`, `Card`, `Badge`, native textareas, 120/500 counters, `window.confirm` for delete.
- [x] **Step 4:** Tests plus `tsc`/eslint clean.
- [x] **Step 5:** Commit `feat(news): organizer updates editor` (`7026a6f`).

### Task 4: Admin review, authorship, slots

**Files:**
- Create: `src/app/api/admin/updates/route.ts` (GET queue `?status=&region=`)
- Create: `src/app/api/admin/updates/[updateId]/route.ts` (PATCH `{ approved }`)
- Create: `src/app/api/admin/events/[id]/updates/route.ts` (POST, auto-APPROVED)
- Create: `src/app/api/admin/news-slots/route.ts` (GET, PUT ordered list)
- Test: `tests/integration/admin-event-updates.test.ts`

**Interfaces:**
- Consumes: Task 1 schemas; `evictSlotsForUpdate` from Task 2.
- Produces: queue data, approval state machine, ordered slots.

**Steps:**

- [x] **Step 1:** Failing tests: 401/403 on all four; queue filters by status with event context; approve stamps, unapprove clears stamps and deletes slots; admin POST on an ownerless event creates APPROVED; 7 slot ids 400 with nothing saved; unknown id 404; DRAFT update slot 400.
- [x] **Step 2:** Confirm failure.
- [x] **Step 3:** Implement the four routes with `requireRole`, envelope, `{ success, ... }` shapes.
- [x] **Step 4:** Tests plus `tsc`/eslint clean.
- [x] **Step 5:** Commit `feat(news): admin review and slot endpoints` (`7c7d1aa`, typing fix `45cc937`).

### Task 5: Admin console review tab and slot picker

**Files:**
- Modify: `src/components/admin/AdminEventsConsoleClient.tsx`
- Test: `tests/unit/components/AdminNewsReview.test.tsx`

**Steps:**

- [x] **Step 1:** Failing tests: review tab lists pending updates with event and region; approve PATCHes and refreshes; slot picker PUTs ordered ids; tab disabled with the preview note when `isLive` is false.
- [x] **Step 2:** Confirm failure.
- [x] **Step 3:** Implement with `Tabs`, `Card`, `Badge`, `Button`, existing `feedback`/`busyId` patterns.
- [x] **Step 4:** Tests plus `tsc`/eslint clean.
- [x] **Step 5:** Commit `feat(news): admin review tab and slot picker` (`6f3caef`).

### Task 6: Homepage rail, detail timeline, dictionary keys

**Files:**
- Modify: `src/messages/{en,id,ja,zh-CN,de,es}.json`
- Create: `src/components/discovery/HomepageNewsRail.tsx`
- Create: `src/components/discovery/EventNewsTimeline.tsx`
- Modify: `src/app/[locale]/(attendee)/page.tsx`
- Modify: `src/app/[locale]/(attendee)/events/[slug]/page.tsx` and `src/components/themed/EventPageShell.tsx`
- Test: `tests/unit/components/discovery/HomepageNews.test.tsx`

**Interfaces:**
- Consumes: `updateAnchor`; slot and update rows.
- Produces: rail in slot order with `#update-<id>` links; timeline newest-first; no rail when there are no slots.

**Steps:**

- [x] **Step 1:** Failing tests: rail order and anchors; empty rail renders nothing; timeline renders approved rows only and carries `id="update-<id>"`; bodies contain no links; usage guard across six locales.
- [x] **Step 2:** Confirm failure.
- [x] **Step 3:** Add the `news` keys and implement both components. Rail query resolves slots to APPROVED updates on attendable public events; detail query filters APPROVED ordered `approvedAt` desc.
- [ ] **Step 4 (open):** Add query-layer tests for both predicates. Today the components are tested with pre-filtered props, so a regression that stops filtering would not fail the suite. Assert against the server mapping output or extract the predicate into a tested helper.
- [x] **Step 5:** Tests plus `tsc`/eslint/parity clean.
- [x] **Step 6:** Commit `feat(news): homepage rail and detail timeline` (`518cf0b`).

### Task 7: Full verification

- [x] Fresh-DB suite: 1138/1138 at the time of the news branch.
- [x] Axe serious+ gate 3/3 light and 3/3 dark; live `/en` and detail probes; zero `MISSING_MESSAGE`; probe rows cleaned.

## Open follow-ups

1. Organizer revert does not evict its slot. Route it through the invariant helper and assert eviction.
2. No query-layer test for approved-only and past-event predicates.
3. No PATCH round-trip test for a `zh-CN` key through the allowlist.
4. Integration `afterAll` restores blurb and approval but not the i18n map (no-op on the throwaway DB, dirty on a reused one).

## Self-Review

1. **Spec coverage:** goals 1 to 4 map to Tasks 1 to 6; N1 to Task 2 and 4; N2 to Task 4; N3 to Task 5.
2. **Step scan:** test steps pin assertions; code steps pin files and signatures; no undetermined bodies.
3. **Type consistency:** `updateAnchor`, slot shape `{ updateId, regionId, position }`, and `evictSlotsForUpdate` are used identically across tasks.
4. **Review Focus:** each line names its owning task, and the two open predicate gaps are called out rather than implied covered.
5. **Proportion:** the plan stays shorter than the code surface.
