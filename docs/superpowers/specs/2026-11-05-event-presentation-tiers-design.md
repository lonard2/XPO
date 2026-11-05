# Design: Event Presentation Tiers (sizes + visibility)

- Date: 2026-11-05
- Status: proposed, awaiting owner approval
- Size: project (schema + shell branching + venue seeding + listing filters)

## Intent and why

A flagship expo and an intimate mall pop-up should not wear the identical
page, and unannounced corporate bookings should read as occupancy rather
than absence. One shell, three sizes, three visibility tiers — same design
family, honest presence levels. Pop-ups rejected (events need shareable
URLs for social, calendar export, and SEO); separate codebases rejected
(forked maintenance for a spacing problem).

## Goals

1. Page sizes LARGE / MEDIUM / SMALL, same shell and components:
   SMALL is a tight subset (hero-short, key facts, program grid, venue
   pin, pass CTA), not a different page.
2. Tier defaults from the venue record, overridable per event; override
   selectable by organizer, editorial, and admin.
3. Visibility PUBLIC / DISCREET / HIDDEN, orthogonal to `isListingOnly`
   (which governs operations, not discovery).
4. Small venues (malls, open fields) seed as plain `Venue` rows with size
   SMALL; no separate venue-kind field.
5. DISCREET renders as occupancy-without-identity (hall + generic
   "private event" label): visible in venue schedules and the calendar as
   blocked, no title/organizer leak, no detail link, excluded from search
   and homepage rails.

## Non-goals

- Venue-page compact treatment (event pages first; revisit after).
- Per-locale tier or visibility labels beyond dictionary keys.
- Changing `isListingOnly` semantics.

## Constraints

- Institutional tone, zero emojis, lucide icons only, no em dashes.
- Additive migration only; auth deny-by-default; `apiError` envelope.
- HIDDEN and DISCREET exclusions must hold across homepage, search,
  calendar, sitemap, and public APIs — leak tests mandatory per surface.
- Serious+ axe gate; stubs must be real text, not color-only signals.

## Approaches

### A. Columns + conditional sections (picked)

`Venue.size` (default LARGE, so nothing visually regresses on migrate;
admin curates down), `Event.pageSize` nullable override (null inherits),
`Event.visibility` default PUBLIC. Shell branches section lists by
resolved size; listing queries exclude by visibility centrally.

- For: smallest change that stays honest; one shell, data-driven.
- Against: conditional sections need discipline to stay family-like;
  accepted via guard tests on the subset markers.

### B. Separate compact template

- For: total layout freedom.
- Against: forked maintenance, drift within quarters. Rejected.

## Decided parts (builder-checkable, verify while reading)

- Resolution: per-event override → venue default → LARGE.
- SMALL subset: short hero, key facts, program grid, venue pin, pass CTA;
  hides booths directory, meeting-request panels, and showcase channels;
  keeps alerts.
- DISCREET stub content: hall name + generic label from dictionary keys
  (all six locales); title/organizer/image never leave the server —
  assert absence in tests, not just UI hiding.
- HIDDEN: excluded from all listings; direct URL still resolves
  (link-only, like unlisted).
- Seed: representative mall + open-field venues per region at SMALL.

## Left to the builder

- Exact SMALL spacing/hero height within the shell's scale.
- Seed rows (builder call: add with reason, keep seeding rules).

## Builder-check resolutions (2026-11-05)

Builder calls (mine, check while reading):

1. New columns, no reuse: `Venue.size` and `Event.pageSize` are
   presentation tiers (`LARGE`/`MEDIUM`/`SMALL`, Prisma String like the
   neighboring fields); `Event.scale` (magnitude) and `SCALE_LABELS`
   stay untouched. `Event.pageSize` nullable = inherit venue.
2. MEDIUM renders the full section list with tighter spacing only; only
   SMALL hides (booths/floorMap tab, meeting-request tab entries,
   showcase channels within archetype children). Shell-only change:
   hide whole tabs by key; archetype views untouched.
3. One central helper, `src/lib/discovery/visibility.ts`, owns
   `publicEventWhere()` plus field-stripping for discreet rows; every
   surface (homepage mapping, events search API, calendar page + API,
   sitemap.ts, venue schedules, suggestions API, metadata/JSON-LD)
   must call it — the leak tests enumerate these files.
4. Discreet stripping happens at the Prisma `select` level: title,
   organizer identity, images, tagline, description, branding, tiers,
   agenda, and booths never leave the server. Generic label keys live
   under the `common` namespace (loaded on every surface that needs
   them), six locales plus usage guard.
5. Override editing: organizers may set `pageSize` on own events
   (creation wizard + customizer); `visibility` is ADMIN-only
   (organizers cannot hide their own events). "Editorial" is admin
   curation — no new role.
6. SEO: HIDDEN excluded from sitemap, detail page emits `noindex` and
   suppresses JSON-LD/OG. DISCREET direct URLs 404 (stubs live only in
   schedules); owners and admins still see own rows everywhere
   (deny-by-default applies to the public, not to owners).
7. SMALL keeps alerts (useful at intimate scale), hides the rest per
   section 2.

Still theirs (changes what gets built):

- V1. DISCREET direct-URL behavior is set to 404 above — confirm, or do
  you want a "this event is private" stub page at the URL instead?
