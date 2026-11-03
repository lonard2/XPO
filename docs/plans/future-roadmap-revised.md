# XPO Future Roadmap (Revised)

Supersedes `docs/plans/future-roadmap.md`. Written after re-verifying every
claim in that document against the code, not against its own summary. Where
the two disagree, this file carries the evidence.

Provenance: three codebase audits (unbacked UI promises, unused data model
power, API and journey gaps), 2026 MICE industry research, and a line-by-line
re-check of the prior roadmap. No claim below is inherited without a file
reference.

Standing decisions carried forward:

- Payments stay reservation-only until a provider decision. Nothing here
  scopes Midtrans, Xendit or Stripe.
- Hosting target is undecided. Nothing here assumes one.
- Theatre interactions in the archetype views stay as visual showcases, per
  owner decision. They are labelled, not removed and not gated.

---

## 1. Status of the prior roadmap

`A1` shipped as `86902f2`: `MeetingRequest` model, validated and rate-limited
POST route, email to both sides, four forms wired. The checkbox in
`docs/plans/trust-repair.md` is stale and should be marked complete.

Everything else in the prior roadmap is still open. Its evidence base holds
up, with five exceptions recorded in section 2.

---

## 2. Verification of the prior roadmap

| Prior claim | Code evidence | Disposition |
| --- | --- | --- |
| A2 recap CTA points at the live page | `BannerCarousel.tsx:320` links to the live event; no recap model or field exists | Keep, unchanged |
| A3 discovery ignores `isListingOnly` | Flag at `schema.prisma:86`; excluded from dashboard, booths and scanner (`dashboard/page.tsx:46`, `CheckInScanner.tsx:155`, `booths/page.tsx:318`); zero references in discovery | Keep, unchanged |
| A4 gate showcase sections on `showcaseJson` | CME claims are hardcoded JSX (`MedicalSymposiumView.tsx:111-155`), not showcase-driven | Rewrite as labelling |
| A5 Google/Outlook export only the next event | `CalendarInteractiveView.tsx:497,522` pass `nextUpcomingEvent`; `ical.ts:121,141` build single-event deeplinks | Correct diagnosis, fix changed |
| B1 `BoothTenant` has no user link | `schema.prisma:153-166`: no `userId`, no claim status | Keep, unchanged |
| C1 "model and UI exist, only persistence missing" | No bookmark model exists; `AgendaItem` is the schedule, not a saved-items join | Effort corrected upward |
| D1 `interestsJson` is dead | `schema.prisma:18` only; zero readers or writers in `src/` | Keep, unchanged |
| E1 raw-cookie role parsing | Worse than stated, see C1 below | Promoted to P0 |
| Audit UI shows mock rows | `admin/audit/page.tsx:24` hardcodes `LOG-9410`; `recentAuditEntries()` already exists (`audit.ts:50`) | Keep, smaller than stated |
| Quick wins (meeting rooms, freight specs, devices, `vipLounge`) | `MEETING_ROOM` rows exist and are excluded (`venueSpaces.ts`); `ceilingHeightM` and `floorLoadKnM2` at `schema.prisma:59-70`; `Session.userAgent/ip` at `schema.prisma:205-216`; `vipLounge` has no consumer | All correct |

---

## 3. Corrections applied

**C1. Authentication is P0, not Phase E.** `POST /api/organizer/events`
rejects only the literal `ATTENDEE` role (`route.ts:39-45`). A request with no
cookie yields `undefined`, which passes. The same pattern guards booth
POST, PATCH and DELETE (`booths/route.ts:51,265,392`). `src/proxy.ts:44`
excludes `api` from the matcher, so there is no middleware backstop. This is
unauthenticated event and booth mutation in production. It moves to the first
track and gates everything else.

**C2. A4 contradicted the owner decision.** The decision was to keep the
theatre UIs as showcases. Gating them on `showcaseJson` hides them, and would
not remove the CME claims anyway because those are static JSX. A4 becomes a
labelling task.

**C3. A5's fix was not implementable.** Google Calendar `action=TEMPLATE` and
the Outlook deeplink each accept exactly one event. "Export the filtered set"
through those buttons cannot work. The correct split: per-event Google and
Outlook links in the list, bulk export stays on `.ics` and CSV.

**C4. D2 duplicated A1.** Meeting requests exist. D2 is re-scoped to the
authenticated accept, decline and schedule lifecycle over the existing
`MeetingRequest`, which makes it smaller than the prior estimate.

**C5. B3's revenue figure is a benchmark, not a forecast.** The
per-scanner pricing came from vendor research, not from XPO pricing or
customer evidence. It is stated as a benchmark below and does not justify
building the scanner before demand is tested.

---

## 4. Roadmap

Effort: S under a day, M one to three days, L a week or more. Every item
carries the evidence that proves it done, because "it compiles" has never
been the bar in this repository.

### Track S: Security and correctness (do first, in order)

- [x] **S1. Auth consistency.** Replace every raw `xpo_role` read with
  `resolveEventCaller` plus an explicit write guard. Deny by default: absent
  role is a 401, not a pass. Files: `organizer/events/route.ts`,
  `organizer/booths/route.ts`, `admin/events/[id]/{route,assign,release}.ts`,
  `admin/users/route.ts`. M.
  *Done when:* each route returns 401 without a session and 403 with the
  wrong role, covered by an integration test per route, and `grep` finds no
  `xpo_role` parsing outside `src/lib/auth/`.
  Shipped 2026-11-03 as `495f330`. Guard in `src/lib/auth/guards.ts`; event
  creation takes its owner from the caller and listing is scoped per
  organizer. Verified live: 401, 403, 401, 201, 401 across five probes; full
  suite 909 green.
- [x] **S2. Write-path rate limits.** Extend the existing limiter to event
  creation and report generation, and emit `X-RateLimit-*` headers so
  integrators can back off. S.
  *Done when:* a burst test trips the limit and the headers appear on both
  success and 429.
  Shipped 2026-11-03 as `e51baee`. 30 event creations and 10 reports per
  minute; headers on 201 and 429. Verified live: remaining 29 on create,
  then limit 10, remaining 0, Retry-After 60.

### Track T: Trust completion (finish what A1 started)

- [x] **T1. Organizer meeting-request inbox.** `MeetingRequest` is
  write-only today: no GET route and no reader anywhere in `src/`. Add a
  scoped list for the event's organizer with accept, decline and status
  transitions, plus an unread count. S.
  *Done when:* a submitted request appears in the organizer view, changes
  status, and the requester receives the status email.
  Shipped 2026-11-03 as `fa753f1`. GET and PATCH routes with ownership,
  audit and decision email; dashboard inbox with pending first. Verified
  live: public submit, scoped list, confirm, dashboard render.
- [x] **T2. Event recaps.** Add a recap field (photos, slides, recordings) or
  retarget the CTA. No recap data exists today. S.
  *Done when:* the past-event CTA opens a recap section when data exists and
  falls back to the event page when it does not.
  Shipped 2026-11-03 as `26db720`. Took the retarget branch: the CTA now
  says View Event Details. A recap field without an authoring path would
  have been a new stub.
- [x] **T3. Listing-only semantics.** Badge `isListingOnly` events in
  discovery as external listings with an off-platform CTA, and suppress the
  pass drawer for them. S.
  *Done when:* a listing-only event shows the external badge and cannot
  reach checkout, verified by test.
  Shipped 2026-11-03 as `377f0ec`. Adds `externalUrl`, admin-only and
  validated; card badge and off-platform CTA; every Book Pass control
  replaced; checkout drawer never mounts. Verified in a browser: no Book
  Pass, badge and external link present.
- [x] **T4. Showcase labelling.** Mark livestream, CME and deal-room sections
  as demonstration content unless backed by data. Keep them visible, per the
  owner decision. S.
  *Done when:* every unbacked showcase section carries the label, and the
  label disappears once the backing field is populated.
  Shipped 2026-11-03 as `5db649b`. CME, KYC and deal-room credential claims
  carry a Demonstration badge. The livestream section already gates on an
  organizer-published URL, so it needed no label. Verified live on the
  finance event page.
- [x] **T5. Calendar export parity.** Per-event Google and Outlook links for
  each event in the filtered list; bulk stays `.ics` and CSV. S.
  *Done when:* every listed event produces its own valid deeplink and the
  bulk export still contains the full filtered set.
  Shipped 2026-11-03 as `f006f6a`. One deeplink pair per card with
  event-specific accessible names; bulk unchanged. Verified live: six
  deeplink targets on the calendar page.

### Track C: Attendee fundamentals (retention and inventory truth)

- [x] **C1. Cancellation and transfer.** `POST /api/bookings/[id]/cancel`
  with status change, `soldCount` decrement, audit row and email; transfer
  re-issues the holder while keeping the hash. Free-tier void first; refunds
  wait for Track F. S.
  *Done when:* cancelling frees capacity, the audit row exists, and the email
  sends.
  Shipped 2026-11-03 as `dbad967`. Holder, owning organizer or admin may
  cancel; holder or admin may transfer. Wallet scoped to the holder and the
  pass page 404s for anyone else. Verified live: transfer 200, cancel 200,
  hash unchanged, both emails attempted.
- [x] **C2. Persistent agenda.** New bookmark model joining booking and
  agenda item, plus API and UI state that survives refresh. The prior roadmap
  understated this: no model exists. M.
  *Done when:* a saved session survives reload and appears in the guidebook.
  Shipped 2026-11-03 as `5e34531`. `AgendaBookmark` with a unique booking
  and session pair; pass page loads it, guidebook writes through the API
  and reverts on failure. Verified live: save 200, one row, page renders
  My Agenda.
- [x] **C3. Waitlist with auto-promotion.** `WaitlistEntry` plus join and
  leave routes; a cancellation promotes the head of the queue by email. M.
  *Done when:* a sold-out tier accepts a waitlist entry and a cancellation
  promotes it.
  Shipped 2026-11-03 as `56b22b9`. Per-tier queue with position, idempotent
  join, seats-available refusal, guarded promotion and email. Verified live:
  join 201, duplicate 201, leave 200.
- [x] **C4. Reminders.** `reminderSentAt` on `Booking` and a scheduler for
  T-24h and T-2h through the existing email layer. M.
  *Done when:* a booking receives exactly one reminder per window, proven by
  test with a clock stub.
  Shipped 2026-11-03 as `fa2b067`. Ruling: two sent markers instead of one,
  because a single `reminderSentAt` cannot express two windows. The route is
  hosting-neutral and idempotent under overlapping runs. Verified live: 401
  without the secret, 200 with it, one email and the marker set.
- [x] **C5. Session check-in.** `SessionCheckIn` reusing the QR hash, feeding
  attendance into the exhibitor report and the agenda. S to M.
  *Done when:* a session scan records attendance without allowing duplicates.
  Shipped 2026-11-03 as `5f86819`. Scanner panel with event and session
  selection; repeats return alreadyCheckedIn. Attendance data is ready for
  X5 once the exhibitor report exists. Verified live: 201 first scan, 200
  repeat, one row.

### Track X: Exhibitor validation slice (test demand before building the scanner)

- [ ] **X1. Booth claiming.** `BoothTenant` gains `userId` and claim status;
  `POST /api/exhibitor/booths/[id]/claim` with organizer approval. M.
  *Done when:* an exhibitor claims a booth, the organizer approves, and the
  exhibitor sees only their booth.
- [ ] **X2. Exhibitor self-service.** Scoped profile editing; surface
  `logoUrl`, `dimensions`, `areaSqm` and `boothType`, which organizers already
  write and nobody reads. S after X1.
  *Done when:* an exhibitor edits their own profile and the attendee card
  shows the new fields.
- [ ] **Gate.** Measure exhibitor logins and profile edits for one event
  cycle. Do not start X3 without a positive signal.
- [ ] **X3. Lead scanning.** `LeadScan` model reusing the QR verify path,
  plus a booth scanner mode. M. **Blocked by the gate.**
- [ ] **X4. Exhibitor lead center.** Per-booth scans, meetings and
  qualification in one view, CSV export, post-event email summary. M.
- [ ] **X5. Exhibitor ROI report.** Feed X3 and X4 into the existing AI
  report engine. S.

### Track M: Matchmaking (rules before AI)

- [ ] **M1. Profiles from interests.** Persist `interestsJson` and settings
  through `PATCH /api/profile` and make them readable by matching. This also
  removes the false "suggestions follow these interests" copy. M.
  *Done when:* interests round-trip to the database and a rule-based
  suggestion reads them.
- [ ] **M2. Request lifecycle.** Accept, decline and schedule on
  `MeetingRequest`, on shared identity (booking, booth, profile). Re-scoped
  from D2. M after M1 and X1.
- [ ] **M3. AI re-ranking.** Rank suggestions through the OpenRouter layer
  with plain-language reasons, fed by M2 outcomes. S to M.
- [ ] **M4. Hosted buyer program.** Tier-gated meeting quotas with
  booked-versus-held analytics. S after M2.

### Track P: Platform maturity (one item per cycle, alongside)

- [ ] **P1. Error envelope.** One `{success, error, code}` shape with
  machine-readable codes; three dialects exist now. S to M.
- [ ] **P2. Validation and pagination.** Zod on checkout, booths and venues;
  shared pagination; one id-or-slug helper; one DELETE body precedence. S,
  ongoing.
- [ ] **P3. Checkout idempotency.** `Idempotency-Key` so retries never
  double-book. S to M.
  *Done when:* replaying the same key returns the original booking, proven by
  test.
- [ ] **P4. Public API and webhooks.** Versioned read API with keys, booking
  and check-in webhooks with retries. L, last for a reason.

### Track O: Operational gaps absent from the prior roadmap

- [ ] **O1. Email operations.** Bounce and complaint handling, a suppression
  list, and documented SPF, DKIM and DMARC. Email now carries OTP, booking
  confirmations and meeting requests, so delivery is load-bearing. M.
- [ ] **O2. Retention and deletion.** A deletion and export path for attendee
  PII, and a retention window for audit rows. M.
- [ ] **O3. Restore drill.** Execute the backup and restore procedure in
  `docs/operations/deploy.md` against a scratch database and record the
  result. S.
- [ ] **O4. Contrast debt.** Clear the deferred serious-level kicker contrast
  findings and re-enable them in the axe gate. S.

### Track F: Money (gated, not scheduled)

Blocked on a payment provider decision. Then: payment ledger, real refunds
(C1's void becomes a refund), organizer finance reports, payouts, and the
finance-gated perks (CME certificates, wristband top-up). L.

---

## 5. Sequence

1. **S1, S2.** Security first. Nothing else ships ahead of an open write path.
2. **T1 through T5.** Finish the promises, cheapest first.
3. **C1, C2.** Cancellation and agenda, the two attendee gaps that block
   everything else.
4. **X1, X2, then the gate.**
5. **M1, M2, M3.**
6. **C3, C4, C5** and **P1 through P3** alongside, one per cycle.
7. **X3 through X5** only after the gate.
8. **P4** and **F** when the prerequisites land.
9. **O1 through O4** slotted into whichever cycle has room; none of them is
   optional.

---

## 6. Risk assessment for the exhibitor bet

- **Risk:** medium-high. The engineering is tractable; the demand is not
  evidenced.
- **Main assumption:** organizers will pay for lead retrieval, and exhibitors
  will log in to use it.
- **Evidence to find first:** whether any current organizer has asked for
  exhibitor lead data. If none has, ship X1 and X2, then measure.
- **Do next:** S1, then T1.
- **Delay:** X3 through X5 until exhibitor logins or organizer requests
  appear.
- **Benchmark, not forecast:** third-party lead-retrieval pricing sits in the
  low hundreds per scanner per event. That is a market reference, not an XPO
  revenue projection.

Kill criteria: if X1 and X2 produce no exhibitor logins across one event
cycle, stop Track X and redirect the effort to Track C and Track M, which
serve attendees who already use the product.

---

## 7. Deliberately excluded

- Payment collection, refunds and payouts, until a provider is chosen.
- Public API and webhooks, until the internal envelope and pagination are
  consistent.
- Removing or hiding the theatre UIs. The owner decision is to keep them as
  showcases, so they are labelled rather than deleted.
- Any new platform surface. Every item above extends an existing model, route
  or component.

---

## 8. Quick wins (each under a day, never batched)

- Real rows in the audit log UI with filters and CSV export; the read helper
  `recentAuditEntries()` already exists.
- Active-device session list with per-device revoke, using
  `Session.userAgent` and `Session.ip`.
- Low-stock urgency badges and a gate-velocity chart from `checkedInAt`.
- Tier-to-perk deep links so benefits unlock visible perks.
- Meeting-room finder from the `MEETING_ROOM` rows already excluded from hall
  counts.
- Freight spec sheet from `ceilingHeightM`, `floorLoadKnM2` and `floorAreaSqm`.
- Dead copy removal, starting with the `vipLounge` key that has no consumer.
- Per-event staff roles (OWNER, EDITOR, SCANNER, VIEWER).

---

## 9. Open decisions

| Decision | Owner | Blocks |
| --- | --- | --- |
| Payment provider | product | Track F |
| Hosting target | engineering | deployment hardening beyond the current container path |
| Exhibitor pricing model | product | X3 and beyond |
| Data retention window | legal and product | O2 |

No item in Tracks S, T, C or M depends on any of these.
