---
target: the homepage
total_score: 37
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-08-26T09-13-42Z
slug: src-app-locale-attendee-page-tsx
---
# Critique: XPO Homepage & Discovery Suite

Method: dual-agent (A: 86cf1483-533a-4b80-844d-38a8ae19a4b8 · B: 80f819c0-3ef0-4b90-a049-36c4442edcb8)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | **3.5/4** | Real-time countdown widget, pulsating live badges, and explicit country edition labels provide clear status; carousel pagination index could be more prominent. |
| 2 | Match System / Real World | **4.0/4** | Outstanding institutional B2B taxonomy: "Gross Floor Area", "Transit Corridors", "RFQ Tender Quotes", and exact hall specs. |
| 3 | User Control and Freedom | **3.5/4** | Full control over carousel progression, keyboard roving navigation, calendar month exploration, and region switching. |
| 4 | Consistency and Standards | **3.5/4** | Uniform card hierarchy across events, venues, and banners; clean Lucide vector icons; zero emoji clutter. |
| 5 | Error Prevention | **4.0/4** | Concluded events automatically disable checkout buttons and switch to post-event recap exploration. |
| 6 | Recognition Rather Than Recall | **3.5/4** | Category-coded visual badges with paired semantic icons and upfront transit connections reduce cognitive load. |
| 7 | Flexibility and Efficiency | **3.5/4** | Keyboard shortcut `/` for search, keyboard roving toolbar navigation on jump pills, and smooth mouse drag-to-scroll. |
| 8 | Aesthetic and Minimalist Design | **3.5/4** | Multi-layer dark scrim guarantees WCAG AAA contrast over exhibition photography; bento layout provides clean visual chunking. |
| 9 | Error Recovery | **4.0/4** | Empty calendar dates display an informative notice along with a 1-click "Jump to Next Event" action. |
| 10 | Help and Documentation | **3.5/4** | Asymmetric bento cells clearly explain the attendee, organizer, and venue governance portals. |
| **Total** | | **37/40** | **Excellent (Benchmark Quality)** |

## Design Specificity Verdict

**Verdict: Highly Tailored, Bespoke MICE Digital Architecture (9.4 / 10).**

The homepage architecture is purpose-built for multi-sided international convention ecosystems. Rather than a generic event calendar, XPO is anchored around dedicated national convention infrastructures (**Indonesia**: *JIExpo Kemayoran*, *ICE BSD City*, *JICC Senayan*; **Japan**: *Tokyo Big Sight*, *Makuhari Messe*, *Pacifico Yokohama*; **Global**: *Marina Bay Sands*, *Messe Frankfurt*), synchronizing localized currencies (IDR, JPY, USD) and exact hall specifications (`Hall A1`, `Nusantara Hall 2`).

**Deterministic Scan Findings**:
- 0 primary AI slop anti-patterns (zero side-tabs, zero gradient text, zero bounce easing, zero overused fonts).
- Turnstile-ready optical contrast across all hero scrims and badge pairings.
- 0 critical defects; minor advisories on sub-11px font sizes (`text-[9px]`/`text-[10px]`) in `MajorVenuesUpcomingSection.tsx`, `EventCalendarWidget.tsx`, and `EventCard.tsx`, plus touch target padding on mini-controls.

## Overall Impression

The homepage is an exceptional, mature, and authoritative trade exhibition surface. The compound hero banner with docked venue quick-glance rail delivers high situational awareness in the first viewport. Resolving minor typography ramp consistency (`text-[10px]` $\rightarrow$ `text-xs`) and expanding touch targets on mini-controls will bring it to complete perfection.

## What's Working

1. **Compound Hero & Quick-Glance Rail (`HeroSection.tsx`)**: Docking `HeroVenueQuickGlanceRail` directly beneath `BannerCarousel` gives instant multi-venue visibility without vertical bloat.
2. **Temporal State Awareness Engine (`BannerCarousel.tsx` & `EventCard.tsx`)**: Dynamic status evaluation (Live, Upcoming, Concluded) with automated action rerouting.
3. **15-Vertical Categorization (`EventCategoryPills.tsx`)**: Unified category registry in `theming.ts` with roving keyboard navigation and 44px mobile touch targets.

## Priority Issues

### [P1] Region Switcher Visibility on Mid-Size Viewports (`1024px – 1279px`)
- **Location**: `src/components/layout/Navbar.tsx` (Line 185)
- **Why it matters**: `RegionSwitcher` is marked `hidden xl:block`, which hides the Country Edition toggle on standard 13" laptops (1024px–1279px).
- **Fix**: Adjust breakpoint in `Navbar.tsx` to `hidden lg:block` and refine nav link horizontal padding (`px-2 py-1.5`) so it fits laptop viewports comfortably.
- **Suggested Command**: `/impeccable layout`

### [P2] Direct Search Trigger in Homepage Header
- **Location**: `src/app/[locale]/(attendee)/page.tsx`
- **Why it matters**: Delegates searching for a specific exhibition or hall must navigate away to `/events` to find a text search input.
- **Fix**: Add a floating quick-search trigger bar in the hero area that opens instant search or routes to `/[locale]/events?q=...`.
- **Suggested Command**: `/impeccable clarify`

### [P2] Standardize Sub-11px Micro-Text in Discovery Cards & Calendar
- **Location**: `src/components/discovery/MajorVenuesUpcomingSection.tsx`, `src/components/discovery/EventCard.tsx`, `src/components/discovery/EventCalendarWidget.tsx`
- **Why it matters**: Instances of `text-[9px]` and `text-[10px]` breach the mandatory 11px legibility floor specified in `DESIGN.md`.
- **Fix**: Standardize all micro-labels to `text-[11px] font-semibold` or `text-xs`.
- **Suggested Command**: `/impeccable typeset`

### [P3] Mouse Drag-to-Scroll Support on `HeroVenueQuickGlanceRail`
- **Location**: `src/components/discovery/HeroVenueQuickGlanceRail.tsx`
- **Why it matters**: `EventCategoryPills.tsx` supports click-and-drag mouse scrolling, but the venue rail only supports chevrons and trackpads, creating a slight physics inconsistency.
- **Fix**: Add mouse drag-to-scroll handlers to `HeroVenueQuickGlanceRail.tsx`.
- **Suggested Command**: `/impeccable polish`

## Persona Red Flags

- **Alex (International Trade Buyer / LP Investor)**: On a 13" laptop at 1200px, the RegionSwitcher in the top navbar is hidden (`hidden xl:block`), requiring Alex to scroll to the footer or open a mobile drawer to switch country editions.
- **Jordan (First-Time Convention Attendee)**: Clicking calendar days immediately displays scheduled events or a 1-click recovery button ("Jump to Next Event").
- **Casey (Mobile User in Bright Sunlight)**: Hero banner contrast is pristine (AAA dark scrim); ensure small hall metadata badges maintain dark borders.
- **Event Organizer (Evaluating Platform)**: Bento Cell 2 ("Organizer Suite") clearly articulates live customizer, analytics, and QR check-in capabilities.

## Minor Observations

1. Fallback data structures ensure graceful presentation if the database is offline or during SSR cold starts.
2. `AuthModal` trigger in the navbar displays the active role persona badge (`ADMIN`, `ORGANIZER`, `ATTENDEE`) for multi-sided testing.

## Questions to Consider

1. Should the Country Edition switcher be elevated into an explicit segmented toggle inside the Hero section header (e.g. `[ Indonesia | Japan | Global ]`)?
2. Should hovering over hall badges on venue cards show an interactive mini-floorplan popover preview?
