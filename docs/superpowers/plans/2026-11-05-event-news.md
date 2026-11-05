# Event News & Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Organizer-authored event updates with editorial approval, a hand-ordered per-region homepage rail, and an approved-only timeline on event detail pages.

**Architecture:** Two models (`EventUpdate` state machine, `HomepageNewsSlot` ordering), organizer CRUD scoped by event ownership, admin review/approve/slot endpoints, a new `news` message namespace, and two read surfaces (rail + timeline) fed by approved-only queries.

**Tech Stack:** Next.js 15 App Router, React 19, Prisma 7, Zod (repo contract pattern per `src/app/api/tickets/checkout/route.ts`), next-intl, Tailwind.

**Spec:** `docs/superpowers/specs/2026-11-05-event-news-design.md` — the plan argues from the spec; executors read both.

## Global Constraints

- Institutional tone, zero emojis, `lucide-react` icons only, no em dashes.
- Migrations additive-only; `EventUpdate.status` is a String (`DRAFT`/`APPROVED`, matching repo String-status convention).
- Auth deny-by-default; organizer writes via `resolveEventCaller` + `canWriteEvent` from `src/lib/auth/eventOwnership.ts` (mirror `src/app/api/organizer/events/[id]/showcase/route.ts:19-46`); admin writes via `requireRole(request, ["ADMIN"])` (mirror `src/app/api/admin/events/[id]/assign/route.ts:11-22`).
- One `{success:false, error, code}` envelope via `apiError`.
- New `news` namespace keys in all six locales (`en`, `id`, `ja`, `zh-CN`, `de`, `es`) plus a T3.6-style usage guard test scanning the new components.
- Bodies render as plain text with preserved line breaks (`whitespace-pre-line`); no markdown, no linkification.
- Serial vitest; dev DB compose `xpo-db-1:5433` (`.env`); test runs on throwaway `xpo-test-db:5434` with exported `DATABASE_URL` + `migrate deploy` + `db:seed`.
- Each task ships as its own commit pushed to `origin/main` with tests + `tsc --noEmit` + eslint; revert `next-env.d.ts` churn before committing.

## Review Focus

- Unapproved or draft updates must never surface on public pages — test in Tasks 6 and 7.
- Editing approved copy reverts to DRAFT and disappears from public surfaces until re-approved — test in Task 2.
- Deleting an update evicts its slot (no dead rail cards) — test in Tasks 2 and 4.
- Organizer A cannot touch organizer B's event updates (403) — test in Task 2.
- Slotted update on a past/hidden event never renders — test in Task 6.

---

### Task 1: Models, migration, validation

**Files:**
- Modify: `prisma/schema.prisma` (append `EventUpdate`, `HomepageNewsSlot`)
- Create: `src/lib/news/validation.ts`
- Test: `tests/unit/news/validation.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `EventUpdateInput` / `NewsSlotInput` Zod schemas; `UPDATE_TITLE_MAX = 120`, `UPDATE_BODY_MAX = 500`, `NEWS_SLOTS_MAX = 6`; anchor helper `updateAnchor(id: string): string` returning `#update-<id>`.

**Steps:**

- [ ] **Step 1: Write the failing test.** Cases: title 121 chars rejected; body 501 rejected; empty title/body rejected; slot position negative rejected; region outside `id`/`jp`/`global` rejected; `updateAnchor("abc123")` returns `"#update-abc123"`. Imports from `@/lib/news/validation`.
- [ ] **Step 2: Run it to verify failure.** Run: `npx vitest run tests/unit/news/validation.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3: Add the models.** `EventUpdate { id cuid, eventId → Event (onDelete: Cascade), authorId String?, title String, body String, status String @default("DRAFT"), approvedBy String?, approvedAt DateTime?, createdAt, updatedAt }`; `HomepageNewsSlot { id cuid, updateId unique → EventUpdate (onDelete: Cascade), regionId String, position Int, @@unique([regionId, position]) }`. Run `npx prisma migrate dev --name event_news` (dev DB up) and `npm run db:generate`.
- [ ] **Step 4: Implement validation** in `src/lib/news/validation.ts` with the exact exported names above (Zod, UTF-16 `.max` per repo convention).
- [ ] **Step 5: Run tests to verify pass.** Run the new file plus `npx tsc --noEmit`. Expected: pass, clean.
- [ ] **Step 6: Commit.** `git add prisma/schema.prisma prisma/migrations/* src/lib/news/validation.ts tests/unit/news/validation.test.ts && git commit -m "feat(news): update and slot models with validation" && git push origin main`.

### Task 2: Organizer updates API

**Files:**
- Create: `src/app/api/organizer/events/[id]/updates/route.ts` (GET own + POST)
- Create: `src/app/api/organizer/events/[id]/updates/[updateId]/route.ts` (PATCH + DELETE)
- Test: `tests/integration/organizer-event-updates.test.ts`

**Interfaces:**
- Consumes: Task 1 schemas; `resolveEventCaller`/`canWriteEvent`.
- Produces: CRUD honoring ownership; PATCH of an APPROVED row reverts to DRAFT (clears `approvedBy`/`approvedAt`); DELETE removes row (slots cascade).

**Steps:**

- [ ] **Step 1: Write the failing tests.** Pattern `tests/integration/organizer-api-routes.test.ts:1-45` (import handlers, seeded DB, self-cleaning creates). Cases: POST without ownership → 403; POST valid → 200 DRAFT; PATCH body edit on APPROVED → 200 with status DRAFT and null `approvedAt`; PATCH by another organizer → 403; DELETE removes row and its slot (seed a slot in-test, assert `HomepageNewsSlot` count drops); GET lists own event's updates including drafts, never other events'.
- [ ] **Step 2: Run to verify failure.** Run: `npx vitest run tests/integration/organizer-event-updates.test.ts`. Expected: FAIL, modules not found.
- [ ] **Step 3: Implement both routes** mirroring showcase ownership lines (findFirst with `idOrSlugWhere`, 404 shape, `canWriteEvent` 403 message style). No attestation gate (updates are lighter than showcase rewrites). POST stamps DRAFT; PATCH applies title/body edits and forces DRAFT + clears approval stamps whenever an APPROVED row's copy changes (approval-only toggles by organizers rejected with 400); DELETE by owner or ADMIN.
- [ ] **Step 4: Run tests to verify pass** on throwaway DB:5434. Expected: all pass.
- [ ] **Step 5: Commit.** `git commit -m "feat(news): organizer updates API" && git push origin main`.

### Task 3: Organizer updates page + editor

**Files:**
- Create: `src/app/[locale]/(organizer)/events/[slug]/updates/page.tsx`
- Create: `src/components/organizer/EventUpdatesEditor.tsx`
- Test: `tests/unit/components/EventUpdatesEditor.test.tsx`

**Interfaces:**
- Consumes: Task 2 endpoints.
- Produces: organizers see drafts with status; create/edit/delete flows.

**Steps:**

- [ ] **Step 1: Write the failing tests.** Render editor with mocked `fetch`: lists drafts with DRAFT/APPROVED badges; create posts `{ title, body }` to `/api/organizer/events/<id>/updates`; edit sends PATCH; delete confirms via `window.confirm` mock then DELETEs; approved rows show read-only copy plus an "edits need re-approval" note.
- [ ] **Step 2: Run to verify failure.** Expected: FAIL, module not found.
- [ ] **Step 3: Implement the page** (server: `resolveEventCallerFromCookies`, 403/404 via `apiError`-style `notFound()`/message — mirror customizer page auth) **and the editor** reusing `Button`, `Input`, `Card`, `Badge`, `Modal` primitives; 120/500 counters; `window.confirm` for delete (repo console convention).
- [ ] **Step 4: Run tests to verify pass** plus `tsc` and eslint. Expected: pass, clean.
- [ ] **Step 5: Commit.** `git commit -m "feat(news): organizer updates editor" && git push origin main`.

### Task 4: Admin review, authorship, and slots API

**Files:**
- Create: `src/app/api/admin/updates/route.ts` (GET queue `?status=&region=`)
- Create: `src/app/api/admin/updates/[updateId]/route.ts` (PATCH approve/unapprove as `{ approved: boolean }`, stamps `approvedBy`/`approvedAt` or clears both and auto-evicts slots)
- Create: `src/app/api/admin/events/[id]/updates/route.ts` (POST admin-authored, auto-APPROVED)
- Create: `src/app/api/admin/news-slots/route.ts` (GET per region, PUT ordered id list, renumbers transactionally, max 6)
- Test: `tests/integration/admin-event-updates.test.ts`

**Interfaces:**
- Consumes: Task 1 schemas.
- Produces: queue data, approval state machine, ordered slots; unapproved-with-slot never resolvable (evict on unapprove).

**Steps:**

- [ ] **Step 1: Write the failing tests.** Cases: no cookie 401, ORGANIZER 403 on all four; queue GET filters by status with event title/region joined; approve sets APPROVED + stamps, unapprove clears stamps AND deletes slots; admin POST on curated (ownerless) event creates APPROVED; slots PUT with 7 ids → 400, nothing saved; slots PUT unknown update id → 404; slot for DRAFT update → 400.
- [ ] **Step 2: Run to verify failure.** Expected: FAIL, modules not found.
- [ ] **Step 3: Implement the four routes** (admin `requireRole` + envelope + `{ success, ... }` shapes mirroring the blurb endpoint).
- [ ] **Step 4: Run tests to verify pass** on throwaway DB. Expected: all pass.
- [ ] **Step 5: Commit.** `git commit -m "feat(news): admin review and slot endpoints" && git push origin main`.

### Task 5: Admin console review tab + slot picker

**Files:**
- Modify: `src/components/admin/AdminEventsConsoleClient.tsx`
- Test: `tests/unit/components/AdminEventsConsole.test.tsx` (append describe)

**Interfaces:**
- Consumes: Task 4 endpoints.
- Produces: pending-updates inbox with counts; per-region slot ordering.

**Steps:**

- [ ] **Step 1: Write the failing tests.** Render with mocked `fetch`: a "News review" tab/section lists pending updates with event title + region + approve/unapprove buttons; approve PATCHes `{ approved: true }` and refreshes counts; slot picker per region saves ordered ids via PUT; whole tab disabled with the preview note when `isLive` is false.
- [ ] **Step 2: Run to verify failure.** Expected: FAIL on new assertions.
- [ ] **Step 3: Implement** reusing console primitives (`Card`, `Badge`, `Button`, `Tabs` from `src/components/ui/Tabs.tsx`, existing `feedback`/`busyId` patterns).
- [ ] **Step 4: Run tests to verify pass** plus `tsc` and eslint. Expected: whole file green, clean.
- [ ] **Step 5: Commit.** `git commit -m "feat(news): admin review tab and slot picker" && git push origin main`.

### Task 6: Homepage rail + detail timeline + dictionary keys

**Files:**
- Modify: `src/messages/{en,id,ja,zh-CN,de,es}.json` (new top-level `news` namespace)
- Create: `src/components/discovery/HomepageNewsRail.tsx`
- Create: `src/components/discovery/EventNewsTimeline.tsx`
- Modify: `src/app/[locale]/(attendee)/page.tsx` (rail section after the featured grid, before the calendar)
- Modify: `src/app/[locale]/(attendee)/events/[slug]/page.tsx` + `src/components/themed/EventPageShell.tsx` (optional `newsUpdates` prop, section after `{children}`)
- Test: `tests/unit/components/discovery/HomepageNews.test.tsx`

**Interfaces:**
- Consumes: Task 1 anchor helper; slot/update rows.
- Produces: rail renders slot order with event links + `#update-<id>` anchors; timeline renders approved-only newest-first; empty slots → no rail element.

**Steps:**

- [ ] **Step 1: Write the failing tests.** Cases: rail renders slotted updates in position order with links containing `#update-`; rail with zero slots renders nothing (query null); timeline renders APPROVED only (draft prop item absent); timeline items carry `id="update-<id>"`; bodies render as plain text (assert no `<a>` inside body container). (Usage-guard pattern from T3.6 extended to the new files for the `news` keys.)
- [ ] **Step 2: Run to verify failure.** Expected: FAIL, modules not found.
- [ ] **Step 3: Add the six `news` keys** (section title/subtitle, empty states excluded by design, approve-state labels where UI needs them, timeline heading) **and implement both components** (`whitespace-pre-line` bodies, `stagger-children` on rail grid to match listing language, no motion on timeline). Page wiring: rail query resolves slots → APPROVED updates on attendable PUBLIC events only (reuse `filterAttendable`; forward-compatible with the visibility doc); detail query APPROVED ordered `approvedAt` desc.
- [ ] **Step 4: Run tests to verify pass** plus `tsc`, eslint, and i18n parity. Expected: green, clean.
- [ ] **Step 5: Commit.** `git commit -m "feat(news): homepage rail and detail timeline" && git push origin main`.

### Task 7: Full verification

**Files:** none (evidence only).

**Steps:**

- [ ] **Step 1: Fresh-DB full suite.** Recreate `xpo-test-db` on 5434, export `DATABASE_URL`, `migrate deploy`, `db:seed`, `npx vitest run`. Expected: 100% pass (note the count).
- [ ] **Step 2: Axe gate + live probes.** One `next dev` per directory; accessibility spec 3/3 light + dark probe; curl `/en` 200 with zero `MISSING_MESSAGE`; curl one detail page with an approved update and assert the timeline anchor present; kill server, revert `next-env.d.ts`, remove temp files.
- [ ] **Step 3: Record receipts.** Append Task 7 lines to `.superpowers/sdd/hero-carousel/progress.md` (git-ignored ledger).

## Self-Review

1. **Spec coverage:** goals 1→Tasks 2–3, 2→Tasks 4–5 (timeline surface Task 6), 3→Tasks 4–6, 4→Task 1 validation + Task 6 queries; N1→Task 2 PATCH + Task 4 approve; N2→Task 4 author POST; N3→Task 5. No gaps.
2. **Step scan:** test steps pin names/assertions; code steps pin signatures/files; no bodies beyond referenced mirror files. Fixed inline: none outstanding.
3. **Type consistency:** `updateAnchor` name used in Tasks 1 and 6; slot shape `{ updateId, regionId, position }` consistent across Tasks 1/4/6; `AdminEventItem` untouched (review tab reads updates, not events).
4. **Review Focus:** all five lines own task tests as listed.
5. **Proportion:** plan shorter than the code surface; assertions carry the weight. No transcripts.
