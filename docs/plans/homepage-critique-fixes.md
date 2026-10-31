# Homepage Critique Fixes (2026-10-31)

Follow-up to the 24/40 critique. Five priority issues, shipped one commit each.

- [x] **H1. Identity plate.** The homepage opened on an event carousel, so the first
  screen answered "which event is this" instead of "what is XPO". A visible masthead
  now states what the platform is, who it serves, and three checkable facts. Copy
  rewritten in all six locales to read like a person wrote it.
- [x] **H2. Concierge launcher collision.** The fixed launcher covers section CTAs
  (measured: 54px of the 162px "Convention Centers" button at 1440).
- [x] **H3. Tablet header overlap.** At 768 the language switcher covers `Venues` and
  `My Passes`, and the account pill covers `Organizer`.
- [ ] **H4. Venue name truncation.** `line-clamp-1` cuts the primary identifier on every
  venue card at every breakpoint.
- [ ] **H5. Curation.** Six events enumerated four times, three badged Concluded under
  an "Upcoming" eyebrow, four of six venue cards reading "0 LISTED".

Deferred on purpose: countdown hydration mismatch (small separate commit), and the
low-contrast category kickers plus sub-44px targets (accessibility pass).
