# Event Page: Day-of Guide Hierarchy

Date: 2026-11-15
Target: `src/app/[locale]/(attendee)/events/[slug]/page.tsx`, `EventPageShell`, and the archetype views.

## Problem

The event page is a pass-first poster. It answers what, when, where, and cost in the hero, then
spends the rest of the page on category copy and repeated pass asks. On a live day a delegate
cannot answer the operational questions: what is on now, which hall, until when, and where do I
enter. The guidebook, timetable, perks, and venue transit detail exist elsewhere in the system
but are not wired into this page.

## Decision

The event page leads with the day-of guide while the event is live, and keeps the pass as the
single conversion action. Category copy and secondary detail stay available, but they move below
the operational answer.

## Hierarchy

### 1. Hero (all states)

Unchanged composition, now honest:

- Title, tagline, format and scale.
- Status badge: Live Today, Final Day, or Concluded.
- Metadata strip: dates, venue, hall, pass price. While live, the date card becomes
  `Day N of M` plus `Closes HH:MM WIB`.
- One primary action. Reserve Pass while open; a disabled concluded state plus a related-events
  link after the end date. Share stays secondary.

### 2. Day-of status panel (live only, first section on Overview)

A compact, factual strip above the category view:

- `Day N of M`, local closing time, and the resolved hall name.
- Direct link to the venue page and its transit section.
- Programme state: number of sessions today, or an honest "Programme not published" line with a
  contact path when the organizer has published nothing.

No invented rows. The panel renders only from event, agenda, hall, and venue data the page already
loads.

### 3. Today's programme (live, when agenda data exists)

Render `InteractiveGuidebook` on Overview, filtered to the current day by default. The agenda tab
stays for the full run. When there is no agenda data, the panel in section 2 carries the honest
empty state and the tab is not duplicated on Overview.

### 4. Attendee perks (when perk data exists)

Render the event's published perks as a first-class section on Overview. Each perk shows title,
description, and the tier gate when one is set. Perks are never synthesized from category copy.
When the organizer has published none, the section is absent rather than an empty shell.

### 5. Venue, hall, and transit (all states)

A first-class section on Overview linking to the venue page, with the exact hall name and the
transit hub entry point. This is the differentiator the page currently hides behind a tab.

### 6. Category view and secondary tabs

The archetype view, news timeline, floor map, and full pass tier grid keep their current
positions below the operational sections. Tabs remain for secondary content; they no longer own
the day-of answer.

## Empty-state rules

- Upcoming: future-tense copy is allowed ("will be published closer to the event").
- Live or concluded: no future-tense promise. State what is missing and, when an organizer email
  exists, offer a contact path.
- Absent data hides the section. It never produces a placeholder that looks like content.

## Out of scope

- Seeding agenda, booth, or perk rows for live events. The page must be honest about missing
  organizer data; filling it with generated rows would fabricate the programme.
- Reworking every archetype view. The shell owns the day-of hierarchy; category bodies stay as
  they are.
