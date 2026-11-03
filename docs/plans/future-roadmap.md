# XPO Future Roadmap

Evidence-built from three codebase audits (unbacked UI promises, unused data
model power, API and journey gaps) plus 2026 MICE industry direction. The
industry consensus this year is unusually clear: matchmaking quality, lead
retrieval on a shared identity, and exhibitor ROI reporting decide platform
wins. XPO already owns the primitives for all three (QR passes, booths,
agenda, AI reports, interests columns). Nothing here needs a new platform.

Standing decisions: payments stay reservation-only until a provider decision;
hosting target is undecided, so nothing below assumes one.

## Phase A: Trust repair (back it or remove it)

Every item below is a promise the UI makes today with nothing behind it.
Each ships as its own commit; each is either wired to a real backend or the
copy comes out.

- [ ] **A1. Meeting requests that persist.** RFQ, deal-room slots, buyer
  appointments and bilateral slots currently flip local booleans and promise
  email confirmations that never send (`IndustrialB2BView`, `HospitalityTourismView`,
  `GovernmentDiplomaticView`, `FinanceInvestorView`). Persist requests with
  requester, target, slot and status; notify both sides by email. Medium.
- [ ] **A2. Event recaps.** Concluded hero slides link to `View Event Recap`,
  which is the live page. Add a recap section (photos, slides, recordings) or
  retarget the CTA. Small.
- [ ] **A3. Listing-only semantics.** Discovery must badge `isListingOnly`
  events as external listings with an off-platform CTA, never a pass drawer.
  Small.
- [ ] **A4. Showcase honesty.** Archetype views advertise livestreams, CME
  credits and deal rooms even when the organizer authored nothing. Gate those
  sections on `showcaseJson` presence. Small.
- [ ] **A5. Calendar export parity.** Bulk `.ics`/CSV works; Google/Outlook
  buttons export only the next event. Export the filtered set. Small.

## Phase B: The exhibitor marketplace (highest industry value)

The 2026 market pays for lead retrieval (£100-575 per scanner) and renews on
ROI evidence. XPO has booths, QR verification and AI reports; it has no
exhibitor user.

- [ ] **B1. Booth claiming.** `BoothTenant` gains `userId` plus claim status;
  `POST /api/exhibitor/booths/[id]/claim` with organizer approval. Medium.
  Unlocks everything below.
- [ ] **B2. Exhibitor self-service.** Scoped profile editing for the claiming
  user; surface `logoUrl`, dimensions and booth type on attendee cards
  (organizers already write that data, nobody reads it). Small after B1.
- [ ] **B3. Lead scanning.** `LeadScan` model (booth x booking x timestamp)
  reusing the QR verify infra, plus a scanner mode for booth staff.
  Medium. This is the revenue line.
- [ ] **B4. Exhibitor lead center.** Per-booth scans, meetings and qualification
  scores in one view, CSV export, post-event email summary. Medium after B3.
- [ ] **B5. Exhibitor ROI report.** Feed scans, meetings and booth traffic into
  the existing AI reports engine as an exhibitor-facing report. Small after
  B3+B4.

## Phase C: Attendee depth (retention)

- [ ] **C1. My Agenda that survives refresh.** Persist bookmarks
  (`bookingId` + `agendaId`), per-session calendar export, overlap warnings.
  The model and the guidebook UI exist; only persistence is missing. Medium.
- [ ] **C2. Waitlist with auto-promotion.** `WaitlistEntry` plus
  `POST/DELETE /api/events/[id]/waitlist`; cancellations promote the head of
  the queue by email. Medium. Needs C3's cancel path for full value.
- [ ] **C3. Cancellation and transfer.** `POST /api/bookings/[id]/cancel`
  (status, `soldCount` decrement, audit, email) and transfer (re-issue
  holder, keep hash, audit). Free-tier void first; refunds need Phase F.
  Small.
- [ ] **C4. Reminders.** `reminderSentAt` on Booking plus a scheduler for
  T-24h/T-2h templates through the existing email layer. Medium.
- [ ] **C5. Session check-in.** `SessionCheckIn` reusing the QR hash, feeding
  attendance back into B5 and C1. Small-medium.

## Phase D: Matchmaking engine (the big bet)

Industry guidance is explicit: rule-based matching first with an auditable
trail, AI re-ranking on top, never AI alone. XPO's pieces: dead
`interestsJson` columns, AI reports, agenda, tiers.

- [ ] **D1. Profiles from interests.** Sync settings and interests to the
  database (`PATCH /api/profile`), make them visible to matching. This also
  fixes today's false "suggestions follow these interests" copy. Medium.
- [ ] **D2. Meeting requests.** Request, accept, decline and schedule on
  shared identity (booking + booth + profile in one record). Medium after
  D1 and B1.
- [ ] **D3. AI re-ranking.** Feed D2 outcomes back into the OpenRouter layer
  for ranked suggestions with plain-language reasons. Small-medium after D2.
- [ ] **D4. Hosted buyer program.** Tier-gated meeting quotas with kept-meeting
  analytics (booked vs held vs rated). Small after D2.

## Phase E: Platform maturity (developer velocity + integrators)

- [ ] **E1. Auth consistency.** Standardize every route on
  `resolveEventCaller` + `requireEventWrites`; raw-cookie role parsing trusts
  client state in production today. Medium, high value.
- [ ] **E2. Error envelope.** One `{success, error, code}` shape with
  machine-readable codes; three dialects exist now. Small-medium.
- [ ] **E3. Validation and pagination.** Zod on checkout/booths/venues, shared
  pagination everywhere, one id-or-slug helper, one DELETE body precedence.
  Small, ongoing.
- [ ] **E4. Coverage gaps.** Rate-limit event creation and report generation;
  emit `X-RateLimit-*` headers. Small.
- [ ] **E5. Checkout idempotency.** `Idempotency-Key` so retries never
  double-book. Small-medium.
- [ ] **E6. Public API and webhooks.** Versioned read API with keys, booking
  and check-in webhooks with retries. Large; last for a reason.

## Phase F: Money (plan-ready, scoped out)

Gated on a provider decision (Midtrans/Xendit/Stripe). Then: payment ledger,
real refunds (C3's void becomes a refund), organizer finance reports
(replacing today's analytics estimate), payouts, and the finance-gated
perks (CME certificates, wristband top-up). Large.

## Quick wins backlog (each under a day)

- Real rows in the audit log UI with filters and CSV export.
- Active-device session list with per-device revoke.
- Low-stock urgency badges and a gate-velocity chart from `checkedInAt`.
- Tier-to-perk deep links so benefits unlock visible perks.
- Meeting-room finder from the excluded `MEETING_ROOM` rows.
- Freight spec sheet from hall tech specs (floor load, ceiling, area).
- Livestream hub completion and showcase staleness badges.
- Dead copy removal (`vipLounge`, `gate*` orphans).
- Staff roles per event (OWNER/EDITOR/SCANNER/VIEWER).

## Suggested order

A (trust) -> B1-B3 (exhibitor spine) -> C1-C3 (attendee depth) -> D (matchmaking)
-> E (alongside, one item per cycle) -> B4-B5, C4-C5 -> F when decided.
Quick wins fill gaps between larger items, never as a batch.
