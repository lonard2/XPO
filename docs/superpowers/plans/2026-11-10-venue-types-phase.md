# Venue Types and Smaller Venues Phase

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Give every venue a real type and every sub-space a real kind, so convention centers, exhibition halls, stadiums, fields, malls, hotels, and outdoor plazas are labeled and counted correctly across the directory, venue pages, homepage, admin, and seeds.

**Architecture:** Add two additive columns (`Venue.type`, `Venue.capacity`) and widen the existing `VenueHall.kind` vocabulary. Keep `Venue.size` as the event presentation-tier suggestion, separate from venue type. Backfill existing rows with an idempotent script. Update the public surfaces and the admin to read the new vocabulary.

**Spec:** The 2026-11-10 adaptive-layout discussion and the two homepage critiques. The current seed already contains the pilot smaller venues: `grand-indonesia-atrium`, `yoyogi-park-events-ground`, and `battersea-riverside-plaza`.

**Tech Stack:** Prisma 7, PostgreSQL, Next.js 16 App Router, React 19, TypeScript strict, next-intl, Vitest, Playwright + axe.

## Global Constraints

- Additive migrations only. No column drops, no model renames, no destructive changes.
- `Venue.size` remains the event presentation-tier suggestion. It never becomes the venue type.
- Every user-visible label goes through next-intl and exists in all six locales.
- Zero emojis. Lucide icons only. No em dashes.
- The directory must never hide a venue. Type filters are optional views, not silent exclusions.
- The backfill script is idempotent and supports a dry run.

## Vocabulary

**Venue types:** `CONVENTION_CENTER`, `EXHIBITION_CENTER`, `ARENA`, `STADIUM`, `FIELD`, `MALL`, `HOTEL`, `COMMUNITY_HALL`, `OUTDOOR_PLAZA`.

**Space kinds:** `HALL`, `MEETING_ROOM`, `ARENA`, `FIELD`, `COURT`, `ATRIUM`, `PAVILION`, `BALLROOM`, `OUTDOOR`.

**Count label rule:** convention centers and exhibition centers say "Halls"; every other venue type says "Spaces". Meeting rooms are always listed deeper and never counted.

## Review Focus

- An existing venue with no type silently disappearing from a filtered directory.
- A mall atrium or park lawn being counted as a "Hall".
- The venue page summing meeting rooms into the headline space count.
- The backfill overwriting a type an operator already set.
- A new space kind accepted by the UI but rejected by the API, or the reverse.
- A locale that has the type labels but not the space-kind labels.

---

### Task 1: Schema, vocabulary, and backfill

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_venue_types/migration.sql`
- Create: `src/lib/discovery/venueTypes.ts`
- Create: `scripts/backfill-venue-types.ts`
- Test: `tests/unit/discovery/venueTypes.test.ts`

**Interfaces:**
- `VENUE_TYPES` and `SPACE_KINDS` readonly arrays, with `VenueType` and `SpaceKind` unions.
- `normalizeVenueType(value): VenueType`, defaulting to `CONVENTION_CENTER`.
- `normalizeSpaceKind(value): SpaceKind`, defaulting to `HALL`.
- `countLabelKey(type): "hallsCount" | "spacesCount"`.
- `isHallVenue(type): boolean` for convention and exhibition centers.

- [ ] **Step 1: Write the failing vocabulary test.** Assert normalization of known and unknown values, the hall-vs-spaces label rule, and that `MEETING_ROOM` is never counted.
- [ ] **Step 2: Add the columns.** `Venue.type String @default("CONVENTION_CENTER")`, `Venue.capacity Int?`, and `@@index([regionId, type])`. Keep `VenueHall.kind` as a string with the widened comment.
- [ ] **Step 3: Write the migration.** Add the columns and the index; no data updates.
- [ ] **Step 4: Write the backfill script.** Match by slug, never overwrite a non-default type unless `--force` is passed. Dry run prints the planned changes. Known mappings:
  - `jiexpo-kemayoran`, `ice-bsd-city` -> `EXHIBITION_CENTER`
  - `jcc-senayan`, `nice-pik-2` -> `CONVENTION_CENTER`
  - `gbk-sports-complex`, `jis-jakarta` -> `STADIUM`
  - `grand-indonesia-atrium` -> `MALL`
  - `yoyogi-park-events-ground` -> `FIELD`
  - `battersea-riverside-plaza` -> `OUTDOOR_PLAZA`
  - Tokyo Big Sight, Makuhari Messe, Pacifico Yokohama, Marina Bay Sands, Messe Frankfurt, ExCeL London -> `EXHIBITION_CENTER`
- [ ] **Step 5: Backfill space kinds.** Match by venue slug and space name, idempotent:
  - Grand Indonesia "Atrium Level 3A" -> `ATRIUM`
  - Yoyogi "Keyaki Plaza Lawn" -> `FIELD`
  - Battersea "Riverside Event Deck" -> `OUTDOOR`
  - GBK and JIS spaces -> `FIELD`/`ARENA`/`COURT` by name
  - Existing convention halls stay `HALL`; meeting rooms stay `MEETING_ROOM`
- [ ] **Step 6: Run the vocabulary test, `prisma generate`, `tsc`, and the backfill dry run. Commit and push.**

### Task 2: Type-aware counting and labels

**Files:**
- Modify: `src/lib/discovery/venueSpaces.ts`
- Modify: `src/types/discovery.ts`
- Modify: `src/messages/*.json`
- Test: `tests/unit/discovery/venueSpaces.test.ts`

**Interfaces:**
- `countSpaces(halls, type)` returns the headline count: non-meeting-room spaces for non-hall venues, halls for convention/exhibition centers.
- `spaceKindLabelKey(kind)` returns the i18n key for a space kind.
- `VenueSummary` and `VenueWithEvents` gain `type?: string | null` and `capacity?: number | null`.

- [ ] **Step 1: Write the failing count tests.** A mall with an atrium returns 1 and uses the spaces label; a convention center with two halls and one meeting room returns 2 and uses the halls label.
- [ ] **Step 2: Implement `countSpaces` and the label helpers.** Keep `countHalls` for existing callers that genuinely mean halls.
- [ ] **Step 3: Add `venueTypes.*` and `spaceKinds.*` to all six locales.** Labels: Convention Center, Exhibition Center, Arena, Stadium, Field, Mall, Hotel, Community Hall, Outdoor Plaza; Hall, Meeting Room, Arena, Field, Court, Atrium, Pavilion, Ballroom, Outdoor.
- [ ] **Step 4: Run the tests, `tsc`, eslint, commit, push.**

### Task 3: Admin API and venue manager

**Files:**
- Modify: `src/app/api/admin/venues/route.ts`
- Modify: `src/app/api/admin/venues/[id]/route.ts`
- Modify: `src/components/admin/VenueDirectoryManagerClient.tsx`
- Test: `tests/integration/admin-venues-types.test.ts`

**Interfaces:**
- POST and PUT accept `type`, `capacity`, and `halls[].kind`.
- Invalid type or kind returns 400 with a specific message; omitted values default to `CONVENTION_CENTER` and `HALL`.
- The form exposes a venue type selector, a venue capacity input, and a space kind selector with all allowed kinds.
- The form labels `size` as "Presentation tier suggestion", not "Venue type".

- [ ] **Step 1: Write the failing integration tests.** Create a mall with an atrium and a field with a field space; assert the persisted values. Send an invalid type and an invalid kind; assert 400.
- [ ] **Step 2: Implement validation and persistence.** Reuse `normalizeVenueType`/`normalizeSpaceKind` but reject invalid explicit values rather than silently defaulting.
- [ ] **Step 3: Update the manager.** Add the type and capacity fields; expand the space kind selector; keep the existing hall editing behavior.
- [ ] **Step 4: Run the tests, `tsc`, eslint, commit, push.**

### Task 4: Directory and homepage

**Files:**
- Modify: `src/components/discovery/VenueDirectoryExplorer.tsx`
- Modify: `src/components/discovery/VenueSpotlightCard.tsx`
- Modify: `src/components/discovery/MajorVenuesUpcomingSection.tsx`
- Modify: `src/app/[locale]/(attendee)/venues/page.tsx`
- Test: `tests/unit/components/discovery/VenueDirectoryTypes.test.tsx`
- Test: `tests/unit/components/discovery/MajorVenuesUpcomingSection.test.tsx`

**Interfaces:**
- The directory gains a type filter with an "All types" option and a type badge on each card.
- Cards and homepage rows show the type-aware count: "2 Halls" for a convention center, "1 Space" for a mall or field.
- The homepage directory rows show the type label next to the city.
- The type filter never removes a venue from the unfiltered view.

- [ ] **Step 1: Write the failing component tests.** A mall card shows "Mall" and "1 Space"; a convention center shows "Convention Center" and "2 Halls"; the type filter narrows the list and "All types" restores it.
- [ ] **Step 2: Implement the filter, badges, and labels.**
- [ ] **Step 3: Run the tests, `tsc`, eslint, commit, push.**

### Task 5: Venue detail page

**Files:**
- Modify: `src/app/[locale]/(attendee)/venues/[slug]/page.tsx`
- Modify: `src/components/discovery/VenueCampusExplorer.tsx`
- Modify: `src/components/discovery/VenueMeetingRooms.tsx`
- Test: `tests/unit/components/discovery/VenueDetailTypes.test.tsx`

**Interfaces:**
- The hero shows the venue type badge.
- The headline metric reads "Halls" for convention/exhibition centers and "Spaces" otherwise.
- The campus explorer groups spaces by kind: Halls, Arenas, Fields, Courts, Atriums, Pavilions, Ballrooms, Outdoor.
- Meeting rooms remain in their own deeper section and never appear in the headline count.

- [ ] **Step 1: Write the failing tests.** A mall page shows "Mall", "1 Space", and an "Atrium" group; a convention center shows "2 Halls" and a "Halls" group; a meeting room is not counted in the headline.
- [ ] **Step 2: Implement the type badge, count label, and grouped space list.**
- [ ] **Step 3: Run the tests, `tsc`, eslint, commit, push.**

### Task 6: Seed, verification, and rollout

**Files:**
- Modify: `prisma/seed.ts`
- Modify: `README.md` and the phase guide
- Test: full suite, axe, live probes

**Interfaces:**
- The seed sets types and space kinds for all 15 venues, including the three smaller venues.
- The backfill script is documented with a dry-run command and a rollback note.

- [ ] **Step 1: Update the seed** with the type and space-kind mappings from Task 1. Do not add new venues; the three smaller venues already exist.
- [ ] **Step 2: Run the full suite on a fresh seeded database.**
- [ ] **Step 3: Run the production build, axe in light and dark, and live probes** on the homepage, `/venues`, a convention center, a mall, a field, and an outdoor plaza.
- [ ] **Step 4: Update the README and the phase guide** with the vocabulary, the count rule, and the backfill command.
- [ ] **Step 5: Commit and push.**

## Rollout

1. Merge the additive migration and deploy the image.
2. Run `npx tsx scripts/backfill-venue-types.ts --dry-run` and review the diff.
3. Run the backfill without `--dry-run`.
4. Verify the directory, a convention center, a mall, a field, and an outdoor plaza.
5. Rollback is the previous image. The columns are additive; the backfill is idempotent and can be re-run.

## Open Decisions

- Should `FIELD` and `OUTDOOR_PLAZA` be separate venue types, or one `OUTDOOR` type with space kinds? The plan keeps them separate so a park and a paved plaza read differently.
- Should the type filter live in the directory sidebar or as a compact chip row above the results? The plan uses a compact chip row to avoid adding another sidebar decision point.
- Should hotel ballrooms be a venue type `HOTEL` with `BALLROOM` spaces, or a `BALLROOM` venue type? The plan uses `HOTEL` plus `BALLROOM` spaces, which matches how delegates search.
