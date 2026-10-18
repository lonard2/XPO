# Admin Venue & Event Management

Follow-up to event-ownership. Gaps found: admin halls API/UI ignore `kind`
(HALL vs MEETING_ROOM) and verified specs, and PUT wipes all halls breaking
`event.venueHallId` links; no admin event DELETE endpoint; no admin events
console (create covered by wizard, edit by customizer).

- [x] **1. Halls with kind, specs, id-preserving PUT** (`api + ui`): POST/PUT accept
  `kind`, `ceilingHeightM`, `floorLoadKnM2`; PUT matches halls by id (update /
  create / delete-removed) so event hall links survive; manager form gains kind
  selector plus spec fields.
- [ ] **2. Admin event DELETE endpoint** (`api`): ADMIN-only, explicit booking
  cleanup first (no cascade on Booking), rest cascades; live probes incl. deny.
- [ ] **3. Admin events console** (`ui`): list with ownership badges and
  curated/owned groups, release + delete actions, create-via-wizard link.

Each ships as its own commit pushed to `origin/main`. Verify by execution:
unit/integration tests, live API probes, tsc.
