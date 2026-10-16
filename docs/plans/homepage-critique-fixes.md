# Homepage Critique Remediation Plan

Source: dual-agent design critique of `src/app/[locale]/(attendee)/page.tsx`
(snapshot `.impeccable/critique/2026-10-15T10-39-57Z__src-app-locale-attendee-page-tsx.md`, 29/40).

One todo per commit. Order follows impact: anything that breaks a promise or blocks a
primary action comes before polish. Each item states its acceptance check so completion
is evidence-based rather than asserted.

## Todos

- [x] **1. Country edition follows the URL locale** (`P1`)
      `/ja` served the Indonesia catalogue and `/jp` was a documented but nonexistent route.
      Accept: `/ja` renders Tokyo Big Sight with a Japan switcher label, inferred visits stop
      pinning a region cookie, explicit `?region=` still overrides.
      Commit: `ae7a333`, docs in `55dd0b0`.

- [x] **2. Hero and featured grid lead with upcoming events** (`P1`)
      `orderBy: { startDate: 'asc' }` put the oldest events first, so the hero and the first
      three featured cards were concluded with a demoted CTA.
      Accept: on `/en` the hero slide and the first featured card are upcoming, not concluded.
      Result: `/en` and `/id` lead with the 2027 upcoming event (countdown, "Get Event Pass");
      `/ja` leads with the Nov 2026 robotics expo. Grid order verified upcoming-first.

- [x] **3. Mobile hero no longer collides with itself** (`P1`)
      At 390px the carousel controls overlap the badge row and the slide-indicator pill
      overlaps the primary CTA. Both overlays are `z-20` over `z-10` content.
      Accept: no intersecting bounding boxes between the four hero bands at 390, 768 and 1440.
      Result: reserved a top and bottom band on the slide below `sm`. Measured gaps are
      20px under the controls and 14px above the indicator pill, with no page overflow,
      at 320, 390, 768 and 1440.

- [ ] **4. Archetype badge contrast meets AA** (`P1`, scoped)
      Badge text was hardcoded white over archetype hues, and the existing contrast helper
      picked dark text that also failed.
      Accept: every archetype badge renders its best available text colour, verified by test.
      Deferred: the dark-mode `--primary` token still fails white text at 3.6:1 on the hero CTA
      and link colour. That is a global palette change and belongs in its own task.

- [ ] **5. Discovery copy is translatable** (`P2`)
      Status labels, section kickers and tab counts were hardcoded English, so `/id` and `/ja`
      rendered two languages at once.
      Accept: no hardcoded user-visible string remains in the discovery components.

- [ ] **6. The homepage has an `h1`** (`P2`)
      The document had none; every heading was an `h2`.
      Accept: exactly one `h1` naming the page, with no skipped heading levels.

- [ ] **7. Venue and category grids stop showing emptiness** (`P2`)
      Four of six venue cards printed the same "nothing this week" empty state, and the
      22-tile default grid left an orphaned final row.
      Accept: a venue renders only when it has a current or upcoming event; no orphaned row.

- [ ] **8. Minor cleanups** (`P3`)
      Dead `xl:grid-cols-3` class, hardcoded calendar fallback city and currency, unused
      `archetypeDisplayName`, a string-guard standing in for a translation, an over-broad
      `isCurated` predicate, and docs claiming 15 categories where the code has 22.
      Accept: each is either fixed or explicitly documented as intentional.

## Explicitly out of scope

- Autocomplete on the homepage search (needs a new index-backed endpoint, not a fix).
- Light mode, screen-reader and 200% zoom verification: not covered by either assessment.
- The dark-mode `--primary` contrast token (see todo 4) affects every surface in the app,
  so it needs a palette decision rather than a spot fix.
