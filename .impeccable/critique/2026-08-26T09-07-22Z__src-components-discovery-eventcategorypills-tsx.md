---
target: MICE category list
total_score: 34
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-26T09-07-22Z
slug: src-components-discovery-eventcategorypills-tsx
---
# Critique: XPO MICE Category List & Discovery Engine

Method: dual-agent (A: 2a1b0e72-f1cf-496b-9849-602fbcff942d · B: cade653f-6945-4a64-96cf-27222a826750)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | **3/4** | Active pill borders and glows give clear feedback; carousel lacks a numerical progress index (e.g., "Card 3 of 15"). |
| 2 | Match System / Real World | **4/4** | Institutional B2B taxonomy: "RFQ Tender Quotes", "Peer-Reviewed Abstracts", "Bilateral Room Schedules", and "Deal Suites". |
| 3 | User Control and Freedom | **3/4** | "All (15)" jump pill abruptly navigates to `/events`, while the 15 category pills smooth-scroll in-page, causing an unexpected interaction divergence. |
| 4 | Consistency and Standards | **3/4** | Subtle token and icon divergence between `theming.ts` and `EventCategoryPills.tsx` (Government `#0284c7` vs `#0f172a`, Fashion `Crown` vs `Sparkles`). |
| 5 | Error Prevention | **4/4** | Sanitized multi-select URL parameters (`?archetype=...`) and safe translation fallbacks prevent state corruption. |
| 6 | Recognition Rather Than Recall | **4/4** | High information scent with 4 explicit domain capability chips per card (e.g. CME credits, precision farming demos). |
| 7 | Flexibility and Efficiency | **3/4** | Keyboard shortcut `/` for search, full WAI-ARIA roving toolbar arrow navigation on jump pills, and smooth mouse drag-to-scroll. |
| 8 | Aesthetic and Minimalist Design | **3/4** | 15 cards at 370px width create a 5,700px horizontal scroll rail with 8 sub-elements per card, creating high cognitive load on small viewports. |
| 9 | Error Recovery | **4/4** | Direct single-click "Reset Search Filters" on empty filter states. |
| 10 | Help and Documentation | **3/4** | Domain capability badges act as built-in micro-documentation for convention formats. |
| **Total** | | **34/40** | **Good (Solid Foundation)** |

## Design Specificity Verdict

**Verdict: Distinctly Authored MICE Architecture with Token Duplication.**

The taxonomy and interaction design are purpose-built for an institutional MICE digital ecosystem (Indonesia, Japan, Global) rather than generic consumer event tagging. Each of the 15 categories represents a genuine commercial convention archetype with custom color tokens, Lucide icon pairings, ambient domain glows, and 4 specific domain capability badges.

**Deterministic Scan Findings**:
- Detector identified 9 color token advisories in `EventCategoryPills.tsx`, 2 sub-11px font size defects in `FacetedFilterBar.tsx` (`text-[10px]` on kbd accelerator and badge count), and conditional React hook calls (`useTranslations` inside `try/catch`).
- Color contrast on light category badges with inline color styles achieves only 1.8:1 to 2.8:1 on light backgrounds, needing dark/light adaptive classes.
- Mobile touch targets on scroll chevron buttons (32x32px) and jump pills (28px height) fall below the 44x44px mobile touch envelope.

## Overall Impression

The MICE category system is exceptionally well-structured from a domain modeling standpoint. However, the horizontal rail presentation of 15 large cards creates excessive scroll depth (5,700px). Consolidating the duplicate category definitions between `theming.ts` and `EventCategoryPills.tsx`, fixing the "All" pill navigation divergence, increasing touch targets to 44px, and improving light-mode contrast will elevate this to benchmark craft.

## What's Working

1. **Enterprise Domain Taxonomy**: 15 distinct MICE verticals covering everything from heavy industrial manufacturing to bilateral diplomatic summits.
2. **Dual-Speed Navigation**: Fast roving keyboard jump-pills paired with deep-dive visual cards and mouse drag-to-scroll.
3. **Multi-Select Filtering**: Seamless URL parameter synchronization (`?archetype=TECH_DEV_SUMMIT,FINANCE_INVESTOR`) in the discovery explorer.

## Priority Issues

### [P1] Navigation Asymmetry on Category Jump Pills
- **Location**: `src/components/discovery/EventCategoryPills.tsx` (Lines 408–424)
- **Why it matters**: Clicking "All (15)" unloads the homepage and navigates to `/events`, whereas clicking any of the 15 category pills smoothly scrolls the in-page carousel. This creates an inconsistent mental model within the same toolbar.
- **Fix**: Make "All (15)" scroll to the start of the category rail (index 0) or filter the featured events grid in-place, keeping the dedicated "All Categories ->" link in the section header as the explicit navigation to `/events`.
- **Suggested Command**: `/impeccable clarify`

### [P1] Dual Registry & Token Drift between `theming.ts` and `EventCategoryPills.tsx`
- **Location**: `src/components/discovery/EventCategoryPills.tsx` & `src/lib/theming.ts`
- **Why it matters**: `EventCategoryPills.tsx` maintains a 598-line hardcoded `EVENT_CATEGORIES` array that duplicates and occasionally drifts from `theming.ts` (e.g. Government `#0284c7` vs `#0f172a`, Fashion `Crown` vs `Sparkles`).
- **Fix**: Centralize category metadata (icons, colors, highlight tags) into `theming.ts` and import them into `EventCategoryPills.tsx`.
- **Suggested Command**: `/impeccable polish`

### [P2] Insufficient Mobile Touch Targets & Contrast Ratios on Badges
- **Location**: `src/components/discovery/EventCategoryPills.tsx` (Lines 374, 410, 527–535) and `src/components/discovery/FacetedFilterBar.tsx` (Lines 164, 198)
- **Why it matters**: Chevron scroll buttons (32px) and jump pills (28px) are difficult to tap accurately on mobile. Light badge text with inline opacity colors fails WCAG AA 4.5:1 contrast against pure white cards. `text-[10px]` in filter bar kbd/badge breaches the legibility floor.
- **Fix**: Enforce `min-h-[44px]` touch targets, replace inline light badge styles with high-contrast token classes, and raise `text-[10px]` to `text-[11px] font-semibold` or `text-xs`.
- **Suggested Command**: `/impeccable polish`

### [P2] 5,700px Linear Carousel Depth & Lack of Progress Feedback
- **Location**: `src/components/discovery/EventCategoryPills.tsx`
- **Why it matters**: 15 cards at 370px width result in excessive scrolling to reach later categories (e.g. Hospitality, Fashion, Incentive).
- **Fix**: Add a subtle progress indicator (`Card X of 15` / mini dot rail) and optional industry cluster grouping tabs (*Digital/Tech*, *Heavy Industry*, *Finance/Enterprise*, *Lifestyle/Festivals*).
- **Suggested Command**: `/impeccable layout`

## Persona Red Flags

- **Alex (International Trade Buyer — Seeking Industrial B2B & Energy)**: Finds Industrial B2B immediately at Position 1, but must scroll 9 cards away to discover Energy & Infrastructure.
- **Jordan (First-Timer — Looking for Pop Culture & Comic Con)**: Rapidly identifies Pop Culture at Position 5 (Purple, Gamepad2), validated by domain badges ("Cosplay Guidelines", "Creator Alley").
- **Casey (Mobile User — Single-Handed Thumb Scrolling)**: Jump pills scroll smoothly, but small 32px scroll chevrons and 28px jump pill heights are difficult to tap reliably on mobile.
- **Event Organizer (Evaluating Category Branding)**: Confirms category tokens cleanly map to dynamic CSS variables, but notices slight color drift for Government/Fashion archetypes.

## Minor Observations

1. `select-none` on the carousel container prevents text selection and copying of category descriptions and tender specs.
2. `useTranslations` is called inside `try/catch` blocks in `EventCategoryPills.tsx` and `FacetedFilterBar.tsx` instead of unconditionally at the top level.

## Questions to Consider

1. Should selecting a category pill on the homepage dynamically filter the *Featured Trade Shows & Conventions* grid directly below it in real time, turning the homepage into an interactive discovery console?
2. Should dedicated country editions prioritize regional categories (e.g., Indonesia `/id` putting Industrial, Energy & Agritech first; Japan `/jp` putting Tech, Pop Culture & Automotive first)?
