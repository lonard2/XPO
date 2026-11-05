# Homepage Rows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A shared adaptive row for the homepage, a daily-rotating cross-region rail ranked by real demand, and admin-authored editor rows scoped by region or all editions.

**Architecture:** One layout primitive (`ResponsiveRow`) owns mobile scrolling and desktop grids; one `HomepageRow` model stores editor rows; the cross-region rail is computed at request time from a date-seeded region choice. Cards reuse `EventCard`, so tilt, sheen, and press physics stay consistent.

**Tech Stack:** Next.js 15 App Router, React 19, Prisma 7, Zod, next-intl, Tailwind 4.

**Spec:** `docs/superpowers/specs/2026-11-05-homepage-rows-design.md`

## Global Constraints

- Institutional tone, zero emojis, `lucide-react` icons only, no em dashes.
- Additive migration only. `HomepageRow.regionId` null means all editions.
- Admin-only writes via `requireRole(request, ["ADMIN"])` and the `apiError` envelope.
- Only PUBLIC attendable events render. Use `listingWhere()` from `src/lib/discovery/presentation.ts`; hidden and discreet rows never appear. Past events are excluded by end date.
- Motion reuses existing utilities only: `stagger-children`, `data-tilt`, `sheen`, `card-interactive-3d`, `prefers-reduced-motion`. No new keyframes.
- New dictionary keys in all six locales plus a usage guard.
- Serial vitest; throwaway `xpo-test-db:5434` with `migrate deploy` and `db:seed`.
- Each task ships as its own commit pushed to `origin/main` with tests, `tsc`, and eslint; revert `next-env.d.ts` churn.
- Serious+ axe gate; scroller controls are 44px and labeled.

## Review Focus

- A hidden or discreet event never appears in a rail or editor row, even when its id is stored. Test in Tasks 3 and 6.
- The rail never names or draws from the active region. Test in Task 1.
- The daily seed is stable within a day and changes across days. Test in Task 1.
- Ranking falls back to featured order when bookings are thin, and never returns more than three. Test in Task 1.
- Mobile scroller controls disable at both ends and never trap keyboard focus. Test in Task 2.
- A deleted or past event id in a stored row is skipped, not rendered as an empty card. Test in Task 6.

---

### Task 1: Model and homepage row library

**Files:**
- Modify: `prisma/schema.prisma` (append `HomepageRow`)
- Create: `src/lib/homepage/rows.ts`
- Test: `tests/unit/homepage/rows.test.ts`

**Interfaces:**
- Produces: `MAX_ROW_TITLE = 80`, `MAX_ROW_SUBTITLE = 160`, `MAX_ROW_EVENTS = 8`, `RAIL_SIZE = 3`; `railCandidates(activeRegion: string): string[]`; `pickRailRegion(activeRegion: string, date: Date): string`; `rankRailEvents<T extends { isFeatured: boolean; startDate: Date | string; bookingCount: number }>(events: T[]): T[]`; `mergeRows<T extends { regionId: string | null; position: number }>(regionRows: T[], allRows: T[]): T[]`; `resolveRowCopy(row, locale): { title: string; subtitle: string | null }`.

**Steps:**

- [ ] **Step 1: Write the failing test.** Cases: candidates exclude the active region and keep the other two sorted; `pickRailRegion` returns the same value for two times on the same UTC date and never the active region; ranking puts a 9-booking featured event before a 2-booking featured event; with one featured event it appends non-featured to reach three and stops at three; merge sorts by position with region rows before all-editions rows on a tie; `resolveRowCopy` prefers the exact locale and falls back to the default, treating an empty override as unset.
- [ ] **Step 2: Run it to verify failure.** `npx vitest run tests/unit/homepage/rows.test.ts`. Expected: module not found.
- [ ] **Step 3: Add the model.** `HomepageRow { id cuid, title String, titleI18n Json?, subtitle String?, subtitleI18n Json?, regionId String?, position Int, eventIdsJson String, isActive Boolean @default(true), createdAt, updatedAt, @@index([regionId, position]) }`. Run `npx prisma migrate dev --name homepage_rows` and `npm run db:generate`.
- [ ] **Step 4: Implement the library.** Region pick uses a stable hash of `YYYY-MM-DD` plus the active region, indexed into `railCandidates`. Ranking sorts featured by `bookingCount` desc then start date asc, then appends non-featured the same way until three. Merge sorts by position, then region-specific first.
- [ ] **Step 5: Run tests to verify pass** plus `npx tsc --noEmit`. Expected: pass, clean.
- [ ] **Step 6: Commit.** `git add prisma/schema.prisma prisma/migrations/* src/lib/homepage/rows.ts tests/unit/homepage/rows.test.ts && git commit -m "feat(home): homepage row model and resolvers" && git push origin main`.

### Task 2: ResponsiveRow and desktop density

**Files:**
- Create: `src/components/discovery/ResponsiveRow.tsx`
- Modify: `src/lib/discovery/grids.ts` (add `rowGridClass`)
- Test: `tests/unit/components/discovery/ResponsiveRow.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `rowGridClass(count: number): string` returning `grid-cols-1` for one centered item, `md:grid-cols-2`, `lg:grid-cols-3`, `xl:grid-cols-4`, and `min-[1800px]:grid-cols-5` when `count >= 5`; `ResponsiveRow({ children, className? })`.

**Steps:**

- [ ] **Step 1: Write the failing test.** Cases: `rowGridClass(1)` contains `max-w-3xl`, `rowGridClass(2)` contains `md:grid-cols-2`, `rowGridClass(4)` contains `xl:grid-cols-4` and not `5`, `rowGridClass(5)` contains `min-[1800px]:grid-cols-5`; `ResponsiveRow` renders all children, exposes buttons named Previous items and Next items, starts with Previous disabled, and hides both buttons from desktop via `md:hidden` on their container; clicking Next calls `scrollBy` on the scroller.
- [ ] **Step 2: Run to verify failure.** Expected: module not found.
- [ ] **Step 3: Implement `rowGridClass`** in `grids.ts` next to the existing helpers.
- [ ] **Step 4: Implement `ResponsiveRow`.** One DOM: outer section, scroller `div` with `flex gap-6 overflow-x-auto snap-x snap-mandatory md:grid md:overflow-visible` plus `rowGridClass(React.Children.count(children))`; each child wrapped in `snap-start shrink-0 w-[85%] md:w-auto`. Buttons sit in a `md:hidden` control bar, disable at scroll ends, and call `scrollBy({ left: ±step, behavior: reducedMotion ? "auto" : "smooth" })`. Edge fades are `aria-hidden` spans.
- [ ] **Step 5: Run tests to verify pass** plus `tsc` and eslint. Expected: green, clean.
- [ ] **Step 6: Commit.** `git commit -m "feat(home): adaptive row with mobile scroller" && git push origin main`.

### Task 3: Migrate existing rows to ResponsiveRow

**Files:**
- Modify: `src/app/[locale]/(attendee)/page.tsx` (featured grid)
- Modify: `src/components/discovery/MajorVenuesUpcomingSection.tsx`
- Modify: `src/components/discovery/HomepageNewsRail.tsx`
- Modify: `src/lib/discovery/grids.ts` (retire `featuredGridClass` and `venueGridClass` once unused)
- Test: `tests/unit/a11y/homepage-motion.test.ts`, `tests/unit/a11y/homepage-expressive.test.ts`, `tests/unit/discovery/major-venues-curation.test.tsx`

**Interfaces:**
- Consumes: `ResponsiveRow`, `rowGridClass`.
- Produces: one layout path for featured events, venues, and news. Section headers, eyebrows, and CTAs are untouched.

**Steps:**

- [ ] **Step 1: Update the structural tests.** Featured and news rows render through `ResponsiveRow`; the homepage still carries exactly two `stagger-children` occurrences (featured and bento); venue cards still tilt and carry `sheen`; the venue grid test asserts the row container rather than `venueGridClass`.
- [ ] **Step 2: Run to verify failure.** Expected: assertions fail against the old grid markup.
- [ ] **Step 3: Replace the three grids** with `ResponsiveRow`, keeping each section's header outside the row. Keep `stagger-children` on featured and bento so motion is unchanged.
- [ ] **Step 4: Run tests to verify pass** plus `tsc` and eslint. Expected: green, clean.
- [ ] **Step 5: Commit.** `git commit -m "refactor(home): share one adaptive row across sections" && git push origin main`.

### Task 4: Cross-region rail

**Files:**
- Create: `src/components/discovery/CrossRegionRail.tsx`
- Modify: `src/app/[locale]/(attendee)/page.tsx` (query plus section after the featured grid)
- Modify: `src/messages/{en,id,ja,zh-CN,de,es}.json` (`home.alsoHappeningIn`)
- Test: `tests/unit/components/discovery/CrossRegionRail.test.tsx` and extend `tests/unit/homepage/rows.test.ts`

**Interfaces:**
- Consumes: `pickRailRegion`, `rankRailEvents`, `listingWhere`, `EventCard`.
- Produces: `CrossRegionRail({ items, locale, regionName })` rendering nothing when `items.length === 0`.

**Steps:**

- [ ] **Step 1: Write the failing test.** Rail renders the localized label with the region name, renders up to three `EventCard`s in rank order, and renders nothing for an empty list. Page-level source guard: the rail query uses `listingWhere()` and excludes the active region.
- [ ] **Step 2: Run to verify failure.** Expected: module not found.
- [ ] **Step 3: Implement the component and page query.** Query featured, public, attendable events in the target region with a filtered `_count` of bookings where status is `CONFIRMED` or `CHECKED_IN`; if the featured pool has fewer than three, query non-featured public attendable events in the same region and append. Render through `ResponsiveRow` with `stagger-children`.
- [ ] **Step 4: Add `home.alsoHappeningIn`** in six locales with a `{region}` placeholder; reuse the `regions` dictionary for the name.
- [ ] **Step 5: Run tests to verify pass** plus `tsc`, eslint, and parity. Expected: green, clean.
- [ ] **Step 6: Commit.** `git commit -m "feat(home): daily cross-region rail" && git push origin main`.

### Task 5: Admin rows API

**Files:**
- Create: `src/app/api/admin/homepage-rows/route.ts` (GET rows plus candidate events, POST create)
- Create: `src/app/api/admin/homepage-rows/[id]/route.ts` (PUT update, DELETE)
- Create: `src/app/api/admin/homepage-rows/reorder/route.ts` (PUT ordered ids per scope)
- Test: `tests/integration/admin-homepage-rows.test.ts`

**Interfaces:**
- Consumes: Task 1 constants and `listingWhere`.
- Produces: `{ success, rows }`, `{ success, row }`, `{ success, candidates }`; ordered-list replace semantics.

**Steps:**

- [ ] **Step 1: Write the failing tests.** Cases: 401 without cookie and 403 for ORGANIZER on all endpoints; POST appends at the next position and validates title 1 to 80, subtitle up to 160, and at most 8 event ids; an id for a hidden event returns 400 with nothing saved; reorder renumbers transactionally and rejects ids outside the scope; PUT changing `regionId` moves the row and appends in the new scope; DELETE removes it; GET candidates excludes hidden and past events.
- [ ] **Step 2: Run to verify failure.** Expected: modules not found.
- [ ] **Step 3: Implement the routes** with Zod, `requireRole`, and the envelope. Positions are API-managed, never client-supplied.
- [ ] **Step 4: Run tests to verify pass** on the throwaway DB plus `tsc`/eslint. Expected: green, clean.
- [ ] **Step 5: Commit.** `git commit -m "feat(home): admin homepage row endpoints" && git push origin main`.

### Task 6: Admin page, editor, and homepage rendering

**Files:**
- Create: `src/app/[locale]/(admin)/admin/homepage/page.tsx`
- Create: `src/components/admin/HomepageRowsManagerClient.tsx`
- Modify: `src/app/[locale]/(attendee)/page.tsx` (render editor rows)
- Modify: `src/messages/{en,id,ja,zh-CN,de,es}.json` (admin keys)
- Test: `tests/unit/components/HomepageRowsManager.test.tsx`, extend `tests/integration/admin-homepage-rows.test.ts`

**Interfaces:**
- Consumes: Task 5 endpoints, `mergeRows`, `resolveRowCopy`, `ResponsiveRow`, `EventCard`.
- Produces: rows render in merge order; stored ids that no longer resolve are skipped.

**Steps:**

- [ ] **Step 1: Write the failing tests.** Manager lists rows per region, opens an editor with title, subtitle, region or all editions, and an ordered event picker; save POSTs or PUTs; reorder sends the ordered list; delete confirms. Homepage source guard: editor rows merge region and all-editions rows and skip ids that do not resolve to public attendable events.
- [ ] **Step 2: Run to verify failure.** Expected: failures on missing components.
- [ ] **Step 3: Implement the page and manager** with console primitives, per-locale override fields mirroring the editorial blurb editor, and a searchable candidate list.
- [ ] **Step 4: Render editor rows on the homepage.** Query active rows for the active region plus all-editions rows, resolve event ids in one query with `listingWhere`, skip missing or past ids, resolve copy per locale, render each row through `ResponsiveRow` with `stagger-children`.
- [ ] **Step 5: Run tests to verify pass** plus `tsc`, eslint, and parity. Expected: green, clean.
- [ ] **Step 6: Commit.** `git commit -m "feat(home): editor rows with admin manager" && git push origin main`.

### Task 7: Full verification

**Files:** none.

**Steps:**

- [ ] **Step 1: Fresh-DB suite.** Recreate `xpo-test-db` on 5434, export `DATABASE_URL`, `migrate deploy`, `db:seed`, `npx vitest run`. Expected: 100% pass (record the count).
- [ ] **Step 2: Axe gate plus live probes.** Accessibility spec 3/3 light and dark. Live `/en` shows the rail with a region label and no active-region events; `/en/events` unaffected; admin homepage page loads; a row with a hidden event id renders without that card; zero `MISSING_MESSAGE`. Kill the server, revert `next-env.d.ts`, remove temp files.
- [ ] **Step 3: Record receipts** in `.superpowers/sdd/hero-carousel/progress.md`.

## Self-Review

1. **Spec coverage:** goals 1 to 4 map to Tasks 1 to 6; non-goals untouched; builder resolutions (candidates, ranking, container-only row, cross-region ids, merge order, position semantics, empty rail, localized copy) each appear in Tasks 1, 4, or 6.
2. **Step scan:** each test step names assertions; each code step names files and signatures; no undetermined bodies.
3. **Type consistency:** `HomepageRow.regionId` null scope, `rowGridClass`, `mergeRows`, and `resolveRowCopy` are used identically across tasks.
4. **Review Focus:** each line names its owning task and test.
5. **Proportion:** the plan stays shorter than the code surface and carries no transcripts.
