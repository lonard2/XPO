# Homepage Critique Fixes, Round Two

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the five actions from the second critique as five verified commits on `main`, starting with the edition-switch crash and including a venue section that keeps every venue visible.

**Architecture:** Targeted changes to the carousel, edition resolver, venue section, shared row primitive, mobile chrome, and polish surfaces. No new data model.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS, next-intl, Vitest, Playwright + axe.

**Spec:** `.impeccable/critique/2026-11-10T12-56-44Z__src-app-locale-attendee-page-tsx.md` and the delivered critique in chat.

## Global Constraints

- Zero emojis. Lucide icons only. No em dashes in prose.
- Every user-visible string goes through next-intl and exists in all six locales.
- **Every venue stays visible.** The venue fix must not delete, hide, or filter out a venue with no events. The section becomes a spotlight plus a full directory.
- Preserve `AGENTS.md` requirements: hero carousel, homepage quick calendar, venue directory.
- Marketplace direction, but shorter: cut depth and repeated CTAs, not required modules.
- Each task ends with `tsc`, targeted tests, eslint, one commit, and a push to `origin/main`.

## Review Focus

- The carousel index surviving a shorter slide array on edition switch.
- The edition trigger hydrating a different region on server and client.
- A venue directory that silently drops a venue.
- A single-item row that still stretches to billboard width.
- A mobile CTA that a fixed layer can still cover.

---

### Task 1: Harden the edition switch

**Files:**
- Modify: `src/lib/i18n/useActiveRegion.ts`
- Modify: `src/components/discovery/BannerCarousel.tsx`
- Modify: `src/app/[locale]/layout.tsx`
- Test: `tests/unit/components/discovery/BannerCarousel.test.tsx`
- Test: `tests/unit/components/RegionSwitcher.test.tsx`

**Interfaces:**
- Produces: `useActiveRegion` reads `?region=` through `useSearchParams` so server and client resolve the same edition.
- Produces: `BannerCarousel` clamps `currentIndex` to `slides.length - 1` and returns null for an out-of-range slide.

- [ ] **Step 1: Write the failing carousel test.** Render with two slides, click Next, rerender with one slide, assert the first slide renders and no error is thrown.
- [ ] **Step 2: Run it and confirm it fails.**
- [ ] **Step 3: Implement.** Add `useSearchParams` to `useActiveRegion`; wrap `Navbar` in `Suspense` in the locale layout; add a `useEffect` that clamps the index when `totalSlides` changes; guard `renderSlide` against a missing slide.
- [ ] **Step 4: Run targeted tests, `tsc`, eslint, commit, push.**

### Task 2: Distill the venue section and page depth

**Files:**
- Modify: `src/components/discovery/MajorVenuesUpcomingSection.tsx`
- Modify: `src/app/[locale]/(attendee)/page.tsx`
- Modify: `src/messages/*.json`
- Test: `tests/unit/components/discovery/MajorVenuesUpcomingSection.test.tsx`
- Test: `tests/unit/discovery/major-venues-curation.test.tsx`
- Test: `tests/unit/a11y/homepage-motion.test.ts`

**Interfaces:**
- Produces: a `data-venue-directory` list containing every venue, with name, city, hall count, transit, and a status line.
- Produces: spotlight cards only for venues with attendable events.
- Produces: the page drops the third bento cell and the organizer callout, and collapses the concluded archive to one link.

- [ ] **Step 1: Write the failing tests.** Assert all six venue names appear in `[data-venue-directory]`; assert quiet venues are not removed; assert the page has two bento cells and no organizer callout.
- [ ] **Step 2: Run them and confirm they fail.**
- [ ] **Step 3: Implement** the spotlight plus directory. The directory lists every venue, including active ones, so nothing is hidden. Change the venue subtitle to describe the directory. Remove the third bento cell and organizer callout; collapse the concluded list to a single `/events?status=concluded` link.
- [ ] **Step 4: Run targeted tests, `tsc`, eslint, commit, push.**

### Task 3: Layout single-item rows and carousel controls

**Files:**
- Modify: `src/components/discovery/ResponsiveRow.tsx`
- Modify: `src/lib/discovery/grids.ts`
- Modify: `src/components/discovery/CrossRegionRail.tsx`
- Modify: `src/components/discovery/BannerCarousel.tsx`
- Modify: `src/app/[locale]/(attendee)/page.tsx`
- Test: `tests/unit/components/discovery/ResponsiveRow.test.tsx`
- Test: `tests/unit/components/discovery/CrossRegionRail.test.tsx`
- Test: `tests/unit/a11y/homepage-hero.test.ts`

**Interfaces:**
- Produces: `ResponsiveRow` accepts `singleClassName`, default `max-w-md`, applied only when it has one item.
- Produces: the featured row and venue row use `max-w-md`; the rail uses `max-w-2xl`.
- Produces: desktop carousel controls sit top-left over the image, clear of the up-next strip.

- [ ] **Step 1: Write the failing tests.** A one-item row gets `max-w-md`; a rail with one item gets `max-w-2xl`; the controls no longer use `lg:bottom-4 lg:left-4`.
- [ ] **Step 2: Run them and confirm they fail.**
- [ ] **Step 3: Implement** the prop and the control position (`lg:top-4 lg:left-4 lg:bottom-auto lg:right-auto`).
- [ ] **Step 4: Run targeted tests, `tsc`, eslint, commit, push.**

### Task 4: Adapt mobile chrome

**Files:**
- Modify: `src/components/discovery/BannerCarousel.tsx`
- Modify: `src/app/[locale]/(attendee)/page.tsx`
- Modify: `src/components/layout/MobileBottomNav.tsx`
- Modify: `src/components/layout/Navbar.tsx`
- Test: `tests/unit/components/layout/outer-chrome.test.tsx`
- Test: `tests/unit/a11y/homepage-hero.test.ts`

**Interfaces:**
- Produces: the hero reserves enough bottom padding that its CTA clears the fixed bottom nav at 390.
- Produces: the featured header CTA is `self-start` on mobile, so the FAB cannot cover it.
- Produces: the bottom nav marks the current page with `aria-current="page"`.
- Produces: the mobile drawer has a clear Sign In action.

- [ ] **Step 1: Write the failing tests.** Assert the hero slide has the larger mobile bottom padding; assert the featured CTA has `self-start`; assert the bottom nav emits `aria-current`; assert the drawer contains a sign-in control.
- [ ] **Step 2: Run them and confirm they fail.**
- [ ] **Step 3: Implement** the padding, the CTA alignment, the current-page attribute, and the drawer sign-in button.
- [ ] **Step 4: Run targeted tests, `tsc`, eslint, commit, push.**

### Task 5: Polish regressions and minors

**Files:**
- Modify: `src/components/discovery/EventCard.tsx`
- Modify: `src/components/discovery/EventCalendarWidget.tsx`
- Modify: `src/components/discovery/BannerCarousel.tsx`
- Modify: `src/components/discovery/EventCategoryPills.tsx`
- Modify: `src/components/discovery/MajorVenuesUpcomingSection.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/messages/*.json`
- Test: `tests/unit/components/discovery/EventCard.test.tsx`
- Test: `tests/unit/components/discovery/EventCalendarWidget.test.tsx`
- Test: `tests/unit/components/discovery/EventCategoryPills.test.tsx`

**Interfaces:**
- Produces: currency chips at 11px, not 10px.
- Produces: the calendar opens on the next attendable event date, and its heading is an `h2`.
- Produces: autoplay pauses under `prefers-reduced-motion`.
- Produces: category tiles use the short tagline, clamped to two lines.
- Produces: the venue CTA reads "View venue", the footer clears the FAB, and focus-visible uses a 2px primary outline.
- Produces: `IN_PERSON`, `HYBRID`, and `VIRTUAL` render as human labels, not raw enums.

- [ ] **Step 1: Write the failing tests.** Assert 11px chips; the calendar selects the next event date; the category tile shows the tagline and two lines; the format label is humanized.
- [ ] **Step 2: Run them and confirm they fail.**
- [ ] **Step 3: Implement** each item and add the needed keys to all locales.
- [ ] **Step 4: Run targeted tests, `tsc`, eslint, commit, push.**
- [ ] **Step 5: Run the full suite on a fresh seeded database, the axe gate in light and dark, and live probes at 390, 768, 1280, and 1800.**
