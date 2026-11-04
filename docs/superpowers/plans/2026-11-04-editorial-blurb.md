# Editorial Blurb + Roomier Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Editorial blurbs (English default + per-locale overrides, approval-gated) editable in the admin console and rendered as a quarantined footnote in the hero carousel, plus roomier strip thumbnails.

**Architecture:** Three nullable columns on Event, a pure resolver in `lib/discovery`, an admin-only PATCH mirroring the assign route, a dialog editor in the admin console, and server-side resolution in the homepage banner mapping so the client carousel receives a plain string.

**Tech Stack:** Next.js 15 App Router, React 19, Prisma 7 (`@prisma/adapter-pg`, URL in `prisma.config.ts`), Zod (see `src/app/api/tickets/checkout/route.ts` for the repo's contract pattern), next-intl, Tailwind.

**Spec:** `docs/superpowers/specs/2026-11-04-editorial-blurb-design.md` — the plan argues from the spec; executors read both.

## Global Constraints

- Institutional tone, zero emojis, `lucide-react` icons only, no em dashes.
- Migrations are additive-only; rollback is image redeploy.
- Auth denies by default: 401 no identity, 403 wrong role (`requireRole`).
- One `{success:false, error, code}` error envelope via `apiError`; message text byte-identical.
- next-intl throws `MISSING_MESSAGE` on missing keys in production: every new key goes in all six locales (`en`, `id`, `ja`, `zh-CN`, `de`, `es`) plus the T3.6-style usage guard.
- Serial vitest files (`fileParallelism: false`); dev DB is compose `xpo-db-1` on 5433 (`.env`); test runs use throwaway `xpo-test-db` on 5434 with exported `DATABASE_URL` + `migrate deploy` + `db:seed`; never run the full suite against the dev DB.
- Each task ships as its own commit pushed to `origin/main`, verified by its tests plus `tsc --noEmit` and eslint on touched files; revert `next-env.d.ts` churn before committing.
- Motion gating untouched; footnote contrast must clear the serious+ axe gate (slate-400 or lighter on the dark story panel).

## Review Focus

- Unapproved blurb must never render anywhere — test in Task 5.
- Empty-string locale override must fall back to default, never render blank — test in Task 1.
- Unknown locale keys rejected with 400 while the hyphenated `zh-CN` key round-trips — tests in Tasks 1 and 3.
- Overlong blurb (281+ chars) rejected with 400 and nothing saved — test in Task 3.
- Non-admin PATCH attempts denied (401 without cookie, 403 wrong role) — test in Task 3.

---

### Task 1: Schema columns + resolution helper

**Files:**
- Modify: `prisma/schema.prisma` (Event model, after `heroImageUrl`)
- Create: `src/lib/discovery/editorial.ts`
- Test: `tests/unit/discovery/editorial-blurb.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `EDITORIAL_LOCALES: readonly ["en","id","ja","zh-CN","de","es"]`; `resolveEditorialBlurb(input: { approved: boolean; blurb?: string | null; i18n?: Record<string,string> | null; locale: string }): string | null`.

**Steps:**

- [ ] **Step 1: Write the failing test.** Cases: unapproved returns null even with text; exact locale override wins; missing locale falls back to default; empty-string override falls back (never `""`); no default returns null; unknown extra keys in `i18n` ignored. Test file imports from `@/lib/discovery/editorial`.
- [ ] **Step 2: Run it to verify failure.** Run: `npx vitest run tests/unit/discovery/editorial-blurb.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3: Add the columns.** In `prisma/schema.prisma` Event model after `heroImageUrl String?`: `editorialBlurb String?` (English default), `editorialBlurbI18n Json?` (`{ locale: text }` map), `editorialApproved Boolean @default(false)`. Then run `npx prisma migrate dev --name editorial_blurb` (dev DB must be up: `npm run db:up`) and `npm run db:generate`.
- [ ] **Step 4: Implement the resolver** in `src/lib/discovery/editorial.ts` with the exact signature above and the spec's chain (approved? exact non-empty locale hit? non-empty default? else null).
- [ ] **Step 5: Run tests to verify pass.** Run: `npx vitest run tests/unit/discovery/editorial-blurb.test.ts` then `npx tsc --noEmit`. Expected: all pass, tsc clean.
- [ ] **Step 6: Commit.** `git add prisma/schema.prisma prisma/migrations/* src/lib/discovery/editorial.ts tests/unit/discovery/editorial-blurb.test.ts && git commit -m "feat(editorial): blurb columns with locale resolver" && git push origin main`.

### Task 2: BannerSlide type + server mapping + fallback examples

**Files:**
- Modify: `src/types/discovery.ts:97-115` (BannerSlide)
- Modify: `src/app/[locale]/(attendee)/page.tsx:140-160` (banner mapping)
- Modify: `src/lib/discovery/fallbackData.ts` (1–2 slide literals)
- Test: `tests/unit/a11y/homepage-expressive.test.ts` (append source guard)

**Interfaces:**
- Consumes: `resolveEditorialBlurb` from Task 1.
- Produces: `BannerSlide.editorialBlurb?: string | null`; mapping guarantees every slide carries the resolved value or null.

**Steps:**

- [ ] **Step 1: Write the failing guard.** Append to `tests/unit/a11y/homepage-expressive.test.ts`: read `(attendee)/page.tsx` source, find the line containing `tagline: evt.tagline`, assert the surrounding block (that line ±4) contains `resolveEditorialBlurb`; assert `fallbackData.ts` contains `editorialBlurb`.
- [ ] **Step 2: Run to verify failure.** Run: `npx vitest run tests/unit/a11y/homepage-expressive.test.ts`. Expected: FAIL on the new assertions.
- [ ] **Step 3: Add the type field.** `editorialBlurb?: string | null` on `BannerSlide` with a comment noting it is pre-resolved server-side.
- [ ] **Step 4: Wire the mapping.** In the `bannerSource.map` add `editorialBlurb: resolveEditorialBlurb({ approved: evt.editorialApproved ?? false, blurb: evt.tagline !== undefined ? evt.editorialBlurb : undefined, i18n: ..., locale })` — exact shape: pass `evt.editorialBlurb`, `evt.editorialBlurbI18n` as the map (cast through `as Record<string,string> | null` since Prisma Json types as `unknown`), and the page's `locale` variable. `findMany` without `select` already returns the new scalar columns. Map the fallback literals through the same resolver (default-language strings; non-English editions fall back identically).
- [ ] **Step 5: Run tests to verify pass.** Run the guard file plus `npx tsc --noEmit`. Expected: pass, clean.
- [ ] **Step 6: Commit.** `git commit -m "feat(editorial): resolve blurb in banner mapping" && git push origin main` (stage the four files).

### Task 3: Admin-only PATCH route

**Files:**
- Create: `src/app/api/admin/events/[id]/blurb/route.ts`
- Test: `tests/integration/admin-editorial-blurb.test.ts`

**Interfaces:**
- Consumes: `EDITORIAL_LOCALES` from Task 1 for Zod key allowlisting.
- Produces: `PATCH` returning `{ success, event, message }` or the `apiError` envelope; `AdminEventItem`-compatible `event` shape.

**Steps:**

- [ ] **Step 1: Write the failing tests.** Import `PATCH` from the route (pattern: `tests/integration/organizer-api-routes.test.ts:1-45`, `Cookie: xpo_role=ADMIN` headers, real seeded DB, delete nothing — mutate one seeded event then restore its original blurb fields in `afterAll`). Cases: no cookie → 401; `xpo_role=ORGANIZER` → 403; overlong blurb (281 chars) → 400 with envelope and value unchanged on refetch; unknown locale key → 400; happy path (default + one override + approved true) → 200, response `event` carries the saved values; `editorialApproved: false` + text saves text but stays unpublished (assert via `resolveEditorialBlurb` on the returned row → null).
- [ ] **Step 2: Run to verify failure.** Run: `npx vitest run tests/integration/admin-editorial-blurb.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement the route**, mirroring `src/app/api/admin/events/[id]/assign/route.ts:1-70` exactly (requireRole ADMIN, `idOrSlugWhere`, 404 message shape, `include: { organizer, venue, venueHall }`, `{ success: true, event, message }`). Zod object (see checkout route for repo style): `editorialBlurb` optional nullable string `.max(280)`, `editorialBlurbI18n` optional record with keys restricted to `EDITORIAL_LOCALES` and values `.max(280)`, `editorialApproved` optional boolean; absent means unchanged. Reject empty body with 400.
- [ ] **Step 4: Run tests to verify pass** (throwaway DB on 5434 per Global Constraints). Expected: all pass.
- [ ] **Step 5: Commit.** `git commit -m "feat(admin): editorial blurb update endpoint" && git push origin main`.

### Task 4: Admin console blurb editor

**Files:**
- Modify: `src/components/admin/AdminEventsConsoleClient.tsx`
- Modify: `src/app/[locale]/(admin)/admin/events/page.tsx` (only if the select needs extending — it uses full-row `findMany`, so likely untouched; verify and skip if so)
- Test: `tests/unit/components/AdminEventsConsole.test.tsx` (new)

**Interfaces:**
- Consumes: PATCH from Task 3 (`/api/admin/events/${id}/blurb`).
- Produces: per-row editorial dialog state merged back via the existing `setEvents(prev => prev.map(...))` pattern.

**Steps:**

- [ ] **Step 1: Write the failing tests.** Render with `isLive={false}` (skips the organizers fetch) and one `initialEvents` row carrying blurb fields: editor dialog opens from the row, shows default + six locale textareas with existing values, approve toggle reflects state, save calls `fetch` with the Task 3 body shape (mock `fetch`, assert URL/method/body), and the whole editor is disabled with an explanatory note when `isLive` is false. Extend `AdminEventItem` with `editorialBlurb?`, `editorialBlurbI18n?`, `editorialApproved?`.
- [ ] **Step 2: Run to verify failure.** Run: `npx vitest run tests/unit/components/AdminEventsConsole.test.tsx`. Expected: FAIL (no editor UI).
- [ ] **Step 3: Implement the dialog** reusing `Button`, `Input`, `Card`, `Badge` primitives; native `<textarea rows={3}>` styled with the same utilities as `src/components/ui/Input.tsx`; per-field 280 counters; approve/unapprove toggle; feedback via the existing `feedback` state; merge response `data.event` with the existing `setEvents` pattern. Disabled-with-note when `!isLive`.
- [ ] **Step 4: Run tests to verify pass** plus `tsc` and eslint on touched files. Expected: pass, clean, zero errors.
- [ ] **Step 5: Commit.** `git commit -m "feat(admin): blurb editor in events console" && git push origin main`.

### Task 5: Carousel footnote + roomier strip + marker keys

**Files:**
- Modify: `src/messages/{en,id,ja,zh-CN,de,es}.json` (hero: `editorialByline`)
- Modify: `src/components/discovery/BannerCarousel.tsx`
- Test: `tests/unit/components/discovery/BannerCarousel.test.tsx` (append)

**Interfaces:**
- Consumes: `BannerSlide.editorialBlurb` from Task 2 (plain resolved string or null).
- Produces: footnote + enlarged strip, all existing T3 tests still green.

**Steps:**

- [ ] **Step 1: Write the failing tests.** Cases: slide with `editorialBlurb` renders a footnote containing the `hero.editorialByline` marker below the CTA row; slide with `editorialBlurb: null` renders no footnote element and no extra gap block; strip thumbnails carry the enlarged sizing (`h-14`) and titles use `line-clamp-2` instead of `truncate`. (The T3.6 usage guard automatically covers the new key since it scans all `tHero('…')` literals.)
- [ ] **Step 2: Run to verify failure.** Run the carousel file. Expected: FAIL on new tests.
- [ ] **Step 3: Add the six `editorialByline` keys** (English `"XPO Editors"`, others in the existing hero tone) and implement: footnote `p` with mono micro-label + marker, `line-clamp-3`, slate-400 or lighter on the dark story panel, rendered under all three temporal CTA variants only when the blurb is non-null; strip thumb `h-11 w-16` → `h-14 w-20`, title span `truncate` → `line-clamp-2`.
- [ ] **Step 4: Run tests to verify pass** plus `tsc` and eslint. Expected: whole file green (21+ new tests), clean.
- [ ] **Step 5: Commit.** `git commit -m "feat(hero): editorial footnote and roomier strip" && git push origin main`.

### Task 6: Full verification

**Files:** none (evidence only).

**Steps:**

- [ ] **Step 1: Fresh-DB full suite.** Recreate `xpo-test-db` on 5434, export `DATABASE_URL`, `migrate deploy`, `db:seed`, `npx vitest run`. Expected: 100% pass (note the count).
- [ ] **Step 2: Axe gate + live probes.** One `next dev` per directory; `npx playwright test tests/e2e/accessibility.spec.ts` (3/3 light, plus the dark probe from the hero log); curl `/en` 200 with zero `MISSING_MESSAGE`; curl one event detail page 200; kill the server, revert `next-env.d.ts`, remove temp files.
- [ ] **Step 3: Record receipts.** Append per-task verification lines to `.superpowers/sdd/hero-carousel/progress.md` (git-ignored ledger). No commit needed (ledger is ignored); if the plan requires roadmap receipt updates, do them in a `docs:` commit.

## Self-Review

1. **Spec coverage:** every spec section maps — goals 1→Task 5, 2→Tasks 1–4, 3→Task 5, 4→Tasks 1+5; constraints each appear in Global Constraints or a task; non-goals named in Task 5 and the plan intro. No gaps.
2. **Step scan:** each test step pins names/assertions; code steps pin signatures/files/values; bodies appear only where the signature underdetermines (resolver chain is fully pinned by tests; route mirrors assign). Fixed inline: none outstanding.
3. **Type consistency:** `editorialBlurb: string | null` on BannerSlide matches resolver return; `editorialBlurbI18n` travels as `Record<string,string> | null` with a cast at the Prisma Json boundary in Task 2 and Zod validation at the Task 3 boundary. Consistent.
4. **Review Focus:** all five lines have owning-task tests (listed per line).
5. **Proportion:** plan is shorter than the combined spec + touched files; code blocks appear only for test assertions the executor cannot derive. No transcripts.
