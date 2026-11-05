# Homepage Rows: Cross-Region Rail, Editor Rows, Adaptive Layout

- Date: 2026-11-05
- Status: proposed, awaiting owner approval
- Size: project (one model, one shared component, one admin surface, homepage wiring)

## Intent and why

The homepage is region-locked: a delegate on the Indonesia edition never sees
that a flagship robotics expo is running in Tokyo. Editors also have no way to
compose a themed row ("Energy transition week") from events across categories.
Both needs are the same shape: a titled row with a subtitle and an ordered
event list. One primitive serves both, and one model lets editors compose rows
without a second system.

## Goals

1. **Cross-region rail.** One section per edition, labeled by region ("Also
   happening in Japan"), showing up to three events from one other region.
   Region rotates daily, derived from the date, stable within a day.
   Ranking is hybrid: booking volume among featured events, falling back to
   featured order when bookings are thin or zero.
2. **Editor rows.** Admin-authored rows with title, optional subtitle, an
   ordered event list, and a position. Region-scoped, with an all-editions
   flag. Empty rows render nothing.
3. **Shared adaptive layout.** One `ResponsiveRow`: horizontal snap scroller
   with prev/next below `md`, count-aware grid at `md` and above, up to five
   columns at 1800px when inventory supports it. Used by featured events,
   major venues, the news rail, the cross-region rail, and editor rows.
4. **Motion-capable.** Rows support the existing Expressive vocabulary:
   stagger entrance on the row, tilt and sheen on cards (inherited from
   `EventCard`), press feedback on controls, all gated by `motion-off` and
   reduced motion.

## Non-goals

- Personalized rows (no preferences backend exists; explicitly deferred).
- A generic CMS or arbitrary block builder.
- Desktop horizontal rails. Grids win when the viewport fits the inventory.
- Converting category chips into content rows; they are filters.
- Notifications when a row changes.

## Constraints

- Institutional tone, zero emojis, `lucide-react` icons only, no em dashes.
- Additive migration only; `HomepageRow.regionId` nullable means all editions.
- Admin-only writes via `requireRole(request, ["ADMIN"])`, `apiError` envelope.
- Only PUBLIC, attendable events render. Hidden and discreet rows are excluded
  through `listingWhere()`; past events are filtered by end date.
- New `home` or `admin` dictionary keys in all six locales plus a usage guard.
- Serial vitest; throwaway test DB on 5434; serious+ axe gate.
- Existing motion utilities are reused, never reimplemented: `stagger-children`,
  `data-tilt`, `sheen`, `card-interactive-3d`, `prefers-reduced-motion` kills.

## Approaches

### A. One adaptive row plus one model (picked)

`ResponsiveRow` owns layout and scroll controls only. Items are passed as
children, wrapped by the row for snap behavior. Cards keep their own motion
hooks. Editor rows persist in one `HomepageRow`; the cross-region rail is a
computed section that renders through the same row primitive.

- For: one layout, one motion treatment, one admin surface, no duplication.
- Against: the row component must not impose motion on cards that already
  have it, so motion lives on children and the row only staggers.

### B. Separate implementations per section

- For: each section can diverge freely.
- Against: four layouts and four motion treatments drift. Rejected.

### C. Generic block or CMS builder

- For: maximum flexibility.
- Against: far more than five sections need. Rejected.

## Decided parts

- **Model.** `HomepageRow { id, title (80), titleI18n Json?, subtitle (160,
  optional), subtitleI18n Json?, regionId String? (null = all editions),
  position Int, eventIdsJson String, isActive Boolean @default(true),
  createdAt, updatedAt }`. Unique position per scope enforced in the API, not
  by a database constraint, because null region breaks a composite unique.
- **Daily rotation.** Region chosen deterministically from the UTC date plus
  the active region, never equal to the active region. Global edition chooses
  between Indonesia and Japan.
- **Hybrid ranking.** Query featured, attendable, public events in the target
  region with `_count.bookings`, sort by bookings descending, then by start
  date. When the target region has fewer than three featured events, widen to
  all attendable public events in that region, still bookings-first.
- **Row rendering.** Editor rows render in position order for the active
  region plus all-editions rows. Missing, past, or non-public event ids are
  skipped, never rendered as placeholders.
- **Placement.** Featured grid, cross-region rail, editor rows, news rail,
  calendar, categories, bento, concierge banner.
- **ResponsiveRow API.** `{ children, className? }`. It wraps items into snap
  items and owns the scroller and grid. Section headers stay with their
  sections. Below `md` it renders a scroll container with prev/next buttons,
  edge fades, and `scroll-snap-type: x mandatory`. At `md` and above it renders
  a grid whose columns come from `rowGridClass(count)`.
- **Desktop density.** `rowGridClass`: 1 item centered, 2 at `md`, 3 at `lg`,
  4 at `xl`, 5 at `min-[1800px]` when count is 5 or more.
- **Motion.** Row container gets `stagger-children` (Expressive only, existing
  cap of six). Scroller buttons reuse `Button` press physics. Smooth scrolling
  is skipped under `prefers-reduced-motion`. Edge fades are decorative and
  `aria-hidden`.
- **Accessibility.** Scroller has `role="region"` with an accessible name,
  buttons labeled Previous and Next with disabled ends, keyboard arrow support
  when focus is inside, and cards remain focusable in DOM order.
- **Admin surface.** New `/admin/homepage` page: list rows per region, create
  or edit in a dialog (title, subtitle, region or all editions, ordered event
  picker with search), reorder, deactivate, delete. Reuses console primitives.
- **API.** `/api/admin/homepage-rows` GET and POST, `/[id]` PUT and DELETE.
  Validation: title 1 to 80, subtitle up to 160, up to 8 event ids, ids must
  resolve to public attendable events, position integer.

## Left to the builder

- Exact scroller step and edge-fade widths.
- Whether the event picker is a search list or a dialog with checkboxes.
- Seed rows (builder call: add one demonstrative row or skip with reason).

## Builder-check resolutions (2026-11-05)

Settled as builder calls, recorded so the plan can carry them:

1. **Rail candidates.** Every region except the active one. Indonesia can draw
   from Japan or Global, Japan from Indonesia or Global, Global from either
   country edition. The daily seed picks one candidate; the heading names it.
2. **Ranking.** Count bookings with status `CONFIRMED` or `CHECKED_IN` only,
   all time. Sort by that count descending, then start date ascending. The
   pool is featured, public, attendable events in the target region; when it
   has fewer than three, non-featured public attendable events are appended to
   fill to three, never replacing the featured picks.
3. **`ResponsiveRow` is the item container only.** It takes `children` and an
   optional `className`, wraps items for snap, and owns prev/next and edge
   fades. Section headers, eyebrows, descriptions, and CTAs stay in their
   sections, so no header API is invented. `featuredGridClass` and
   `venueGridClass` are replaced by `rowGridClass(count)`; the homepage motion
   test's stagger count is updated with the layout.
4. **Editor rows may reference any public attendable event.** The picker
   defaults to the row's region and can search all regions; all-editions rows
   depend on this. Validation checks visibility and dates, not region match.
5. **Merge order.** Region-specific rows and all-editions rows are merged and
   sorted by position ascending, with region-specific first on a tie.
6. **Positions.** PUT replaces the ordered list for one scope and renumbers
   transactionally, mirroring the news-slot endpoint. POST appends at the end.
   Moving a row between scopes removes it from the old scope and appends in the
   new one. No 409 path exists.
7. **Empty rail.** When the target region has no attendable public events, the
   rail renders nothing, including on fallback data. No placeholder section.
8. **Row copy is localized.** `title` and `subtitle` keep their default values
   and gain optional `titleI18n` and `subtitleI18n` JSON maps, resolved with the
   same chain as editorial blurbs (exact locale, then default). A Japanese
   homepage must not show English row headings.

## Risks

- A rail that claims popularity from thin data. Mitigated by the hybrid
  fallback and a region label rather than a rank label.
- Five-column cards at 1800px may crowd venue names. Builder verifies at
  1800 and drops to four if a card truncates essential text.
- Editor rows can duplicate the news rail visually. Mitigated by one row
  primitive and distinct section headings, not by separate designs.
