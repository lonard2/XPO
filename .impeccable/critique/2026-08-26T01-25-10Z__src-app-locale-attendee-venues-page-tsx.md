---
target: the venue and hall directory page
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-26T01-25-10Z
slug: src-app-locale-attendee-venues-page-tsx
---
Method: dual-agent (A: db100376-4c98-48a4-b09c-771017cbb8d2 · B: 4a61be81-7e50-4c5b-b0ab-61025c7eeece)

### Design Health Score

| # | Heuristic | Score | Key Findings & Evidence |
|---|-----------|:-----:|-------------------------|
| 1 | Visibility of System Status | 2.5/4 | Region tabs clearly indicate active filter with count badges, but lacks hall occupancy and active show status |
| 2 | Match System / Real World | 2.5/4 | Authentic MICE naming conventions, but convention campuses are spatial complexes, not flat linear card grids |
| 3 | User Control and Freedom | 3.0/4 | Clear breadcrumbs, URL synchronization, and instant multi-region filtering |
| 4 | Consistency and Standards | 3.5/4 | 100% Lucide vector SVG icons, clean badge micro-tokens (`text-[10px] font-mono`), and unified border styling |
| 5 | Error Prevention | 3.0/4 | Robust fallback architecture (`FALLBACK_VENUES`, `FALLBACK_EVENTS`) prevents runtime crashes |
| 6 | Recognition Rather Than Recall | 2.5/4 | Capacity and gross area surfaced on badges, but homogeneous hall cards lack visual wing landmarks |
| 7 | Flexibility and Efficiency | 2.0/4 | Live search across nested hall names, but lacks 1-click copy address for taxi, gate guides, and floorplan PDF export |
| 8 | Aesthetic and Minimalist Design | 3.0/4 | Clean modern visual rhythm with restrained borders and dark-mode friendly card surfaces |
| 9 | Error Recovery | 3.0/4 | Clear empty states with dedicated reset actions when search criteria yield zero venues |
| 10| Help and Documentation | 1.5/4 | Missing floorplan legends, accessibility (ADA/wheelchair/elevator) information, and loading dock gate policies |
| **Total** | | **26.5/40** | **Acceptable (66%)** |

### Design Specificity Verdict

**LLM Assessment**: Partially Specific Data / Generic Structural Composition (Grade: C+). While the data layer incorporates authentic naming conventions for major MICE complexes (JIExpo Kemayoran, ICE BSD City, Tokyo Big Sight, Marina Bay Sands), the layout treats these massive multi-hectare convention campuses as flat, unchunked card grids without spatial campus topology, wing wayfinding, or structured logistics cards.

**Deterministic Scan**: 0 mechanical anti-pattern violations across all 6 venue discovery and detail components.

### Overall Impression

The Venue Directory Explorer and hero quick-glance rail provide fast, reliable search across international hubs. However, the individual venue specification pages (`/venues/[slug]`) need an interactive spatial wayfinding campus layout, structured multi-modal transit cards, and MICE engineering specs (ceiling height, floor loading capacity).

### What's Working

1. **Synchronized Multi-Region State Engine (`VenueDirectoryExplorer.tsx`)**:
   - Effortlessly searches across venue names, cities, addresses, transit notes, and nested hall names with zero perceptible latency and clean URL synchronization.
2. **Hero Venue Quick-Glance Rail (`HeroVenueQuickGlanceRail.tsx`)**:
   - Displays near-upcoming exhibitions directly beneath country edition banners with exact hall allocations and category archetype color tokens.
3. **Institutional Aesthetic & Vector Hygiene**:
   - 100% SVG Lucide icons, zero emoji noise, restrained monochromatic surfaces, high-contrast typography, and robust fallback resilience against database outages.

### Priority Issues

1. **[P0] Interactive Campus Spatial Topology & Wing/Level Wayfinding**
   * **Why it matters**: MICE delegates visit venue pages primarily to understand spatial layout (*Where is Nusantara Hall relative to Hall 1? How do I get to the East Halls at Tokyo Big Sight?*). A flat text card grid is inadequate for multi-hectare convention facilities.
   * **Fix**: Implement an interactive campus wing & floorplan explorer with Wing/Level tabs (`East Wing`, `West Wing`, `Convention Center`, `Level B2/L5`) and visual hall layout diagrams.
   * **Suggested command**: `/impeccable layout`

2. **[P1] Structured Multi-Modal Transit & Logistics Hub**
   * **Why it matters**: `venue.transitInfo` is currently rendered as an unformatted prose block. Delegates in transit need structured modal cards with 1-click address copy.
   * **Fix**: Decompose transit into structured modal chips (*Rapid Rail / MRT*, *Bus / BRT*, *Vehicle Gate & Parking*, *Airport Express*) with 1-click **"Copy Address for Taxi/Ride-Hailing"** and navigation launchers.
   * **Suggested command**: `/impeccable clarify`

3. **[P1] MICE Engineering & Technical Hall Specifications**
   * **Why it matters**: B2B exhibitors and organizers make booking decisions based on engineering parameters: ceiling clearance, floor loading ($kN/m^2$), and column spans.
   * **Fix**: Enrich hall rendering with structured technical pill tags (*Ceiling Clearance*, *Floor Load kN/m²*, *Column-Free Span*, *Utility Trenches*).
   * **Suggested command**: `/impeccable polish`

4. **[P2] Specialized In-Venue Hall Timetable & Schedule**
   * **Why it matters**: The venue detail page reuses generic event cards that redundantly print the venue name and city that the user is already viewing.
   * **Fix**: Replace with a specialized in-venue hall allocation schedule showing active hall occupancy, dates, and pass booking.
   * **Suggested command**: `/impeccable layout`

### Persona Red Flags

* **Alex (Power User / Trade Delegate)**: Cannot estimate inter-hall walking times between consecutive keynotes.
* **Jordan (First-Timer)**: Overwhelmed by a single unformatted paragraph of transit text when driving to ICE BSD / JIExpo looking for the correct parking gate.
* **Casey (Mobile User On-Site)**: Needs to quickly find Hall 7 on a smartphone; must scroll past bulky hero sections with no sticky hall search.
* **B2B Event Organizer**: Cannot find engineering specs (floor loading $kN/m^2$, ceiling clearance, freight dock clearance) needed for heavy machinery booth construction.
