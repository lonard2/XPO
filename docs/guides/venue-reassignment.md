# Venue Reassignment in the Organizer Customizer

An event's venue and spaces are chosen in the event wizard. Before this
feature, that choice was permanent: the customizer could change branding,
title, hero media, page size, and visibility, but never `venueId`,
`venueHallId`, or `venueHallIds`. A changed booking meant abandoning the event
or asking an administrator to edit the database.

This guide covers the dedicated route, the customizer card, the region rule, the
allocation rules, and how to verify the work.

## Route contract

`PUT /api/organizer/events/[id]/venue`

```json
{ "venueId": "venue_cuid", "venueHallIds": ["hall_cuid_1", "hall_cuid_2"] }
```

The identifier segment accepts either the event id or its slug, through the
shared `idOrSlugWhere` helper. Validation runs in this order:

1. Resolve the event. Absent means `404`.
2. Resolve the caller and apply `canWriteEvent`. A caller who is neither the
   owning organizer nor an administrator gets `403`.
3. Require a non-empty `venueId`. Load the venue with its spaces. An unknown
   venue is `400`.
4. Normalize `venueHallIds` to unique, non-empty strings, then drop every ID
   that does not belong to the new venue.
5. Require at least one valid space. An allocation made only of the previous
   venue's IDs is `400`.
6. Write `venueId`, `regionId`, `venueHallId`, and `venueHallIds` in one
   `db.event.update` call.

The route never touches branding, title, page size, visibility, booths, agenda,
or tickets. A rejected request writes nothing, so the event stays exactly as it
was.

The audit entry uses the action `event.venue` and records both venue IDs, both
region IDs, and the allocated space list.

## The region rule

`Event.regionId` is required, and every attendee surface assumes it matches the
venue's region: homepage rows, the venue directory counts, and edition routing.
When the new venue belongs to another region, the event moves with it.

The card names both editions before the request is sent. A cross-edition move is
deliberate, never silent:

> This moves the event from the Indonesia edition to the Japan edition.

The confirmation dialog restates the venue and the edition move. Only then does
the card call the route.

## The allocation rule

Spaces must belong to the selected venue. The route keeps the order the
organizer sent, drops IDs from any other venue, and promotes the first valid ID
to the primary `venueHallId` relation. `venueHallIds` stores the full allocation
as a JSON string, which is the same shape the wizard writes at creation.

At least one space is required. The card disables saving when no space is
selected, and the route returns `400` if an empty allocation reaches it.

## Stale space names

Booths and agenda items store hall names as free text:

- `BoothTenant.hallName`, for example `Hall A2`
- `AgendaItem.location`, for example `Main Stage - Hall A1`

They are not relations, so a venue change cannot rewrite them safely. The card
counts the entries whose text names a space from the previous venue and no space
from the new one, then shows the count with links to the booth manager and the
event updates page. Nothing is rewritten automatically, because a guess at
`Hall A2 - B12` can silently mislabel a booth.

## Page size stays put

Page size is the organizer's explicit presentation choice. A venue's `size`
column is only a suggestion, so the card shows it as a hint and never applies
it. Changing the venue does not change the page size, the archetype, or the
branding.

## Card behavior

`VenueReassignmentCard` sits in the customizer's left column, directly after the
hero media card, and renders only when the loaded event has a real venue. It:

- Loads `/api/organizer/venues?take=500` and shows a loading or error line while
  that resolves.
- Shows the current venue, its region label, and the allocated space count.
- Lists every venue with its city and resets the space selection to the new
  venue's first space when the venue changes.
- Lists the selected venue's spaces with their kind and capacity, each with a
  44px touch target.
- Saves through a confirmation dialog, separately from the branding save, so a
  failed venue change cannot disturb branding and the reverse.

## Verification

```bash
# Route contract, ownership, region move, stale IDs, empty venue
npx vitest run tests/integration/venue-reassignment.test.ts

# Card behavior and copy rules
npx vitest run tests/unit/organizer/VenueReassignmentCard.test.tsx \
  tests/unit/a11y/customizer-venue-card.test.ts

# Locale parity for the new namespace
npx vitest run tests/unit/i18n/message-parity.test.ts

# Full suite and production build
npx vitest run
npm run build
```

The integration test seeds from the database, restores the original venue
fields after every test, and removes the temporary empty venue it creates, so it
stays order-independent.
