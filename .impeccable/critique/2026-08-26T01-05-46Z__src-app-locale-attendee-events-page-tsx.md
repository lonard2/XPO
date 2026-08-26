---
target: the event list page
total_score: 36
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-26T01-05-46Z
slug: src-app-locale-attendee-events-page-tsx
---
Method: dual-agent (A: e5475765-b324-47da-a8d0-f72302443e16 · B: 3cb461de-f58d-4761-9a7c-e8e6e44ce416)

### Design Health Score

| # | Heuristic | Score | Key Finding |
|---|-----------|:-----:|-------------|
| 1 | Visibility of System Status | 3.5/4 | Reactive exhibition counters (`Showing 12 exhibitions`), active filter chips with count badges, and live pulse beacons |
| 2 | Match System / Real World | 4.0/4 | Authentic MICE vocabulary: "Exhibition Scale (Global Mega, Large Convention)", "Venue Halls", "B2B Deals", and native currencies |
| 3 | User Control and Freedom | 3.5/4 | 1-click batch reset, individual filter tag removal, and frictionless URL sync via `router.replace(..., { scroll: false })` |
| 4 | Consistency and Standards | 4.0/4 | Cohesive design system tokens across `Button`, `Badge`, `Card`, and `Drawer`; strict vector SVGs and zero emojis |
| 5 | Error Prevention | 3.8/4 | Safe fallback pipelines (`FALLBACK_EVENTS`) and resilient URL query defaults preventing white-screen crashes |
| 6 | Recognition Rather Than Recall | 3.7/4 | Category facet items display exact live event counts `(14)` with archetype indicator color swatches |
| 7 | Flexibility and Efficiency | 3.0/4 | Dual controls on desktop, but facets are strictly single-select and missing keyboard accelerators (e.g. `/` to focus search) |
| 8 | Aesthetic and Minimalist Design | 3.6/4 | Clean 12-column grid, subtle backdrop blur, and soft card elevations; minor desktop redundancy between top bar and sidebar |
| 9 | Error Recovery | 3.8/4 | Empathetic empty states with clear diagnostic advice and a prominent 1-click "Reset All Filters" CTA |
| 10| Help and Documentation | 3.2/4 | Clear section subtitles and badge descriptions; opportunity for contextual tooltips explaining trade scales |
| **Total** | | **36.1/40** | **Excellent (90%)** |

### Design Specificity Verdict

**LLM Assessment**: High MICE-Domain Specificity (Grade: A). The Event List surface avoids generic e-commerce ticketing conventions. Events are explicitly grounded in multi-country convention hubs (`Indonesia /id`, `Japan /jp`, `Global /global`), exact venue halls (`JIExpo Kemayoran • Hall A1`), and 15 distinct industry verticals with domain-specific metadata.

**Deterministic Scan**: 5 discovery and filter components mechanically audited with **0 fatal anti-pattern violations / 0 warnings**.

### Overall Impression

A robust, institutional MICE discovery engine with fast faceted filtering, resilient URL synchronization, and strong responsive adaptation across mobile drawers and desktop grids.

### What's Working

1. **Spatial & Temporal Precision**: Physical venue hall indexing (`event.venue.name` -> `event.venueHall.name`) paired with dynamic temporal status calculation (`Live`, `Concluded`, `Upcoming`).
2. **URL State Synchronization**: Query parameters (`q`, `region`, `archetype`, `format`, `scale`, `dateRange`, `sortBy`) sync bi-directionally without page jumps, enabling shareable delegation links.
3. **Multi-Model Theming Token System**: 15 specialized MICE archetype color sets and badges providing instant visual sector differentiation.

### Priority Issues

1. **[P1] Desktop Double-Control Redundancy (Top Bar vs. Left Sidebar)**
   * **Why it matters**: Desktop users see redundant Region and Category dropdowns in `FacetedFilterBar`, directly adjacent to the full facet lists in `FilterSidebar`.
   * **Fix**: Strip redundant dropdowns from the desktop top bar; let the top bar focus on search, sorting, and active chips, while the sidebar handles faceted drilldown.
   * **Suggested command**: `/impeccable layout`

2. **[P1] Multi-Select Facet Capability**
   * **Why it matters**: Trade attendees cannot currently filter for multiple relevant sectors simultaneously (e.g. "Tech & AI" + "Industrial B2B").
   * **Fix**: Enable multi-select array state for archetypes and formats, serialized as comma-separated URL parameters (`?archetype=TECH_DEV_SUMMIT,INDUSTRIAL_B2B`).
   * **Suggested command**: `/impeccable polish`

3. **[P2] 15-Category List Cognitive Fatigue**
   * **Why it matters**: Scanning 15 un-chunked categories in a single scrollbox creates visual fatigue.
   * **Fix**: Group the 15 MICE verticals into 4 thematic clusters: *Industry & Manufacturing*, *Tech & Innovation*, *Finance & Enterprise*, and *Consumer & Lifestyle*.
   * **Suggested command**: `/impeccable distill`

4. **[P2] Sticky Action Bar in Mobile Filter Drawer**
   * **Why it matters**: On mobile, the "Apply Filters" button is at the bottom of the scrollable drawer, requiring long scrolls.
   * **Fix**: Anchor the confirmation button into a sticky bottom sheet footer (`sticky bottom-0 bg-background/95 backdrop-blur-md`).
   * **Suggested command**: `/impeccable polish`

### Persona Red Flags

* **Alex (Power User & Procurement Director)**: Frustrated by single-select sector filters when looking for cross-industry automation expos; lacks a `/` shortcut to quickly focus search.
* **Jordan (First-Timer / Student)**: Can find industry scale classifications (`Global Mega`, `Large Convention`) ambiguous without quick explanatory hover hints.
* **Casey (Distracted Mobile User)**: Must scroll all the way to the bottom of the mobile filter sheet to confirm selections.
* **International Trade Delegate**: Seeks explicit timezone code badges (e.g., `WIB / UTC+7`, `JST / UTC+9`) alongside date ranges to plan intercontinental flights.

### Minor Observations & Provocative Questions

* **Search Debounce Indicator**: Add a subtle inline loader icon inside the search bar when typing debounces.
* **Segmented View Switcher**: Could the top bar offer a view toggle (`[ Grid | Compact List | Calendar Matrix ]`)?
* **Timezone Badges**: Display explicit local timezone codes next to date ranges on event cards.
