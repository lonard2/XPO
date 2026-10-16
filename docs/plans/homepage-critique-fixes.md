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

- [x] **4. Archetype badge contrast meets AA** (`P1`, scoped)
      Badge text was hardcoded white over archetype hues, and the existing contrast helper
      picked dark text that also failed.
      Result: contrast helpers moved into `src/lib/theming.ts`, which `src/lib/AGENTS.md`
      already designates for contrast validation. `getReadableBadgeColors` guarantees 4.5:1
      for all 22 archetypes by darkening the badge background in steps rather than falling
      back to a neutral, so the hue stays recognisable. In-page detector low-contrast
      findings dropped from 9 to 6; the `<h1>`-era MEGA_EXPO (white on orange, 3.6:1) and
      indigo (3.6:1) badge pairs are gone.
      Deferred: 6 remaining findings are token-level, not badges: the dark-mode `--primary`
      surface carrying white text (3.6:1) and `--primary` used as text on dark cards
      (3.5:1). Both affect every surface in the app, so they need a palette decision.

- [x] **5. Discovery copy is translatable** (`P2`)
      Status labels, section kickers and tab counts were hardcoded English, so `/id` and `/ja`
      rendered two languages at once.
      Result: 31 keys added to all six locales (en, id, ja, zh-CN, de, es), 180 entries.
      Reused existing keys where they already existed (`events.allCategories`,
      `venues.noUpcomingEventsScheduled`, `discovery.inPerson`) so id/ja/zh-CN inherited
      authored translations instead of new ones. The tab counts now derive from
      `ARCHETYPE_LIST.length` rather than the literal 22.
      Deliberately a zero-visual-change refactor: the EventCard archetype badge label still
      comes from the theming token, because switching it to the authored `shortName` would
      change a visible label and belongs in todo 8.
      Added `tests/unit/i18n/message-parity.test.ts`, which asserts all six bundles carry an
      identical key set, consistent ICU placeholders, and no em dashes.
      Verified: no hardcoded user-visible string remains in the four homepage components, and
      `/ja` plus `/id` render translated status labels, kickers and counts.

- [x] **6. The homepage has an `h1`** (`P2`)
      The document had none; every heading was an `h2`.
      Result: one visually hidden `h1` naming the page, built from `hero.title` and
      `hero.titleHighlight`, which were already authored and translated in all six locales
      and otherwise unused. The hero rotates between events, so a slide title would have made
      an unstable `h1`.
      Verified: exactly one `h1` on all six locales, heading order now begins at level 1 with
      no skipped levels, carousel top offset unchanged at 390px, no page overflow.
      Guarded by `tests/unit/a11y/homepage-heading.test.ts`, matching the repo's existing
      source-scan a11y pattern.

- [x] **7. Venue and category grids stop showing emptiness** (`P2`, partial by design)
      Four of six venue cards printed the same "nothing this week" empty state, and the
      category subtitle was clipped on all 22 tiles.
      Result: the venue section now derives each venue's attendable events once and drops
      venues with none, so on `/en` the spotlight went from 6 cards (4 of them empty) to the
      1 venue that actually has something on. When no venue qualifies, the section explains
      itself once instead of repeating the message per card. Venue event lists are also
      filtered by status rather than sliced raw, which removes a label mismatch: ended events
      were being listed under "Current & Near-Upcoming Events".
      The category subtitle moved from `line-clamp-1` to `line-clamp-2`: 22 of 22 tiles were
      clipped mid-phrase, now 0 of 22 are.
      NOT FIXED, deliberately: the trailing partial row (22 tiles at 5 columns leaves 3 empty
      cells). A uniform grid cannot be flush for 22 items at any column count except 2, since
      22 only divides by 2 and 11. Removing it would need either invented filler tiles or a
      grid-to-flex rewrite that distorts tile widths, and both are worse than a normal
      trailing row. Recorded rather than papered over.
      Updated `MajorVenuesUpcomingSection.test.tsx` to assert the corrected behaviour with a
      fixed clock, matching the `vi.setSystemTime` pattern EventCard.test.tsx already used.

- [x] **8. Minor cleanups** (`P3`) - all resolved or recorded
      * **Fixed**: dead `xl:grid-cols-3` duplicating `lg:grid-cols-3` in the featured grid.
      * **Fixed**: the calendar mapping's `'Grand Convention Hall'` and `'Jakarta'` fallbacks
        invented facts for every non-Indonesian edition. Both fields are optional on
        `EventSummary`, so they now pass `undefined` and the widget decides. The currency
        fallback derives from `getCurrencyForRegion(activeRegionCode)`, so Japan gets JPY.
      * **Fixed**: `EventCard` computed `archetypeDisplayName` and never used it, while the
        badge rendered the untranslated token name, so `/ja` showed "TECH & CONSUMER
        ELECTRONICS". The badge now uses the authored, translated `tag` field. Visible on
        `/en` as "INDUSTRIAL & MANUFACTURING" instead of "INDUSTRIAL B2B".
      * **Fixed**: the `isCurated` predicate treated `isPlatformCurated === undefined` as
        curated, so any future event with no organizer and no explicit flag would be labelled
        "Curated by {venue}". It now requires an explicit flag or an organizer name.
      * **Fixed**: `AGENTS.md` section 5A and `DESIGN.md` both documented 15 categories with a
        15-row colour table; the code has 22. Both now describe 22 across 6 clusters, and the
        colour table is complete.
      * **Recorded, not changed**: the fragile `happeningAtVenue` string-guard was already
        removed in todo 5. `HeroVenueQuickGlanceRail` stays off on the homepage
        (`showVenueRail={false}`) but is an opt-in variant with its own test coverage, so it is
        a supported API rather than dead code, and AGENTS.md documents the rail as a feature.

## Explicitly out of scope

- Autocomplete on the homepage search (needs a new index-backed endpoint, not a fix).
- Light mode, screen-reader and 200% zoom verification: not covered by either assessment.
- The dark-mode `--primary` contrast token (see todo 4) affects every surface in the app,
  so it needs a palette decision rather than a spot fix.
