# Event Presentation Tiers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One event shell in three explicit human-chosen sizes plus three visibility tiers with leak-proof enforcement and discreet occupancy stubs.

**Architecture:** Three columns, a pure tier/visibility resolver library, shell branching by resolved size (tabs hidden wholesale, one optional `pageSize` prop for meeting/channel blocks), a central visibility helper consumed by every public listing, and tier/visibility editing split by role (organizers set size, admins set visibility).

**Tech Stack:** Next.js 15 App Router, React 19, Prisma 7, Zod, next-intl, Tailwind.

**Spec:** `docs/superpowers/specs/2026-11-05-event-presentation-tiers-design.md` — the plan argues from the spec; executors read both.

## Global Constraints

- Institutional tone, zero emojis, `lucide-react` icons only, no em dashes.
- Migrations additive-only; `Event.visibility` default `PUBLIC`, `Venue.size` default `LARGE` (nothing regresses on migrate); `Event.pageSize` nullable (null = no explicit choice yet).
- Creation wizard requires explicit tier confirmation (validation rejects unset; a venue prefill never saves silently).
- Visibility is ADMIN-only; organizers may set `pageSize` on own events, never visibility.
- Auth deny-by-default; `apiError` envelope; new dict keys under `common` (`discreetEventLabel`, `discreetEventDesc`) in all six locales plus usage-guard test.
- Serial vitest; dev DB compose `xpo-db-1:5433`; test runs on throwaway `xpo-test-db:5434` with exported `DATABASE_URL` + `migrate deploy` + `db:seed`.
- Each task ships as its own commit pushed to `origin/main` with tests + `tsc` + eslint; revert `next-env.d.ts` churn.
- Serious+ axe gate; stubs are real text, never color-only.

## Review Focus

- Discreet title/organizer/image must never leave the server (JSON-LD and metadata included) — tests in Tasks 3 and 4.
- Hidden events absent from sitemap yet resolvable by direct URL with `noindex` — test in Task 3.
- Explicit per-event tier beats venue size; unset tier rejected at creation — tests in Tasks 1 and 5.
- Discreet direct URL 404s; owners/admins still see own rows — test in Task 3.
- SMALL hides booths/floorMap tab, meeting drawers, showcase channels; keeps alerts — test in Task 2.

---

### Task 1: Schema + tier/visibility library

**Files:**
- Modify: `prisma/schema.prisma` (Venue.size, Event.pageSize, Event.visibility)
- Create: `src/lib/discovery/presentation.ts`
- Test: `tests/unit/discovery/presentation.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `PAGE_SIZES = ["LARGE","MEDIUM","SMALL"]`; `resolvePageSize({ eventTier, venueSize }): "LARGE"|"MEDIUM"|"SMALL"` (explicit choice → venue suggestion → LARGE); `VISIBILITY = ["PUBLIC","DISCREET","HIDDEN"]`; `listingWhere()` → `{ visibility: "PUBLIC" }`; `scheduleWhere()` → `{ visibility: { in: ["PUBLIC","DISCREET"] } }`; `stripDiscreetFields<T>(row)` dropping title/organizer/identity/image/tagline/description/branding/tiers/agenda/booths to `{ hallName, startDate, endDate }`-shaped stubs (exact stub type exported as `DiscreetStub`).

**Steps:**

- [ ] **Step 1: Write the failing test.** Cases: explicit SMALL beats LARGE venue; null event tier inherits venue MEDIUM; null/null resolves LARGE; `listingWhere`/`scheduleWhere` exact objects; `stripDiscreetFields` output contains no title/organizer/image keys and keeps hall/dates.
- [ ] **Step 2: Run it to verify failure.** Run: `npx vitest run tests/unit/discovery/presentation.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3: Add the columns.** `Venue.size String @default("LARGE")`, `Event.pageSize String?`, `Event.visibility String @default("PUBLIC")`. Run `npx prisma migrate dev --name presentation_tiers` (dev DB up) and `npm run db:generate`.
- [ ] **Step 4: Implement the library** with the exact names above.
- [ ] **Step 5: Run tests to verify pass** plus `npx tsc --noEmit`. Expected: pass, clean.
- [ ] **Step 6: Commit.** `git add prisma/schema.prisma prisma/migrations/* src/lib/discovery/presentation.ts tests/unit/discovery/presentation.test.ts && git commit -m "feat(tiers): size and visibility model with resolvers" && git push origin main`.

### Task 2: Shell sizes

**Files:**
- Modify: `src/components/themed/EventPageShell.tsx` (resolve size, hide floorMap tab on SMALL, pass `pageSize` to `ArchetypeView`)
- Modify: the 9 files under `src/components/themed/archetypes/` that render meeting-request drawers or showcase channels (find via `submitMeetingRequest` and channel sections): accept optional `pageSize?: "LARGE"|"MEDIUM"|"SMALL"` default `"LARGE"`, skip those blocks on SMALL
- Test: `tests/unit/a11y/event-detail-motion.test.ts` (append guards) plus existing `tests/unit/theming/archetypes.test.tsx` must stay green

**Interfaces:**
- Consumes: `resolvePageSize` from Task 1; shell already receives venue halls (verify prop carries venue size — extend the venue prop with `size` if absent).
- Produces: SMALL renders hero-short, facts, programs, pin, CTA; no floorMap tab, no meeting drawers, no showcase channels; alerts kept.

**Steps:**

- [ ] **Step 1: Write the failing guards.** Cases: shell source resolves size via `resolvePageSize`; floorMap tab absent when SMALL (render `EventPageShell` with a small-tier event and assert `queryByRole("tab", { name: /floor|map/i })` null while overview renders); meeting/channel markers absent on SMALL, present on LARGE (one representative archetype view each, e.g. Hospitality for meetings, a channels renderer).
- [ ] **Step 2: Run to verify failure.** Expected: FAIL (no branching yet).
- [ ] **Step 3: Implement** per interfaces; MEDIUM renders full sections with tighter spacing only (adjust the main container gap class, no hides).
- [ ] **Step 4: Run tests to verify pass** (new guards + full archetypes file) plus `tsc` and eslint. Expected: green, clean.
- [ ] **Step 5: Commit.** `git commit -m "feat(tiers): sized event shell" && git push origin main`.

### Task 3: Visibility enforcement + leak tests

**Files:**
- Modify: `src/app/sitemap.ts:55` (exclude non-PUBLIC), `src/app/[locale]/(attendee)/page.tsx` (banner + grids via `listingWhere`), `src/app/[locale]/(attendee)/events/page.tsx`, `src/app/[locale]/(attendee)/calendar/page.tsx`, `src/app/[locale]/(attendee)/venues/[slug]/page.tsx` (schedule via `scheduleWhere` + strip), `src/app/[locale]/(attendee)/events/[slug]/page.tsx` (DISCREET → `notFound()`, HIDDEN → `noindex` + no JSON-LD/OG), `src/app/api/profile/suggestions/*` (exclude non-PUBLIC)
- Test: `tests/integration/tiers-visibility.test.ts`

**Interfaces:**
- Consumes: Task 1 helpers.
- Produces: every public surface filtered; owners/admins unaffected (their queries untouched).

**Steps:**

- [ ] **Step 1: Write the failing tests.** Seed in-test: one DISCREET + one HIDDEN event (self-cleaning). Cases: sitemap output contains neither slug; suggestions exclude both; discreet detail URL 404s; hidden detail URL 200 with `noindex` and no `application/ld+json` block; discreet JSON payloads (calendar/schedule fetchers at the lib level) contain no title key. Model sitemap/metadata assertions on the existing `curated-event-display.test.ts` rendering pattern.
- [ ] **Step 2: Run to verify failure.** Expected: FAIL (unfiltered).
- [ ] **Step 3: Implement** per file list; discreet stripping at the Prisma `select` level (never select-then-delete).
- [ ] **Step 4: Run tests to verify pass** on throwaway DB plus `tsc`/eslint. Expected: green, clean.
- [ ] **Step 5: Commit.** `git commit -m "feat(tiers): visibility enforcement with leak tests" && git push origin main`.

### Task 4: Discreet stubs + dictionary keys

**Files:**
- Modify: `src/messages/{en,id,ja,zh-CN,de,es}.json` (`common.discreetEventLabel`, `common.discreetEventDesc`)
- Modify: venue schedule renderer + calendar day-list (blocked entries: hall + generic label, non-clickable)
- Test: extend `tests/integration/tiers-visibility.test.ts` + usage-guard test for the new keys

**Interfaces:**
- Consumes: Task 3 stripped rows.
- Produces: visible occupancy without identity, real text, both themes.

**Steps:**

- [ ] **Step 1: Write the failing tests.** Cases: schedule contains hall name + label with no `<a>` wrapping; label key resolves in all six locales (usage-guard pattern); axe-clean by construction (inherits gate in Task 6).
- [ ] **Step 2: Run to verify failure.** Expected: FAIL.
- [ ] **Step 3: Implement** per interfaces; label uses `common` namespace (loaded on all three surfaces).
- [ ] **Step 4: Run tests to verify pass** plus `tsc`/eslint/parity. Expected: green, clean.
- [ ] **Step 5: Commit.** `git commit -m "feat(tiers): discreet occupancy stubs" && git push origin main`.

### Task 5: Tier/visibility editing by role

**Files:**
- Modify: `src/app/[locale]/(organizer)/events/new/page.tsx` (tier select, explicit confirm, reject unset), `src/app/[locale]/(organizer)/events/[slug]/customizer/page.tsx` (+ API `branding` or events route: accept `pageSize` for own events, reject `visibility`)
- Modify: `src/app/api/admin/venues/*` or venues admin route (venue `size`), admin events console + API (event `pageSize` + `visibility` ADMIN-only)
- Test: new integration `tests/integration/tiers-editing.test.ts` + console render extension

**Interfaces:**
- Consumes: Task 1 constants for Zod enums.
- Produces: organizers set size (never visibility: 403/400); admins set all three.

**Steps:**

- [ ] **Step 1: Write the failing tests.** Cases: creation without tier → 400; organizer PATCH `visibility` → 403/400 with size applied and visibility unchanged; organizer PATCH `pageSize: "SMALL"` → 200; ADMIN sets all three → 200; venue size ADMIN-only.
- [ ] **Step 2: Run to verify failure.** Expected: FAIL.
- [ ] **Step 3: Implement** per file list; wizard prefills from venue suggestion but requires explicit confirmation.
- [ ] **Step 4: Run tests to verify pass** plus `tsc`/eslint. Expected: green, clean.
- [ ] **Step 5: Commit.** `git commit -m "feat(tiers): role-split tier and visibility editing" && git push origin main`.

### Task 6: Small-venue seeds + full verification

**Files:**
- Modify: `prisma/seed.ts` (representative mall + open-field venues per region at SMALL)
- Evidence only otherwise.

**Steps:**

- [ ] **Step 1: Fresh-DB full suite.** Recreate `xpo-test-db` on 5434, export `DATABASE_URL`, `migrate deploy`, `db:seed`, `npx vitest run`. Expected: 100% pass (note the count).
- [ ] **Step 2: Axe gate + live probes.** One `next dev` per directory; accessibility spec 3/3 light + dark probe; curl a SMALL event page and a venue schedule with a discreet entry; kill server, revert `next-env.d.ts`, remove temp files.
- [ ] **Step 3: Record receipts** in `.superpowers/sdd/hero-carousel/progress.md` and seed with `git commit -m "feat(tiers): small venue seeds" && git push origin main` before the suite (seeds are code, verified by the suite).

## Self-Review

1. **Spec coverage:** goals 1→Tasks 1–2+5, 2→Tasks 1+5, 3→Tasks 1+3, 4→Tasks 1+6, 5→Tasks 3–4; V1→Task 3; tier-correction→Tasks 1+5. No gaps.
2. **Step scan:** test steps pin names/assertions; code steps pin files/signatures; mirror-targets named. Fixed inline: none outstanding.
3. **Type consistency:** `pageSize`/`size`/`visibility` String fields; `DiscreetStub` shape from Task 1 reused in Tasks 3–4; slot-shape precedent followed. Consistent.
4. **Review Focus:** all five lines own task tests as listed.
5. **Proportion:** plan shorter than the surface inventory; no transcripts.
