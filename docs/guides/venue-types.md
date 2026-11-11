# Venue Types and Space Kinds

XPO distinguishes three things that used to collapse into one:

1. **Event presentation tier** (`Venue.size` and `Event.pageSize`): a suggestion for how much page the event gets. A human chooses it; it never auto-applies.
2. **Venue type** (`Venue.type`): what kind of place it is, such as a convention center, stadium, mall, or outdoor ground.
3. **Space kind** (`VenueHall.kind`): what kind of sub-space it is, such as a hall, arena, field, court, atrium, ballroom, or outdoor deck.

A mall is not a small convention center, and a stadium field is not a hall. The vocabulary keeps those distinctions visible in the directory, the venue page, the homepage, and the admin.

## Venue types

| Type | Use |
|---|---|
| `CONVENTION_CENTER` | Purpose-built convention and conference complexes |
| `EXHIBITION_CENTER` | Large exhibition and trade-fair complexes |
| `ARENA` | Indoor arenas and multifunction sport venues |
| `STADIUM` | Stadiums and sports complexes |
| `MALL` | Shopping centres with event atriums |
| `HOTEL` | Hotels with ballrooms and meeting space |
| `COMMUNITY_HALL` | Civic and community halls |
| `OUTDOOR` | Parks, plazas, lawns, and open grounds |

## Space kinds

`HALL`, `MEETING_ROOM`, `ARENA`, `FIELD`, `COURT`, `ATRIUM`, `PAVILION`, `BALLROOM`, `OUTDOOR`.

A ballroom is a space kind, not a venue type. Hotels and convention centers can both have ballrooms, and the same kind renders on both.

## The count rule

- **Convention and exhibition centers** count `HALL` spaces and label them "Halls".
- **Every other venue type** counts every non-meeting-room space and labels them "Spaces".
- **Meeting rooms** are always listed in their own deeper section and never enter the headline count.

So a convention center with two halls, one ballroom, and one meeting room reads "2 Halls". A mall with one atrium reads "1 Space". A stadium with a field, an arena, and a court reads "3 Spaces".

## Where it appears

- **Venue directory**: a type filter in the sidebar, with counts per type. The filter narrows the view; "All types" restores it. It never removes a venue from the unfiltered list.
- **Venue cards**: a type badge and the type-aware count.
- **Homepage directory**: the type label and count on each row.
- **Venue detail page**: a type badge, a "Halls" or "Spaces" headline metric, and kind chips in the campus explorer.
- **Admin**: a venue type selector, an optional venue capacity, and a space kind selector for every space.

## Backfill and rollout

The migration only adds `Venue.type`, `Venue.capacity`, and an index. It does not rewrite data.

```bash
# Review the planned changes
npx tsx scripts/backfill-venue-types.ts --dry-run

# Apply them
npx tsx scripts/backfill-venue-types.ts
```

The script matches known slugs and space names, is idempotent, never reclassifies a meeting room, and never overwrites an operator-set type unless `--force` is passed. Rollback is the previous image; the columns are additive and the backfill can be re-run.

## Seed inventory

The seed already includes the pilot smaller venues:

- `grand-indonesia-atrium` -> `MALL`, with `Atrium Level 3A` as `ATRIUM`.
- `yoyogi-park-events-ground` -> `OUTDOOR`, with `Keyaki Plaza Lawn` as `FIELD`.
- `battersea-riverside-plaza` -> `OUTDOOR`, with `Riverside Event Deck` as `OUTDOOR`.

GBK and JIS are `STADIUM`, with arenas, courts, fields, and outdoor spaces.

## Verification

- Unit: vocabulary normalization, count rules, metric labels, and space-kind grouping.
- Integration: admin create/update with types and kinds, invalid values rejected, partial updates preserving a field kind.
- Component: the directory sidebar type filter, mall cards reading "Mall" and "1 Space", and the campus explorer kind chips.
- Full suite, production build, axe in light and dark, and live checks on the directory, a mall, a stadium, and an outdoor ground.
