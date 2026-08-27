---
target: the homepage
total_score: 36
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
timestamp: 2026-08-27T04-29-36Z
slug: src-app-locale-attendee-page-tsx
---
# Design Critique: Attendee Homepage

**Method:** dual-agent (A: 6ab15b23 · B: e4c36f0b)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Excellent temporal states (Happening Now, Countdown, Concluded) and persistent filter chips |
| 2 | Match Between System and Real World | 3 | Strong MICE terminology; minor "archetype" jargon leaks into prop naming |
| 3 | User Control and Freedom | 4 | Clear All filters, individual chip dismissal, calendar month traversal with jump-to-upcoming |
| 4 | Consistency and Standards | 3 | Visually cohesive; lucide-react icons and 1px border system consistent throughout |
| 5 | Error Prevention | 3 | Good empty states and fallbacks; P0 nested Button-in-Link creates hydration errors |
| 6 | Recognition Rather Than Recall | 4 | ActiveFilterChips, visual active states on category pills, persistent URL query params |
| 7 | Flexibility and Efficiency of Use | 4 | `/` hotkey for search, roving keyboard nav in category pills, bookmarkable filter URLs |
| 8 | Aesthetic and Minimalist Design | 4 | Clean 1px border tactile system, no heavy shadows, purposeful hierarchy |
| 9 | Error Recovery | 4 | Empty-state recovery with "Reset All Filters" and jump-to-nearest-upcoming in calendar |
| 10 | Help and Documentation | 3 | Self-documenting inline micro-copy in calendar widget; no contextual tooltips on filters |
| **Total** | | **36/40** | **Excellent** |

## Design Specificity Verdict

**LLM Assessment:** Highly specific and institutional. The homepage escapes the generic event listing trap through three layers of domain-specific grounding:

1. **Spatial reality**: MajorVenuesUpcomingSection maps the digital experience to physical MICE venues with exact hall names, answering "What's happening at JIExpo Kemayoran?" before individual event browsing begins.
2. **Temporal reality**: BannerCarousel uses sophisticated lifecycle states (Happening Now with pulsing emerald badge, Countdown timer, Concluded with grayscale treatment) that reflect the strict time-bound nature of trade shows.
3. **Domain identity**: 15 MICE category pills with archetype-specific color tokens transform a standard filter into a domain-specific discovery engine unique to this platform.

The country edition model (Indonesia/Japan/Global) is structurally embedded in the routing and filter architecture, not just a locale toggle. The venue quick-glance section, category pills, and calendar widget work together to tell a coherent story.

**Deterministic Scan:** 1 finding across 10 scanned components. `ActiveFilterChips.tsx` line 170 uses `text-[11px]` which is off the primary type ramp. This is a **false positive**: DESIGN.md explicitly documents 11px as the "minimum legibility floor" for micro-labels, and the "Clear All" button is precisely this kind of compact utility control. All other 9 components returned clean (0 findings).

## Overall Impression

The homepage is a mature, well-engineered discovery surface that feels authored for a specific product rather than assembled from generic components. The strongest quality is the seamless integration of spatial (venue/hall), temporal (lifecycle states), and domain (15 MICE categories) dimensions into a single coherent browsing experience. The single biggest opportunity is fixing the P0 accessibility violation in EventCard where a Button is nested inside a Link, which will cause hydration errors and break screen reader navigation.

## What's Working

1. **Temporal and Spatial Grounding**: The BannerTemporalWidget and explicit rendering of exact Hall Names (e.g., "Hall A1", "Nusantara Hall 2") in EventCard elevates this above a generic ticketing app. It feels like an enterprise MICE platform that understands the physical reality of conventions.

2. **Keyboard Accessibility and Power-User Accelerators**: The `/` hotkey for instant search focus in FacetedFilterBar and `ArrowRight`/`ArrowLeft` roving index in EventCategoryPills demonstrate top-tier UX engineering. These are invisible to novices but transformative for power users.

3. **Graceful Empty States with Recovery**: The EventCalendarWidget's empty state calculates and offers a direct one-click jump link to the nearest upcoming event, preventing dead-ends. The EventsExplorer provides a clear "Reset All Filters" recovery button. The page also falls back to FALLBACK_EVENTS if the database returns empty, preventing a blank page.

## Priority Issues

### [P0] Nested Interactive Elements in EventCard (Hydration/A11y Violation)

**What:** In `EventCard.tsx` (lines 211-217), a `<Button>` component is nested directly inside a Next.js `<Link>` component, creating invalid HTML (`<a><button></button></a>`).

**Why it matters:** This violates the HTML specification, triggers React hydration mismatch errors in Next.js 15, and breaks screen reader navigation. The DESIGN.md explicitly states: "Don't nest `<button>` inside `<Link>`. Use `buttonVariants` for accessible anchor buttons." This is the homepage's most-interacted component.

**Fix:** Remove the `<Button>` wrapper. Apply `buttonVariants({ variant: ..., size: 'sm', className: 'gap-1 ...' })` directly to the `<Link>` element, making it a single interactive element.

**Suggested command:** `/impeccable harden` (fix accessibility and standards violations)

### [P1] Banner Carousel Touch Swipe Lacks Vertical Guard

**What:** In `BannerCarousel.tsx` (lines 109-125), the touch swipe handler uses a fixed 50px horizontal threshold but does not check vertical scroll intent.

**Why it matters:** On mobile, users scrolling the page vertically through the banner region can accidentally trigger horizontal slide changes because the handler doesn't compare `deltaY` against `deltaX`. This causes frustrating unintended navigation, especially on tall banner regions (420px-520px).

**Fix:** Track `touchStartY` alongside `touchStartX`. In `handleTouchEnd`, compare `Math.abs(deltaX)` against `Math.abs(deltaY)` and cancel the swipe if the vertical delta exceeds the horizontal delta. Also increase the threshold to 75px for better reliability.

**Suggested command:** `/impeccable harden` (fix touch interaction edge cases)

### [P2] Search Hotkey Collision Risk

**What:** In `FacetedFilterBar.tsx`, the `/` keydown listener checks for `INPUT`, `TEXTAREA`, and `SELECT` active elements but does not guard against `contenteditable` divs or open modals/drawers.

**Why it matters:** If the AI Concierge drawer or any modal is open, pressing `/` will steal focus and scroll the page to the filter bar. As the platform grows more interactive surfaces, this collision risk increases.

**Fix:** Add checks for `document.activeElement?.isContentEditable` and `document.querySelector('[role="dialog"][data-state="open"]')` before activating the hotkey.

**Suggested command:** `/impeccable harden` (fix keyboard interaction edge cases)

### [P2] ActiveFilterChips text-[11px] Below Type Ramp

**What:** In `ActiveFilterChips.tsx` (line 170), the "Clear All" button uses `text-[11px]`, which is below the `text-xs` (12px) standard ramp.

**Why it matters:** While DESIGN.md permits 11px as a "minimum legibility floor," this is a utility action button, not supplementary metadata. Using 11px for an interactive control reduces scannability and may fail WCAG target size guidelines at certain zoom levels.

**Fix:** Standardize to `text-xs font-semibold` to match the "Clear All" button's interactive role.

**Suggested command:** `/impeccable typeset` (standardize typography tokens)

## Persona Red Flags

**Jordan (First-Timer):** Mostly passes. The MajorVenuesUpcomingSection helps them instantly understand that this platform maps to physical venues. The 15 category pills are clearly labeled with text, not icon-only. One concern: the term "Pass" (as in "View Pass") may confuse a first-timer who expects "Buy Ticket" — the MICE terminology is correct but requires domain familiarity.

**Casey (Distracted Mobile User):** The EventCard footer has both a stretched-link card body and a separate footer button, creating two competing tap targets. The footer `<Link><Button>` at lines 211-217 is also the P0 hydration violation. On mobile, the distinction between "tap card to browse" and "tap button to view pass" is unclear. The BannerCarousel swipe threshold (P1) will frustrate one-handed vertical scrolling.

**Riley (Stress Tester):** The page handles empty states well with FALLBACK_EVENTS and the calendar's jump-to-nearest link. However, a country edition with zero upcoming events and zero venues (e.g., a newly launched Global edition) would show only fallback data with no explicit "No events in your region yet" messaging — the fallback silently masks the empty state rather than being transparent about it.

**Trade Delegate (Project-Specific):** Passes well. The FacetedFilterBar allows immediate filtering by country and category ("Indonesia" + "Industrial & Manufacturing"). URL query params sync, enabling bookmarkable filtered views. The `/` hotkey accelerates repeated searches.

## Minor Observations

- The BannerCarousel hardcodes gradients (`from-card via-card to-blue-500/5`) in the Bento showcase rather than dynamically using archetype tokens. This is consistent with DESIGN.md but misses an opportunity for richer category-specific visual identity.
- The FacetedFilterBar exposes 5-6 dropdown parameters on desktop simultaneously, which slightly exceeds the 4-item cognitive load guideline for simultaneous decision points.
- Region filtering via `?region=jp` URL param completely replaces global events rather than augmenting — a Trade Delegate browsing Japan events can't also see cross-border events in their filtered view.

## Questions to Consider

1. If the attendee is already physically at a venue (detectable via geolocation or NFC check-in), should the homepage invert its hierarchy to show the live timetable and QR pass at the very top instead of the discovery carousel?
2. Are 15 horizontally scrolling category pills too many for a mobile user to parse quickly? Would a 2-tier grid (8 featured + "More" expansion) be more scannable for initial discovery?
3. Should the fallback events in an empty-database country edition be transparent ("No events scheduled yet — here are highlights from other regions") rather than silently presenting fallback data as if it belongs to the selected edition?
