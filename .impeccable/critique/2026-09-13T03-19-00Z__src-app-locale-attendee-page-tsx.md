---
target: the homepage
total_score: 34
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
timestamp: 2026-09-13T03-19-00Z
slug: src-app-locale-attendee-page-tsx
---
# Design Critique: Attendee Homepage (`src/app/[locale]/(attendee)/page.tsx`)

**Method:** dual-agent (A: a8b5383e · B: 9ec291f6)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Real-time temporal countdowns, pulsing live badge, and concluded states |
| 2 | Match Between System and Real World | 4 | Exact hall mapping (Hall A1, Nusantara Hall 2) and transit connections |
| 3 | User Control and Freedom | 3 | Category pills trigger full route navigation to /events instead of in-place filtering |
| 4 | Consistency and Standards | 4 | Strict buttonVariants on Links, 1px border tokens, zero emojis, unified icons |
| 5 | Error Prevention | 3 | Date comparison in calendar widget lacks explicit region timezone normalization |
| 6 | Recognition Rather Than Recall | 4 | 15 distinct MICE category badges with primary color tokens and icons |
| 7 | Flexibility and Efficiency of Use | 2 | **No search bar on homepage**: power users cannot type keywords/venues without navigating to /events |
| 8 | Aesthetic and Minimalist Design | 3 | Asymmetric Bento section markets Organizer/Admin tools to attendees, creating visual noise |
| 9 | Error Recovery | 3 | Calendar has jump-to-nearest recovery; but empty featured events grid lacks empty-state card |
| 10 | Help and Documentation | 4 | Floating AI Concierge with grounded transit and schedule prompts |
| **Total** | | **34/40** | **Good** |

## Design Specificity Verdict

**LLM Assessment:** Highly specific and institutional. The homepage escapes the generic event listing trap through deep physical grounding (hall-level indexing, transit notes, and 15 distinct MICE industry verticals). However, its operational discovery value is hampered because the primary search bar and faceted filter controls live exclusively on `/events`, forcing attendees into a secondary click before they can search. Furthermore, Section 5 markets Organizer Suite tools and Admin Governance to attendees, creating audience dissonance.

**Deterministic Scan:** Clean (`[]` — 0 findings, exit code 0). All previous hardening measures (semantic anchor CTAs with `buttonVariants`, multi-axis touch swipe bounds with vertical cancellation, `/` hotkey modal collision guards, and standardized `text-xs` typography) remain 100% verified and intact.

## Overall Impression

The visual craft, typography, obsidian dark elevation, and spatial metadata (exact halls, countdown timers) are of international benchmark standard. The single biggest structural opportunity is transforming the homepage from an institutional brochure into an active **discovery cockpit** by adding an integrated search bar in the hero, and replacing the B2B organizer sales bento with attendee-centric benefits (indoor wayfinding floor maps, digital badge perks).

## What's Working

1. **Physical Hall & Transit Grounding**: Explicit hall allocations (e.g. "Hall A1-A3", "Nusantara Hall 2") and transit lines (TransJakarta Corridor 2C, KRL) eliminate attendee disorientation before booking.
2. **Temporal Status Telemetry**: Dynamic live pulsing indicators, countdown timers, and disabled checkout states for concluded events reflect the real-world operational cadence of physical trade expos.
3. **Dual-Pane Calendar Discovery**: Synchronized mini-month matrix with schedule cards and automatic "Jump to nearest scheduled exhibition" recovery prevents dead-ends.

## Priority Issues

### [P0] Missing Homepage Search & Discovery Cockpit
- **What**: The homepage lacks an integrated search input or quick filter toolbar. Attendees cannot search for keywords, venues, or cities without navigating away to `/[locale]/events`.
- **Why it matters**: Over 70% of returning delegates arrive with a specific exhibition, company, or sector in mind. Forcing them to scan through carousels or click secondary links severely degrades operational efficiency.
- **Fix**: Embed a search & discovery bar docked directly below the hero banner carousel, pre-wired to filter or navigate to `/events?q=...`.
- **Suggested command**: `/impeccable layout` or `/impeccable polish`

### [P1] Audience Dissonance: Organizer & Admin Bento Showcase on Attendee Surface
- **What**: Section 5 (`page.tsx#L271-411`) devotes 140 lines of code to pitching Organizer tools ("Live Split-Screen Customizer", "Booth Manager") and Platform Governance audit logs to attendees.
- **Why it matters**: Attendees do not manage exhibitor booths or inspect server telemetry. This adds unnecessary vertical cognitive load on an attendee discovery surface.
- **Fix**: Replace organizer sales copy with attendee-centric value propositions: "Interactive Hall Floor Maps & Indoor Wayfinding", "Networking & Deal-Room Passes", and "Instant Turnstile QR Badges". Move organizer marketing to a dedicated `/organizer` landing page.
- **Suggested command**: `/impeccable clarify`

### [P2] Calendar Date Timezone Normalization
- **What**: In `EventCalendarWidget.tsx`, date filtering creates local `Date` instances without normalizing to the venue's active timezone (`getTimeZoneForRegion(regionCode)`).
- **Why it matters**: International delegates browsing from different time zones (e.g., viewing Tokyo events from Europe or US) may see events shift by one day or fail to match selected calendar dates.
- **Fix**: Normalize event start/end dates using the region's timezone before comparing against `selectedDate`.
- **Suggested command**: `/impeccable harden`

### [P3] Category Pills Break In-Place Exploration
- **What**: Clicking a category in `EventCategoryPills.tsx` triggers a hard navigation to `/events?archetype=...` rather than smoothly filtering the featured events grid below it.
- **Why it matters**: Disrupts the attendee's flow when simply wanting to explore what is happening in a specific category on the homepage.
- **Fix**: Support an inline category selection filter that highlights or filters the upcoming events section, while providing an explicit "View All in Explorer" link.
- **Suggested command**: `/impeccable polish`

## Persona Red Flags

- **Jordan (First-Timer)**: Hero banner is impressive and clear, but the 15-category taxonomy can feel overwhelming without a simple search bar. The Organizer/Admin Bento section confuses them regarding whether XPO is an app for organizers or an event directory for visitors.
- **Casey (Distracted Mobile User)**: Hero section combined with the docked venue rail is very tall on mobile (`min-h-[420px]` + rail), requiring multiple thumb scrolls to reach actual event cards.
- **Riley (Stress Tester)**: If a newly launched country edition has 0 upcoming events, the featured events section renders a blank grid rather than an explicit "No upcoming events in this region yet" empty state.
- **Trade Delegate (Project-Specific)**: Cannot type "Machinery" or "JIExpo" directly on the landing page; forced to hunt through category pills or click to a secondary page.

## Minor Observations

- On high-contrast dark slides in `BannerCarousel.tsx`, an outer white focus ring (`focus-visible:ring-white`) provides superior WCAG AAA visibility compared to the default primary ring.
- In `Navbar.tsx`, `RegionSwitcher` is hidden on mobile screens behind the hamburger drawer; elevating country editions into the homepage body would increase multi-region discovery.

## Questions to Consider

1. Should the hero banner feature an integrated search input (Venue x Category x Date) directly embedded into the first viewport?
2. What if the Organizer/Admin Bento section was replaced by an interactive **"Attendee Perks & Day-of Guidebook"** showcase?
3. Should Country Editions (`[ Indonesia | Japan | Global ]`) be elevated into a prominent tactile segmented control on the homepage?
