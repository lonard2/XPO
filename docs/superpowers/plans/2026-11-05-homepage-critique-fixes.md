# Homepage Critique Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the six critique actions as six verified commits on `main`, improving homepage depth, edition clarity, card consistency, category navigation, contrast, and minor polish.

**Architecture:** Targeted edits to existing homepage components and shared primitives. No new page or data model. Each task is independently testable and committed on its own.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS, next-intl, Vitest, Playwright + axe.

**Spec:** `.impeccable/critique/2026-11-05T13-41-16Z__src-app-locale-attendee-page-tsx.md` and the delivered critique in chat.

## Global Constraints

- Zero emojis. Lucide icons only. No em dashes in prose.
- Every user-visible string goes through next-intl and exists in all six locales (`en`, `id`, `ja`, `zh-CN`, `de`, `es`).
- Preserve `AGENTS.md` requirements: the hero carousel stays, the homepage quick calendar stays, and the venue directory keeps every venue discoverable.
- `twMerge` collapses conflicting display classes: never emit a bare `grid` from `rowGridClass`.
- Public queries keep `listingWhere()`. Hidden events must not leak into any rail.
- Each task ends with `tsc`, targeted tests, eslint, one commit, and a push to `origin/main`.

## Review Focus

- A new translation key that exists in `en` but not the other five locales: production `MISSING_MESSAGE` is the failure mode.
- A card wrapper that stretches but whose inner `Card` does not, leaving ragged CTA rows.
- An orphan-centering rule that also fires on even counts or at `lg`.
- A currency code chip that duplicates the code when `Intl` already prints it.
- A category default that hides a category with no visible way back.

---

### Task 1: Distill repetition and depth

**Files:**
- Modify: `src/app/[locale]/(attendee)/page.tsx`
- Modify: `src/components/discovery/MajorVenuesUpcomingSection.tsx`
- Modify: `src/messages/*.json`
- Test: `tests/unit/components/discovery/MajorVenuesUpcomingSection.test.tsx`
- Test: `tests/unit/a11y/homepage-motion.test.ts`

**Interfaces:**
- Produces: `featuredRowEvents` in the page, which excludes the hero lead when more than one attendable event exists.
- Produces: a compact quiet-venue list that still renders every venue name.

**Decision:** The critique asked to drop quiet venues and replace the calendar. The venue test at `MajorVenuesUpcomingSection.test.tsx:125` guards against hiding them, and `AGENTS.md` requires the quick calendar. Quiet venues become a compact directory strip instead of full cards; the calendar and carousel stay.

- [ ] **Step 1: Write the failing tests.** In the venue test, assert every venue name is present and that quiet venues render in a `data-quiet-venues` list without a full event block. In `homepage-motion.test.ts`, assert the featured row uses `featuredRowEvents`.
- [ ] **Step 2: Run the tests and confirm they fail.**
- [ ] **Step 3: Implement.** Split `orderedVenues` into `activeVenues` and `quietVenues`; render active cards in `ResponsiveRow`, then a compact `<ul data-quiet-venues>` with name link, city, and the quiet line. In the page, compute `featuredRowEvents` from `attendableEvents` minus `bannerSlides[0]?.id` when more than one remains, and use it in the featured row.
- [ ] **Step 4: Change the final banner to an attendee CTA** (`/${locale}/events`, "Browse upcoming passes") and add the key to all locales.
- [ ] **Step 5: Run targeted tests, `tsc`, eslint, commit, push.**

### Task 2: Clarify edition and currency

**Files:**
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/layout/RegionSwitcher.tsx`
- Modify: `src/components/discovery/EventCard.tsx`
- Modify: `src/messages/*.json`
- Test: `tests/unit/components/RegionSwitcher.test.tsx`
- Test: `tests/unit/components/discovery/EventCard.test.tsx`

**Interfaces:**
- Produces: a persistent `RegionSwitcher` in the top bar at every width. Below `sm` the trigger shows the flag code and ISO currency, not the full region name.
- Produces: a muted ISO currency chip beside paid prices when the formatted price does not already contain the code.

- [ ] **Step 1: Write the failing tests.** Assert the compact trigger renders `ID (IDR)` at small widths (via a `compact` prop) and that a paid JPY card shows `JPY` when the locale renders only `¥`.
- [ ] **Step 2: Run the tests and confirm they fail.**
- [ ] **Step 3: Implement.** Remove the `hidden lg:block` wrapper in `Navbar`; add `compact` to `RegionSwitcher` and render `flagCode` plus `currency` in the trigger. In `EventCard`, add a currency chip when `!priceDisplay.toUpperCase().includes(currency)`. Change the venue name clamp to `line-clamp-2` and let city and hall wrap.
- [ ] **Step 4: Run targeted tests, `tsc`, eslint, commit, push.**

### Task 3: Layout card system and hero hierarchy

**Files:**
- Modify: `src/components/discovery/ResponsiveRow.tsx`
- Modify: `src/lib/discovery/grids.ts`
- Modify: `src/components/discovery/EventCard.tsx`
- Modify: `src/components/discovery/CrossRegionRail.tsx`
- Modify: `src/components/discovery/BannerCarousel.tsx`
- Modify: `src/components/discovery/IdentityStrip.tsx`
- Test: `tests/unit/components/discovery/ResponsiveRow.test.tsx`
- Test: `tests/unit/components/discovery/CrossRegionRail.test.tsx`
- Test: `tests/unit/discovery/grids.test.ts`

**Interfaces:**
- Produces: `ResponsiveRow` wrappers carry `h-full`, and the last odd item centers at `md` only (`md:col-span-2 md:mx-auto md:w-1/2 lg:col-span-1 lg:w-auto`).
- Produces: `CrossRegionRail` passes `variant="horizontal"` when it has fewer than three items.
- Produces: the hero grid is `lg:grid-cols-[1fr_1.4fr]`, controls sit bottom-left on desktop, and the event title is one step smaller than the H1.

- [ ] **Step 1: Write the failing tests.** Assert the row renders `h-full`; assert an odd three-item row gives the last wrapper the centering classes and an even row does not; assert a one-item rail renders the horizontal variant; assert the hero grid and control classes.
- [ ] **Step 2: Run the tests and confirm they fail.**
- [ ] **Step 3: Implement.** Add `h-full` to the wrapper and `Card`. Add the odd-count centering. Add `variant` to the rail. Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` to the card title link. Flip the hero grid, move controls to `lg:bottom-4 lg:left-4 lg:top-auto lg:right-auto`, set the event title to `lg:text-4xl`, and the H1 to `sm:text-5xl`.
- [ ] **Step 4: Run targeted tests, `tsc`, eslint, commit, push.**

### Task 4: Shape the category matrix

**Files:**
- Modify: `src/components/discovery/EventCategoryPills.tsx`
- Modify: `src/messages/*.json`
- Test: `tests/unit/components/discovery/EventCategoryPills.test.tsx`

**Interfaces:**
- Produces: default `all` view shows eight representative categories and a `Show all 22 categories` button. Expanding renders all 22.
- Produces: cluster tabs wrap instead of clipping, and the 22-tile view uses centered flex-wrap so no row ends in orphans.
- Produces: the focused cluster panel title uses `clusterLabel`, matching the tab.

- [ ] **Step 1: Write the failing tests.** Default shows eight tiles and the disclosure button; clicking the button shows 22; tabs have `flex-wrap`; the panel title matches the tab label.
- [ ] **Step 2: Run the tests and confirm they fail.**
- [ ] **Step 3: Implement.** Add `showAllCategories` state and a `REPRESENTATIVE_IDS` list (first archetype of each cluster plus two flagship categories). Replace the tab strip overflow with `flex flex-wrap`. Replace the 22-grid with `flex flex-wrap justify-center` and basis classes. Use `clusterLabel` in the panel.
- [ ] **Step 4: Run targeted tests, `tsc`, eslint, commit, push.**

### Task 5: Audit contrast and the live-state gate

**Files:**
- Modify: `src/components/discovery/BannerCarousel.tsx`
- Modify: `src/components/discovery/IdentityStrip.tsx`
- Test: `tests/unit/a11y/live-badge-contrast.test.ts` (create)
- Test: `tests/e2e/accessibility.spec.ts`

**Interfaces:**
- Produces: the `Happening Now` badge uses `bg-emerald-700` (4.8:1 with white).
- Produces: the H1 uses the documented `text-3xl` ramp, not `text-[1.7rem]`.
- Produces: the hero story panel uses a 1px left border, not `border-l-4`.

- [ ] **Step 1: Write the failing contrast test.** Compute the WCAG ratio for `#047857` on white and assert it is at least 4.5; assert the source contains `bg-emerald-700` and not `bg-emerald-600` for the live badge.
- [ ] **Step 2: Run the test and confirm it fails.**
- [ ] **Step 3: Implement** the three changes. Add a note in the axe spec that the live badge is now covered by the source guard.
- [ ] **Step 4: Run targeted tests, `tsc`, eslint, commit, push.**

### Task 6: Polish minor observations

**Files:**
- Modify: `src/components/discovery/BannerCarousel.tsx`
- Modify: `src/components/discovery/MajorVenuesUpcomingSection.tsx`
- Modify: `src/components/discovery/EventCategoryPills.tsx`
- Modify: `src/components/discovery/CrossRegionRail.tsx`
- Modify: `src/components/discovery/IdentityStrip.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/app/[locale]/(attendee)/page.tsx`
- Modify: `src/messages/*.json`
- Test: `tests/unit/components/discovery/BannerTemporalWidget.test.tsx`
- Test: `tests/unit/a11y/homepage-expressive.test.ts`

**Interfaces:**
- Produces: countdown shows days, hours, minutes (no seconds) and ticks once a minute.
- Produces: hero city renders as a separate `• City` span, never a second parenthesis.
- Produces: the venue CTA reads "View all venues" from a translation key, not a title split.
- Produces: featured images keep 16:9, the masthead subtitle is `max-w-prose`, the footer meta line wraps, the category header link is hidden below `sm`, the rail has an `h2`, and the outer venue `<section>` wrapper is removed.

- [ ] **Step 1: Write the failing tests.** Countdown regex has no seconds; rail has an `h2`; page has one fewer `<section>`; venue CTA is the new key.
- [ ] **Step 2: Run the tests and confirm they fail.**
- [ ] **Step 3: Implement** each polish item and add the new keys to all locales.
- [ ] **Step 4: Run targeted tests, `tsc`, eslint, commit, push.**
- [ ] **Step 5: Run the full suite on a fresh seeded database, the axe gate in light and dark, and live probes at 390, 768, 1280, and 1800.**
