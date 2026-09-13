---
target: the event list page
total_score: 38
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
timestamp: 2026-09-13T04-15-00Z
slug: src-app-locale-attendee-events-page-tsx
---
# Design Critique: Event List Page (`src/app/[locale]/(attendee)/events/page.tsx`)

**Method:** verified-re-audit

## Design Health Score

| # | Heuristic | Score | Key Finding |
|---|-----------|:-----:|-------------|
| 1 | Visibility of System Status | 4.0/4 | Reactive exhibition counters (`Showing X exhibitions`), active filter chips with count badges, and live pulse beacons |
| 2 | Match System / Real World | 4.0/4 | Authentic MICE vocabulary: "Exhibition Scale (Global Mega, Large Convention)", "Venue Halls", "B2B Deals", and native currencies |
| 3 | User Control and Freedom | 4.0/4 | 1-click batch reset, individual filter chip removal, and frictionless URL sync via `router.replace(..., { scroll: false })` |
| 4 | Consistency and Standards | 4.0/4 | Cohesive design system tokens, 1px borders, zero emojis, zero em-dashes, and standardized `text-xs` typography across sidebar |
| 5 | Error Prevention | 4.0/4 | Safe fallback pipelines (`FALLBACK_EVENTS`), robust comma-separated multi-select parsing, and resilient URL query defaults |
| 6 | Recognition Rather Than Recall | 4.0/4 | Category facet items display exact live event counts `(14)` with archetype indicator color swatches and ActiveFilterChips |
| 7 | Flexibility and Efficiency | 3.5/4 | Global `/` shortcut to focus search input with modal guards, multi-select category filters, and sticky mobile apply drawer |
| 8 | Aesthetic and Minimalist Design | 3.5/4 | Clean 12-column desktop grid; 15 categories chunked into 4 thematic clusters; top bar focused on search and chips |
| 9 | Error Recovery | 4.0/4 | Empathetic empty states with clear diagnostic advice and a prominent 1-click "Reset All Filters" CTA |
| 10| Help and Documentation | 3.5/4 | Clear section subtitles, search placeholder examples, and accessible floating Attendee AI Concierge |
| **Total** | | **38.0/40** | **Excellent (Calibrated & Verified)** |

## Design Specificity Verdict

**Assessment**: High MICE-Domain Specificity. The Event List surface avoids generic e-commerce ticketing conventions. Events are explicitly grounded in multi-country convention hubs (`Indonesia /id`, `Japan /jp`, `Global /global`), exact venue halls (`JIExpo Kemayoran • Hall A1`), and 15 distinct industry verticals with domain-specific metadata.

**Deterministic Scan**: All 5 discovery and filter components mechanically audited with **0 anti-pattern violations / 0 warnings** (`[]`, exit code 0).

## Resolved Issues

1. **Sub-scale Typographic Tokens Fixed**: Replaced 4 instances of non-standard `text-[10px]` in `FilterSidebar.tsx` with standard `text-xs font-mono` and `text-xs font-semibold`.
2. **Double-Control Redundancy Resolved**: Removed redundant dropdowns from the top `FacetedFilterBar`, leaving the desktop sidebar to manage multi-select facets while the top bar handles search, sorting, and active filter chips.
3. **Multi-Select Categories Active**: Enabled comma-separated URL multi-selection for archetypes (`?archetype=TECH_DEV_SUMMIT,INDUSTRIAL_B2B`).
4. **Mobile Filter Drawer Ergonomics**: Anchored sticky bottom apply bar on mobile (`sticky bottom-0 bg-background/95 backdrop-blur-md`).
5. **Keyboard Accelerators**: Global `/` shortcut implemented with collision guards for inputs, contenteditable, and open dialogs.
