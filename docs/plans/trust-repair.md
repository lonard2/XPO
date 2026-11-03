# Trust Repair (roadmap Phase A)

Every item is a promise the UI makes today with nothing behind it. Each ships
as its own commit and is verified live; theatre interactions (KYC badges,
compliance flips) stay as visual showcases per owner decision.

A4 and A5 are corrected in `docs/plans/future-roadmap-revised.md`: A4 becomes
labelling rather than gating, to match the showcase decision, and A5 splits
into per-event deeplinks plus bulk `.ics`, because the Google and Outlook
URLs accept one event each. This file keeps the original wording for history.

- [x] **A1. Meeting requests that persist.** RFQ, deal-room slots, buyer
  appointments and bilateral slots across the industrial, hospitality,
  government and finance views. One `MeetingRequest` model, one POST route,
  email to both sides, all four forms wired to it.
  Shipped 2026-11-03 as `86902f2`. Verified: `tsc` and lint clean; route,
  template and client tests pass; curl confirmed 201 on valid input and
  400/404 on bad type and missing event; a live browser RFQ submission
  returned a persisted reference; both notification emails were attempted.
- [ ] **A2. Event recaps.** Concluded hero slides link to `View Event Recap`,
  which is the live page. Recap section or retargeted CTA.
- [ ] **A3. Listing-only semantics.** Discovery badges `isListingOnly` events
  as external listings with an off-platform CTA, never a pass drawer.
- [ ] **A4. Showcase honesty.** Livestream, CME and deal-room sections gated
  on `showcaseJson` presence instead of rendering unbacked.
- [ ] **A5. Calendar export parity.** Google/Outlook buttons export the
  filtered set, not just the next event.
