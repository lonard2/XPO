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
      RESOLVED in todo 9.

- [x] **9. Remaining dark-mode contrast, by lightening the ink rather than the hue** (`P1`)
      Owner chose to keep the brand hue and fix the text side. Four findings had four
      distinct causes, all confirmed by locating the exact element first:
      * Hero CTA and the selected calendar day cell hardcoded `text-white` over `bg-primary`.
        Dark mode pairs `--primary` (#3b82f6) with a dark `--primary-foreground`, so white was
        the wrong ink at 3.6:1. Both now use `text-primary-foreground` (5.5:1 dark, 5.2:1
        light) and the hero CTA finally matches every other primary button.
      * The topbar role badge used `--archetype-primary`, which stayed `#2563eb` in dark mode
        while `--archetype-surface` darkened to `#0f172a`. The dark block now defines a
        lighter archetype ink, so the token is legible on its own surface. Only 3 places use
        the token as a background, and all 3 sit inside themed event views that override it
        inline, so the change cannot affect them.
      * The selected cluster count chip used `bg-primary-foreground/20`, which lightened the
        chip away from its own ink (3.6:1 dark, 4.0:1 light). It is now border-only, so the
        count reads against the tab background in both themes.
      * The venue-row archetype badge painted the archetype colour as text on a 7% tint of
        itself (4.0:1). It now uses `getReadableBadgeColors`, matching the EventCard badge.
      Result: 0 contrast failures on `/en`, `/ja` and `/id`.
      Guarded by `tests/unit/theming/globals-contrast.test.ts`, which parses the `:root` and
      `.dark` blocks and asserts the token pairs reach 4.5:1. Verified as a real guard by
      reintroducing the old value, which failed at 3.45:1.

- **NEW, not in the original critique: light mode.** Fixing the dark findings exposed that
      light mode had 13 of its own, all in the muted-text range: `--muted-foreground`
      (`#64748b`) reached only 4.2-4.3:1 on `--muted` (`#f1f5f9`) and on `bg-primary/10`
      tints. Six of them were the unselected cluster count chips. Light-mode
      `--muted-foreground` is now slate 600 (`#475569`), about 6.9:1, which took light mode
      from 13 contrast failures to 1. Guarded by the same test file, plus a check that muted
      ink passes on a 10% primary tint.
      Also switched the cluster header's "N Verticals" chip from a 10% primary tint to a
      border, matching the cluster tab count chip, so its label sits on the neutral panel.

- **RESOLVED: `text-primary` on a `bg-primary/10` tint in light mode.** Owner chose to
      darken the token. Light-mode `--primary` moved from `#2563eb` to `#1d4ed8`, which
      lifts the tint pair from 4.4:1 to about 6.0:1 and also improves `text-primary` on
      white (6.9:1) and `bg-primary` with light text (6.7:1). One token edit fixed all
      ~25 text chips instead of a 25-file sweep. `DESIGN.md` was updated to match, including
      the note that hover is rendered as `bg-primary/90` rather than a separate colour token.
      Final state: **0 contrast failures in both light and dark mode**, verified with a cluster
      selected so the extra chip renders. Remaining detector findings are 6 nested-card
      frames, 1 `tiny-text` at the deliberate 11px floor, and 1 advisory `overused-font`.

- **REGRESSION FIXED: the venue spotlight hid five of six Indonesian venues.** Todo 7
      filtered out venues with no current/upcoming event, which emptied the section for any
      edition with a sparse calendar: only JIExpo Kemayoran had a near-term event, so GBK,
      JICC, JIS and NICE PIK 2 disappeared and ICE BSD went with them. No venue data was
      ever deleted (all 6 remain in the database, 12 across regions); it was a render filter.
      The section now renders every venue and orders the ones with something attendable
      first, so JIExpo still leads. The repeated empty-state block is replaced by a single
      quiet muted line per card, which keeps the original critique's point without hiding the
      directory. Verified: 6 cards on `/en` and `/id`, 3 on `/ja`, correct leading order.

- **RESOLVED: two venues had a dead image URL.** `JIS (Jakarta International Stadium)` and
      `Pacifico Yokohama Convention Center` both pointed at Unsplash photo
      `1508098682722-e99c43a406b2`, which returns 404; the other 18 photo ids in the repo all
      return 200. It was defined in `prisma/seed.ts` lines 212 and 278 and in
      `src/lib/discovery/fallbackData.ts:144`, so the seed and the offline fallback were both
      affected. Pacifico's broken card was visible on `/ja` well before this work; JIS only
      became visible once the venues were restored.
      Replacements were chosen by looking at candidates rather than guessing: JIS gets a
      track-and-field photo (`1461896836934-ffe607ba8211`) and Pacifico gets a plenary-hall
      photo (`1511578314322-379afb476865`). Each is reused from a venue in a different region,
      so no two cards in the same grid show the same image. Verified: all 12 database venues
      and all 24 photo ids in the seed and fallback data return 200, and the homepage renders
      6 images on `/en` and 3 on `/ja` with none hidden.
      The card also paints the gradient behind the image and hides the `<img>` on error, so a
      future dead URL degrades instead of showing broken-image chrome.
      Guarded by `tests/unit/discovery/venue-images.test.ts`: the known-dead id must stay gone,
      every seeded URL must be well formed, and the two repaired images must stay distinct.
      Reachability is deliberately not asserted because it would need the network and would
      make the suite flaky in CI.

- [x] **10. Indonesian venue halls complete and current** (`P1`, new request)
      Initial pass: 74 halls. Superseded by todo 11 below (161 total with the JIExpo New
      Hall and individual meeting rooms; detail for the initial pass lives in git history).

- [x] **11. Newer spaces and full meeting-room inventory** (new request)
      Two additions on top of todo 10, researched the same way (official site plus an
      independent source, current October 2026):
      * JIExpo has a ~20,000 sqm New Hall across Levels 1A and 1B under construction
        (foundation mid-2025, superstructure due mid-2026) that is already selling
        December 2026 events. It is listed with its status stated, not presented as open.
        No other venue has a verifiable new build: ICE BSD, JICC, GBK and JIS show none,
        and the one NICE Phase 2 mention is a single uncorroborated press line, so Phase 2
        is recorded as unverified rather than added.
      * All meeting rooms are now individual rows instead of aggregates: JIExpo 31 rooms
        (Levels 5 and 6 plus Semeru/Lawu/Bromo/Kerinci/Rinjani subdivisions), ICE 29
        (Garuda/Cendana/Kalimaya with published areas and theatre capacities), JICC 12
        (Merak/Nuri/Maleo/Murai/Kenari/Kakatua/Summit with official dimensions),
        NICE 14 (Nakula/Sadewa with areas and classroom capacities). GBK gains Gedung
        Serbaguna and GBK Arena; JIS gains its hospitality, press and training-field rooms.
      Indonesian total is now 161 halls (44/41/22/28/16/10). The fallback dataset mirrors
      the seed. Guarded by raised per-venue minimums in the integration test.
- [x] **12. Japanese venue halls complete and current** (new request)
      Same treatment as Indonesia: Tokyo Big Sight 47 rows (23 halls, 24 meeting rooms),
      Makuhari Messe 39 (14 halls, 25 meeting), Pacifico Yokohama 88 (9 halls, 79 meeting).
      Researched per venue against the official site plus an independent source, current
      October 2026; unverifiable figures left null.
      Corrections, not just additions: Makuhari actually has eleven numbered halls, not the
      eight previously listed; Tokyo's East/West/South blocks are now individual halls with
      official areas; Pacifico gains its Conference Center rooms, Annex Hall subdivisions
      and the entire North building. National Convention Hall carries its announced
      May 2027 to Mar 2028 renovation closure in its description. No venue has a
      verifiable new build since 2024, and Rinko Park is excluded because it is a
      city-managed park, not Pacifico inventory.
      The fallback dataset is generated from the seed by script, so the two cannot drift;
      all event venue references already use the slug lookup. Guarded by a Japan
      integration test with per-venue minimums, key names and the exact hall/meeting split.

- [x] **13. Global venue halls complete and current** (new request)
      Same treatment: Marina Bay Sands 38 rows (23 halls, 15 meeting rooms), Messe
      Frankfurt 23 (22 halls, 1 meeting group), ExCeL London 31 (18 halls, 13 meeting
      groups). Researched per venue against the official site plus an independent source,
      current October 2026; unverifiable figures left null.
      Corrections: MBS expo halls are now six individual units with official areas instead
      of one 30,000 sqm row, plus the Grand Ballroom with its tabulated 7,000 theatre
      figure, the Sands Theatre, plazas and SkyPark spaces; Frankfurt lists halls 1
      through 12 honouring the real numbering (no Hall 2 or 7), the Forum halls, Congress
      Center, Kap Europa and the Agora; ExCeL gains the six Maritime Halls from the July
      2025 Phase 3 expansion, the named Maritime Suite room groups and Immerse LDN.
      Under construction but not listed as inventory: MBS IR2 (opening ~2031), Frankfurt
      South Entrance/Via Mobile, and ExCeL's western entrance, which is a site allocation
      rather than a consent.
      The fallback dataset is generated from the seed by script. Guarded by a Global
      integration test with per-venue minimums, key names, the exact hall/meeting split,
      and an assertion that no Hall 2 or Hall 7 exists at Frankfurt.

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
