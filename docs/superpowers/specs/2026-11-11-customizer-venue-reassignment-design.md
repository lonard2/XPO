# Customizer Venue Reassignment

Date: 2026-11-11
Status: Approved

## Intent

An organizer chooses a venue and its spaces once, in the event wizard. If the
booking changes, there is currently no way to correct the event: the customizer
writes branding, title, hero image, page size, and visibility, but never
`venueId`, `venueHallId`, or `venueHallIds`. The organizer has to abandon the
event or ask an administrator to touch the database.

This adds a deliberate venue reassignment step to the organizer customizer, so a
venue or space change is a normal, audited operation.

## Goals

- Reassign an event to another venue after creation.
- Reallocate the event's spaces within the new venue.
- Keep the event's region consistent with its venue.
- Keep branding saves and venue saves independent, so neither can half-apply.
- Leave existing booth and agenda text intact and warn when it may be stale.

## Non-goals

- Editing venue records themselves. That stays in the admin venue directory.
- Reassigning booths or agenda items automatically.
- Changing ticket tiers, bookings, or passes.
- A free-form page layout system. Page size and archetype stay as they are.

## Anti-goals

- A venue change that silently moves the public edition without telling the
  organizer.
- A venue change that leaves `venueHallId` pointing at a space in the old venue.
- A single save button that writes branding and venue in one request and leaves
  the event partially updated when one half fails.

## Constraints

- `Event.regionId` is required and every attendee surface assumes it matches the
  venue's region.
- `Event.venueHallIds` is a JSON string column, not a relation. `Event.venueHallId`
  stays the primary relation.
- `BoothTenant.hallName` and `AgendaItem.location` are free text.
- Ownership is enforced by `resolveEventCaller` and `canWriteEvent`.
- All user-visible strings go through `next-intl` in six locales.

## Approaches considered

**A. Dedicated `PUT /api/organizer/events/[id]/venue` (chosen).** Its own
validation, its own audit action, and its own failure boundary. The branding
route keeps a single responsibility.

**B. Extend the branding PUT.** Fewer files, but that route already carries an
admin-only visibility branch, and every branding save would then also carry
venue validation and region migration.

**C. Reuse the creation route with PATCH.** Large validation surface, and it
would need to accept partial create payloads.

## Decision: region follows the venue

The organizer picked this. When the new venue belongs to another region, the
event's `regionId` moves with it. The confirmation names the old and new
editions before the request is sent, so a cross-edition move is never silent.

## Design

### Route

`PUT /api/organizer/events/[id]/venue`

Request body: `{ venueId: string, venueHallIds: string[] }`.

Behavior:

1. Resolve the event by id or slug. Return 404 when absent.
2. Resolve the caller and apply `canWriteEvent`. Return 403 when the caller is
   neither the owning organizer nor an administrator.
3. Validate `venueId` as a non-empty string and load the venue with its halls.
   Return 400 when the venue does not exist.
4. Normalize `venueHallIds` to unique non-empty strings. Drop every ID that does
   not belong to the new venue. Return 400 when no valid space remains, because
   an event must always have at least one allocated space.
5. Write `venueId`, `regionId` (from the venue), `venueHallId` (first valid ID),
   and `venueHallIds` (JSON of the valid list).
6. Record audit action `event.venue` with the previous and next venue IDs.
7. Return the updated event with its venue and halls.

The route never touches title, branding, page size, visibility, booths, agenda,
or tickets.

### Customizer card

A new `Venue & Allocated Spaces` card in the customizer's left column, placed
after the hero media card:

- Venue select, grouped by region, with the current venue preselected. Options
  show the venue name, city, and type.
- Space checkboxes for the selected venue, each showing its kind. The current
  allocation is preselected. At least one space must stay selected.
- A summary line: current venue, region, and allocated spaces.
- When the venue changes, the space selection resets to the new venue's first
  space, and an inline notice names the region move when the region differs.
- A `Save venue` button inside the card, disabled while saving and when nothing
  changed. A confirmation dialog restates the change, including the edition
  move when it applies.
- A warning above the button when booths or agenda items name a hall that is not
  in the new venue, with the count of affected entries and a link to the booth
  and updates pages.

Page size is not changed. The card shows the venue's suggested tier as a hint.

### Data loading

The customizer already loads `/api/events/[id]`, which returns `venue.halls` and
`venueHall`. It also needs the full venue list, so the card fetches
`/api/organizer/venues?take=500` the same way the wizard does.

### Failure behavior

The route is all-or-nothing: validation happens before the write, and the single
`db.event.update` carries every venue field. A rejected request leaves the event
unchanged and surfaces the error inside the card.

## Left to the builder

- Exact component split. A single client component inside the customizer page is
  acceptable if it stays under a reasonable size.
- Whether the confirmation uses the existing `Modal` primitive or a native
  `confirm`. The existing `Modal` is preferred for accessibility.
- The wording of the stale-hall warning, as long as it names the count and the
  two affected surfaces.
