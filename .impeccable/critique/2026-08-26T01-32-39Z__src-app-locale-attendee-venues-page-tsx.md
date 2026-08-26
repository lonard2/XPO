---
target: the venue directory page
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-26T01-32-39Z
slug: src-app-locale-attendee-venues-page-tsx
---
Method: dual-agent (A: 68a424f6-8f84-41e7-93c8-7ef50006a142 · B: 7603db0e-b9b4-44d8-9267-c8965835f32f)

### Design Health Score

| # | Heuristic | Score | Key Findings & Evidence |
|---|-----------|:-----:|-------------------------|
| 1 | Visibility of System Status | 2.5/4 | Live regional inventory counts present, but lacks active search result counter ("Showing X of Y") |
| 2 | Match System / Real World | 3.0/4 | Excellent MICE physical metrics (Pax, sqm, transit links), but fragile string splits for i18n |
| 3 | User Control and Freedom | 2.5/4 | 1-click reset in empty state, but tab switches write persistent cookies unexpectedly |
| 4 | Consistency and Standards | 2.0/4 | Critical HTML nesting flaw: `<button>` inside `<Link>`, and cursor pointer mismatch across card surface |
| 5 | Error Prevention | 3.0/4 | Resilient case-insensitive search across 5 fields and graceful database fallbacks |
| 6 | Recognition Rather Than Recall | 3.0/4 | Floating badges and high-contrast spec boxes enable rapid visual scanning |
| 7 | Flexibility and Efficiency | 2.0/4 | No sorting (by capacity, floor space, or alphabetical) and no city/amenity facet filters |
| 8 | Aesthetic and Minimalist Design | 3.5/4 | Clean modern visual rhythm, restrained border radius, and dark-mode friendly card surfaces |
| 9 | Error Recovery | 3.0/4 | Clear empty state with dedicated reset action, but lacks cross-region discovery suggestions |
| 10| Help and Documentation | 2.5/4 | Clear hero copy and verified infrastructure badges; needs capacity metric definition tooltips |
| **Total** | | **27.0/40** | **Acceptable (67%)** |

### Design Specificity Verdict

**LLM Assessment**: MICE-Aware Foundation with Generic Directory Ergonomic Blindspots (Grade: B-). While the directory incorporates authentic MICE physical metrics (attendee capacity in Pax, gross exhibition space in sqm, transit lines, and dedicated country editions), the interaction model suffers from HTML interactive nesting violations, pseudo-interactive card cursor mismatches, and a lack of MICE sorting controls.

**Deterministic Scan**: 0 mechanical regex violations; verified 5 critical structural and a11y defects across DOM and React lifecycle patterns.

### Overall Impression

The Venue Directory page provides clean visual rhythm and instant regional hub switching. However, resolving the full-card click ergonomics, fixing nested interactive elements, adding sort controls, and providing live result counts will elevate it to true institutional MICE grade.

### What's Working

1. **Integrated Multi-Modal Transit Logistics on Card Surface**:
   - Places rapid transit, train lines, and shuttle guides directly on directory cards, acknowledging that physical accessibility is a primary decision driver for MICE delegates.
2. **Instant Regional Hub Tri-Partitioning with Live Counts**:
   - Tab switches between Indonesian, Japanese, and Global venues are instant and accompanied by live inventory counts.
3. **Structured Physical Metrics Grid**:
   - Displays attendee capacity (`Pax`) and gross indoor space (`sqm`) side-by-side in a dedicated high-contrast container.

### Priority Issues

1. **[P0] Full-Card Anchor Click Ergonomics & Nested `<button>` Fix**
   * **Why it matters**: `Card interactive` applies `cursor-pointer` to the entire card, but clicking whitespace or images fails to navigate. Inside the card footer, `<button>` is nested inside Next.js `<Link>`, violating HTML5 and WCAG specs.
   * **Fix**: Use Next.js stretched link (`after:absolute after:inset-0`) for full-card clickability and style footer links directly with `buttonVariants`.
   * **Suggested command**: `/impeccable polish`

2. **[P1] React Rules of Hooks & Accessible Form Controls**
   * **Why it matters**: `useTranslations` called inside `try/catch` violates React Hook rules and causes hydration mismatches. The search input lacks an `aria-label`, and breadcrumbs use plain `<div>` rather than `<nav aria-label="Breadcrumb">`.
   * **Fix**: Move hooks to top-level, add explicit `aria-label="Search venues, cities, or halls"`, and implement semantic breadcrumbs with `<ol>` and `aria-current="page"`.
   * **Suggested command**: `/impeccable harden`

3. **[P1] Dynamic Result Tally & Cross-Region Search Recovery**
   * **Why it matters**: Users searching for "Tokyo" while on the "Indonesia" tab hit a dead end with no indication that 3 matching venues exist in the Japan tab.
   * **Fix**: Add a `"Showing {count} of {total} venues"` tally, and in empty states provide 1-click cross-region suggestions (*"Found 2 venues in Japan matching 'Tokyo'. [Switch to Japan]"*).
   * **Suggested command**: `/impeccable clarify`

4. **[P2] MICE Sort Controls & Typography Normalization**
   * **Why it matters**: Conference organizers cannot sort venues by gross exhibition area (sqm) or total pax capacity. Card micro-text (`text-[10px]`) fails legibility standards.
   * **Fix**: Add a sort dropdown (*Largest Capacity*, *Largest Floor Area*, *Alphabetical*), clean dead imports, remove synthetic fallback specs (`|| 25000`), and normalize micro-text to `text-xs` / `text-[11px]`.
   * **Suggested command**: `/impeccable layout`

### Persona Red Flags

* **Alex (Trade Delegate)**: Forced to toggle between Japan and Global tabs without cross-tab search discovery or side-by-side sorting.
* **Casey (Mobile User in Transit)**: Taps the venue photo on a phone and gets a dead click because only inner text links are wired.
* **Event Organizer**: Cannot sort convention centers by gross square meters (sqm) to evaluate heavy machinery exhibition scale.
